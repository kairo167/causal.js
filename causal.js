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

/*! Return the path of the current script.
 * @return string: the path of the current script.
 */
/** @export */
function CS_current_path() {
  let here = _CS_js_current_script;
  if (here == "") {
    return "clari3d.js/causal.js";
  }
  else {
    let last = here.lastIndexOf('/');
    return here.substring(0, last);
  }
}

/*! Return the Web site root path.
 * @return string: the path.
 */
/** @export */
function CS_get_root_path(loc) {
  let _location = loc ? loc : document.location.toString();

  // _location =
  // 1: http://site              -> ""
  // 2: http://site/             -> ""
  // 2: http://site/file.ext     -> ""
  // 4: http://site/dir/         -> "/dir"
  // 5: http://site/dir/file.ext -> "/dir"

  let domain = _location.indexOf('/', _location.indexOf('://') + 3);
  // 1: -> -1
  // 2: -> 11
  // 2: -> 11
  // 4: -> 11
  // 5: -> 11
  if (domain == -1) {
    return "";
  }

  let ext = _location.lastIndexOf('.');
  let after = _location.lastIndexOf('/');

  if (ext <= domain) {
    ext = -1;
  }
  if (after <= domain) {
    after = domain;
  }

  let path;
  if (after > ext) {
    path = _location.substring(domain);
  }
  else {
    path = _location.substring(domain, after);
  }

  if (path[path.length - 1] == '/') {
    return path.substring(0, path.length - 1);
  }
  else {
    return path;
  }
}

/** @export */
function CS_bind() {
  /*! Binds horizontal or vertical filler.
   * @param vfill true for vertical, horizontal filler otherwise.
   */
  /** @export */
  function CS_bind_vfill(vfill) {
    if (!vfill) {
      let vfills = document.getElementsByClassName("CS_vfill");
      for (let i = 0; i < vfills.length; i++) {
        CS_bind_vfill(vfills[i]);
      }
    }
    else if (typeof vfill.bound == "undefined" || !vfill.bound) {
      vfill.bound = true;
      let parent = vfill.parentNode;
      let height = vfill.style.height ? vfill.style.height : 100;
      vfill.style.height = (parent.clientHeight * height / 100) + 'px';
    }
  }

  // bind the fillers
  CS_bind_vfill(false);

  // install String.endsWith() method
  if (typeof String.prototype.endsWith == "undefined") {
    String.prototype.endsWith = function (suffix) {
      return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
  }

  // menus
  let items = document.getElementsByClassName("CS_menu");
  for (let i = 0; i < items.length; i++) {
    CS_bind_menu(items[i], CS_close_menu, 0);
  }

  // editables
  CS_bind_editables();

  // tabs
  items = document.getElementsByClassName("CS_tab");
  for (let i = 0; i < items.length; i++) {
    CS_bind_page(items[i]);
  }

  // splits
  items = document.getElementsByClassName("CS_split");
  for (let i = 0; i < items.length; i++) {
    CS_bind_split(items[i], false);
  }

  // spack
  items = document.getElementsByClassName("CS_stack");
  for (let i = 0; i < items.length; i++) {
    CS_bind_stack(items[i]);
  }

  // slideshows
  items = document.getElementsByClassName("CS_slideshow");
  for (let i = 0; i < items.length; i++) {
    CS_bind_slideshow(items[i]);
  }

  // trees
  items = document.getElementsByClassName("CS_tree");
  for (let i = 0; i < items.length; i++) {
    CS_bind_tree(items[i]);
  }

  // uploads
  items = document.getElementsByClassName("CS_upload");
  for (let i = 0; i < items.length; i++) {
    CS_bind_upload(items[i], false, false);
  }

  // details (firefox only)
  switch (CS_get_browser()) {
    case 'firefox':
      console.log('bind details for buggy browsers');
      let detailss = document.getElementsByTagName('details');
      for (let i = 0; i < detailss.length; i++) {
        CS_bind_details(detailss[i]);
      }
  }
}

/*! Causal entry.
 * @return void.
 */
/** @export */
function CS_main() {
  let _previous_onload;

  /*! Called onload.
   * @return void.
   */
  function _onload() {
    if (_previous_onload) {
      _previous_onload();
    }

    /* add the browser hacks */
    CS_bind();

    /* call the ready functions */
    CS_call_ready();
  }

  /* on modern browsers */
  if (document.onreadystatechange) {
    _previous_onload = document.onreadystatechange;
    document.onreadystatechange = function () {
      if (document.readyState === "interactive") {
        _onload();
      }
    }
  }
  else if (document.addEventListener) {
    /* call the ready functions once the dom is loaded */
    document.addEventListener("DOMContentLoaded", _onload);
  }
  else if (window.attachEvent) {
    /* on window, attach the ready caller to the window onload event */
    window.attachEvent("onload", _onload);
  }
  else {
    /* otherwise, attach the ready caller to the window onload
     * event brutally */
    _previous_onload = window.onload;
    window.onload = _onload;
  }
}

// Call the entry
CS_main();
