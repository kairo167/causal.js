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

/*! Tooltip position */
/** @export */
let CS_tooltip_position = {
  top: 1 << 0,
  bottom: 1 << 1,
  left: 1 << 2,
  right: 1 << 3,
  middle: 1 << 4,
  center: 1 << 5
};

// if true, the tooltip are never hidden (for debug purpose only)
let CS_tooltip_debug_no_hide = false;

/*! Display a tooltip ad the given position.
 * @param owner the owner element or null,
 * @param options the option object as 
 * {
 *   x:        <int>,          // the absolute x coordinates of the tooltip,
 *   y:        <int>,          // the absolute y coordinates of the tooltip,
 *   content:  <string> | DOM, // the tip as a string or a DOM element,
 *   delayed:  <bool>,         // if delayed (default = false),
 *   autohide: <bool>,         // auto hide after a while,
 *   nomove:   <bool>,         // if true, the tooltip is not hidden on mouse move,
 *   position: <flags>         // CS_tooltip_position ored values
 * },
 * @return timer interval: the tip timer.
 */
/** @export */
function CS_tooltip(owner, options) {
  // the tooltip element
  let tooltip;

  /*! Adds or removes the event handlers of the owner.
   * @param set if true, the handlers are installed and they are
   * removed otherwise.
   */
  function set_handlers(set) {
    const handlers = ["mousemove", "mousedown", "keydown", "touchstart"];

    if (set) {
      for (let i = options.nomove ? 1 : 0; i < handlers.length; i++) {
        // add the event handler
        CS_add_event(owner, handlers[i], hide_tooltip, true);
      }
    }
    else {
      for (let i = 0; i < handlers.length; i++) {
        // remove the event handler
        CS_del_event(owner, handlers[i], hide_tooltip, true);
      }
    }
  }

  /*! Hides the tooltip. 
   * @return void.
   */
  function hide_tooltip() {
    // on no hide debug, return
    if (CS_tooltip_debug_no_hide) {
      return;
    }

    // remove the envent handlers
    set_handlers(false);

    // hide the tooltip
    tooltip.style.display = "none";

    // if the tooltip must be hidden, reset the message
    tooltip.innerHTML = tooltip.content = "";

    // store the last display time
    tooltip.last = CS_now();

    // if the tooltip are auto-hidden, reset the timer
    if (tooltip.autohide) {
      window.clearInterval(tooltip.autohide);
      tooltip.autohide = false;
    }
  }

  /*! Function that sets the tip visible.
   * @return void.
   */
  function display_tooltip() {
    // reset the timer
    if (tooltip.autohide) {
      window.clearInterval(tooltip.autohide);
      tooltip.autohide = null;
    }

    // set the position on need
    let position = (options.position
      ? options.position
      : CS_tooltip_position.top | CS_tooltip_position.left);

    // set the text and styles
    if (typeof options.content == "string") {
      tooltip.innerHTML = options.content;
    }
    else {
      if (!options.content) {
        console.log("set tooltip", options.content);
      }
      for (
        let child = tooltip.lastElementChild;
        child;
        child = tooltip.lastElementChild) {
        tooltip.removeChild(child);
      }
      tooltip.appendChild(options.content);
    }

    // set the style
    tooltip.style.left =
      tooltip.style.right =
      tooltip.style.top =
      tooltip.style.bottom = "auto";

    // set the position
    if (position & CS_tooltip_position.top) {
      tooltip.style.top = options.y + "px";
    }
    else if (position & CS_tooltip_position.bottom) {
      tooltip.style.bottom = options.y + "px";
    }
    if (position & CS_tooltip_position.left) {
      tooltip.style.left = options.x + "px";
    }
    else if (position & CS_tooltip_position.right) {
      tooltip.style.right = options.x + "px";
    }

    // display the tip
    tooltip.style.display = "block";
    tooltip.last = CS_now();

    // if autohide, add the alarm
    if (options.autohide) {
      tooltip.autohide = CS_alarm(2000, hide_tooltip);
    }

    // add the events handlers
    set_handlers(true);
  }

  // get the owner
  if (!owner) {
    owner = document.body;
  }

  // get the tooltip and create it if missing
  tooltip = owner.cs_tooltip;

  // if the tooltip is to be hidden
  if (typeof options == "undefined") {
    if (tooltip) {
      // otherwise, hide the tooltip in a few time
      tooltip.interval = CS_alarm(300, function () {
        // hide the tooltip
        hide_tooltip();
      });
    }
    return null;
  }

  // if the tooltip widget is not yet created
  if (!tooltip) {
    // create the div
    owner.cs_tooltip = tooltip = document.createElement("div");
    tooltip.className = "CS_tooltip";

    // on mouse over, display the tip
    tooltip.onmouseover = function (event) {
      window.clearInterval(tooltip.interval);
    }

    // initialize the visibility
    tooltip.style.display = "none";

    // add the widget to the document
    owner.insertBefore(tooltip, owner.firstChild);
  }

  // if the previous message is identical, return
  if (tooltip &&
    tooltip.content == options.content &&
    tooltip.x == options.x &&
    tooltip.y == options.y) {
    return tooltip.innerHTML;
  }

  // store the new tip
  tooltip.content = options.content;
  tooltip.x = options.x;
  tooltip.y = options.y;

  // clear the delay interval
  window.clearInterval(tooltip.interval);
  tooltip.interval = null;

  // if the display is delayed
  if (options.delayed && tooltip.style.display == "none") {
    // create an interval
    tooltip.interval = CS_alarm(1300, display_tooltip);
  }
  else {
    // and if the display is not delayed, set it immedialtly
    display_tooltip();
  }

  return tooltip.interval;
}

/* Add a tooltip to an element, and manage it.
 * @param owner the tooltip owner,
 * @param element the element,
 * @param tip the tip,
 * @param position optional position as "top", "center" "bottom";
 * default is "bottom",
 * @return void.
 */
/** @export */
function CS_set_tooltip(owner, element, tip, position) {
  // keep the original handlers
  let org_onclick = element.onclick;
  let org_onmouseover = element.onmouseover;
  let org_onmouseout = element.onmouseout;
  let org_ontouchstart = element.ontouchstart;
  let alarm = false;
  let touch = false;

  element.ontouchstart = function (event) {
    touch = true;
    return org_ontouchstart ? org_ontouchstart(event) : true;
  }

  // on mouse over, display the tip
  element.onmouseover = function (event) {
    // get the tip positiob
    let rect = element.getBoundingClientRect();
    let x = rect.left;
    let y = rect.bottom;

    if (position & CS_tooltip_position.top) {
      y = rect.top;
    }
    else if (position & CS_tooltip_position.bottom) {
      y = rect.bottom;
    }
    else if (position & CS_tooltip_position.middle) {
      y = rect.top + (rect.bottom - rect.left) / 2;
    }
    if (position & CS_tooltip_position.left) {
      x = rect.left;
    }
    else if (position & CS_tooltip_position.right) {
      x = rect.right;
    }
    else if (position & CS_tooltip_position.center) {
      x = rect.left + (rect.right - rect.left) / 2;
    }

    // create the timer
    alarm = CS_tooltip(
      owner,
      {
        x: x,
        y: y,
        message: tip,
        delayed: touch ? false : true,
        autohide: touch ? true : false
      });
    if (org_onmouseover) {
      org_onmouseover(event);
    }

    // reset the value
    touch = false;
  }

  /*! Onclick, dont display the tip.
   * @return void.
   */
  element.onclick = function (event) {
    if (!touch) {
      window.clearInterval(alarm);
    }
    return org_onclick ? org_onclick(event) : true;
  }

  /*! On mouse out, hide the tip.
   * @return void.
   */
  element.onmouseout = function (event) {
    CS_tooltip();
    return org_onmouseout ? org_onmouseout(event) : true;
  }
}
