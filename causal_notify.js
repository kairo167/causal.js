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

/*! Notify the user with an element of a html content.
 * @param element DOM element or HTML content,
 * @param type type of notification in "error", "success" and "warning"
 * or "info" (by default if not provided),
 * @return void.
 */
/** @export */
function CS_notify(element, type) {
  // check the type
  if (!type) {
    type = 'info';
  }

  // remove all the previous notifications
  let elems = document.getElementsByClassName("CS_notify");
  for (let i = 0; i < elems.length; i++) {
    elems[i].parentNode.removeChild(elems[i]);
  }

  // create the notification container
  let div = document.createElement("div");
  CS_add_class(div, "CS_notify");

  // set it invisible
  div.style.opacity = 0;

  // append the content
  if (typeof element == "string") {
    div.innerHTML = element;
  }
  else {
    div.appendChild(element);
  }

  // default type
  if (!type) {
    type = "success";
  }

  // check if the child are not notification too
  for (let i = 0; i < div.children.length; i++) {
    let child = div.children[i];

    // if a child is a notification, remove its type
    if (CS_has_class(child, "CS_notify")) {
      for (let i = 0, types = ["info", "error", "success", "warning"];
        i < types.length;
        i++) {
        if (CS_has_class(child, "CS_" + types[i])) {
          type = types[i];
          CS_del_class(child, "CS_" + types[i]);
        }
      }
      CS_del_class(child, "CS_notify");
    }
  }

  // set the class of the container
  CS_add_class(div, "CS_" + type);

  // close the notification
  function close() {
    CS_del_event(document.body, "mousedown", close, true);
    CS_del_event(document.body, "mousemove", close, true);
    CS_del_event(document.body, "keydown", close, true);
    div.style.opacity = 0;
    CS_alarm(5000, function () {
      try {
        document.body.removeChild(div);
      }
      catch (e) {
      }
    });
  }

  // on mobile device, hide the notification after some time because
  // there is no mousemove events
  switch (CS_get_os()) {
    case "ios": case "android":
      CS_alarm(3000, close);

    default:
      // set the new event handler after a while
      CS_alarm(800,
        function () {
          CS_add_event(document.body, "mousedown", close, true);
          CS_add_event(document.body, "mousemove", close, true);
          CS_add_event(document.body, "keydown", close, true);
        });
      break;
  }

  // add the notification in the document and set it visible
  document.body.appendChild(div);
  div.style.opacity = 1;
}
