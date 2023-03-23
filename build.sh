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
    with OPTIONS:
    -d|--debug      : debug mode
    -f|--force      : force generation
    -h|--help       : this help
    -H|--hide  SYM  : hide the defined symbols in the file SYM
    -l|--level LEVEL: compiler level with
                      LEVEL=0: contatenation only
                      LEVEL=1: default optimizations
                      LEVEL=2: simple optimizations
                      LEVEL=3: advanced optimizations (default)
    -v|--verbose    : verbose mode
EOF
}

# root path
ROOT=$(dirname "$0")

# hide the symbols
HIDE_SYMBOLS=

# force generation
FORCE=0

# verbose mode
VERBOSE=0

# compiler options
COMPILER_OPTIONS=""

# compiler level
LEVEL=3

# parse the cli
while [[ $# -gt 0 ]]; do
  case $1 in
    -d|--debug)
      set -x
      COMPILER_OPTIONS="$COMPILER_OPTIONS --debug"
      ;;

    -f|--force)
      FORCE=1
      ;;

    -h|--help)
      help
      exit
      ;;

    -H|--hide)
      HIDE_SYMBOLS=$2
      if [ -z "$HIDE_SYMBOLS" -o "${HIDE_SYMBOLS:0:1}" = "-" ]; then
        HIDE_SYMBOLS="$ROOT"/symbols.txt
      else
        shift
      fi
      COMPILER_OPTIONS="$COMPILER_OPTIONS --hide $HIDE_SYMBOLS"
      ;;

    -l|--level)
      shift
      case $1 in
        0|1|2|3)
          COMPILER_OPTIONS="$COMPILER_OPTIONS --level $1"
          LEVEL=$1
          ;;
        *)
          echo "Error: invalid level $1"
          exit 1
          ;;
      esac
      ;;

    -v|--verbose)
      VERBOSE=1
      COMPILER_OPTIONS="$COMPILER_OPTIONS --verbose"
      ;;

    *)
      help
      exit
      ;;
  esac
  shift
done

DEV=/Users/gdw/Documents/dev
COPYRIGHT="$ROOT"/copyright.txt

# output file
test $VERBOSE = 1 && LOG=/dev/stdout || LOG=/dev/null

# locate npn
if [ x"$(which npm)" = x ]; then
  echo "Error: unable to locate npm"    > $LOG
  echo "       install it with:"        > $LOG
  echo "       brew install node"       > $LOG
  exit 1
fi

# locate terser
if [ x"$(which terser)" = x ]; then
  echo "Error: unable to locate terser" > $LOG
  echo "       install it with:"        > $LOG
  echo "       npm install terser -g"   > $LOG
  exit 1
fi

# locate minity
if [ x"$(which minify)" = x ]; then
  echo "Error: unable to locate minify" > $LOG
  echo "       install it with:"        > $LOG
  echo "       npm install minify -g"   > $LOG
  exit 1
fi

# locate php
if [ -f /usr/bin/php ]; then
  PHP=/usr/bin/php
elif [ -f /usr/local/bin/php ]; then
  PHP=/usr/local/bin/php
else
  echo "Error: unable to find PHP"      > $LOG
  echo "       install it with:"        > $LOG
  echo "       brew install php"        > $LOG
  exit 1;
fi

# clean if force
test $FORCE = 1 && rm "$ROOT"/*.min.*

# get the js sources
SOURCES=$(ls "$ROOT"/causal*.js | grep -v ".min.")

# extract the symbols
if [ "$HIDE_SYMBOLS" != "" ]; then
  $ROOT/symbols_get.sh -p CS\$ $SOURCES > "$HIDE_SYMBOLS"
fi


echo "Build causal.min.js"

# compile the files
cat $SOURCES \
  | "$ROOT"/./compile.sh \
           $COMPILER_OPTIONS \
           --copyright "$COPYRIGHT" \
           > "$ROOT"/causal.min.js

echo "Build causal.min.css"
rm -f "$ROOT"/*.min.css
CSS=$(ls "$ROOT"/*.css)
(
  cat $COPYRIGHT | sed 's#^#/* #g' | sed 's#$# */#g'
  echo "/* -*-header-*- */"

  if [ $LEVEL = 0 ]; then
    cat $CSS
  else
    minify $CSS
  fi
) > "$ROOT"/causal.min.css
