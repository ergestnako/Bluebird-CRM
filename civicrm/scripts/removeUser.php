<?php

/*
 * Project: BluebirdCRM
 * Authors: Brian Shaughnessy
 * Organization: New York State Senate
 * Date: 2014-02-13
 *
 * Given an LDAP user id, purge the user and their associated contact record from the system
 */

// ./removeUser.php -S skelos --dryrun --user=USERNAME
error_reporting(E_ERROR | E_PARSE | E_WARNING);
set_time_limit(0);

define('DEFAULT_LOG_LEVEL', 'TRACE');

class CRM_removeUser {

  function run() {

    global $_SERVER;

    require_once 'script_utils.php';

    // Parse the options
    $shortopts = "d:u";
    $longopts = array("dryrun", "username=");
    $optlist = civicrm_script_init($shortopts, $longopts, TRUE);

    if ($optlist === null) {
      $stdusage = civicrm_script_usage();
      $usage = '[--dryrun] [--username USERNAME]';
      error_log("Usage: ".basename(__FILE__)."  $stdusage  $usage\n");
      exit(1);
    }

    if ( empty($optlist['username']) ) {
      bbscript_log(LL::FATAL, "The LDAP username must be provided.");
      exit();
    }

    //get instance settings
    $bbcfg = get_bluebird_instance_config($optlist['site']);
    //bbscript_log(LL::TRACE, "bbcfg", $bbcfg);

    $civicrm_root = $bbcfg['drupal.rootdir'].'/sites/all/modules/civicrm';
    $_SERVER['REMOTE_ADDR'] = '127.0.0.1';

    // Initialize CiviCRM
    require_once 'CRM/Core/Config.php';
    $config = CRM_Core_Config::singleton();
    $session = CRM_Core_Session::singleton();

    self::removeUser($bbcfg, $optlist['dryrun'], $optlist['username']);
  }//run

  function removeUser($bbcfg, $dryrun, $username) {
    //get user id
    $sql = "
      SELECT uid
      FROM {$bbcfg['db.drupal.prefix']}{$bbcfg['db.basename']}.users
      WHERE name = '{$username}';
    ";
    $userID = CRM_Core_DAO::singleValueQuery($sql);

    if ( !$userID ) {
      bbscript_log(LL::FATAL, "The LDAP username was not found in this instance.");
      exit();
    }

    //get contact ID
    $contactID = civicrm_api('uf_match', 'getvalue',
      array(
        'version' => 3,
        'uf_id' => $userID,
        'return' => 'contact_id'
      )
    );

    if ( $contactID ) {
      //delete contact
      civicrm_api('contact', 'delete',
        array(
          'version' => 3,
          'id' => $contactID,
          'skip_undelete' => TRUE,
        )
      );
    }

    //delete user, role map, authmap
    $sql = "
      DELETE FROM {$bbcfg['db.drupal.prefix']}{$bbcfg['db.basename']}.users
      WHERE name = '{$username}';
    ";
    CRM_Core_DAO::executeQuery($sql);

    $sql = "
      DELETE FROM {$bbcfg['db.drupal.prefix']}{$bbcfg['db.basename']}.users_roles
      WHERE uid = {$userID};
    ";
    CRM_Core_DAO::executeQuery($sql);

    $sql = "
      DELETE FROM {$bbcfg['db.drupal.prefix']}{$bbcfg['db.basename']}.authmap
      WHERE uid = {$userID};
    ";
    CRM_Core_DAO::executeQuery($sql);

    bbscript_log(LL::INFO, "user [{$username} ({$userID}/{$contactID})] has been removed.");
  }//removeUser

}//end class

//run the script if called directly
$script = new CRM_removeUser();
$script->run();
