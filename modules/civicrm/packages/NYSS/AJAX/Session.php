<?php
/*
  Session class for BlueBird analytics
  Provides an easy reference object containing request parameters,
  database connections, configuration, etc.
*/

require_once 'CRM/Utils/Array.php';
require_once 'NYSS/Logger.php';
require_once 'NYSS/AJAX/Response.php';
require_once $_SERVER['DOCUMENT_ROOT'].'/../civicrm/scripts/bluebird_config.php';


class NYSS_AJAX_Session
{
  protected static $instance = null;

  public $bbconfig = null;
  public $request = null;
  public $response = null;
  public $logger = null;


  protected function __construct()
  {
    $this->loadBBConfig();
    $this->startLogger();
    $this->log("Logging started",NYSS_LOG_LEVEL_DEBUG);
    $this->_parseRequest();
    $this->response = new NYSS_AJAX_Response($this->req('req'));
  }


  public function configBBInstance($instance)
  {
    return CRM_Utils_Array::value("instance:$instance", $this->bbconfig, array());
  } // configBBInstance()


  public function configBBInstanceCredentials($instance = null)
  {
    if (!$instance) {
      $instance = $this->req('instance_account');
    }
    $ret = CRM_Utils_Array::value("imap.accounts", $this->configBBInstance($instance));
    return $ret ? explode('|', $ret) : null;
  } // configBBInstanceCredentials()


  public static function getInstance()
  {
    if (!(static::$instance)) {
      static::$instance = new static;
    }
    return static::$instance;
  } // getInstance()


  public function loadBBConfig($filename = null)
  {
    $this->bbconfig = get_bluebird_config($filename);
    if (!$this->bbconfig) {
      $this->response->sendFatal("Could not load config");
    }
  } // loadBBConfig()


  /* wrapper around $this->log() for easier reference */
  public function log($msg, $lvl = NYSS_LOG_LEVEL_INFO)
  {
    $this->logger->log($msg, $lvl);
  } // log()


  protected function _parseRequest()
  {
    $this->log("parseRequest full _REQUEST=\n".var_export($_REQUEST,1),NYSS_LOG_LEVEL_DEBUG);
    if (!is_array($this->request)) { $this->request = array(); }
    foreach ($_REQUEST as $k => $v) {
      $this->request[$k] = preg_replace('/[^-a-zA-Z0-9: _,.]/', '', $v);
      $this->log("parseRequest set $k = ".var_export($this->request[$k],1),NYSS_LOG_LEVEL_DEBUG);
    }
  } // _parseRequest()


  public function req($key, $default = null)
  {
    return CRM_Utils_Array::value($key, $this->request, $default);
  } // req()


  public function startLogger()
  {
    $level = $file = $loc = null;
    if (array_key_exists('debug',$this->bbconfig)) {
      $c = $this->bbconfig['debug'];
      $level = (int) CRM_Utils_Array::value('level', $c, $level);
      $file  =       CRM_Utils_Array::value('file',  $c, $file );
      $loc   =       CRM_Utils_Array::value('path',  $c, $loc  );
    }
    $this->logger = NYSS_Logger::getInstance($level, $file, $loc);
  } // startLogger()
}
