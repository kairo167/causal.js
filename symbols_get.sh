#! /bin/bash
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

# extract all the exported symbols of the js files
# and write them in symbols.txt as symbol:new:
#
# symbols_get.sh *.js > symbols.txt

# here directory
HERE=$(dirname "$0")

# human readable symbols
HUMAN=0

# symbol prefix
PREFIX=""

# symbols to exclude
EXCLUDES=

# files to parse
FILES=""

# number of bytes for the generated random numbers
RAND_BYTES=3

function help() {
  cat <<EOF
  $(basename $0) [OPTIONS*] files*
    with OPTIONS:
    -d|--debug      : debug mode
    -h|--help       : this help
    -H|--human      : human readable generated symbols
    -p|--prefix     : symbol prefix
    -x|--exclude SYM: exclude symbol SYM
EOF
}

# return a symbol
# $1 the symbol to replace
# $2 the count number
function get_symbol() {
  if [ $HUMAN = 1 ]; then
    echo "\$\$\$_$1_\$\$\$"
  elif [ -z "$PREFIX" ]; then
    printf "_$(openssl rand -hex $RAND_BYTES)%03d" $2
  else
    echo "$PREFIX$2"
  fi
}

# parse the cli
while [[ $# -gt 0 ]]; do
  case $1 in
    -d|--debug)
      set -x
      ;;

    -h|--help)
      help
      exit
      ;;

    -H|--human)
      HUMAN=1
      ;;

    -p|--prefix)
      shift
      PREFIX="$1"
      ;;

    -x|--exclude)
      shift
      EXCLUDES="$EXCLUDES -e $1"
      ;;

    *)
      FILES="$FILES $1"
      ;;
  esac
  shift
done

# grep -s -A 1 -h '/\*\* @export \*/' $FILES         | \
# grep -v -e '/\*\* @export \*/' -e -- $EXCLUDES
# echo "-------------------------"
#
# echo "  wgl.look_at = function (camera, target)" | \
#   perl -ne 'print "$1\n" if /\s*\w+\.(\w*)\s*=\s*function/'
#
# echo "-------------------------"
#
# echo "  wgl.look_at = function (camera, target)" | \
#   perl -ne 'print "$1\n" if /var\s+(\w*)/
#                          || /let\s+(\w*)/
#                          || /const\s+(\w*)/
# 			                   || /\s*\w+\.(\w*)\s*=\s*function/
# 			                   || /function\s+(\w*)/'
# echo "  function toto (a, b, c) {}" | \
#   perl -ne 'print "$1\n" if /var\s+(\w*)/
#                          || /let\s+(\w*)/
#                          || /const\s+(\w*)/
# 			                   || /\s*\w+\.(\w*)\s*=\s*function/
# 			                   || /function\s+(\w*)/'
#
# echo "-------------------------"
#
# grep -s -A 1 -h '/\*\* @export \*/' $FILES         | \
#   grep -v -e '/\*\* @export \*/' -e -- $EXCLUDES    | \
#   perl -ne 'print "$1\n" if /\s*(\w+\.\w+)\s*=\s*function/
#                          || /var\s+(\w*)/
#                          || /let\s+(\w*)/
#                          || /const\s+(\w*)/
# 			                   || /function\s+(\w*)/'
#
# echo "-------------------------"
# exit

export LANGUAGE=en_US.UTF-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
num=1
for symbol in $(                                      \
 grep -s -A 1 -h '/\*\* @export \*/' $FILES         | \
  grep -v -e '/\*\* @export \*/' -e -- $EXCLUDES    | \
  perl -ne 'print "$1\n" if /\s*(\w+\.\w+)\s*=\s*function/
                         || /var\s+(\w*)/
                         || /let\s+(\w*)/
                         || /const\s+(\w*)/
			                   || /function\s+(\w*)/'     | \
  sort | uniq); do
    printf "$symbol\a$(get_symbol $symbol $num)\a\n"
    num=$((num+1))
  done

# for symbol in $(                                      \
#  grep -s -A 1 -h '/\*\* @symbol \*/' $FILES | \
#   grep -v -e '/\*\* @symbol \*/' -e -- $EXCLUDES | \
#   perl -ne 'print "$1\n" if /\s*(\w+):.*/
# 			                   || /\.(\w*)\s*=/' | \
#   sort | uniq); do
#     by=$(get_symbol $symbol $num)
#     printf ".$symbol\a.$by\a\n$symbol:\a$by:\a\n"
#     num=$((num+1))
# done

