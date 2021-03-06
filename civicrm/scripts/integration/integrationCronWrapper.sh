#!/bin/bash
#

# self reference
prog=`basename $0`
script_dir=`dirname $0`
base_dir=`cd $script_dir/../../..; echo $PWD`
iterator="$base_dir/scripts/iterateInstances.sh"

# set all script defaults
run_import=1
run_process=1
use_debug=0


usage() {
  echo "
Usage: $prog <options>

--no-import   : skip running the import section
--no-process  : skip running the message processing section
--debug       : include verbose debugging information
--help        : prints this message and exits
" >&2
}

# Check path
if [ ! -x "$iterator" ]; then
  echo "$prog: $iterator: Instance iterator not found; check installation" >&2
  usage
  exit 1
fi

# read in the command line config
while [ $# -gt 0 ]; do
  case "$1" in
    --help|-h) usage; exit 0 ;;
    --no-import) run_import=0 ;;
    --no-process) run_process=0 ;;
    --debug) use_debug=1 ;;
    *) echo "$prog: $1: Invalid option" >&2; usage; exit 1 ;;
  esac
  shift
done

if [ $use_debug -eq 1 ]; then
  echo "Option --debug detected"
fi

if [ $run_import -eq 1 ]; then
  echo "About to transfer event messages from website to local accumulator"
  debug_opt=
  if [ $use_debug -eq 1 ]; then
    echo "About to run $script_dir/integrationImportMessages.sh"
    debug_opt="--debug"
  fi
  $script_dir/integrationImportMessages.sh $debug_opt
  if [ $? -ne 0 ]; then
    echo "ERROR: Message transfer failed; exiting" >&2
    exit 1
  fi
else
  if [ $use_debug -eq 1 ]; then
    echo "Option --no-import detected; skipping import section"
  fi
fi
if [ $run_process -eq 1 ]; then
  echo "About to process messages from local accumulator into Bluebird"
  if [ $use_debug -eq 1 ]; then
    echo "About to run $script_dir/process.php for each CRM instance"
  fi
  $iterator --live-fast "php $script_dir/process.php -S{} --archive"
else
  if [ $use_debug -eq 1 ]; then
    echo "Option --no-process detected; skipping process section"
  fi
fi

exit 0
