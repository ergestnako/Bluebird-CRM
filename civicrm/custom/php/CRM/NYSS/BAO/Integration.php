<?php

/*
 * Project: BluebirdCRM
 * Authors: Brian Shaughnessy
 * Organization: New York State Senate
 * Date: 2015-04-10
 */

class CRM_NYSS_BAO_Integration {

  /*
   * given a website user Id, conduct a lookup to get the contact Id
   * if none, return empty
   */
  static function getContact($userId) {
    $cid = CRM_Core_DAO::singleValueQuery("
      SELECT id
      FROM civicrm_contact
      WHERE web_user_id = {$userId}
    ");

    return $cid;
  }//getContact

  /*
   * attempt to match the record with existing contacts
   */
  static function matchContact($params) {
    //format params to pass to dedupe tool
    $dedupeParams = array(
      'civicrm_contact' => array(
        'first_name' => $params['first_name'],
        'last_name' => $params['last_name'],
        'postal_code' => $params['postal_code'],
        'birth_date' => $params['birth_date'],
        'gender_id' => $params['gender_id'],
      ),
      'civicrm_address' => array(
        'street_address' => $params['street_address'],
        'city' => $params['city'],
        'postal_code' => $params['postal_code'],
      ),
    );

    if ( !empty($params['email']) ) {
      $dedupeParams['civicrm_email']['email'] = $params['email'];
    }

    $dedupeParams = CRM_Dedupe_Finder::formatParams($dedupeParams, 'Individual');
    $dedupeParams['check_permission'] = 0;

    //get indiv unsupervised rule
    $ruleTitle = CRM_Core_DAO::singleValueQuery("
      SELECT title
      FROM civicrm_dedupe_rule_group
      WHERE id = 1
    ");

    $o = new stdClass();
    $o->title = $ruleTitle;
    $o->params = $dedupeParams;
    $o->noRules = FALSE;
    $tableQueries = array();
    nyss_dedupe_civicrm_dupeQuery($o, 'table', $tableQueries);
    $sql = $tableQueries['civicrm.custom.5'];
    $sql = "
      SELECT contact.id
      FROM civicrm_contact as contact JOIN ($sql) as dupes
      WHERE dupes.id1 = contact.id AND contact.is_deleted = 0
    ";
    $r = CRM_Core_DAO::executeQuery($sql);

    $dupeIDs = array();
    while($r->fetch()) {
      $dupeIDs[] = $r->id;
    }

    //if dupe found, return id
    if ( !empty( $dupeIDs ) ) {
      $cid = $dupeIDs[0];
    }
    else {
      //if not found, create new contact
      $cid = self::createContact($params);
    }

    //set user id
    if (!empty($cid)) {
      CRM_Core_DAO::executeQuery("
        UPDATE civicrm_contact
        SET web_user_id = {$params['web_user_id']}
        WHERE id = {$cid}
      ");

      return $cid;
    }
    else {
      return array(
        'is_error' => 'Unable to match or create contact',
        'params' => $params,
      );
    }
  }

  /*
   * create a new contact
   */
  static function createContact($params) {
    $contact = civicrm_api('contact', 'create', array('version' => 3, 'contact_type' => 'Individual') + $params);
    //CRM_Core_Error::debug_var('contact', $contact);

    return $contact['id'];
  }//createContact

  //TODO when a user moves to a different district, need to reset web_user_id

  static function processIssue($contactId, $action, $params) {
    //bbscript_log('trace', '$contactId', $contactId);
    //bbscript_log('trace', '$action', $action);
    //bbscript_log('trace', '$params', $params);

    //find out if tag exists
    $parentId = CRM_Core_DAO::singleValueQuery("
      SELECT id
      FROM civicrm_tag
      WHERE name = 'Website Issues'
        AND is_tagset = 1
    ");
    $tagId = CRM_Core_DAO::singleValueQuery("
      SELECT id
      FROM civicrm_tag
      WHERE name = '{$params->issue_name}'
        AND parent_id = {$parentId}
    ");
    //CRM_Core_Error::debug_var('tagId', $tagId);

    if (!$tagId) {
      $tag = civicrm_api('tag', 'create', array(
        'version' => 3,
        'name' => $params->issue_name,
        'parent_id' => $parentId,
        'is_selectable' => 0,
        'is_reserved' => 1,
        'used_for' => 'civicrm_contact',
        'created_date' => date('Y-m-d H:i:s'),
        'description' => '',//TODO store link back to website
      ));
      //CRM_Core_Error::debug_var('$tag', $tag);

      if ($tag['is_error']) {
        return $tag;
      }

      $tagId = $tag['id'];
    }

    //clear tag cache; entity_tag sometimes fails because newly created tag isn't recognized by pseudoconstant
    civicrm_api3('Tag', 'getfields', array('cache_clear' => 1));

    $apiAction = ($action == 'follow') ? 'create' : 'delete';
    $et = civicrm_api('entity_tag', $apiAction, array(
      'version' => 3,
      'entity_table' => 'civicrm_contact',
      'entity_id' => $contactId,
      'tag_id' => $tagId,
    ));

    if ($et['is_error']) {
      return $et;
    }

    return true;
  }//processIssue

  static function processCommittee($contactId, $action, $params) {
    //bbscript_log('trace', '$contactId', $contactId);
    //bbscript_log('trace', '$action', $action);
    //bbscript_log('trace', '$params', $params);

    //find out if tag exists
    $parentId = CRM_Core_DAO::singleValueQuery("
      SELECT id
      FROM civicrm_tag
      WHERE name = 'Website Committees'
        AND is_tagset = 1
    ");
    $tagId = CRM_Core_DAO::singleValueQuery("
      SELECT id
      FROM civicrm_tag
      WHERE name = '{$params->committee_name}'
        AND parent_id = {$parentId}
    ");
    //CRM_Core_Error::debug_var('tagId', $tagId);

    if (!$tagId) {
      $tag = civicrm_api('tag', 'create', array(
        'version' => 3,
        'name' => $params->committee_name,
        'parent_id' => $parentId,
        'is_selectable' => 0,
        'is_reserved' => 1,
        'used_for' => 'civicrm_contact',
        'created_date' => date('Y-m-d H:i:s'),
        'description' => ''//TODO store link back to website
      ));
      //CRM_Core_Error::debug_var('$tag', $tag);

      if ($tag['is_error']) {
        return $tag;
      }

      $tagId = $tag['id'];
    }

    //clear tag cache; entity_tag sometimes fails because newly created tag isn't recognized by pseudoconstant
    civicrm_api3('Tag', 'getfields', array('cache_clear' => 1));

    $apiAction = ($action == 'follow') ? 'create' : 'delete';
    $et = civicrm_api('entity_tag', $apiAction, array(
      'version' => 3,
      'entity_table' => 'civicrm_contact',
      'entity_id' => $contactId,
      'tag_id' => $tagId,
    ));

    if ($et['is_error']) {
      return $et;
    }

    return true;
  }//processCommittee

  static function processBill($contactId, $action, $params) {
    //bbscript_log('trace', '$contactId', $contactId);
    //bbscript_log('trace', '$action', $action);
    //bbscript_log('trace', '$params', $params);

    //find out if tag exists
    $parentId = CRM_Core_DAO::singleValueQuery("
      SELECT id
      FROM civicrm_tag
      WHERE name = 'Website Bills'
        AND is_tagset = 1
    ");

    //build bill value text
    $billNumber = "{$params->bill_number}-{$params->bill_year}";

    if (!empty($params->bill_sponsor)) {
      $sponsor = strtoupper($params->bill_sponsor);
    }
    else {
      $target_url = CRM_Admin_Page_AJAX::OPENLEG_BASE_URL.'/api/1.0/json/search/?term=otype:bill+AND+oid:('.$billNumber.')&pageSize=100&sort=year&sortOrder=true';
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, $target_url);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
      $content = curl_exec($ch);
      curl_close($ch);
      $json = json_decode($content, true);
      //CRM_Core_Error::debug_var('json', $json);

      $sponsor = strtoupper($json[0]['sponsor']);
    }

    $bill = "{$billNumber} ({$sponsor})";

    //construct tag name and determine action
    switch ($action) {
      case 'follow':
        $apiAction = 'create';
        $tagName = "{$bill}";
        break;
      case 'unfollow':
        $apiAction = 'delete';
        $tagName = "{$bill}";
        break;
      case 'aye':
        $apiAction = 'create';
        $tagName = "{$bill}: FOR";
        break;
      case 'nay':
        $apiAction = 'create';
        $tagName = "{$bill}: AGAINST";
        break;
      default:
        return array(
          'is_error' => 1,
          'message' => 'Unable to determine bill action',
          'contactId' => $contactId,
          'action' => $action,
          'params' => $params,
        );
    }

    $tagId = CRM_Core_DAO::singleValueQuery("
      SELECT id
      FROM civicrm_tag
      WHERE name = '{$tagName}'
        AND parent_id = {$parentId}
    ");
    //CRM_Core_Error::debug_var('tagId', $tagId);

    if (!$tagId) {
      //$url = "http://nysenatedemo.prod.acquia-sites.com/legislation/bills/{$params->bill_year}/{$params->bill_number}";
      $url = "http://www.nysenate.gov/legislation/bills/{$params->bill_year}/{$params->bill_number}";
      $tag = civicrm_api('tag', 'create', array(
        'version' => 3,
        'name' => $tagName,
        'parent_id' => $parentId,
        'is_selectable' => 0,
        'is_reserved' => 1,
        'used_for' => 'civicrm_contact',
        'created_date' => date('Y-m-d H:i:s'),
        'description' => "{$tagName} :: <a href='$url' target=_blank>$url</a>",
      ));
      //CRM_Core_Error::debug_var('$tag', $tag);

      if ($tag['is_error']) {
        return $tag;
      }

      $tagId = $tag['id'];
    }

    //clear tag cache; entity_tag sometimes fails because newly created tag isn't recognized by pseudoconstant
    civicrm_api3('Tag', 'getfields', array('cache_clear' => 1));

    $et = civicrm_api('entity_tag', $apiAction, array(
      'version' => 3,
      'entity_table' => 'civicrm_contact',
      'entity_id' => $contactId,
      'tag_id' => $tagId,
    ));

    if ($et['is_error']) {
      return $et;
    }

    return true;
  }//processBill

  static function processPetition($contactId, $action, $params) {
    //bbscript_log('trace', '$contactId', $contactId);
    //bbscript_log('trace', '$action', $action);
    //bbscript_log('trace', '$params', $params);

    //find out if tag exists
    $parentId = CRM_Core_DAO::singleValueQuery("
      SELECT id
      FROM civicrm_tag
      WHERE name = 'Website Petitions'
        AND is_tagset = 1
    ");
    $tagId = CRM_Core_DAO::singleValueQuery("
      SELECT id
      FROM civicrm_tag
      WHERE name = '{$params->petition_name}'
        AND parent_id = {$parentId}
    ");
    //CRM_Core_Error::debug_var('tagId', $tagId);

    if (!$tagId) {
      $tag = civicrm_api('tag', 'create', array(
        'version' => 3,
        'name' => $params->petition_name,
        'parent_id' => $parentId,
        'is_selectable' => 0,
        'is_reserved' => 1,
        'used_for' => 'civicrm_contact',
        'created_date' => date('Y-m-d H:i:s'),
        'description' => '',//TODO store link back to website
      ));
      //CRM_Core_Error::debug_var('$tag', $tag);

      if ($tag['is_error']) {
        return $tag;
      }

      $tagId = $tag['id'];
    }

    //clear tag cache; entity_tag sometimes fails because newly created tag isn't recognized by pseudoconstant
    civicrm_api3('Tag', 'getfields', array('cache_clear' => 1));

    $apiAction = ($action == 'sign') ? 'create' : 'delete';
    $et = civicrm_api('entity_tag', $apiAction, array(
      'version' => 3,
      'entity_table' => 'civicrm_contact',
      'entity_id' => $contactId,
      'tag_id' => $tagId,
    ));

    if ($et['is_error']) {
      return $et;
    }

    return true;
  }//processPetition

  /*
   * process account records in the custom nyss_web_account table
   */
  static function processAccount($contactId, $action, $params, $created_date) {
    switch ($action) {
      case 'account created':
      case 'account deleted':
      case 'login':
      case 'logout':
        $sql = "
          INSERT INTO nyss_web_account
          (contact_id, action, created_date)
          VALUES
          ({$contactId}, '{$action}', '{$created_date}')
        ";
        CRM_Core_DAO::executeQuery($sql);

        break;

      default:
        return array(
          'is_error' => 1,
          'message' => 'Unable to determine account action',
          'contactId' => $contactId,
          'action' => $action,
          'params' => $params,
        );
    }

    return true;
  }//processAccount

  static function processProfile($contactId, $action, $params, $row) {
    //CRM_Core_Error::debug_var('processProfile $row', $row);

    //only available action is account edited
    if ($action != 'account edited') {
      return array(
        'is_error' => 1,
        'message' => 'Unknown action type for profile: '.$action,
        'params' => $params,
      );
    }

    $status = ($params->status) ? $params->status : 'edited';

    $profileParams = array(
      'entity_id' => $contactId,
      'custom_65' => $row->first_name,
      'custom_66' => $row->last_name,
      'custom_67' => $row->address1,
      'custom_68' => $row->address2,
      'custom_69' => $row->city,
      'custom_70' => $row->state,
      'custom_71' => $row->zip,
      'custom_72' => $row->email_address,
      'custom_73' => ($row->dob) ? date('Ymd', $row->dob) : '',//dob comes as timestamp
      'custom_74' => $row->gender,
      'custom_75' => $row->contact_me,
      'custom_76' => $row->top_issue,
      'custom_77' => $status,
      'custom_78' => $row->user_is_verified,
      'custom_79' => date('YmdHis', $row->created_at),
    );
    //CRM_Core_Error::debug_var('profileParams', $profileParams);

    try{
      $result = civicrm_api3('custom_value', 'create', $profileParams);
      //CRM_Core_Error::debug_var('update profile result', $result);
    }
    catch (CiviCRM_API3_Exception $e) {
      // handle error here
      $errorMessage = $e->getMessage();
      $errorCode = $e->getErrorCode();
      $errorData = $e->getExtraParams();

      return array(
        'is_error' => true,
        'error' => $errorMessage,
        'error_code' => $errorCode,
        'error_data' => $errorData
      );
    }

    return true;
  }//processProfile

  /*
   * process communication and contextual messages as notes
   */
  static function processCommunication($contactId, $action, $params, $type) {
    if ($type == 'DIRECTMSG') {
      $entity_table = 'nyss_directmsg';
      $subject = 'Direct Message';
      $note = $params->message;

      if (empty($note)) {
        $note = '[no message]';
      }
    }
    else {
      $entity_table = 'nyss_contextmsg';
      $subject = 'Contextual Message';

      //TODO create link to openleg?
      $note = "{$params->message}\n\n
        Bill Number: {$params->bill_number}\n
        Bill Year: {$params->bill_year}
      ";
    }

    //TODO with contextmsg, devise way to trace to source
    //TODO adapt entity_id if there is a thread

    $params = array(
      'entity_table' => $entity_table,
      'entity_id' => $contactId,
      'note' => $note,
      'contact_id' => $contactId,
      'modified_date' => date('Y-m-d H:i:s'),
      'subject' => "Website {$subject}",
    );

    try{
      $result = civicrm_api3('note', 'create', $params);
      //CRM_Core_Error::debug_var('processCommunication result', $result);
    }
    catch (CiviCRM_API3_Exception $e) {
      // handle error here
      $errorMessage = $e->getMessage();
      $errorCode = $e->getErrorCode();
      $errorData = $e->getExtraParams();

      return array(
        'is_error' => true,
        'error' => $errorMessage,
        'error_code' => $errorCode,
        'error_data' => $errorData
      );
    }

    return $result;
  }

  /*
   * handle surveys (questionnaire response) with
   */
  static function processSurvey($contactId, $action, $params) {
    //bbscript_log('trace', '$params', $params);

    //check if survey exists; if not, construct fields
    if (!$flds = self::surveyExists($params)) {
      $flds = self::buildSurvey($params);
    }

    if (empty($flds)) {
      return false;
    }

    //build array for activity
    $actParams = array(
      'subject' => $params->form_title,
      'date' => date('Y-m-d H:i:s'),
      'activity_type_id' => CRM_Core_OptionGroup::getValue('activity_type', 'Website Survey', 'name'),
      'target_contact_id' => $contactId,
      'source_contact_id' => civicrm_api3('uf_match', 'getvalue', array(
        'uf_id' => 1,
        'return' => 'contact_id',
      )),
    );
    //CRM_Core_Error::debug_var('actParams', $actParams);
    $act = civicrm_api3('activity', 'create', $actParams);
    if ($act['is_error']) {
      return $act;
    }

    $custParams = array(
      'entity_id' => $act['id'],
      'custom_79' => $params->form_title,
      'custom_80' => $params->form_id,
    );

    foreach ($params->form_values as $k => $f) {
      //CRM_Core_Error::debug_var("field $k", $f);

      //some surveys are constructed with duplicate field names, so need to make
      //sure we don't overwrite or skip
      if (isset($flds[$f->field]) && !isset($custParams[$flds[$f->field]])) {
        $custParams[$flds[$f->field]] = $f->value;
      }
      else {
        //try alternate field label (if duplicate)
        $custParams[$flds["{$f->field} ({$k})"]] = $f->value;
      }
    }
    //CRM_Core_Error::debug_var('actParams', $actParams);
    $cf = civicrm_api3('custom_value', 'create', $custParams);

    if ($cf['is_error']) {
      return $cf;
    }

    return true;
  }//processProfile

  /*
   * get web account history for a contact
   */
  static function getAccountHistory($cid) {
    $sql = "
      SELECT *
      FROM nyss_web_account
      WHERE contact_id = {$cid}
      ORDER BY created_date DESC
      LIMIT 50
    ";
    $r = CRM_Core_DAO::executeQuery($sql);

    $rows = array();
    while ($r->fetch()) {
      $rows[] = array(
        'action' => $r->action,
        'created' => date('F jS, Y g:i A', strtotime($r->created_date)),
      );
    }

    return $rows;
  }

  /*
   * get web messages for a contact
   */
  static function getMessages($cid) {
    $sql = "
      SELECT *
      FROM civicrm_note
      WHERE entity_id = {$cid}
        AND entity_table IN ('nyss_contextmsg', 'nyss_directmsg')
      ORDER BY modified_date DESC
      LIMIT 50
    ";
    $r = CRM_Core_DAO::executeQuery($sql);

    $rows = array();
    while ($r->fetch()) {
      $rows[] = array(
        'subject' => $r->subject,
        'modified_date' => date('F jS, Y', strtotime($r->modified_date)),
        'note' => $r->note,
      );
    }

    return $rows;
  }

  /*
   * check if survey already exists; if so, return fields by label
   * else return false
   */
  function surveyExists($params) {
    if (empty($params->form_id)) {
      return false;
    }

    //see if any activity records exist with the survey id
    $act = CRM_Core_DAO::singleValueQuery("
      SELECT count(id)
      FROM civicrm_value_website_survey_10
      WHERE survey_id_80 = {$params->form_id}
    ");

    //see if custom set exists
    $cs = CRM_Core_DAO::singleValueQuery("
      SELECT *
      FROM civicrm_custom_group
      WHERE name LIKE 'Survey_{$params->form_id}'
    ");

    //CRM_Core_Error::debug_var('act', $act);
    //CRM_Core_Error::debug_var('cs', $cs);

    if (!$act && !$cs) {
      return false;
    }

    //get custom fields for this set
    $cf = civicrm_api3('custom_field', 'get', array('custom_group_id' => $cs));
    //CRM_Core_Error::debug_var('$cf', $cf);

    $fields = array();
    foreach ($cf['values'] as $id => $f) {
      $fields[$f['label']] = "custom_{$id}";
    }
    //CRM_Core_Error::debug_var('surveyExists $fields', $fields);

    return $fields;
  }//surveyExists

  /*
   * create custom data set and fields for survey
   */
  function buildSurvey($data) {
    if (empty($data->form_id)) {
      return false;
    }

    //create custom group
    $weight = CRM_Core_DAO::singleValueQuery("
      SELECT max(weight)
      FROM civicrm_custom_group
    ");
    $params = array(
      'name' => "Survey_{$data->form_id}",
      'title' => "Survey: {$data->form_title} [{$data->form_id}]",
      'extends' => array('0' => 'Activity'),
      'extends_entity_column_value' => CRM_Core_OptionGroup::getValue('activity_type', 'Website Survey', 'name'),
      'collapse_display' => 1,
      'collapse_adv_display' => 1,
      'style' => 'Inline',
      'is_active' => 1,
      'weight' => $weight++,
    );
    $cg = civicrm_api3('custom_group', 'create', $params);

    $fields = array();
    $weight = 0;
    foreach ($data->form_values as $k => $f) {
      //make sure label is unique
      $label = $f->field;
      if (array_key_exists($f->field, $fields)) {
        $label = "{$f->field} ({$k})";
      }
      $params = array(
        'custom_group_id' => $cg['id'],
        'label' => $label,
        'data_type' => 'String',
        'html_type' => 'Text',
        'is_searchable' => 1,
        'is_active' => 1,
        'is_view' => 1,
        'weight' => $weight++,
      );
      //CRM_Core_Error::debug_var('fields $params', $params);
      $cf = civicrm_api3('custom_field', 'create', $params);

      $fields[$f->field] = "custom_{$cf['id']}";
    }
    //CRM_Core_Error::debug_var('fields', $fields);

    return $fields;
  }//buildSurvey

  /*
   * get the four types of website tagset tags
   * return hierarchal array by tagset
   */
  static function getTags($cid) {
    $parentNames = CRM_Core_BAO_Tag::getTagSet('civicrm_contact');
    //CRM_Core_Error::debug_var('$parentNames', $parentNames);

    $tags = array(
      'Website Bills' =>
        CRM_Core_BAO_EntityTag::getChildEntityTagDetails(array_search('Website Bills', $parentNames), $cid),
      'Website Committees' =>
        CRM_Core_BAO_EntityTag::getChildEntityTagDetails(array_search('Website Committees', $parentNames), $cid),
      'Website Issues' =>
        CRM_Core_BAO_EntityTag::getChildEntityTagDetails(array_search('Website Issues', $parentNames), $cid),
      'Website Petitions' =>
        CRM_Core_BAO_EntityTag::getChildEntityTagDetails(array_search('Website Petitions', $parentNames), $cid),
    );

    //CRM_Core_Error::debug_var('$tags', $tags);
    return $tags;
  }//getTags

  /*
   * get activity stream for contact
   */
  static function getActivityStream() {
    //CRM_Core_Error::debug_var('getActivityStream $_REQUEST', $_REQUEST);

    $contactID = CRM_Utils_Type::escape($_REQUEST['cid'], 'Integer');
    //CRM_Core_Error::debug_var('getActivityStream $contactID', $contactID);

    $type = CRM_Utils_Type::escape($_REQUEST['type'], 'String', '');
    //CRM_Core_Error::debug_var('getActivityStream $type', $type);
    $typeSql = ($type) ? "AND type = '{$type}'" : '';

    $sortMapper = array(
      0 => 'type',
      1 => 'created_date',
      2 => 'details',
    );

    $sEcho = CRM_Utils_Type::escape($_REQUEST['sEcho'], 'Integer');
    $offset = isset($_REQUEST['iDisplayStart']) ? CRM_Utils_Type::escape($_REQUEST['iDisplayStart'], 'Integer') : 0;
    $rowCount = isset($_REQUEST['iDisplayLength']) ? CRM_Utils_Type::escape($_REQUEST['iDisplayLength'], 'Integer') : 25;
    $sort = isset($_REQUEST['iSortCol_0']) ? CRM_Utils_Array::value(CRM_Utils_Type::escape($_REQUEST['iSortCol_0'], 'Integer'), $sortMapper) : NULL;
    $sortOrder = isset($_REQUEST['sSortDir_0']) ? CRM_Utils_Type::escape($_REQUEST['sSortDir_0'], 'String') : 'asc';

    $params = $_REQUEST;
    if ($sort && $sortOrder) {
      $params['sortBy'] = $sort . ' ' . $sortOrder;
    }

    $params['page'] = ($offset / $rowCount) + 1;
    $params['rp'] = $rowCount;

    $params['contact_id'] = $contactID;
    //CRM_Core_Error::debug_var('getActivityStream $params', $params);

    $orderBy = ($params['sortBy']) ? $params['sortBy'] : 'created_date desc';

    $activity = array();
    $sql = "
      SELECT SQL_CALC_FOUND_ROWS *
      FROM nyss_web_activity
      WHERE contact_id = {$contactID}
        {$typeSql}
      ORDER BY {$orderBy}
      LIMIT {$rowCount} OFFSET {$offset}
    ";
    $dao = CRM_Core_DAO::executeQuery($sql);
    $totalRows = CRM_Core_DAO::singleValueQuery('SELECT FOUND_ROWS()');
    //CRM_Core_Error::debug_var('getActivityStream $totalRows', $totalRows);

    while ($dao->fetch()) {
      $activity[$dao->id] = array(
        //'contact_id' => $dao->contact_id,
        'type' => $dao->type,
        'created_date' => date('m/d/Y g:i A', strtotime($dao->created_date)),
        'details' => $dao->details,
      );
    }
    //CRM_Core_Error::debug_var('getActivityStream $activity', $activity);

    // store the activity filter preference CRM-11761
    $session = CRM_Core_Session::singleton();
    $userID = $session->get('userID');
    if ($userID) {
      //flush cache before setting filter to account for global cache (memcache)
      $domainID = CRM_Core_Config::domainID();
      $cacheKey = CRM_Core_BAO_Setting::inCache(
        CRM_Core_BAO_Setting::PERSONAL_PREFERENCES_NAME,
        'web_activity_filter',
        NULL,
        $userID,
        TRUE,
        $domainID,
        TRUE
      );
      if ( $cacheKey ) {
        CRM_Core_BAO_Setting::flushCache($cacheKey);
      }

      $activityFilter = array(
        'web_activity_type_filter' => $type,
      );

      CRM_Core_BAO_Setting::setItem(
        $activityFilter,
        CRM_Core_BAO_Setting::PERSONAL_PREFERENCES_NAME,
        'web_activity_type_filter',
        NULL,
        $userID,
        $userID
      );
    }

    $iFilteredTotal = $iTotal = $params['total'] = $totalRows;
    $selectorElements = array(
      'type', 'created_date', 'details',
    );

    echo CRM_Utils_JSON::encodeDataTableSelector($activity, $sEcho, $iTotal, $iFilteredTotal, $selectorElements);
    CRM_Utils_System::civiExit();
  }//getActivityStream

  /*
   * store basic details about the event in the activity log
   */
  static function storeActivityLog($cid, $type, $date, $details) {
    //CRM_Core_Error::debug_var('storeActivityLog', $type);

    CRM_Core_DAO::executeQuery("
      INSERT INTO nyss_web_activity
      (contact_id, type, created_date, details)
      VALUES
      ({$cid}, '{$type}', '{$date}', '{$details}')
    ");
  }//storeActivityLog

  /*
   * archive the accumulator record and then delete from accumulator
   */
  static function archiveRecord($table, $row, $params, $date) {
    //CRM_Core_Error::debug_var('archiveRecord $table', $table);
    //CRM_Core_Error::debug_var('archiveRecord $row', $row);
    //CRM_Core_Error::debug_var('archiveRecord $params', $params);
    //CRM_Core_Error::debug_var('archiveRecord $date', $date);

    //wrap in a transaction so we store archive and delete from accumulator together
    $transaction = new CRM_Core_Transaction();

    //extra fields by type
    $extraFields = array(
      'bill' => array(
        'bill_number',
        'bill_year',
      ),
      'issue' => array(
        'issue_name',
      ),
      'committee' => array(
        'committee_name',
      ),
      'contextmsg' => array(
        'bill_number',
      ),
      'petition' => array(
        'petition_id',
      ),
      'survey' => array(
        'form_id',
      ),
    );

    //setup fields
    $fields = array_keys(get_object_vars($row));
    //remove object properties
    foreach ($fields as $k => $f) {
      if (strpos($f, '_') === 0 || $f == 'N') {
        unset($fields[$k]);
      }
    }
    if (array_key_exists($table, $extraFields)) {
      $fields = array_merge($fields, $extraFields[$table]);
    }
    $fields[] = 'archive_date';
    $fieldList = implode(', ', $fields);
    //CRM_Core_Error::debug_var('archiveRecord $fields', $fields);

    //setup data
    $data = array();
    foreach ($row as $f => $v) {
      if (in_array($f, $fields)) {
        $data[] = CRM_Core_DAO::escapeString($v);
      }
    }
    foreach ($extraFields[$table] as $f) {
      $data[] = CRM_Core_DAO::escapeString($params->$f);
    }
    $data[] = $date;
    $dataList = implode("', '", $data);
    //CRM_Core_Error::debug_var('archiveRecord $data', $data);

    $sql = "
      INSERT INTO senate_web_integration.archive_{$table}
      ({$fieldList})
      VALUES
      ('{$dataList}')
    ";
    //CRM_Core_Error::debug_var('archiveRecord $sql', $sql);
    CRM_Core_DAO::executeQuery($sql);

    //now delete record from accumulator
    CRM_Core_DAO::executeQuery("
      DELETE FROM senate_web_integration.accumulator
      WHERE id = {$row->id}
    ");

    $transaction->commit();
  }
}//end class
