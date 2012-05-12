<?php
# settings.php - Drupal configuration file
#
# Project: BluebirdCRM
# Author: Ken Zalewski
# Organization: New York State Senate
# Date: 2010-09-10
# Revised: 2011-06-11
#
# This customized settings.php file takes advantage of the strict CRM
# hostname naming scheme that we have developed.  Each CRM instance is
# of the form <instanceName>.crm.nysenate.gov.  The <instanceName> maps
# indirectly to the databases that are used for that instance via the
# Bluebird configuration file.
#

require_once dirname(__FILE__).'/../../../civicrm/scripts/bluebird_config.php';

# Use Bluebird custom maintenance pages within our own custom theme.
$conf['maintenance_theme'] = 'rayCivicrm';

$bbconfig = get_bluebird_instance_config();

if ($bbconfig == null) {
  $GLOBALS['maintenance_message'] = "<br/>There is no such CRM instance:<br/><br/>".$_SERVER['HTTP_HOST'];
  drupal_maintenance_theme();
  drupal_site_offline();
  exit(1);
}

if (isset($bbconfig['xhprof.profile']) && $bbconfig['xhprof.profile']) {
  function xhprof_shutdown_func($source="bluebird", $run_id=NULL) {
    // Hopefully we don't throw an exception cause there's no way to catch it now...
    $xhprof_data = xhprof_disable();

    // Check to see if the custom/civicrm/php path has been added to the path
    if (!stream_resolve_include_path("xhprof_lib/utils/xhprof_runs.php"))
      return; // Can't do anything without this...

    require_once "xhprof_lib/utils/xhprof_runs.php";

    // Save the run under a namespace "bluebird" with an autogenerated uid.
    // uid can also be supplied as a third optional parameter to save_run
    $xhprof_runs = new XHProfRuns_Default();

    // In case no run_id was passed in, set it now from the return value
    $run_id = $xhprof_runs->save_run($xhprof_data, $source, $run_id);

    //TODO: Make some sort of link to the profile output.
  }

  // Build the profiling flags based on configuration parameters
  $flags = 0;
  if (isset($bbconfig['xhprof.memory']) && $bbconfig['xhprof.memory'])
    $flags += XHPROF_FLAGS_MEMORY;
  if (isset($bbconfig['xhprof.cpu']) && $bbconfig['xhprof.cpu'])
    $flags += XHPROF_FLAGS_CPU;
  if (!isset($bbconfig['xhprof.builtins']) || !$bbconfig['xhprof.builtins'])
    $flags += XHPROF_FLAGS_NO_BUILTINS;

  // Build the ignore list based on configuration parameters
  $ignored_functions = array();
  if (isset($bbconfig['xhprof.ignore']) && $bbconfig['xhprof.ignore']) {
    $ignored_functions = $bbconfig['xhprof.ignore'];
  }

  xhprof_enable($flags, array('ignored_functions' => $ignored_functions));
  register_shutdown_function('xhprof_shutdown_func', "bluebird", NULL);
}

$db_url = $bbconfig['drupal_db_url'];
$db_prefix = '';
$update_free_access = FALSE;

ini_set('arg_separator.output',     '&amp;');
ini_set('magic_quotes_runtime',     0);
ini_set('magic_quotes_sybase',      0);
ini_set('session.cache_expire',     200000);
ini_set('session.cache_limiter',    'none');
ini_set('session.cookie_lifetime',  2000000);
ini_set('session.gc_maxlifetime',   200000);
ini_set('session.save_handler',     'user');
ini_set('session.use_cookies',      1);
ini_set('session.use_only_cookies', 1);
ini_set('session.use_trans_sid',    0);
ini_set('url_rewriter.tags',        '');

# ini_set('pcre.backtrack_limit', 200000);
# ini_set('pcre.recursion_limit', 200000);

$cookie_domain = $bbconfig['servername'];

# $conf = array(
#   'site_name' => 'My Drupal site',
#   'theme_default' => 'minnelli',
#   'anonymous' => 'Visitor',
#   'maintenance_theme' => 'minnelli',
#   'reverse_proxy' => TRUE,
#   'reverse_proxy_addresses' => array('a.b.c.d', ...),
# );

# $conf['locale_custom_strings_en'] = array(
#   'forum'      => 'Discussion board',
#   '@count min' => '@count minutes',
# );

$GLOBALS['simpletest_installed'] = TRUE;
if (preg_match("/^simpletest\d+$/", $_SERVER['HTTP_USER_AGENT'])) {
  $db_prefix = $_SERVER['HTTP_USER_AGENT'];
}

# Cacherouter: Try to use APC for all local caching
$cache_engine = 'db';
if (function_exists("apc_fetch")) {
  $cache_engine = 'apc';
}
$conf['cache_inc'] = './sites/all/modules/cacherouter/cacherouter.inc';
$conf['cacherouter'] = array(
  'default' => array(
    'engine' => $cache_engine,
    'shared' => FALSE,
    'prefix' => $bbconfig['servername'],
    'static' => FALSE,
    'fast_cache' => TRUE,
  ),
);

# Varnish reverse proxy on localhost
$conf['reverse_proxy'] = TRUE;           
$conf['reverse_proxy_addresses'] = array('127.0.0.1'); 

