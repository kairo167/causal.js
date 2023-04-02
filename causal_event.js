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

/*! Allow to know if passive event handlers are managed in this browser.
 */
/** @export */
var CS_has_passive_event_handers = (function () {
  var cold = false, hike = function () { };

  try {
    var aid = Object.defineProperty(
      {}, 'passive', { get: function () { cold = true } });
    window.addEventListener('test', hike, aid);
    window.removeEventListener('test', hike, aid);
  }
  catch (e) {
  }

  return cold;
})();

/*! Returns the mouse position from the last event.
 * @param event the event,
 * @return {x: x, y: y}.
 */
/** @export */
function CS_getxy(event) {
  let x, y;
  let st = CS_get_document_scroll('top');
  let sl = CS_get_document_scroll('left');

  // get the event if not provided
  if (!event) {
    event = window.event;
    if (!event) {
      return { x: -1, y: -1 };
    }
  }

  const target = event.target;

  // Get the bounding rectangle of target
  let rect;
  if (target == window) {
    rect = {
      top: 0,
      left: 0,
      bottom: window.getInnerHeight(),
      right: window.getInnerWidth()
    };
  }
  else {
    rect = target.getBoundingClientRect();
  }

  // in case of touch event
  if (typeof event.changedTouches !== "undefined"
    && event.changedTouches.length) {
    x = event.changedTouches[0].clientX;
    y = event.changedTouches[0].clientY;
  }
  else if (typeof event.clientX !== "undefined") {
    x = event.clientX + sl - rect.left;
    y = event.clientY + st - rect.top;
  }
  else if (typeof event.pageX !== "undefined") {
    x = event.pageX + sl - rect.left;
    y = event.pageY + st - rect.top;
  }
  else if (typeof event.x !== "undefined") {
    x = event.x + sl - rect.left;
    y = event.y + st - rect.top;
  }
  else {
    x = y = 0;
  }

  // log
  // console.log("mouse at {" + x + ", " + y + "}");

  // return the position
  return { x: x, y: y };
};

/*! Return true if the location are almost the same. Commonly used to know if
 * a click occured at the same location.
 * @param previous_xy previous location,
 * @param event optional event,
 * @param epsilon optional epsilon value (default is 3),
 * @return true or false.
 */
/** @export */
function CS_same_location(previous_xy, event, epsilon) {
  // get the event if not provided
  if (!event) {
    event = window.event;
    if (!event) {
      return true;
    }
  }

  // get the current location
  const xy = CS_getxy(event);

  // set epsilon if missing
  if (typeof epsilon == "undefined" || epsilon < 0) {
    epsilon = 3;
  }

  return (Math.abs(xy.x - previous_xy.x) < epsilon
    && Math.abs(xy.y - previous_xy.y) < epsilon);
}

/*! Detect if the escape key is pressed on the event.
 * @param event the event,
 * @return true or false.
 */
/** @export */
function CS_is_escape_key(event) {
  var is_escape = false;
  if ("key" in event) {
    is_escape = event.key == "Escape";
  }
  else {
    is_escape = event.keyCode == 27;
  }

  return is_escape;
}

/*! Mouse buttons symbolic names */
/** @export */
const CS_mouse_buttons = {
  primary: 1 << 0,
  secondary: 1 << 1,
  auxilary: 1 << 2,
  fourth: 1 << 3,
  fifth: 1 << 4
};

/*! Allows to know if the given event is a mouse event and if any mouse buttons
 * are pressed.
 * @param event the event,
 * @param buttons a ored combination of CS_mouse_buttons values,
 * @return integer: -1= this is not a mouse button,
 *                   0= none of the given buttons to test are pressed,
 *             buttons= the combination of pressed CS_mouse_buttons values.
 */
/** @export */
function CS_is_mouse_event_with_button(event, buttons) {
  // if the left mouse buton key is not pressed
  if (typeof event.buttons == "undefined") {
    return -1;
  }

  // return the value
  return event.buttons & buttons;
}

/* Adds a mouse stop event listener.
 * @param obj: the object where to add the listner,
 * @param fn: the callback function,
 * @param capture: true to capture all the event,
 * @param passive: the passive mode of the event,
 * @return void.
 */
function CS_install_mouse_stop_handler(obj, fn, capture, passive) {
  // delay used to detect mouse stops
  const stop_delay_ms = 1100;

  /* if the mousestop object does not exist, add it */
  if (!obj.mousestop) {
    obj.mousestop = { callbacks: [] };
  }

  // add the handler
  obj.mousestop.callbacks.push(fn);

  // if there is no yet a mousemove handler
  if (!obj.mousestop.mousemove) {
    obj.mousestop.mousemove = function (event) {
      obj.mousestop.time = CS_now();
      obj.mousestop.event = event;
    };

    CS_add_event(obj, "mousemove", obj.mousestop.mousemove, capture, passive);
    CS_add_event(obj, "touchmove", obj.mousestop.mousemove, capture, passive);
  }

  // if there is no yet a mouseleave handler
  if (!obj.mousestop.mouseleave) {
    obj.mousestop.mouseleave = function (event) { obj.mousestop.time = false; };
    CS_add_event(
      obj, "mouseleave", obj.mousestop.mouseleave, capture, passive);
    CS_add_event(obj, "touchend", obj.mousestop.mouseleave, capture, passive);
  }

  // if there is not yet a timer
  if (!obj.mousestop.timer) {
    // add a timer
    obj.mousestop.timer = setInterval(function () {
      // if the last time set and if it is before now minus the stop delay
      if (obj.mousestop.time && CS_now() > obj.mousestop.time + stop_delay_ms) {
        // reset the time
        obj.mousestop.time = false;

        // call all the callbacks
        obj.mousestop.callbacks.forEach(
          callback => callback(obj.mousestop.event));
      }
    }, stop_delay_ms * 3 / 2);
  }
}

/* Removes a mouse stop event listener.
 * @param obj: the object where from where to remove the listner,
 * @param fn: the callback function,
 * @param capture: true to capture all the event,
 * @param passive: the passive mode of the event,
 * @return void.
 */
function CS_remove_mouse_stop_handler(obj, fn, capture, passive) {
  // if the mousestop object exists
  if (obj.mousestop) {
    // if there is an array of callbacks
    if (obj.mousestop.callbacks) {
      // get the index of the function
      const index = obj.mousestop.callbacks.indexOf(fn);

      // if the array conteins fn
      if (index > -1) {
        obj.mousestop.callbacks.splice(index, 1);
      }
    }

    // if there is no callbacks
    if (!obj.mousestop.callbacks || obj.mousestop.callbacks.length == 0) {
      // remove the timer
      if (obj.mousestop.timer) {
        clearTimeout(obj.mousestop.timer);
      }

      // remove the mousemove handlers
      CS_del_event(
        obj, "mousemove", obj.mousestop.mousemove, capture, passive);
      CS_del_event(
        obj, "touchmove", obj.mousestop.mousemove, capture, passive);
      CS_del_event(
        obj, "mouseleave", obj.mousestop.mouseleave, capture, passive);
      CS_del_event(
        obj, "touchend", obj.mousestop.mouseleave, capture, passive);

      // reset the mousestop object
      obj.mousestop = null;
    }
  }
}

/* Adds an event listener.
 * @param obj: the object where to add the listner,
 * @param type: the event type to listen for,
 * @param fn: the callback function,
 * @param capture: true to capture all the events,
 * @param passive: the passive mode of the event,
 * @return void.
 */
/** @export */
function CS_add_event(obj, type, fn, capture, passive) {
  if (type == "mousestop") {
    /* install the mousestop handler */
    CS_install_mouse_stop_handler(obj, fn, capture, passive);
  }
  else if (obj.attachEvent) {
    obj['e' + type + fn] = fn;
    obj[type + fn] = function (event) {
      obj['e' + type + fn](event);
      if (capture) {
        CS_stop_propagation(event);
      }
    };
    obj.attachEvent('on' + type, obj[type + fn]);
  }
  else {
    obj.addEventListener(type,
      fn,
      CS_has_passive_event_handers
        ? { 'capture': capture, 'passive': true }
        : capture);
  }
}

/* Removes an event listener from an object.
 * @param obj: the object from where to remove the listner,
 * @param type: the event type to listen for,
 * @param fn: the callback function,
 * @param capture: true to capture all the event,
 * @return void.
 */
/** @export */
function CS_del_event(obj, type, fn, capture) {
  if (type == "mousestop") {
    /* remove the mousestop handler */
    CS_remove_mouse_stop_handler(obj, fn, capture, passive);
  }
  else if (obj.detachEvent) {
    obj.detachEvent('on' + type, obj[type + fn]);
    obj[type + fn] = null;
  }
  else {
    obj.removeEventListener(type, fn, capture);
  }
}

/* Stops the propagation of an event.
 * @param event: the event to stop,
 * @return boolean: false.
 */
/** @export */
function CS_stop_propagation(event) {
  if (event.stopPropagation) {
    event.stopPropagation();
  }
  else {
    event.returnValue = false;
  }

  if (!CS_has_passive_event_handers) {
    if (event.preventDefault) {
      event.preventDefault();
    }
    if (event.cancelBubble != null) {
      event.cancelBubble = true;
    }
  }
  return false;
}

/*! Flush the top capture or all the captures if all is true.
 * @param all if true, pop all the captures,
 * @return void.
 */
/** @export */
function CS_modal_pop(all) {
  if (typeof document.CS_modals != "undefined" && document.CS_modals.length) {
    // top {callback: <callback>, elem: <elem>}
    var target;
    while (target = document.CS_modals.pop()) {
      if (target.callback) {
        target.callback(target.elem);
      }
      if (!all) {
        return target;
      }
    }
  }
  return true;
}

/*! Modal capture event handler callback.
 * @param event the event,
 * @return void.
 */
/** @export */
function _CS_modal_capture(event) {
  // depending to the event type
  switch (event.type) {
    case "mousedown":
      var target = document.CS_modals[document.CS_modals.length - 1];

      // if the target is not specified or if the clicked element is not
      // a descendant of the target
      if (target === true
        || (typeof target != 'undefined' && typeof target.elem != 'undefined'
          && !CS_is_descendant(target.elem, event.target))) {
        // stop the event propagation
        CS_stop_propagation(event);

        // pop the modal dialog
        CS_modal_pop(false);
      }
      break;

    case "keydown":
      if (CS_is_escape_key(event, true)) {
        CS_modal_pop(true);
      }
      break;

    default:
      break;
  }
}

/*! Capture the events of the document for a modal interaction.
 * When this modal detector detects an event that should close the
 * interaction, it calls the callback function; the callback function
 * should do what it has to do and release its capture.
 * The caller, on some event, can releases by itself the capture;
 * then it calls this function with false. The callback is not
 * called...
 * @param target the modal target, of false to reset the capture,
 * @param callback optional callback called on release with target
 * as argument,
 * @param noscroll if true, the web page is prevented to scroll,
 * @return integer: the capture count.
 */
/** @export */
function CS_modal_capture(target, callback, noscroll) {
  // on capture
  if (target) {
    // if the capture arrays are not set in the document
    if (typeof document.CS_modals == "undefined"
      || document.CS_modals.length == 0) {
      // initialize the document
      document.CS_modals = new Array();
      document.CS_org_scroll_top = CS_get_document_scroll('top');

      CS_add_event(document, "keydown", _CS_modal_capture, true);
      CS_add_event(document, "mousedown", _CS_modal_capture, true);

      // if (noscroll) {
      //   CS_add_class (document.body, 'CS_noscroll');
      //   document.body.style.marginTop = (-document.CS_org_scroll_top) + "px";
      // }
    }

    // add the target and callback in the arrays and increment the
    // capture count
    document.CS_modals.push({ elem: target, callback: callback });
  }

  // on release
  else {
    // decrement the count and pop the target array
    // let top = document.CS_modals.pop();
    let top = CS_modal_pop(false);

    // if the document has no more capture
    if (document.CS_modals.length == 0) {
      if (CS_has_class(document.body, 'CS_noscroll')) {
        // restore the values
        CS_del_class(document.body, 'CS_noscroll');
        CS_set_document_scroll('top', document.CS_org_scroll_top);
      }

      // delete the event handlers
      CS_del_event(document, "keydown", _CS_modal_capture, true);
      CS_del_event(document, "mousedown", _CS_modal_capture, true);

      return 0;
    }
  }
  return document.CS_modals.length;
}

/* Call a function after a certain delay in mili-seconds. Notive that the
 * alarm can be cancelled with CS_cancel_alarm().
 * @param delay_ms the delay in milliseconds
 * @param callback the callback function with the alamr identifier as argument,
 * @return alarm: the alarm identifier.
 */
/** @export */
function CS_alarm(delay_ms, callback) {
  let alarm = setTimeout(function () { callback(alarm); }, delay_ms);
  return alarm;
}

/* Cancel an alarm.
 * @param alarm the alarm to cancel,
 * @return void.
 */
/** @export */
function CS_cancel_alarm(alarm) { clearTimeout(alarm); }

/*! Returns the number of milliseconds elapsed since either the browser
 * navigationStart event or the UNIX epoch, depending on availability.
 * Where the browser supports 'performance' we use that as it is more
 * accurate (microsoeconds will be returned in the fractional part)
 * and more reliable as it does not rely on the system time.
 * Where 'performance' is not available, we will fall back to
 * Date().getTime().
 * @return real: the time
 */
/** @export */
const CS_now = (function () {
  var performance = window.performance || {};

  performance.now = (function () {
    return (performance.now || performance.webkitNow || performance.msNow
      || performance.oNow || performance.mozNow
      || function () { return new Date().getTime(); });
  })();

  return performance.now();
});

/*! Sleeps for the given delay in ms.
 * @param delay the delay to wait,
 * @return Promiose: a primise object.
 */
/** @export */
function CS_sleep(time_ms) {
  return new Promise((resolve) => setTimeout(resolve, time_ms));
}

/*! Debounces a function call: the function is called
 * after the given delay delay in IDLE.
 * https://remysharp.com/2010/07/21/throttling-function-calls
 * @param fn the function,
 * @param delay the delay in milliseconds,
 * @return void.
 */
/** @export */
function CS_debounce(fn, delay_ms) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () { fn.apply(context, args); }, delay_ms);
  };
}

/*! Throttles a function call: the function is called
 * at a frequency that no more than the given threshhold delay.
 * https://remysharp.com/2010/07/21/throttling-function-calls
 * @param fn the function,
 * @param threshhold the delay in milliseconds,
 * @param scope the scope,
 * @return void.
 */
/** @export */
function CS_throttle(fn, threshhold_ms, scope) {
  threshhold_ms || (threshhold_ms = 250);
  var last, deferTimer;
  return function () {
    var context = scope || this;
    var now = +new Date, args = arguments;
    if (last && now < last + threshhold_ms) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold_ms);
    }
    else {
      last = now;
      fn.apply(context, args);
    }
  };
}

/*! Animate a transition.
 * @param steps number of steps - if zero, there is no animation and
 *  callback is called with zero,
 * @param duration duration of the animation in milliseconds,
 * @param callback the animation callback with the current step number and that
 * returns a boolean as true to continue the animation and false to stop it
 * as argument in [0..(steps - 1)],
 * @return false.
 */
/** @export */
function CS_animate(steps, duration_ms, callback) {
  // work arround: firefow does the animation too slowly
  let browser = CS_get_browser();
  if (steps == 0) {
    callback(0);
  }
  else if (browser.indexOf("firefox") > -1) {
    callback(steps - 1);
  }
  else {
    let delay = duration_ms / steps;

    /* internal animation with the current percentage as argument */
    function _animate(step) {
      /* call the callback - stop the animation if it returns false */
      if (!callback(step)) {
        return;
      }

      /* do the next step */
      if (step < steps - 1) {
        /* sleep the given delay */
        CS_sleep(delay).then(() => {
          _animate(step + 1);
        });
      }
    }

    // start the animation
    _animate(0);
  }
}

/*! Animate a show transition. Does not work...
 * @param element the element to animate,
 * @param opacity the final opacity,
 * @param duration_ms duration of the animation in milliseconds.
 */
/** @export */
function CS_animate_show(element, opacity, duration_ms) {
  // if the element is not hidden, return
  if (!CS_has_class(element, 'CS_hidden')) {
    return;
  }

  // keep the original opacity and transition values
  let org_transition = element.style.transition;

  // reset the transition, set the element transparent and make it visible
  element.style.transition = '';
  element.style.opacity = 0;
  CS_del_class(element, 'CS_hidden');

  // set the opacity transition
  element.style.transition = 'opacity ' + duration_ms + 'ms';

  // set the opacity to the final required opacity - this is animated
  element.style.opacity = opacity;

  // create a timer that restore the original transition
  setTimeout(() => {
    element.style.transition = org_transition;
  }, duration_ms);
}

/*! Animate a hide transition.
 * @param element the element to animate,
 * @param duration_ms duration of the animation in milliseconds.
 */
/** @export */
function CS_animate_hide(element, duration_ms) {
  // if the element is already hidden, return
  if (CS_has_class(element, 'CS_hidden')) {
    return;
  }

  // keep the original opacity and transition values
  let org_transition = element.style.transition;

  // set the opacity transition
  element.style.transition = 'opacity ' + duration_ms + 'ms';

  // set the element transparent - this is animated
  element.style.opacity = 0;

  // create a timer that restore the original transition
  setTimeout(() => {
    // make the element hidden
    CS_add_class(element, 'CS_hidden');

    // restore the original opacity and transition
    element.style.transition = org_transition;
  }, duration_ms);
}

/*! Drag in the screen.
 * @param element the element where to drag,
 * @param onstart: function (mouse) boolean
 * called when the user clicks into the scene to start the drag, with the
 * mouse position, the function returns true to continue dragging or false,
 * @param ondrag: function (mouse_start, mouse_delta) boolean
 * called on dragging with the intial drag mouse position and the delta in
 * the mouse position, the function returns true to continue dragging or
 * false,
 * @param onend: function (mouse, dragged) void
 * called when the user release the mouse with the mouse position the
 * dragging status,
 * @return void.
 */
/** @export */
function CS_drag(element, onstart, ondrag, onend) {
  // drag status
  let dragged = false;

  // keep the grag start screen position
  let drag_start = { x: window.event.pageX, y: window.event.pageY };

  /*! Stop the drag process.
   * @param event the event that caused the stop,
   * @param abandon if true, this is an abandon, do not call onend()
   * callback,
   * @return void;
   */
  function stop_drag(event, abandon) {
    // log
    console.log('leave dragging handler with'
      + (dragged ? ' mouse dragged' : 'out dragging'));

    // stop the event propagation
    CS_stop_propagation(event);

    // remove the handler
    CS_del_event(window, 'mousemove', mousemove, true);
    CS_del_event(window, 'mouseup', mouseup, true);
    CS_del_event(window, 'keydown', keydown, true);
    CS_del_event(window, 'keyup', keyup, true);

    CS_del_event(window, 'touchmove', mousemove, true);
    CS_del_event(window, 'touchstart', keydown, true);
    CS_del_event(window, 'touchend', mouseup, true);
    CS_del_event(window, 'touchcancel', mouseup, true);

    // call the onend handled if provided
    if (!abandon && onend) {
      // get the mouse position
      let mouse = CS_getxy(event);

      // call the callback
      onend(mouse, dragged);
    }
  }

  // e v e n t   h a n d l e r s

  /*! Mouse move event handler.
   * @param event the event,
   * @return true;
   */
  function mousemove(event) {
    // stop the event propagation
    CS_stop_propagation(event);

    // if the left mouse buton key is not pressed
    if (CS_is_mouse_event_with_button(event, CS_mouse_buttons.primary) == 0) {
      stop_drag(event, true);
      return false;
    }

    // keep the grag start screen position
    // let mouse = CS_getxy(event);
    let mouse = { x: window.event.pageX, y: window.event.pageY };

    // get the mouse delta
    let delta = { x: mouse.x - drag_start.x, y: mouse.y - drag_start.y };

    // on drag start
    if (dragged == true || !CS_same_location(drag_start, event)) {
      // if dragged not yet started
      if (!dragged) {
        // call the start callback if any
        if (onstart && !onstart(mouse)) {
          // if the callback returns false, stop dragging
          stop_drag(event, true);
        }
        else {
          // log
          console.log('start to drag');

          // change the flag
          dragged = true;
        }
      }

      // log
      console.log('mouse dragged');

      // drag the object
      if (dragged && ondrag && !ondrag(drag_start, delta)) {
        // log
        console.log('dragging interrupted by callback');

        // stop the grag
        stop_drag(event, true);
      }
    }
    else {
      // log
      console.log('mouse moved during drag detection');
    }

    return false;
  }

  /*! Mouse up event handler.
   * @param event the event,
   * @return false;
   */
  function mouseup(event) {
    // stop dragging
    stop_drag(event, false);
    return false;
  }

  /*! Key down event handler.
   * @param event the event,
   * @return false;
   */
  function keydown(event) {
    // stop the event propagation
    CS_stop_propagation(event);
    return false;
  }

  /*! Key up event handler.
   * @param event the event,
   * @return false;
   */
  function keyup(event) {
    // stop the event propagation
    CS_stop_propagation(event);

    // on escape key
    if (event.key == 'Escape') {
      // stop dragging
      stop_drag(event, true);
    }

    return false;
  }

  // log
  console.log("start dragging on ", drag_start);

  // add the event handlers
  CS_add_event(window, 'mousemove', mousemove, true);
  CS_add_event(window, 'mouseup', mouseup, true);
  CS_add_event(window, 'keydown', keydown, true);
  CS_add_event(window, 'keyup', keyup, true);

  CS_add_event(window, 'touchmove', mousemove, true);
  CS_add_event(window, 'touchstart', keydown, true);
  CS_add_event(window, 'touchend', mouseup, true);
  CS_add_event(window, 'touchcancel', mouseup, true);
}

/*! Double click event handler for th given element.
 * @param onclick the on click event handler,
 * @param ondblclick the on double click event handler,
 * @param equiv optional event => boolean callback that return true if the
 * given event is equivallent to a double click, mainly used for
 * touch event devices as ipads,
 * @param double_click_ms the double click timing in ms,
 */
/** @export */
function CS_double_click_handler(
  element, onclick, ondblclick, equiv = false, double_click_ms = 500) {
  // last click time
  let last_click_time = 0;

  // click alarm
  let click_alarm = false;

  // return the element.onclick event handler
  element.onclick = function (event) {
    // get the current time
    const now = CS_now();

    // log
    console.log('click now=',
      now,
      ', last_click_time=',
      last_click_time,
      ', delta=',
      now - last_click_time,
      ', click_alarm=',
      click_alarm);

    // reset the alarm
    if (click_alarm) {
      CS_cancel_alarm(click_alarm);
      click_alarm = false;
    }

    // if equivallent event or if double cick
    if ((equiv && equiv(event)) || now - last_click_time < double_click_ms) {
      // double-lick
      last_click_time = 0;
      ondblclick && ondblclick(event);
    }
    else {
      last_click_time = now;
      click_alarm = CS_alarm(double_click_ms + 150, function () {
        console.log('alarm');
        last_click_time = 0;
        click_alarm = false;
        onclick && onclick(event);
      })
    }

    return true;
  };
}
