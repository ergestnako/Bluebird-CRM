<?php
require_once 'CRM/Core/Error.php';
require_once 'CRM/Core/DAO.php';


class CRM_NYSS_AJAX_Mailing
{
  private static $db = null;
  private static $bbconfig = null;

  /* db()
   * Parameters: None.
   * Returns: The database object for the instance.
   * Occasionally we'll need the raw database connection to do
   * some processing, this will get the database connection from
   * CiviCRM and set it to a static variable.
   */
  private static function db()
  {
    // Load the DAO Object and pull the connection
    if (self::$db == null) {
      $nyss_conn = new CRM_Core_DAO();
      $nyss_conn = $nyss_conn->getDatabaseConnection();
      self::$db = $nyss_conn->connection;
    }
    return self::$db;
  } // db()


  /* get($key)
   * Parameters: $key: The name of the input in the GET message.
   * Returns: The escaped string.
   * We want to be able to escape the string so when we use
   * the key in a query, it's already sanitized.
   */
  private static function get($key)
  {
    // Call mysql_real_escape_string using the db() connection object
    return mysql_real_escape_string($_GET[$key], self::db());
  } // get()


  /* checkTest()
   * Parameters:
   * groupid = the group you would like to check
   * Returns: An Object message details to map to the output.
   */
  public static function checkTest()
  {
    $groupid = self::get('group');
    if (!empty($groupid)) {
      $output['count']  = count(CRM_Contact_BAO_Group::getMember($groupid));
      $query = "SELECT  g.title AS title
      FROM civicrm_group g
      WHERE g.id = ".$groupid;

      $result = mysql_query($query, self::db());
      while ($row = mysql_fetch_assoc($result)) {
        $output['title'] = $row['title'];
      }

      if ($output['count'] <= 10) {
        $message = 'SUCCESS';
        $code = 'SUCCESS';
        $status = 0;
      }
      else {
        $message = "There are {$output['count']} contacts in '{$output['title']}'.<br/><br/>Are you sure that you want to send this test message to all of them?";
        $code = 'WARN';
        $status = 2;
      }

      $returnCode = array('code'=>$code, 'status'=>$status, 'message'=>$message, 'count'=>$output['count'], 'group'=>$output['title']);
      echo json_encode($returnCode);
      mysql_close(self::$db);
      CRM_Utils_System::civiExit();
    }
    else {
      $returnCode = array('code'=>"Error", 'status'=> 1, 'message'=>"nothing selected", 'count'=>0, 'group'=>0);
      echo json_encode($returnCode);
      mysql_close(self::$db);
      CRM_Utils_System::civiExit();
    }
  } // checkTest()
}
