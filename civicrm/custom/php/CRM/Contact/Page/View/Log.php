<?php

/*
 +--------------------------------------------------------------------+
 | CiviCRM version 3.3                                                |
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC (c) 2004-2010                                |
 +--------------------------------------------------------------------+
 | This file is a part of CiviCRM.                                    |
 |                                                                    |
 | CiviCRM is free software; you can copy, modify, and distribute it  |
 | under the terms of the GNU Affero General Public License           |
 | Version 3, 19 November 2007 and the CiviCRM Licensing Exception.   |
 |                                                                    |
 | CiviCRM is distributed in the hope that it will be useful, but     |
 | WITHOUT ANY WARRANTY; without even the implied warranty of         |
 | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.               |
 | See the GNU Affero General Public License for more details.        |
 |                                                                    |
 | You should have received a copy of the GNU Affero General Public   |
 | License and the CiviCRM Licensing Exception along                  |
 | with this program; if not, contact CiviCRM LLC                     |
 | at info[AT]civicrm[DOT]org. If you have questions about the        |
 | GNU Affero General Public License or the licensing of CiviCRM,     |
 | see the CiviCRM license FAQ at http://civicrm.org/licensing        |
 +--------------------------------------------------------------------+
*/

/**
 *
 * @package CRM
 * @copyright CiviCRM LLC (c) 2004-2010
 * $Id$
 *
 */

require_once 'CRM/Core/Page.php';

class CRM_Contact_Page_View_Log extends CRM_Core_Page {

	//NYSS need to sort the array after merge
	static function cmpFunc( $a, $b ) {
        return ( $a['date'] >= $b['date'] ) ? -1 : 1;
    }

   /**
     * This function is called when action is browse
     * 
     * return null
     * @access public
     */
    function browse( ) {
        require_once 'CRM/Core/DAO/Log.php';

        $log = new CRM_Core_DAO_Log( );
        
        $log->entity_table = 'civicrm_contact';
        $log->entity_id    = $this->_contactId;
        $log->orderBy( 'modified_date desc' );
        $log->find( );

        $clogEntries = array( );
        while ( $log->fetch( ) ) {
            list( $displayName, $contactImage ) = CRM_Contact_BAO_Contact::getDisplayAndImage( $log->modified_id );
            $clogEntries[] = array( 'id'    => $log->modified_id,
                                    'name'  => $displayName,
                                    'image' => $contactImage,
                                    'date'  => $log->modified_date,
								    'description' => $log->data ); //NYSS 2551
        }
		
		//NYSS 2551 need to retrieve activity logs for the current record
		require_once 'api/v2/ActivityContact.php';
		$params = array('contact_id' => $this->_contactId);
		$activities = civicrm_activity_contact_get($params);
		//CRM_Core_Error::debug($activities);
		$activityIDs = array();
		$activitySubject = array();
		foreach ( $activities['result'] as $activityID => $activityDetail ) {
			$activityIDs[] = $activityID;
			$activitySubject[$activityID] = $activityDetail['subject'];
		}
		$activityIDlist = implode(',', $activityIDs);
		//CRM_Core_Error::debug($activityIDlist);
		$allContacts = 0;
		$sqlAlogs = "SELECT entity_id, data, modified_id, modified_date
					 FROM civicrm_log
					 WHERE entity_table = 'civicrm_activity' AND entity_id IN ($activityIDlist);";
		$dao = CRM_Core_DAO::executeQuery( $sqlAlogs );
		$alogEntries = array( );
		while ( $dao->fetch( ) ) {
            list( $displayName, $contactImage ) = CRM_Contact_BAO_Contact::getDisplayAndImage( $dao->modified_id );
			$alogEntries[] = array( 'id'    => $dao->modified_id,
                                    'name'  => $displayName,
                                    'image' => $contactImage,
                                    'date'  => $dao->modified_date,
								    'description' => $dao->data );
        }
		$logEntries = array_merge_recursive( $clogEntries, $alogEntries );
		usort( $logEntries, array('CRM_Contact_Page_View_Log', 'cmpFunc') );
		
		$this->assign( 'logCount', count( $logEntries ) );
        $this->assign_by_ref( 'log', $logEntries );
		$this->assign( 'displayName', $displayName ); //NYSS 2551
				
    }

    function preProcess() {
        $this->_contactId = CRM_Utils_Request::retrieve( 'cid', 'Positive', $this, true );
        $this->assign( 'contactId', $this->_contactId );

        // check logged in url permission
        require_once 'CRM/Contact/Page/View.php';
        CRM_Contact_Page_View::checkUserPermission( $this );
        
        $this->_action = CRM_Utils_Request::retrieve('action', 'String', $this, false, 'browse');
        $this->assign( 'action', $this->_action);
    }

   /**
     * This function is the main function that is called when the page loads, it decides the which action has to be taken for the page.
     * 
     * return null
     * @access public
     */
    function run( ) {
        $this->preProcess( );

        $this->browse( );

        return parent::run( );
    }

}


