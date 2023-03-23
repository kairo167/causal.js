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

/*! Select a Tab.
 * @param tabl_id the Tab identifier,
 * @param page_id the page identifier,
 * @return void.
 */
/** @export */
function CS_select_tab (tab_id, page_id) {
  let tab = document.getElementById (tab_id);

  for (let p = 0; p < tab.children.length; p++) {
    if (tab.children[p].tagName.toLowerCase() == "div") {
      let page = tab.children[p];
      if (page.id == page_id) {
        page.style.display = "block";
        CS_add_class (page, "CS_selected");
      }
      else {
        page.style.display = "none";
        CS_del_class (page, "CS_selected");
      }
    }
  }
}

/*! Add a new Tab.
 * @param tab_id the Tab identifier,
 * @param page_id the page identifier,
 * @param title_text the page title,
 * @param current_node the page content,
 * @param on_config on config callback or NULL; if set, a configuration
 * button is added,
 * @return void.
 */
/** @export */
function CS_add_page (tab_id, page_id, title_text, content_node, on_config) {
  // get the tab
  let tab = document.getElementById (tab_id);
  if (! tab) {
    console.log ("Error: unable to find the tab '" + tab_id + "'");
    return;
  }

  // get the page - must not already exist
  if (CS_get_children_by_id (tab, page_id)) {
    console.log ("Error: element with id '" + page_id +
                 "' already exists");
    return;
  }

  // create the page
  let page = document.createElement ("div");
  tab.appendChild (page);
  page.id = page_id;
  page.style.display = "none";

  // create the title
  let title = page.title_child = document.createElement ("div");
  title.innerHTML = title_text;
  page.appendChild (title);

  // create the onconfig button
  if (on_config) {
    let config = page.config_child = document.createElement ('button');
    config.title = ___('Open the configuration box');
    config.onclick = on_config;
    page.appendChild (config);
  }

  // create the content
  let content = page.content_child = document.createElement ("div");
  page.appendChild (content);
  if (typeof content_node == "string") {
    content.innerHTML = content_node;
  }
  else {
    content.appendChild (content_node);
  }

  // bind the tab
  CS_bind_page (tab);
}

/*! Remove new Tab.
 * @param tab_id the Tab identifier,
 * @param page_id the page identifier,
 * @return void.
 */
/** @export */
function CS_remove_page (tab_id, page_id) {
  let tab = document.getElementById (tab_id);
  if (! tab) {
    console.log ("Error: unable to find the tab '" + tab_id + "'");
    return;
  }

  let page = CS_get_children_by_id (tab, page_id);
  if (! page) {
    console.log ("Error: page '" + page_id + "' does not exist");
    return;
  }

  tab.removeChild (page);
  CS_bind_page (tab);
}

/*! Prepare a Tab for working.
 * @param tab the Tab node,
 * @return void.
 */
/** @export */
function CS_bind_page (tab) {
  if (typeof tab.id == "undefined" || ! tab.id) {
    tab.id = CS_generate_uuid ("tab");
  }

  let selected = false;
  let first    = false;
  let menu     = "<ul>";
  let page;

  for (let p = 0; p < tab.children.length; p++) {
    if (tab.children[p].tagName.toLowerCase() == "div") {
      page = tab.children[p];
      if (typeof page.id == "undefined" || ! page.id) {
        page.id = CS_generate_uuid ("page");
      }
      if (p == 0) {
        first = page;
      }
      if (CS_has_class (page, "CS_selected")) {
        selected = page;
      }
    }
    let title   = page.title_child;
    let content = page.content_child;
    if (! title.orgHTML) {
      title.orgHTML = title.innerHTML;
    }
    menu +=
      "<li><a href=\"#\" onclick=\"CS_select_tab('" +
      tab.id + "', '" + page.id +
      "')\">" + title.orgHTML + "</a></li>";
  }
  menu += "</ul>"

  if (! selected && first) {
    selected = first;
    first.style.display = "block";
  }

  for (let p = 0; p < tab.children.length; p++) {
    if (tab.children[p].tagName.toLowerCase() == "div") {
      let page    = tab.children[p];
      let title   = page.title_child;
      let config  = page.config_child;
      let content = page.content_child;
      let name    = title.orgHTML;

      CS_add_class (page,    "CS_page");
      CS_add_class (title,   "CS_title");
      CS_add_class (title,   "CS_menu");
      CS_add_class (content, "CS_content");
      if (config) {
	CS_add_class (config, "CS_config");
      }

      title.innerHTML =
        "<ul><li><a href=\"#\">" + name +" &nbsp;&nbsp;" +
        menu + "</a></li></ul>";
      CS_bind_menu (title, CS_close_menu);
    }
  }

  CS_select_tab (tab.id, selected.id);
}
