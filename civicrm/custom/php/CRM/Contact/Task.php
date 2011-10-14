<?php

/*
 +--------------------------------------------------------------------+
 | CiviCRM version 3.4                                                |
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC (c) 2004-2011                                |
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
 * @copyright CiviCRM LLC (c) 2004-2011
 * $Id$
 *
 */

/**
 * class to represent the actions that can be performed on a group of contacts
 * used by the search forms
 *
 */
require_once 'CRM/Contact/BAO/ContactType.php';
require_once 'CRM/Mailing/Info.php';
 
class CRM_Contact_Task
{
    const
        GROUP_CONTACTS        =     1,
        REMOVE_CONTACTS       =     2,
        TAG_CONTACTS          =     3,
        REMOVE_TAGS           =     4,
        EXPORT_CONTACTS       =     5,
        EMAIL_CONTACTS        =     6,
        SMS_CONTACTS          =     7,
        DELETE_CONTACTS       =     8,
        HOUSEHOLD_CONTACTS    =     9,
        ORGANIZATION_CONTACTS =    10,
        RECORD_CONTACTS       =    11,
        MAP_CONTACTS          =    12,
        SAVE_SEARCH           =    13,
        SAVE_SEARCH_UPDATE    =    14,
        PRINT_CONTACTS        =    15,
        LABEL_CONTACTS        =    16,
        BATCH_UPDATE          =    17,
        ADD_EVENT             =    18,
        PRINT_FOR_CONTACTS    =    19,
        EMAIL_UNHOLD          =    22,
        RESTORE               =    23,
        DELETE_PERMANENTLY    =    24,
		EXPORT_PRINTPROD      =   100, //NYSS export print production task
		EXPORT_DISTRICT		  =   101; //NYSS export district merger/purge task

    /**
     * the task array
     *
     * @var array
     * @static
     */
    static $_tasks = null;

    /**
     * the optional task array
     *
     * @var array
     * @static
     */
    static $_optionalTasks = null;

    static function initTasks( ) {
        if ( ! self::$_tasks ) {
            self::$_tasks = array(
                                  1     => array( 'title'  => ts( 'Add Contacts to Group'         ),
                                                  'class'  => 'CRM_Contact_Form_Task_AddToGroup' ),
                                  2     => array( 'title'  => ts( 'Remove Contacts from Group'    ),
                                                  'class'  => 'CRM_Contact_Form_Task_RemoveFromGroup' ),
                                  3     => array( 'title'  => ts( 'Tag Contacts (assign tags)'    ),
                                                  'class'  => 'CRM_Contact_Form_Task_AddToTag' ),
                                  4     => array( 'title'  => ts( 'Untag Contacts (remove tags)'  ),  
                                                  'class'  => 'CRM_Contact_Form_Task_RemoveFromTag' ),
                                  5     => array( 'title'  => ts( 'Export Contacts'               ),
                                                  'class'  => array( 'CRM_Export_Form_Select',
                                                                     'CRM_Export_Form_Map' ),
                                                  'result' => false ),
                                  6     => array( 'title'  => ts( 'Send Email to Contacts'        ),
                                                  'class'  => 'CRM_Contact_Form_Task_Email',
                                                  'result' => true ),
                                  7     => array( 'title'  => ts( 'Send SMS to Contacts'          ),
                                                  'class'  => 'CRM_Contact_Form_Task_SMS',
                                                  'result' => true ),
                                  8     => array( 'title'  => ts( 'Delete Contacts'               ),
                                                  'class'  => 'CRM_Contact_Form_Task_Delete',
                                                  'result' => false ),
                                  
                                  11    => array( 'title'  => ts( 'Record Activity for Contacts'  ),
                                                  'class'  => 'CRM_Activity_Form_Activity' ),
                                  13    => array( 'title'  => ts( 'New Smart Group'               ),
                                                  'class'  => 'CRM_Contact_Form_Task_SaveSearch',
                                                  'result' => true ),
                                  14    => array( 'title'  => ts( 'Update Smart Group'            ),
                                                  'class'  => 'CRM_Contact_Form_Task_SaveSearch_Update',
                                                  'result' => true ),
                                  15    => array( 'title'  => ts( 'Print Contacts'                ),
                                                  'class'  => 'CRM_Contact_Form_Task_Print',
                                                  'result' => false ),
                                  16    => array( 'title'  => ts( 'Mailing Labels'       ),
                                                  'class'  => 'CRM_Contact_Form_Task_Label',
                                                  'result' => true ),
                                  17    => array( 'title'  => ts( 'Batch Update via Profile'       ),
                                                  'class'  => array( 'CRM_Contact_Form_Task_PickProfile',
                                                                     'CRM_Contact_Form_Task_Batch' ),
                                                  'result' => true ),
                                  19    => array( 'title'  => ts( 'Print PDF Letter for Contacts' ),
                                                  'class'  => 'CRM_Contact_Form_Task_PDF',
                                                  'result' => true ),
                                  22    => array( 'title'  => ts('Unhold Emails'),
                                                  'class'  => 'CRM_Contact_Form_Task_Unhold' ),
                                  //NYSS - add print production export
								  100    => array( 'title'  => ts('Export for Print Production'), 
                                                   'class'  => 'CRM_Contact_Form_Task_ExportPrintProduction',
                                                   'result' => true ),
								  self::RESTORE => array(
                                      'title'  => ts('Restore Contacts'),
                                      'class'  => 'CRM_Contact_Form_Task_Delete',
                                      'result' => false,
                                  ),
                                  self::DELETE_PERMANENTLY => array(
                                      'title'  => ts('Delete Permanently'),
                                      'class'  => 'CRM_Contact_Form_Task_Delete',
                                      'result' => false,
                                  ),
                                  );
            
            //NYSS - add district export for merge/perge			
			if ( CRM_Core_Permission::check( 'export print production files' ) ) {
                self::$_tasks[101] = array( 'title'  => ts('Export District for Merge/Purge'), 
                                            'class'  => 'CRM_Contact_Form_Task_ExportDistrict',
                                            'result' => true 
                                           );
            }
			
			if( CRM_Contact_BAO_ContactType::isActive( 'Household' ) ) {
                $label = CRM_Contact_BAO_ContactType::getLabel( 'Household' );
                self::$_tasks[9] = array( 'title'  => ts( 'Add Contacts to %1',
                                                          array( 1=> $label ) ) ,
                                          'class'  => 'CRM_Contact_Form_Task_AddToHousehold'
                                          );
            }
            if( CRM_Contact_BAO_ContactType::isActive( 'Organization' ) ) {
                $label = CRM_Contact_BAO_ContactType::getLabel( 'Organization' );
                self::$_tasks[10] = array( 'title'  => ts( 'Add Contacts to %1',
                                                           array( 1=> $label ) ) ,
                                           'class'  => 'CRM_Contact_Form_Task_AddToOrganization'
                                           );
            }
            if ( CRM_Core_Permission::check( 'merge duplicate contacts' ) ) {
                self::$_tasks[21] = array( 'title'  => ts( 'Merge Contacts' ),
                                           'class'  => 'CRM_Contact_Form_Task_Merge',
                                           'result' => true 
                                           );
            }
            //CRM-4418, check for delete 
            if ( !CRM_Core_Permission::check( 'delete contacts' ) ) {
                unset( self::$_tasks[8] );
            }
            
            //show map action only if map provider and key is set
            $config = CRM_Core_Config::singleton( );

            if ( $config->mapProvider && $config->mapAPIKey ) {
                self::$_tasks[12] = array( 'title'  => ts( 'Map Contacts'),
                                           'class'  => 'CRM_Contact_Form_Task_Map',
                                           'result' => false );
            }

 
            if ( CRM_Core_Permission::access( 'CiviEvent' ) ) {
                self::$_tasks[18] = array( 'title'  => ts( 'Add Contacts to Event' ),
                                           'class'  => 'CRM_Event_Form_Participant' );
            }
            
            if ( CRM_Core_Permission::access( 'CiviMail' ) ) { 
                self::$_tasks[20] = array( 'title'  => ts( 'Create a Mass Email' ),
                                           'class'  => array( 'CRM_Mailing_Form_Group',
                                                              /*'CRM_Mailing_Form_Settings',*/ //NYSS 3369
                                                              'CRM_Mailing_Form_Upload',
                                                              'CRM_Mailing_Form_Test',
                                                              'CRM_Mailing_Form_Schedule'
                                                              ),
                                           'result' => false
                                           );
            } elseif ( CRM_Mailing_Info::workflowEnabled( ) && 
                       CRM_Core_Permission::check( 'create mailings' ) ) { 
                self::$_tasks[20] = array( 'title'  => ts( 'Create a Mass Email' ),
                                           'class'  => array( 'CRM_Mailing_Form_Group',
                                                              /*'CRM_Mailing_Form_Settings',*/ //NYSS 3369
                                                              'CRM_Mailing_Form_Upload',
                                                              'CRM_Mailing_Form_Test',
                                                              ),
                                           'result' => false
                                           );
            }
            
            self::$_tasks += CRM_Core_Component::taskList( );

            require_once 'CRM/Utils/Hook.php';
            CRM_Utils_Hook::searchTasks( 'contact', self::$_tasks );

            asort(self::$_tasks);
        }
    }

    /**
     * These tasks are the core set of tasks that the user can perform
     * on a contact / group of contacts
     *
     * @return array the set of tasks for a group of contacts
     * @static
     * @access public
     */
    static function &taskTitles()
    {
        self::initTasks( );

        $titles = array( );
        foreach ( self::$_tasks as $id => $value ) {
            $titles[$id] = $value['title'];
        }

        // hack unset update saved search and print contacts
        unset( $titles[14] );
        unset( $titles[15] );

        $config = CRM_Core_Config::singleton( );

        require_once 'CRM/Utils/Mail.php';
        if ( !CRM_Utils_Mail::validOutBoundMail() ) { 
            unset( $titles[6 ] );
            unset( $titles[20] );
        }
        
        if ( ! in_array( 'CiviSMS', $config->enableComponents ) ) {
            unset( $titles[7] );
        }

        // CRM-6806
        if ( !CRM_Core_Permission::check( 'access deleted contacts' ) || 
             !CRM_Core_Permission::check( 'delete contacts' ) ||
			 !CRM_Core_Permission::check( 'delete contacts permanently' ) ) { //NYSS 3598
            unset($titles[self::DELETE_PERMANENTLY]);
        }
        asort( $titles );
        return $titles;
    }

    /**
     * show tasks selectively based on the permission level
     * of the user
     *
     * @param int $permission
     * @param bool $deletedContacts  are these tasks for operating on deleted contacts?
     *
     * @return array set of tasks that are valid for the user
     * @access public
     */
    static function &permissionedTaskTitles($permission, $deletedContacts = false)
    {
        $tasks = array( );
        if ($deletedContacts) {
            if ( CRM_Core_Permission::check( 'access deleted contacts' ) ) {
                $tasks = array( self::RESTORE => self::$_tasks[self::RESTORE]['title'] );
                if ( CRM_Core_Permission::check( 'delete contacts' ) &&
				     CRM_Core_Permission::check( 'delete contacts permanently' ) ) { //NYSS 3598
                    $tasks[self::DELETE_PERMANENTLY] = self::$_tasks[self::DELETE_PERMANENTLY]['title'];
                } 
            }
        } elseif ($permission == CRM_Core_Permission::EDIT) {
            $tasks = self::taskTitles( );
        } else {
            $tasks = array( 
                           5  => self::$_tasks[ 5]['title'],
                           6  => self::$_tasks[ 6]['title'],
                           12 => self::$_tasks[12]['title'],
                           16 => self::$_tasks[16]['title'],
                           20 => self::$_tasks[20]['title'],
                           100 => self::$_tasks[100]['title'], //NYSS
                           101 => self::$_tasks[101]['title'], //NYSS
                           );
            if ( ! self::$_tasks[20]['title'] ) {
                unset( $tasks[20] );
            }
            if ( ! self::$_tasks[12]['title'] ) {
                //usset it, No edit permission and Map provider info
                //absent, drop down shows blank space
                unset( $tasks[12] );
            }
			//NYSS 3205 allow print prod to work with groups
			if ( CRM_Core_Permission::check( 'export print production files' ) ) {
				$tasks[1] = self::$_tasks[1]['title'];
				$tasks[2] = self::$_tasks[2]['title'];
				$tasks[3] = self::$_tasks[3]['title'];
				$tasks[4] = self::$_tasks[4]['title'];
				$tasks[13] = self::$_tasks[13]['title'];
				$tasks[14] = self::$_tasks[14]['title'];
			}
			
            //user has to have edit permission to delete contact.
            //CRM-4418, lets keep delete for View and Edit so user can tweak ACL
//             if ( CRM_Core_Permission::check( 'delete contacts' ) ) {
//                 $tasks[8] = self::$_tasks[8]['title']; 
//             }
        }

        return $tasks;
    }

    /**
     * These tasks get added based on the context the user is in
     *
     * @return array the set of optional tasks for a group of contacts
     * @static
     * @access public
     */
    static function &optionalTaskTitle()
    {
        $tasks = array(
                       14 => self::$_tasks[14]['title'],
                       );
        return $tasks;
    }

    static function getTask( $value ) {
        self::initTasks( );
        
        if ( ! CRM_Utils_Array::value( $value, self::$_tasks ) ) {
            $value = 15; // make it the print task by default
        }
        return array( CRM_Utils_Array::value( 'class', self::$_tasks[$value] ),
                      CRM_Utils_Array::value( 'result', self::$_tasks[$value] ) );
    }

}


