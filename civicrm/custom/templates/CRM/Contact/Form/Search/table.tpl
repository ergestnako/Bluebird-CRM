{*
 +--------------------------------------------------------------------+
 | CiviCRM version 4.2                                                |
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC (c) 2004-2012                                |
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
{* template for search builder *}
 <div id="map-field">
  {strip}
     {section start=1 name=blocks loop=$blockCount}
       {assign var="x" value=$smarty.section.blocks.index}
       <div class="crm-search-block">
    <h3>{if $x eq 1}{ts}Include contacts where{/ts}{else}{ts}Also include contacts where (OR){/ts}{/if}</h3>
	    <table>
        {section name=cols loop=$columnCount[$x]}
            {assign var="i" value=$smarty.section.cols.index}
            <tr>
                <td class="form-item even-row">
                    {$form.mapper[$x][$i].html}
                    {$form.operator[$x][$i].html}
                    &nbsp;&nbsp;{$form.value[$x][$i].html}
                    &nbsp;&nbsp;<a href="javascript:resetBuilderValues({$x},{$i});"><img title="reset the values for this row" src="{$config->resourceBase}i/close.png" class="action-icon" alt="{ts}reset this row{/ts}" /></a>
                    &nbsp;<strong>(AND)</strong>
                </td>
            </tr>
        {/section}
    
         <tr>
           <td class="form-item even-row underline-effect">
               {$form.addMore[$x].html}
           </td>
         </tr>            
       </table>
      </div>
    {/section}
    <div class="underline-effect">{$form.addBlock.html}</div> 
  {/strip}
 </div>

<script type="text/javascript">
{literal}
  function resetBuilderValues(x, i) {
    cj('#mapper_'   + x + '_' + i + '_0').val('');
    cj('#mapper_'   + x + '_' + i + '_1').val('');
    cj('#mapper_'   + x + '_' + i + '_2').val('');
    cj('#mapper_'   + x + '_' + i + '_3').val('');
    cj('#mapper_'   + x + '_' + i + '_4').val('');
    cj('#operator_' + x + '_' + i).val('');
    cj('#value_'    + x + '_' + i).val('');

    if ( i !== 0 ) {
      cj('#mapper_' + x + '_' + i + '_0').parents('tr').remove();
    }
  }
{/literal}
</script>
