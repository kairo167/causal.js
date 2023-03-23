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

// all scripts
/** @export */
let _CS_js_all_scripts = document.getElementsByTagName ("script");

// current script
/** @export */
let _CS_js_current_script
    = _CS_js_all_scripts[_CS_js_all_scripts.length -1].src;

//! Array of ready functions
/** @export */
let CS_ready_funcs = [];

//! Indicate that the scrips are already fired
/** @export */
let CS_ready_funcs_called = false;

//! Register a ready function.
// @param func the function to register,
// @return void
/** @export */
function CS_add_ready (func) {
  // if the scripts are already called, call this script directely
  if (CS_ready_funcs_called) {
    func();
  }
  else {
    // otherwise add it in the array of scripts to call
    CS_ready_funcs.push (func);
  }
}

//! Call all the ready functions.
// @return void
/** @export */
function CS_call_ready() {
  // set the flag
  CS_ready_funcs_called = true;

  // in localhost, call the script without exception handler
  if (window.location.hostname == "localhost") {
    for (let i = 0; i < CS_ready_funcs.length; i++) {
      CS_ready_funcs[i]();
    }
  }
  else {
    // call all the ready callbacks
    for (let i = 0; i < CS_ready_funcs.length; i++) {
      try {
        CS_ready_funcs[i]();
      }
      catch (e){
        if (typeof e.message != "undefined") {
          console.error ('exception during ready evaluation:' + e.sourceURL +
                         "(" + e.line + "): " + e.message);
        }
        else {
          console.error ('exception during ready evaluation');
        }
        return false;
      }
    }
  }

  // reset the ready callbacks array
  CS_ready_funcs  = [];
}

