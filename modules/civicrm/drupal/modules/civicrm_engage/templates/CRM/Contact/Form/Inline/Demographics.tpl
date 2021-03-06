{*
 +--------------------------------------------------------------------+
 | CiviCRM version 4.7                                                |
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC (c) 2004-2017                                |
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
*}
{$form.oplock_ts.html}
<div class="crm-inline-edit-form">
  <div class="crm-inline-button">
    {include file="CRM/common/formButtons.tpl"}
  </div>

  <div class="crm-clear">
    <div class="crm-summary-row">
      <div class="crm-label">{$form.gender_id.label}</div>
      <div class="crm-content">{$form.gender_id.html}
      </div>
    </div>
    <div class="crm-summary-row">
      <div class="crm-label">{$form.birth_date.label}</div>
      <div class="crm-content">
        {include file="CRM/common/jcalendar.tpl" elementName=birth_date}
      </div>
    </div>
    <div class="crm-summary-row">
      <div class="crm-label">&nbsp;</div>
      <div class="crm-content">
        {$form.is_deceased.html}
        {$form.is_deceased.label}
      </div>
    </div>
    <div class="crm-summary-row">
      <div class="crm-label crm-deceased-date">{$form.deceased_date.label}</div>
      <div class="crm-content crm-deceased-date">
        {include file="CRM/common/jcalendar.tpl" elementName=deceased_date}
      </div>
    </div>

    {* Begin civicrm_engage customization *}
    {if isset($demographics_groupTree)}
      {foreach from=$demographics_groupTree item=cd_edit key=group_id}
        {foreach from=$cd_edit.fields item=element key=field_id}
          <table class="form-layout-compressed">
            {include file="CRM/Custom/Form/CustomField.tpl"}
          </table>
        {/foreach}
      {/foreach}
    {/if}
    {* End civicrm_engage customization *}

  </div>
</div> <!-- end of main -->

{literal}
<script type="text/javascript">
function showDeceasedDate( ) {
  if ( cj("#is_deceased").is(':checked') ) {
    cj(".crm-deceased-date").show( );
  } else {
    cj(".crm-deceased-date").hide( );
    cj("#deceased_date").val('');
  }
}

cj( function() {
  showDeceasedDate( );
});
</script>
{/literal}
