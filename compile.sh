#! /bin/sh
#
#                       C l a r i 3 D  (r)
#
#                    The ultimate 3D Explorer
#                        www.clari3d.com
#
#           (c) Copyright 2002 to 2021, by Andéor, SAS
#                      All rights reserved
#
#                         Andéor, SAS
#             SIRET 520 295 643 00016. R.C.S Antibes
#                        Le Cros d'Azur
#                    26 bis avenue des Mimosas
#               06800 - Le Cros de Cagnes - France
#
# This document is the property of  Andéor, SAS.  It is considered
# confidential and proprietary.  This  document may not  be repro-
# duced  or  transmitted in  any form in whole or in part, without
# the express written permission of Andéor, SAS.
#
# -*-header-*-

function help() {
  cat <<EOF
  $(basename $0) OPTIONS
    Compile js files read from stdin and write the result on stdout.

    with OPTIONS:
    -c|--copyright COP: copyright file
    -d|--debug        : debug mode
    -h|--help         : this help
    -H|--hide SYM     : hide the symbols defined in SYM
    -l|--level LEVEL  : compiler level with
                        LEVEL=0: contatenation only
                        LEVEL=1: default optimizations
                        LEVEL=2: simple optimizations
                        LEVEL=3: advanced optimizations (default)
    -s|--silent       : do not generate output
EOF
}

# debug
DEBUG=0

# copyright
COPYRIGHT=""

# hide the symbols
HIDE_SYMBOLS=""

# force generation
FORCE=0

# silent mode
SILENT=0

# compiler default level
COMPILER_LEVEL=3

# parse the cli
while [[ $# -gt 0 ]]; do
  case $1 in
    -c|--copyright)
      shift
      COPYRIGHT=$1
      test -f "$COPYRIGHT" || (
        echo "Error: copyright file $COPYRIGHT does not exist"
        exit 1
      )
      ;;

    -d|--debug)
      DEBUG=1
      set -x
      echo "%%% compiler %%%" > /dev/stderr
      ;;

    -h|--help)
      help
      exit 0
      ;;

    -H|--hide)
      shift
      HIDE_SYMBOLS=$1
      test -f $HIDE_SYMBOLS || (
        echo "Error: symbols file $HIDE_SYMBOLS does not exist"
        exit 1
      )
      ;;

    -l|--level)
      shift
      export COMPILER_LEVEL=$1
      ;;

    -s|--silent)
      SILENT=1
      ;;

    *)
      help
      exit 1
      ;;
  esac
  shift
done

ROOT=$(dirname "$0")
DEV=/Users/gdw/Documents/dev

# set the terser options
case $COMPILER_LEVEL in
  0|1)
    export TERSER_OPTIONS=""
    ;;
  2)
    export TERSER_OPTIONS="--compress"
    ;;
  3)
    export TERSER_OPTIONS="--compress --mangle"
    ;;
  *)
    echo "Error: invalid level"
    exit 1
    ;;
esac

# output file
test $SILENT = 0 && LOG=/dev/stderr || LOG=/dev/null

# locate terser
if [ x"$(which terser)" = x ]; then
  echo "Error: unable to locate terser" > $LOG
  exit 1
fi

# locate php
if [ -f /usr/bin/php ]; then
  PHP=/usr/bin/php
elif [ -f /usr/local/bin/php ]; then
  PHP=/usr/local/bin/php
else
  echo "Error: unable to find PHP" 2> $LOG
  exit 1;
fi

# log the options
if [ x"$DEBUG" = x"1" ]; then
  cat << EOF > $LOG
    copyright = '$COPYRIGHT'
    level     = '$COMPILER_LEVEL'
    hide      = '$HIDE_SYMBOLS'
    silent    = '$SILENT'
EOF
fi

# put the header for php
if [ ! -z "$COPYRIGHT" ]; then
  cat "$COPYRIGHT" | sed 's#^#/* #g' | sed 's#$# */#g'
  echo '/* -*-header-*- */'
  echo
fi

# prepare the hide symbols command
if [ -z "$HIDE_SYMBOLS" ]; then
  HIDE_CMD=cat
else
  HIDE_CMD=""$PHP" "$ROOT"/symbols_hide.php "$HIDE_SYMBOLS""
fi

# get the terseroption
case $COMPILER_LEVEL in
  0)
    cat | $HIDE_CMD | "$PHP" "$ROOT"/uncomment.php
    ;;

  1|2|3)
    cat \
    | "$PHP" "$ROOT"/encrypt_strings.php \
    | $HIDE_CMD \
    | terser $TERSER_OPTIONS -- \
    | "$PHP" "$ROOT"/uncomment.php \
    | terser --format --
    ;;
esac 2> $LOG
