/*                                                                  */
/*                       C l a r i 3 D  (r)                         */
/*                                                                  */
/*                    The ultimate 3D Explorer                      */
/*                        www.clari3d.com                           */
/*                                                                  */
/*           (c) Copyright 2002 to 2021, by Andéor, SAS             */
/*                      All rights reserved                         */
/*                                                                  */
/*                         Andéor, SAS                              */
/*             SIRET 520 295 643 00024, R.C.S Antibes               */
/*                        Le Cros d'Azur                            */
/*                    26 bis avenue des Mimosas                     */
/*               06800 - Le Cros de Cagnes - France                 */
/*                                                                  */
/* This document is the property of  Andéor, SAS.  It is considered */
/* confidential and proprietary.  This  document may not  be repro- */
/* duced  or  transmitted in  any form in whole or in part, without */
/* the express written permission of Andéor, SAS.                   */
/*                                                                  */
/* -*-header-*- */

/*! local string as an array of array such as
 * {"english string": {"language": "translated string", ...}, ...}
 */
/** @export */
var _CS_local_strings = {};

/*! local language to use as "en", "fr", "it", ...
 */
/** @export */
var _CS_language =
  document.causal_language ? document.causal_language : "en";

/*! Debug local */
var _causal_local_debug = false;

/*! dummy translate a string.
 * @param string the string to translate,
 * @return string: the translated string.
 */
/** @export */
function __ (string) {
  return string;
}

/*! Register new strings.
 * @param strings: json of string as {"enflish":{"lang" "translation""...}...}
 * @return void.
 */
function CS_load_locals (strings) {
  Object.keys (strings).forEach (key => {
    _CS_local_strings[key] = strings[key];
  });
}

/*! translate a string.
 * @param string the string to translate,
 * @return string: the translated string.
 */
/** @export */
function ___ (string) {
  if (string == "Disconnect") {
    alert (string);
  }
  if (_causal_local_debug) {
    if (typeof _CS_local_strings =="undefined" ||
        typeof _CS_language =="undefined"        ) {
      return string;
    }
    if (_CS_language == "en") {
      return "#" + string;
    }
    if (typeof _CS_local_strings[string] == "undefined") {
      return "?" + string;
    }
    if (typeof _CS_local_strings[string][_CS_language] == "undefined") {
      console.warn ("String \"" + string + "\" is not translated");
      return "?" + string;
    }
    return "@" + CS_str_from_utf_8 (
      _CS_local_strings[string][_CS_language]);
  }
  else {
    if (typeof _CS_local_strings =="undefined"                           ||
        typeof _CS_language =="undefined"                                ||
        _CS_language == "en"                                             ||
        typeof _CS_local_strings[string] == "undefined"                  ||
        typeof _CS_local_strings[string][_CS_language] == "undefined") {
      return string;
    }
    else {
      return CS_str_from_utf_8 (_CS_local_strings[string][_CS_language]);
    }
  }
}
