{*
 +--------------------------------------------------------------------+
 | CiviCRM version 4.7                                                |
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC (c) 2004-2016                                |
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
  <div id="civicrm-menu">
    {if call_user_func(array('CRM_Core_Permission','giveMeAllACLs'))}
      <div id="crm-qsearch" class="menumain">
        <form action="{crmURL p='civicrm/contact/search/advanced' h=0 }" name="search_block" id="id_search_block" method="post">
          <div id="quickSearch">
            <input class="form-text ui-autocomplete-input" id="sort_name_navigation" placeholder="Name/Email" name="sort_name" style="width: 13em; display: inline-block;" autocomplete="off" type="text">
            <input id="sort_contact_id" style="display: none" type="text">
            <input name="hidden_location" value="1" type="hidden">
            <input name="qfKey" value="" type="hidden">

            <div style="height:1px; overflow:hidden;">
              <input value="Go" name="_qf_Advanced_refresh" class="crm-form-submit default" type="submit">
            </div>
          </div>
        </form>
      </div>
    {/if}
  </div>

  {literal}
  <script type="application/javascript">
    (function($) {
      // CRM-15493 get the current qfKey
      $("input[name=qfKey]", "#quickSearch").val($('#civicrm-navigation-menu').data('qfkey'));

      $('#civicrm-menu').ready(function() {
        $('#root-menu-div .outerbox').css({'margin-top': '6px'});
        $('#root-menu-div .menu-ul li').css({'padding-bottom': '2px', 'margin-top': '2px'});
        $('img.menu-item-arrow').css({top: '4px'});
        $("#civicrm-menu >li").each(function(i){
          $(this).attr("tabIndex",i+2);
        });

        $('#sort_name_navigation')
          .autocomplete({
            source: function(request, response) {
              var
                option = $('input[name=quickSearchField]:checked'),
                params = {
                  name: request.term,
                  field_name: option.val(),
                  table_name: option.attr("data-tablename")
                };
              CRM.api3('contact', 'getquick', params).done(function(result) {
                var ret = [];
                if (result.values.length > 0) {
                  $('#sort_name_navigation').autocomplete('widget').menu('option', 'disabled', false);
                  $.each(result.values, function(k, v) {
                    ret.push({value: v.id, label: v.data});
                  });
                }
                else {
                  $('#sort_name_navigation').autocomplete('widget').menu('option', 'disabled', true);
                  var label = option.closest('label').text();
                  var msg = ts('{/literal}{ts escape='js' 1='%1'}%1 not found.{/ts}'{literal}, {1: label});
                  // Remind user they are not searching by contact name (unless they enter a number)
                  if (params.field_name && !(/[\d].*/.test(params.name))) {
                    msg += {/literal}' {ts escape='js'}Did you mean to search by Name/Email instead?{/ts}'{literal};
                  }
                  ret.push({value: '0', label: msg});
                }
                response(ret);
              })
            },
            focus: function (event, ui) {
              return false;
            },
            select: function (event, ui) {
              if (ui.item.value > 0) {
                document.location = CRM.url('civicrm/contact/view', {reset: 1, cid: ui.item.value});
              }
              return false;
            },
            create: function() {
              // Place menu in front
              $(this).autocomplete('widget')
                .addClass('crm-quickSearch-results')
                .css('z-index', $('#civicrm-menu').css('z-index'));
            }
          })
          .keydown(function() {
            $.Menu.closeAll();
          })
          .on('focus', function() {
            setQuickSearchValue();
          });

        $('.crm-hidemenu').click(function(e) {
          $('#civicrm-menu').slideUp();
          if ($('#crm-notification-container').length) {
            var alert = CRM.alert({/literal}'<a href="#" id="crm-restore-menu" style="text-align: center; margin-top: -8px;">{ts escape='js'}Restore CiviCRM Menu{/ts}</a>'{literal}, '', 'none', {expires: 10000});
            $('#crm-restore-menu')
              .button({icons: {primary: 'fa-undo'}})
              .click(function(e) {
                e.preventDefault();
                alert.close();
                $('#civicrm-menu').slideDown();
              })
              .parent().css('text-align', 'center').find('.ui-button-text').css({'padding-top': '4px', 'padding-bottom': '4px'})
            ;
          }
          e.preventDefault();
        });
        function setQuickSearchValue() {
          var $selection = $('.crm-quickSearchField input:checked'),
            label = $selection.parent().text(),
            value = $selection.val();
          // These fields are not supported by advanced search
          if (!value || value === 'first_name' || value === 'last_name') {
            value = 'sort_name';
          }
          $('#sort_name_navigation').attr({name: value, placeholder: label});
        }
        $('.crm-quickSearchField').click(function() {
          setQuickSearchValue();
          $('#sort_name_navigation').focus();
        });
        // Set & retrieve default value
        if (window.localStorage) {
          $('.crm-quickSearchField').click(function() {
            localStorage.quickSearchField = $('input', this).val();
          });
          if (localStorage.quickSearchField) {
            $('.crm-quickSearchField input[value=' + localStorage.quickSearchField + ']').prop('checked', true);
          }
        }
        // redirect to view page if there is only one contact
        $('#id_search_block').on('submit', function() {
          var $menu = $('#sort_name_navigation').autocomplete('widget');
          if ($('li.ui-menu-item', $menu).length === 1) {
            var cid = $('li.ui-menu-item', $menu).data('ui-autocomplete-item').value;
            if (cid > 0) {
              document.location = CRM.url('civicrm/contact/view', {reset: 1, cid: cid});
              return false;
            }
          }
        });
        // Close menu after selecting an item
        $('#root-menu-div').on('click', 'a', $.Menu.closeAll);
      });
      $('#civicrm-menu').menuBar({arrowSrc: CRM.config.resourceBase + 'packages/jquery/css/images/arrow.png'});
    })(CRM.$);
  </script>
  {/literal}
