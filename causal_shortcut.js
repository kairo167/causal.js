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

/*! Keyboard shortcuts array */
/** @export */
let CS_shortcuts = {};

/*! Get keys as a string.
 * @param keys an array of keys.
 * @return string: the index.
 */
/** @export */
function CS_shortcut_index (keys) {
  let index = "";
  let sep = "";
  keys.sort().forEach (key => {
    index = index + sep + key;
    sep = ":";
  });
  return index;
}

/*! Get keys as a string.
 * @param keys an array of keys.
 * @return string: the index.
 */
/** @export */
function CS_shortcut_handler (event) {
  // get the keys
  let keys = [];

  event.altKey   && keys.push ('alt');
  event.ctrlKey  && keys.push ('ctrl');
  event.metalKey && keys.push ('meta');
  event.shiftKey && keys.push ('shift');
  event.key      && keys.push (event.key);

  // get the index
  let index = CS_shortcut_index (keys);

  // get the shortcut
  let shortcut = CS_shortcuts[index];

  // if the shortcut is defined
  if (shortcut) {
    // stop the event propagation
    CS_stop_propagation (event);

    // call the shortcut callback
    shortcut.callback();

    // return false
    return false;
  }
  else {
    return false;
  }
}

/*! Get keys as a string.
 * @param keys an array of keys.
 * @return string: the index.
 */
/** @export */
function CS_shortcut_install_handler (install) {
  const obj      = document;
  const type     = 'keyup';
  const callback = CS_shortcut_handler;
  const capture  = false;
  const passive  = true;

  if (install ) {
    CS_add_event (obj, type, callback, capture, passive);
  }
  else {
    CS_del_event (obj, type, callback, capture, passive);
  }
}

/*! Add a shortcut.
 * @param keys: an array of keys the key can be specified by their ascii value
 * or the strings: 'ctrl', 'alt', 'meta', 'shift', 'escape', 'enter, 'f1' to
 * 'f12', 'tab', 'left', 'right', 'up', 'down', 'page-up', 'page-down',
 * @param callback the collback method,
 * @param description the description,
 * @return void.
 */
/** @export */
function CS_shortcut_add (keys, callback, description) {
  // install ythe key handler for the first shortcut
  if (Object.keys (CS_shortcuts).length == 0) {
    CS_shortcut_install_handler (true);
  }

  // get the index
  let index = CS_shortcut_index (keys);

  // get an existing shortcut if any
  let shortcut = CS_shortcuts[index];

  // if it does not exist, create one
  if (! shortcut) {
    shortcut = {};
  }

  // update the shortcut
  shortcut.keys        = keys;
  shortcut.callback    = callback;
  shortcut.description = description;

  // and install it
  CS_shortcuts[index] = shortcut;
}

/*! Remove a shortcut.
 * @param key the key in string,
 * @return void.
 */
/** @export */
function CS_shortcut_remove (keys) {
  // get the index
  let index = CS_shortcut_index (keys);

  // get an existing shortcut if any
  let shortcut = CS_shortcuts[index];

  // if it does exist
  if (shortcut) {
    // remove it
    CS_shortcuts[index] = undefined;

    // if there is no mode shortcuts, remove the handler
    if (Object.keys (CS_shortcuts).length == 0) {
      CS_shortcut_install_handler (false);
    }
  }
}

/*! Get the array of shortcuts as a html ready code.
 * @return string: the html code.
 */
/** @export */
function CS_shortcut_html() {
  // create the main div element
  let html = document.createElement ('div');
  html.className = 'CS_shortcuts';

  let div = document.createElement ('div');
  html.appendChild (div);

  // modifiers
  let span = document.createElement ('span');
  div.appendChild (span);
  span.innerHTML = ___('Modifiers');

  // keys
  span = document.createElement ('span');
  div.appendChild (span);
  span.innerHTML = ___('Keys');

  // description
  span = document.createElement ('span');
  div.appendChild (span);
  span.innerHTML = ___('Description');

  // for all the shortcuts
  Object.keys (CS_shortcuts).forEach (index => {
    // get the shortcut
    let shortcut = CS_shortcuts[index];

    // the line
    div = document.createElement ('div');
    html.appendChild (div);

    // the keys
    let modifiers     = '';
    let modifiers_sep = '';
    let keys          = '';
    let keys_sep      = '';
    shortcut.keys.sort().forEach (key => {
      let name = key[0].toUpperCase() + key.substring (1);
      switch (key) {
        case 'alt':
        case 'ctrl':
        case 'meta':
        case 'shift':
          modifiers += modifiers_sep + name;
          modifiers_sep = '+';
          break;

        case 'escape':
        case 'enter':
        case 'f1': case  'f2': case  'f3': case  'f4':
        case 'f5': case  'f6': case  'f7': case  'f8':
        case 'f9': case 'f10': case 'f11': case 'f12':
        case 'tab':
        case 'left':
        case 'right':
        case 'up':
        case 'down':
        case 'page-up':
        case 'page-down':
        default:
          keys += keys_sep + name;
          keys_sep = '+';
          break;
      }
    });

    // modifiers
    span = document.createElement ('span');
    div.appendChild (span);
    span.innerHTML = modifiers;

    // keys
    span = document.createElement ('span');
    div.appendChild (span);
    span.innerHTML = keys;

    // description
    span = document.createElement ('span');
    div.appendChild (span);
    span.innerHTML = shortcut.description;
  });

  return html;
}
