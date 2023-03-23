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

/*! Close a menu from a child element.
 * @param elem the child element,
 * @return void.
 */
/** @export */
function CS_close_menu (elem) {
  // <ul class="CS_level-1">
  //  <li class="CS_submenu CS_level-1">
  //   <a class="CS_level-1">
  //    <ul class="CS_level-2">
  //     <li class="CS_level-2">
  //      <a class="CS_level-2">
  //     </li>
  //     ...
  //    </ul>
  //   </a>
  //  </li>
  //  ...
  // </ul>
  //
  CS_del_class (elem, "CS_over");
  if (elem.tagName != 'UL' || ! CS_has_class (elem, "CS_level-1")) {
  if (elem.tagName.toLowerCase() == "ul") {
    let visibility = elem.style.visibility;
    elem.style.display = "none";
    setTimeout (function() {
      elem.style.display = null;
    }, 500);
  }
    CS_close_menu (elem.parentNode);
  }
}

/*! Open a menu from a child element.
 * @param elem the child element,
 * @return void.
 */
/** @export */
function CS_open_menu (elem) {
  if (elem.tagName != 'UL' || ! CS_has_class (elem, "CS_level-1")) {
    CS_add_class (elem, "CS_over");
    CS_open_menu (elem.parentNode);
  }
}

/*! Bind the menus of the page.
 * @param elem the menu element to bind,
 * @param onclose optional callback called when the menu is closed,
 * @param level the level of the menu,
 * @return void.
 */
/** @export */
function CS_bind_menu (elem, onclose, level) {
  /*! Onmouseenter callback bound to the li element of the menus.
   * The purpose of this enter/leave management is to prevent to
   * close the menu if the user go out of the menu for a small
   * time when he wants to reach a submenu.
   * @param event the event,
   * @return void.
   */
  function li_onmouseenter (event) {
  	// get the li element
    let li = event.target;

    // if there is a current leave alarm associated to the li element
    if (li.enter_alarm) {
  	  // cancel this alarm
      CS_cancel_alarm (li.enter_alarm);
      li.enter_alarm = false;
    }

    // add the over class
    CS_add_class (li, 'CS_over');
  }

  /*! Onmouseleave callback bound to the li element of the menus.
   * @param event the event,
   * @return void.
   */
  function li_onmouseleave (event) {
  	// get the li element and the target element (where the mouse is on now)
    let li = event.target;
    let to = event.toElement;

    // this is the leaving function
    function leave() {
      // reset the alarm value and remove the over class
      li.enter_alarm = false;
      CS_del_class (li, 'CS_over');
    }

    // if there is a target element and if the parents of the
    // target element and the li element are the same, leave
    // immediately
    if (to && li.parentNode == to.parentNode.parentNode) {
      leave();
    }

    // otherwise, leave after a small delay, leting the user the
    // time to reenter in the menu
    else {
      li.enter_alarm = CS_alarm (500, leave);
    }
  }

  // if not provided, get the level
  if (typeof level == "undefined") {
    level = 0;

    for (let x = elem; x; x = x.parentNode) {
      switch (x.tagName.toLowerCase()) {
        case "li": case "a":            break;
        case 'ul':           level++;   break;
        default:             x = false; break;
      }
    }
  }

  switch (elem.tagName.toLowerCase()) {
  case "div":
    break;

  case "li":
    for (let i = 0; i < elem.children.length; i++) {
      if (elem.children[i].tagName.toLowerCase() == "ul") {
	      let child = elem.children[i];
	      CS_add_class (elem, "CS_submenu");
	      break;
      }
    }
    elem.onmouseenter = li_onmouseenter;
    elem.onmouseleave = li_onmouseleave;
    break;

  case "a":
    if (! elem.binded) {
      elem.org_onclick = elem.onclick;

      elem.onclick = function (event) {
        CS_stop_propagation (event);
        if (onclose) {
          onclose (elem);
        }
        if (elem.org_onclick != null) {
          // on touch event
          if (event.pointerType == "touch") {
            // close the menu after a while
            if (elem.close_alarm) {
              CS_cancel_alarm (elem.close_alarm);
            }
            elem.close_alarm = CS_alarm (1800, function() {
              elem.close_alarm = false;
              CS_close_menu (elem);
            });
          }

          // call the callback
          elem.org_onclick (event);
        }
        else {
          // on touch screen
          if (event.pointerType == "touch") {
            // ensure all the hierachy is opened
            CS_open_menu (elem);

            elem.focus();
          }
        }
      };

    }
    break;
  }

  if (elem.tagName.toLowerCase() == "ul") {
    level += 1;
  }

  if (CS_has_class (elem, "CS_level-\\d*")) {
    elem.className =
      elem.className.replace (/(?:^|\s)CS_level-\d*(?!\S)/g,
			                        " CS_level-" + level);
  }
  else {
    CS_add_class (elem, "CS_level-" + level);
  }

  elem.binded = true;

  for (let i = 0; i < elem.children.length; i++) {
    CS_bind_menu (elem.children[i], onclose, level);
  }
}

function menu (html, onclose, location) {
  let menu = document.createElement ("div");
  CS_add_class (menu, "CS_popmenu");
  menu.innerHTML = html;

  if (location) {
    if (location.left) {
      menu.style.left = location.left;
    }
    if (location.top) {
      menu.style.top = location.top;
    }
    if (location.width) {
      menu.style.width = location.width;
    }
    if (location.height) {
      menu.style.height = location.height;
    }
  }
  else {
    menu.style.left = window.event.clientX + "px";
    menu.style.top  = window.event.clientY + "px";
  }

  CS_bind_menu (menu, function (item) {
    if (onclose) {
      onclose();
    }
    menu.parentNode.removeChild (menu);
  });

  let onmousedown = document.onmousedown;
  document.onmousedown =
    function (event) {
      console.log ("Mouse released from menu");

      if (! ((event.explicitOriginalTarget &&
              CS_is_descendant (menu,
                                event.explicitOriginalTarget)) ||
		         (event.srcElement &&
		          CS_is_descendant (menu, event.srcElement)))) {
        if (onclose) {
          onclose();
        }
        CS_stop_propagation (event);
        menu.parentNode.removeChild (menu);
        document.onmousedown = onmousedown;
      }
    };

  document.body.appendChild (menu);
}
