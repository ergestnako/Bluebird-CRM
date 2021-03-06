<?php
// processMailboxes.php
//
// Project: BluebirdCRM
// Author: Ken Zalewski & Stefan Crain
// Organization: New York State Senate
// Date: 2011-03-22
// Revised: 2013-04-27
// Revised: 2014-09-15 - simplified contact matching logic; added debug control
//

// Version number, used for debugging
define('VERSION_NUMBER', 0.07);

// Log levels
define('PM_ERROR', 0);
define('PM_WARN', 1);
define('PM_INFO', 2);
define('PM_DEBUG', 3);

$g_log_levels = array(PM_ERROR => 'ERROR',
                      PM_WARN => 'WARN',
                      PM_INFO => 'INFO',
                      PM_DEBUG => 'DEBUG');

// Mailbox settings common to all CRM instances
define('DEFAULT_IMAP_SERVER', 'senmail.senate.state.ny.us');
define('DEFAULT_IMAP_OPTS', '/imap');
define('DEFAULT_IMAP_MAILBOX', 'Inbox');
define('DEFAULT_IMAP_ARCHIVEBOX', 'Archive');
define('DEFAULT_IMAP_PROCESS_UNREAD_ONLY', false);
define('DEFAULT_IMAP_ARCHIVE_MAIL', true);
define('DEFAULT_LOG_LEVEL', PM_WARN);

define('IMAP_CMD_POLL', 1);
define('IMAP_CMD_LIST', 2);
define('IMAP_CMD_DELETE', 3);

// Maximum size of an e-mail attachment
define('MAX_ATTACHMENT_SIZE', 2097152);

// Allowed file extensions for "application" file type.
define('ATTACHMENT_FILE_EXTS', 'pdf|txt|text|rtf|odt|doc|ppt|csv|doc|docx|xls');

// Status codes for the nyss_inbox_messages table.
define('STATUS_UNMATCHED', 0);
define('STATUS_MATCHED', 1);
define('STATUS_UNPROCESSED', 99);

define('INVALID_EMAIL_FROM', '"Bluebird Admin" <bluebird.admin@nysenate.gov>');
define('INVALID_EMAIL_SUBJECT', 'Bluebird Inbox Error: Not permitted to send e-mails to CRM');
define('INVALID_EMAIL_TEXT', "You do not have permission to forward e-mails to this CRM instance.\n\nIn order to allow your e-mails to be accepted, you must request that your e-mail address be added to the  Authorized Forwarders group for this CRM.\n\nPlease contact Senate Technology Services for more information.\n\n");

// //email address of the contact to file unknown emails against.
// define('UNKNOWN_CONTACT_EMAIL', 'unknown.contact@nysenate.gov');

// The Bluebird predefined group name for contacts who are authorized
// to forward messages to the CRM inbox.
define('AUTH_FORWARDERS_GROUP_NAME', 'Authorized_Forwarders');

error_reporting(E_ERROR | E_PARSE | E_WARNING);

if (!ini_get('date.timezone')) {
  date_default_timezone_set('America/New_York');
}

//no limit
set_time_limit(0);

$prog = basename(__FILE__);

require_once 'script_utils.php';
$stdusage = civicrm_script_usage();
$usage = "[--server|-s imap_server]  [--imap-user|-u username]  [--imap-pass|-p password]  [--imap-opts|-o imap_options]  [--cmd|-c <poll|list|delarchive>]  [--mailbox|-m name]  [--archivebox|-a name]  [--log {ERROR|WARN|INFO|DEBUG}] [--unread-only|-r]  [--archive-mail|-t]";
$shortopts = "s:u:p:o:c:m:a:l:rt";
$longopts = array("server=", "imap-user=", "imap-pass=", "imap-opts=", "cmd=", "mailbox=", "archivebox=", "log=", "unread-only", "archive-mail");

$optlist = civicrm_script_init($shortopts, $longopts);

if ($optlist === null) {
  error_log("Usage: $prog  $stdusage  $usage\n");
  exit(1);
}

require_once 'CRM/Core/Config.php';
$config =& CRM_Core_Config::singleton();
$session =& CRM_Core_Session::singleton();

require_once 'CRM/Contact/BAO/Contact.php';
require_once 'CRM/Contact/BAO/GroupContact.php';
require_once 'CRM/Activity/BAO/Activity.php';
require_once 'CRM/Core/Transaction.php';
require_once 'CRM/Core/BAO/CustomValueTable.php';
require_once 'CRM/Core/PseudoConstant.php';
require_once 'CRM/Core/Error.php';
require_once 'api/api.php';
require_once 'CRM/Core/DAO.php';
require_once 'CRM/Utils/File.php';
require_once 'CRM/Utils/MessageBodyParser.php';


/* More than one IMAP account can be checked per CRM instance.
** The username and password for each account is specified in the Bluebird
** config file.
**
** The user= and pass= command line args can be used to override the IMAP
** accounts from the config file.
*/
$bbconfig = get_bluebird_instance_config();
$imap_accounts = $bbconfig['imap.accounts'];
$imap_validsenders = strtolower($bbconfig['imap.validsenders']);
$imap_activty_status = $bbconfig['imap.activity.status.default'];

$site = $optlist['site'];
$cmd = $optlist['cmd'];
$imap_server = DEFAULT_IMAP_SERVER;
$imap_opts = DEFAULT_IMAP_OPTS;
$imap_mailbox = DEFAULT_IMAP_MAILBOX;
$imap_archivebox = DEFAULT_IMAP_ARCHIVEBOX;
$imap_process_unread_only = DEFAULT_IMAP_PROCESS_UNREAD_ONLY;
$imap_archive_mail = DEFAULT_IMAP_ARCHIVE_MAIL;
$g_log_level = DEFAULT_LOG_LEVEL;
$g_crm_instance = $site;

if (!empty($optlist['server'])) {
  $imap_server = $optlist['server'];
}
if (!empty($optlist['imap-user']) && !empty($optlist['imap-pass'])) {
  $imap_accounts = $optlist['imap-user'].'|'.$optlist['imap-pass'];
}
if (!empty($optlist['imap-opts'])) {
  $imap_opts = $optlist['imap-opts'];
}
if (!empty($optlist['mailbox'])) {
  $imap_mailbox = $optlist['mailbox'];
}
if (!empty($optlist['archivebox'])) {
  $imap_archivebox = $optlist['archivebox'];
}
if ($optlist['unread-only'] == true) {
  $imap_process_unread_only = true;
}
if ($optlist['archive-mail'] == true) {
  $imap_archive_mail = true;
}
if (!empty($optlist['log'])) {
  $level = strtoupper($optlist['log']);
  $key = array_search($level, $g_log_levels);
  if ($key === false) {
    error_log("$prog: $level: Invalid log level");
    exit(1);
  }
  $g_log_level = $key;
}
if ($cmd == 'list') {
  $cmd = IMAP_CMD_LIST;
}
else if ($cmd == 'delarchive') {
  $cmd = IMAP_CMD_DELETE;
}
else if ($cmd == 'poll' || !$cmd) {
  $cmd = IMAP_CMD_POLL;
}
else {
  error_log("$prog: $cmd: Invalid script command.");
  exit(1);
}

// Grab default values for activities (priority, status, type).
$aActivityPriority = CRM_Core_PseudoConstant::get('CRM_Activity_DAO_Activity', 'priority_id');
$aActivityType = CRM_Core_PseudoConstant::activityType();
$aActivityStatus = CRM_Core_PseudoConstant::activityStatus();

$activityPriority = array_search('Normal', $aActivityPriority);
$activityType = array_search('Inbound Email', $aActivityType);

if ($imap_activty_status == false || !isset($imap_activty_status)) {
  $activityStatus = array_search('Completed', $aActivityStatus);
}else{
  $activityStatus = array_search($imap_activty_status, $aActivityStatus);
}


$activityDefaults = array('priority' => $activityPriority,
                          'status' => $activityStatus,
                          'type' => $activityType);

// Set the session ID for who created the activity
$session->set('userID', 1);

// Directory where file attachments will be written.
$uploadDir = $config->customFileUploadDir;
$uploadInbox = $uploadDir."inbox";
if (!is_dir($uploadInbox)) {
  mkdir($uploadInbox);
  chmod($uploadInbox, 0777);
}

if (empty($imap_accounts)) {
  echo "$prog: No IMAP accounts to process for CRM instance [$site]\n";
  exit(1);
}

$authForwarders = getAuthorizedForwarders();
if ($imap_validsenders) {
  // If imap.validsenders was specified in the config file, then add those
  // e-mail addresses to the list of authorized forwarders.  The contact ID
  // for each of these "config file" forwarders will be 1 (Bluebird Admin).
  $validSenders = preg_split('/[\s,]+/', $imap_validsenders, null, PREG_SPLIT_NO_EMPTY);
  foreach ($validSenders as $validSender) {
    if ($validSender && isset($authForwarders[$validSender])) {
      logmsg(PM_INFO, "Valid sender [$validSender] from config is already in the auth forwarders list");
    }
    else {
      $authForwarders[$validSender] = 1;
    }
  }
}

// Iterate over all IMAP accounts associated with the current CRM instance.

foreach (explode(',', $imap_accounts) as $imap_account) {
  list($imapUser, $imapPass) = explode("|", $imap_account);
  $imap_params = array(
    'site' => $site,
    'server' => $imap_server,
    'opts' => $imap_opts,
    'user' => $imapUser,
    'pass' => $imapPass,
    'mailbox' => $imap_mailbox,
    'archivebox' => $imap_archivebox,
    'unreadonly' => $imap_process_unread_only,
    'archivemail' => $imap_archive_mail,
    'authForwarders' => $authForwarders,
    'activityDefaults' => $activityDefaults,
    'uploadDir' => $uploadDir,
    'uploadInbox' => $uploadInbox
  );

  $rc = processMailboxCommand($cmd, $imap_params);
  if ($rc == false) {
    logmsg(PM_ERROR, "Failed to process IMAP account $imapUser@$imap_server\n".print_r(imap_errors(), true));
  }
}

logmsg(PM_INFO, "Finished processing all mailboxes for CRM instance [$site]");
exit(0);



/*
 * getAuthorizedForwarders()
 * Parameters: None.
 * Returns: Array of contact IDs, indexed by e-mail address, that can forward
 *          messages to the inbox.
 * Note: If more than one contact in the Authorized Forwarders group shares
 *       the same e-mail address, the contact with the lowest ID is stored.
 */
function getAuthorizedForwarders()
{
  $res = array();
  $q = "
    SELECT e.email, e.contact_id
    FROM civicrm_group_contact gc, civicrm_group g, civicrm_email e,
         civicrm_contact c
    WHERE g.name='".AUTH_FORWARDERS_GROUP_NAME."'
      AND g.id=gc.group_id
      AND gc.status='Added'
      AND gc.contact_id=e.contact_id
      AND e.contact_id = c.id
      AND c.is_deleted = 0
    ORDER BY gc.contact_id ASC";

  $dao = CRM_Core_DAO::executeQuery($q);

  while ($dao->fetch()) {
    $email = strtolower($dao->email);
    $cid = $dao->contact_id;
    if (isset($res[$email]) && $res[$email] != $cid) {
      logmsg(PM_WARN, "'".AUTH_FORWARDERS_GROUP_NAME."' group already has e-mail address [$email] (cid={$res[$email]}); ignoring cid=$cid");
    }
    else {
      $res[$email] = $cid;
    }
  }

  return $res;
} // getAuthorizedForwarders()



function processMailboxCommand($cmd, $params)
{
  $serverspec = '{'.$params['server'].$params['opts'].'}'.$params['mailbox'];
  logmsg(PM_INFO, "Opening IMAP connection to {$params['user']}@$serverspec");
  $imap_conn = imap_open($serverspec, $params['user'], $params['pass']);

  if ($imap_conn === false) {
    logmsg(PM_ERROR, "Unable to open IMAP connection to $serverspec");
    return false;
  }

  if ($cmd == IMAP_CMD_POLL) {
    $rc = checkImapAccount($imap_conn, $params);
  }
  else if ($cmd == IMAP_CMD_LIST) {
    $rc = listMailboxes($imap_conn, $params);
  }
  else if ($cmd == IMAP_CMD_DELETE) {
    $rc = deleteArchiveBox($imap_conn, $params);
  }
  else {
    logmsg(PM_ERROR, "Invalid command [$cmd], params=".print_r($params, true));
    $rc = false;
  }

  //clean up moved/deleted messages
  // Using CL_EXPUNGE is same as calling imap_expunge().
  imap_close($imap_conn, CL_EXPUNGE);
  return $rc;
} // processMailboxCommand()



// Check the given IMAP account for new messages, and process them.

function checkImapAccount($mbox, $params)
{
  logmsg(PM_INFO, "Polling CRM [".$params['site']."] using IMAP account ".
       $params['user'].'@'.$params['server'].$params['opts']);

  $crm_archivebox = '{'.$params['server'].'}'.$params['archivebox'];

  //create archive box in case it doesn't exist
  //don't report errors since it will almost always fail
  if ($params['archivemail'] == true) {
    $rc = imap_createmailbox($mbox, imap_utf7_encode($crm_archivebox));
    if ($rc) {
      logmsg(PM_DEBUG, "Created new mailbox: $crm_archivebox");
    }
    else {
      logmsg(PM_DEBUG, "Archive mailbox $crm_archivebox already exists");
    }
  }

  // start db connection
  $nyss_conn = new CRM_Core_DAO();
  $nyss_conn = $nyss_conn->getDatabaseConnection();
  $dbconn = $nyss_conn->connection;

  $msg_count = imap_num_msg($mbox);
  $invalid_fwders = array();
  logmsg(PM_INFO, "Number of messages: $msg_count");

  for ($msg_num = 1; $msg_num <= $msg_count; $msg_num++) {
    logmsg(PM_INFO, "Retrieving message $msg_num / $msg_count");
    $msgMetaData = retrieveMetaData($mbox, $msg_num);
    $fwder = strtolower($msgMetaData->fromEmail);

    // check whether or not the forwarder is valid
    if (array_key_exists($fwder, $params['authForwarders'])) {
      logmsg(PM_DEBUG, "Forwarder [$fwder] is allowed to send to this mailbox");
      // retrieved msg, now store to Civi and if successful move to archive
      if (storeMessage($mbox, $dbconn, $msgMetaData, $params) == true) {
        // //mark as read
        imap_setflag_full($mbox, $msgMetaData->uid, '\\Seen', ST_UID);
        // move to folder if necessary
        if ($params['archivemail'] == true) {
          imap_mail_move($mbox, $msg_num, $params['archivebox']);
        }
      }
    }
    else {
      logmsg(PM_WARN, "Forwarder [$fwder] is not allowed to forward/send messages to this CRM; deleting message");
      $invalid_fwders[$fwder] = true;
      if (imap_delete($mbox, $msg_num) === true) {
        logmsg(PM_DEBUG, "Message $msg_num has been deleted");
      }
      else {
        logmsg(PM_WARN, "Unable to delete message $msg_num from mailbox");
      }
    }
  }

  $invalid_fwder_count = count($invalid_fwders);
  if ($invalid_fwder_count > 0) {
    logmsg(PM_INFO, "Sending denial e-mails to $invalid_fwder_count e-mail address(es)");
    foreach ($invalid_fwders as $invalid_fwder => $dummy) {
      sendDenialEmail($params['site'], $invalid_fwder);
    }
  }

  logmsg(PM_INFO, "Finished checking IMAP account ".$params['user'].'@'.$params['server'].$params['opts']);

  logmsg(PM_INFO, "Searching for matches on unmatched records");
  searchForMatches($dbconn, $params);

  return true;
} // checkImapAccount()



function parseMimePart($mbox, $msgid, $p, $partno, &$attachments)
{
  global $uploadInbox;

  //fetch part
  $part = imap_fetchbody($mbox, $msgid, $partno);

  //if type is not text
  if ($p->type != 0) {
    if ($p->encoding == 3) {
      //decode if base64
      $part = base64_decode($part);
    }
    else if ($p->encoding == 4) {
      //decode if quoted printable
      $part = quoted_printable_decode($part);
    }
    //no need to decode binary or 8bit!

    //get filename of attachment if present
    $filename = '';
    // if there are any dparameters present in this part
    if (count($p->dparameters) > 0) {
      foreach ($p->dparameters as $dparam) {
        $attr = strtoupper($dparam->attribute);
        if ($attr == 'NAME' || $attr == 'FILENAME') {
          $filename = $dparam->value;
        }
      }
    }

    //if no filename found
    if ($filename == '') {
      // if there are any parameters present in this part
      if (count($p->parameters) > 0) {
        foreach ($p->parameters as $param) {
          $attr = strtoupper($param->attribute);
          if ($attr == 'NAME' || $attr == 'FILENAME') {
            $filename = $param->value;
          }
        }
      }
    }

    //write to disk and set $attachments variable
    if ($filename != '') {
      $tempfilename = imap_mime_header_decode($filename);
      for ($i = 0; $i < count($tempfilename); $i++) {
        $filename = $tempfilename[$i]->text;
      }
      $fileSize = strlen($part);
      $fileExt = substr(strrchr($filename, '.'), 1);
      $allowed = false;
      $bodyType = $p->type;
      $pattern = '/^('.ATTACHMENT_FILE_EXTS.')$/';

      // Allow body type 3 (application) with certain file extensions,
      // and allow body types 4 (audio), 5 (image), 6 (video).
      if (($bodyType == 3 && preg_match($pattern, $fileExt))
          || ($bodyType >= 4 && $bodyType <= 6)) {
        $allowed = true;
      }
      else {
        $rejected_reason = "File type [$fileExt] not allowed";
      }

      $newName = CRM_Utils_File::makeFileName($filename);

      if ($allowed) {
        if ($fileSize > MAX_ATTACHMENT_SIZE) {
          $allowed = false;
          $rejected_reason = "File is larger than ".MAX_ATTACHMENT_SIZE." bytes";
        }
      }

      if ($allowed) {
        $fp = fopen("$uploadInbox/$newName", "w+");
        fwrite($fp, $part);
        fclose($fp);
      }

      $attachments[] = array('filename'=>$filename, 'civifilename'=>$newName, 'extension'=>$fileExt, 'size'=>$fileSize, 'allowed'=>$allowed, 'rejected_reason'=>$rejected_reason);
    }
  }

  //if subparts... recurse into function and parse them too!
  if (count($p->parts) > 0) {
    foreach ($p->parts as $pno => $parr) {
      parseMimePart($mbox, $msgid, $parr, $partno.'.'.($pno+1), $attachments);
    }
  }
  return true;
} // parseMimePart()



function retrieveMetaData($mbox, $msgid)
{
  // fetch info
  $timeStart = microtime(true);
  $header = imap_rfc822_parse_headers(imap_fetchheader($mbox, $msgid));
  $imap_uid = imap_uid($mbox, $msgid);

  // build email object
  $metaData = new stdClass();
  $metaData->subject = $header->subject;
  $metaData->fromName = $header->reply_to[0]->personal;
  $metaData->fromEmail = $header->reply_to[0]->mailbox.'@'.$header->reply_to[0]->host;
  $metaData->uid = $imap_uid;
  $metaData->msgid = $msgid;
  $metaData->date = date("Y-m-d H:i:s", strtotime($header->date));
  $timeEnd = microtime(true);
  logmsg(PM_DEBUG, "Fetch header time: ".($timeEnd-$timeStart));
  return $metaData;
} // retrieveMetaData()



// storeMessage
// Parses multipart message and stores in Civi database
// Returns true/false to move the email to archive or not.
function storeMessage($mbox, $db, $msgMeta, $params)
{
  $msgid = $msgMeta->msgid;
  $bSuccess = true;
  $uploadInbox = $params['uploadInbox'];

  $timeStart = microtime(true);

  // check for plain/html body text
  $msgStruct = imap_fetchstructure($mbox, $msgid);

  if (!isset($msgStruct->parts) || !$msgStruct->parts) { // not multipart
    $rawBody[$msgStruct->subtype] = array(
        'encoding' => $msgStruct->encoding,
        'body' => imap_fetchbody($mbox, $msgid, '1'),
        'debug' => $msgStruct->lines." : ".$msgStruct->encoding." : 1");

  }
  else { // multipart: iterate through each part
    foreach ($msgStruct->parts as $partno => $pstruct) {
      $section = $partno + 1;
      $rawBody[$pstruct->subtype] = array(
        'encoding' => $pstruct->encoding,
        'body' => imap_fetchbody($mbox, $msgid, $section),
        'debug' => $pstruct->lines." : ".$pstruct->encoding." : $section");
    }
  }

  $parsedBody = MessageBodyParser::unifiedMessageInfo($rawBody);

  if ($parsedBody['fwd_headers']['fwd_lookup'] == 'LDAP FAILURE') {
    logmsg(PM_WARN, "Parse problem: LDAP lookup failure");
  }

  if ($parsedBody['message_action'] == "direct") {
    logmsg(PM_DEBUG, "Message was sent directly to inbox");

    // double check to make sure if was directly sent
    // this message format isn't ideal, it includes message info that is gross looking.
    $rawBody_alt['HTML'] = array(
                 'encoding' => 0,
                 'body' => imap_qprint(imap_body($mbox, $msgid)));
    $parsedBody_alt = MessageBodyParser::unifiedMessageInfo($rawBody_alt);

    if ($parsedBody['message_action'] == "forwarded" || $parsedBody_alt['message_action'] == "forwarded") {
      $headerCheck = array_diff($parsedBody['fwd_headers'], $parsedBody_alt['fwd_headers']);
      if ($headerCheck[0] != NULL) {
        logmsg(PM_WARN, "Parse problem: Header difference found");
      }
    }
  }

  $timeEnd = microtime(true);
  logmsg(PM_DEBUG, "Body download time: ".($timeEnd-$timeStart));

  // formatting headers
  $fwdEmail = substr($parsedBody['fwd_headers']['fwd_email'], 0, 255);
  $fwdName = substr($parsedBody['fwd_headers']['fwd_name'], 0, 255);
  $fwdLookup = $parsedBody['fwd_headers']['fwd_lookup'];
  // the subject could be utf-8
  // civicrm will force '<' and '>' to htmlentities...handle it here to be consistent
  $fwdSubject = mb_strcut(htmlspecialchars($parsedBody['fwd_headers']['fwd_subject'],ENT_QUOTES),0,255);
  $fwdDate = $parsedBody['fwd_headers']['fwd_date'];
  $fwdFormat = $parsedBody['format'];
  $messageAction = $parsedBody['message_action'];
  $fwdBody = $parsedBody['body'];
  $messageId = $msgMeta->uid;
  $fromEmail = substr(mysql_real_escape_string($msgMeta->fromEmail), 0, 255);
  $fromName = substr(mysql_real_escape_string($msgMeta->fromName), 0, 255);
  $subject = substr(mysql_real_escape_string($msgMeta->subject), 0, 255);
  $date = mysql_real_escape_string($msgMeta->date);

  if ($messageAction == 'direct' && !$parsedBody['fwd_headers']['fwd_email']) {
    $fwdEmail = $fromEmail;
    $fwdName = $fromName;
    $fwdSubject = $subject;
    $fwdDate = $date;
    $fwdBody = mysql_real_escape_string($fwdBody);
    $fwdLookup = 'Headers';
  }

  // debug info for mysql
  $debug = "Msg:$msgid; MessageID:$messageId; Action:$messageAction; bodyFormat:$fwdFormat; fwdLookup:$fwdLookup; fwdEmail:$fwdEmail; fwdName:$fwdName; fwdSubject:$fwdSubject; fwdDate:$fwdDate; FromEmail:$fromEmail; FromName:$fromName; Subject:$subject; Date:$date; Version:".VERSION_NUMBER;

  $status = STATUS_UNPROCESSED;

  $q = "INSERT INTO nyss_inbox_messages
        (message_id, sender_name, sender_email, subject, body,
         forwarder, status, format, debug, updated_date, email_date)
        VALUES ($messageId, '$fwdName', '$fwdEmail', '$fwdSubject',
                '$fwdBody', '$fromEmail', $status, '$fwdFormat', '$debug',
                CURRENT_TIMESTAMP, '$fwdDate');";

  if (mysql_query($q, $db) == false) {
    logmsg(PM_ERROR, "Unable to insert msgid=$messageId");
  }

  $q = "SELECT id FROM nyss_inbox_messages
        WHERE message_id=$messageId;";
  $res = mysql_query($q, $db);
  $rowCount = 0;
  while ($row = mysql_fetch_assoc($res)) {
    $rowId = $row['id'];
    $rowCount++;
  }
  mysql_free_result($res);

  logmsg(PM_DEBUG, "Inserted $rowCount message");
  if ($rowCount != 1) {
    logmsg(PM_WARN, "Problem inserting message; debug info:\n".print_r($fwdBody, true));
    logmsg(PM_DEBUG, "Query: $q");
    $bSuccess = false;
  }

  logmsg(PM_INFO, "Fetching attachments");
  $timeStart = microtime(true);

  // if there is more then one part to the message
  if (count($msgStruct->parts) > 1) {
    $attachments = array();
    foreach ($msgStruct->parts as $partno => $pstruct) {
      //parse parts of email
      parseMimePart($mbox, $msgid, $pstruct, $partno+1, $attachments);
    }
  }

  $attachmentCount = count($attachments);
  if ($attachmentCount >= 1) {
    foreach ($attachments as $attachment) {
      $date = date('Ymdhis');
      $filename = mysql_real_escape_string($attachment['filename']);
      $size = mysql_real_escape_string($attachment['size']);
      $ext = mysql_real_escape_string($attachment['extension']);
      $allowed = mysql_real_escape_string($attachment['allowed']);
      $rejection = mysql_real_escape_string($attachment['rejected_reason']);
      $fileFull = '';

      if ($allowed) {
        $fileFull = $uploadInbox.'/'.$attachment['civifilename'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $fileFull);
        finfo_close($finfo);
      }

      $q = "INSERT INTO nyss_inbox_attachments
            (email_id, file_name, file_full, size, mime_type, ext, rejection)
            VALUES ($rowId, '$filename', '$fileFull', $size, '$mime', '$ext', '$rejection');";
      if (mysql_query($q, $db) == false) {
        logmsg(PM_ERROR, "Unable to insert attachment [$fileFull] for msgid=$rowId");
      }
    }
  }

  $timeEnd = microtime(true);
  logmsg(PM_DEBUG, "Attachments download time: ".($timeEnd-$timeStart));

  $q = "SELECT id FROM nyss_inbox_attachments WHERE email_id=$rowId";
  $res = mysql_query($q, $db);
  $dbAttachmentCount = mysql_num_rows($res);
  mysql_free_result($res);

  if ($dbAttachmentCount > 0) {
    logmsg(PM_DEBUG, "Inserted $dbAttachmentCount attachments");
  }

  return $bSuccess;
} // storeMessage()



// searchForMatches
// Creates an activity from parsed email parts.
// Detects email type (html|plain).
// Looks for the source_contact and if not found uses Bluebird Admin.
// Returns true/false to move the email to archive or not.
function searchForMatches($db, $params)
{
  $authForwarders = $params['authForwarders'];
  $uploadDir = $params['uploadDir'];

  // Check the items we have yet to match (unmatched=0, unprocessed=99)
  $q = "SELECT id, message_id, sender_email,
               subject, body, forwarder, updated_date
        FROM nyss_inbox_messages
        WHERE status=".STATUS_UNPROCESSED." OR status=".STATUS_UNMATCHED.";";
  $mres = mysql_query($q, $db);
  logmsg(PM_DEBUG, "Unprocessed/Unmatched records: ".mysql_num_rows($mres));

  while ($row = mysql_fetch_assoc($mres)) {
    $msg_row_id = $row['id'];
    $message_id = $row['message_id'];
    $sender_email = $row['sender_email'];
    $subject = $row['subject'];
    $body = $row['body'];
    $forwarder = $row['forwarder'];
    $email_date = $row['updated_date'];

    logmsg(PM_DEBUG, "Processing Record ID: $msg_row_id");

    // Use the e-mail from the body of the message (or header if direct) to
    // find target contact
    logmsg(PM_INFO, "Looking for the original sender ($sender_email) in Civi");

    $q = "SELECT c.id, e.email
          FROM civicrm_contact c
          LEFT JOIN civicrm_email e ON (c.id = e.contact_id)
          WHERE c.is_deleted=0 AND e.email LIKE '$sender_email'
          GROUP BY c.id
          ORDER BY c.id ASC, e.is_primary DESC";

    $contactID = 0;
    $matched_count = 0;
    $result = mysql_query($q, $db);

    while ($row = mysql_fetch_assoc($result)) {
      $contactID = $row['id'];
      $matched_count++;
    }

    // No matches, or more than one match, marks message as UNMATCHED.
    if ($matched_count != 1) {
      logmsg(PM_DEBUG, "Original sender $sender_email matches [$matched_count] records in this instance; leaving for manual addition");
      // mark it to show up on unmatched screen
      $status = STATUS_UNMATCHED;
      $q = "UPDATE nyss_inbox_messages SET status=$status WHERE id=$msg_row_id";
      if (mysql_query($q, $db) == false) {
        logmsg(PM_ERROR, "Unable to update status of message id=$msg_row_id");
      }
    }
    else {
      // Matched on a single contact.  Success!
      logmsg(PM_INFO, "Original sender [$sender_email] had a direct match (cid=$contactID)");

      // Set the activity creator ID to the contact ID of the forwarder.
      if (isset($authForwarders[$forwarder])) {
        $forwarderId = $authForwarders[$forwarder];
        logmsg(PM_INFO, "Forwarder [$forwarder] mapped to cid=$forwarderId");
      }
      else {
        $forwarderId = 1;
        logmsg(PM_WARN, "Unable to locate [$forwarder] in the auth forwarder mapping table; using Bluebird Admin");
      }

      // create the activity
      $activityDefaults = $params['activityDefaults'];
      $activityParams = array(
                  "source_contact_id" => $forwarderId,
                  "subject" => $subject,
                  "details" =>  $body,
                  "activity_date_time" => $email_date,
                  "status_id" => $activityDefaults['status'],
                  "priority_id" => $activityDefaults['priority'],
                  "activity_type_id" => $activityDefaults['type'],
                  "duration" => 1,
                  "is_auto" => 1,
                  // "original_id" => $email->uid,
                  "target_contact_id" => $contactID,
                  "version" => 3
      );

      $activityResult = civicrm_api('activity', 'create', $activityParams);

      if ($activityResult['is_error']) {
        logmsg(PM_ERROR, "Could not save activity; {$activityResult['error_message']}");
      }
      else {
        $activityId = $activityResult['id'];
        logmsg(PM_INFO, "CREATED e-mail activity id=$activityId for contact id=$contactID");
        $status = STATUS_MATCHED;
        $q = "UPDATE nyss_inbox_messages
              SET status=$status, matcher=1, matched_to=$contactID,
                  activity_id=$activityId
              WHERE id=$msg_row_id";
        if (mysql_query($q, $db) == false) {
          logmsg(PM_ERROR, "Unable to update info for message id=$msg_row_id");
        }

        $q = "SELECT file_name, file_full, rejection, mime_type
              FROM nyss_inbox_attachments
              WHERE email_id=$msg_row_id";
        $ares = mysql_query($q, $db);

        while ($row = mysql_fetch_assoc($ares)) {
          if ((!isset($row['rejection']) || $row['rejection'] == '')
              && file_exists($row['file_full'])) {
            logmsg(PM_INFO, "Adding attachment ".$row['file_full']." to activity id=$activityId");
            $date = date("Y-m-d H:i:s");
            $newName = CRM_Utils_File::makeFileName($row['file_name']);
            $file = "$uploadDir/$newName";
            // Move file to the CiviCRM custom upload directory
            rename($row['file_full'], $file);

            $q = "INSERT INTO civicrm_file
                  (mime_type, uri, upload_date)
                  VALUES ('{$row['mime_type']}', '$newName', '$date');";
            if (mysql_query($q, $db) == false) {
              logmsg(PM_ERROR, "Unable to insert attachment file info for [$newName]");
            }

            $q = "SELECT id FROM civicrm_file WHERE uri='{$newName}';";
            $res = mysql_query($q, $db);
            while ($row = mysql_fetch_assoc($res)) {
              $fileId = $row['id'];
            }
            mysql_free_result($res);

            $q = "INSERT INTO civicrm_entity_file
                  (entity_table, entity_id, file_id)
                  VALUES ('civicrm_activity', $activityId, $fileId);";
            if (mysql_query($q, $db) == false) {
              logmsg(PM_ERROR, "Unable to insert attachment mapping from activity id=$activityId to file id=$fileId");
            }
          }
        } // while rows in nyss_inbox_attachments
        mysql_free_result($ares);
      } // if activity created
    } // if single match on e-mail address
  } // while rows in nyss_inbox_messages

  mysql_free_result($mres);
  logmsg(PM_DEBUG, "Finished processing unprocessed/unmatched messages");
  return;
} // searchForMatches()



function listMailboxes($mbox, $params)
{
  $inboxes = imap_list($mbox, '{'.$params['server'].'}', "*");
  foreach ($inboxes as $inbox) {
    echo "$inbox\n";
  }
  return true;
} // listMailboxes()



function deleteArchiveBox($mbox, $params)
{
  $crm_archivebox = '{'.$params['server'].'}'.$params['archivebox'];
  logmsg(PM_INFO, "Deleting archive mailbox: $crm_archivebox");
  return imap_deletemailbox($mbox, $crm_archivebox);
} // deleteArchiveBox()



function sendDenialEmail($site, $email)
{
  require_once 'CRM/Utils/Mail.php';
  $subj = INVALID_EMAIL_SUBJECT." [$site]";
  $text = "CRM Instance: $site\n\n".INVALID_EMAIL_TEXT;
  $mailParams = array('from'    => INVALID_EMAIL_FROM,
                      'toEmail' => $email,
                      'subject' => $subj,
                      'html'    => str_replace("\n", '<br/>', $text),
                      'text'    => $text
                     );

  $rc = CRM_Utils_Mail::send($mailParams);
  if ($rc == true) {
    logmsg(PM_INFO, "Denial e-mail has been sent to $email");
  }
  else {
    logmsg(PM_WARN, "Unable to send a denial e-mail to $email");
  }
  return $rc;
} // sendDenialEmail()



function logmsg($log_level, $msg)
{
  global $g_crm_instance;
  global $g_log_level;
  global $g_log_levels;

  if ($g_log_level >= $log_level) {
    $date_str = date('YmdHis');
    $level_text = $g_log_levels[$log_level];
    echo "$g_crm_instance $date_str $level_text $msg\n";
  }
} /* logmsg() */

?>
