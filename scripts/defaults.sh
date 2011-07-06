#!/bin/sh
#
# defaults.sh - Shell defaults when using the Bluebird config file.
#
# Project: BluebirdCRM
# Author: Ken Zalewski
# Organization: New York State Senate
# Date: 2010-09-30
# Revised: 2011-06-01
#

DEFAULT_CONFIG_FILE=/etc/bluebird.cfg

DEFAULT_DB_HOST=localhost
DEFAULT_DB_USER=crmadmin
DEFAULT_DB_PASS=NONE
DEFAULT_DB_DRUPAL_PREFIX=senate_d_
DEFAULT_DB_CIVICRM_PREFIX=senate_c_

DEFAULT_HTTP_USER=loadsenate
DEFAULT_HTTP_PASS=NONE

DEFAULT_APP_ROOTDIR=/opt/bluebird
DEFAULT_DATA_ROOTDIR=/var/bluebird
DEFAULT_DRUPAL_ROOTDIR=/var/www
DEFAULT_IMPORT_ROOTDIR=/data/importData

DEFAULT_BACKUP_HOST=localhost
DEFAULT_BACKUP_ROOTDIR=/crmbackups

DEFAULT_BASE_DOMAIN=crm.nysenate.gov

DEFAULT_SENATOR_FORMAL_NAME="Senator"


confirm_yes_no() {
  [ "$1" ] && confirm_msg="$1" || confirm_msg="Proceed with the operation"
  echo -n "$confirm_msg (N/y)? "
  read ch
  case "$ch" in
    [yY]*) return 0 ;;
    *) echo "Aborting."; return 1 ;;
  esac
}
