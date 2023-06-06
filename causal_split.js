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

/*! Force to resize a split.
 * @param split the split widget,
 * @param delta displavement of the gripper or false,
 * @param org: original panel size as {left: <integer>, right <integer>},
 * @return void.
 */
/** @export */
function CS_split_resize(split, delta, org) {
  // log
  console.log("resize split: delta =" + delta);

  // get the split components
  let left = split.children[0];
  let gripper = split.children[1];
  let right = split.children[2];

  // get the wrap mode
  let wrap = CS_has_class(split, "CS_wrap");

  // set the default arguments values on need
  if (typeof delta == "undefined") {
    delta = 0;
  }

  if (typeof org == "undefined") {
    org = false;
  }

  // if the split is vertical
  if (split.vertical) {
    // get the max height
    max_height = CS_get_internal_height(split.parentNode) - 20;

    // get the left (top) element height
    let left_height;

    if (CS_has_class(left, "CS_hidden")) {
      left_height = 0;
    }
    else if (org) {
      left_height = org.left + delta;
    }
    else if (CS_has_class(right, "CS_hidden")) {
      left_height = max_height;
    }
    else {
      left_height = (max_height * 2 / 3 | 0) + delta;
    }

    // apply the left height
    if (left_height) {
      // adjust the max height
      if (left_height > max_height) {
        left_height = max_height;
      }

      // apply the height and get the actual height in case of style max/minHeight
      CS_set_external_height(left, left_height);
      left_height = CS_get_external_height(left);
    }

    // get the right (bottom) element height
    let right_height;

    if (1 || CS_has_class(right, "CS_hidden")) {
      right_height = 120;
    }
    else {
      // compute the right height
      right_height = CS_get_internal_height(split);

      // if the left element is visible (has an height)
      if (left_height) {
        right_height -=
          CS_get_external_height(left) +
          CS_get_external_height(gripper);
      }

      // set the right height
      CS_set_external_height(right, right_height);

      // ajust the right height agains the actual sizes
      let diff = right_height - CS_get_external_height(right);
      if (diff) {
        CS_set_external_height(right, right_height + diff);
        console.log(CS_str_format(
          "Diff adjustment: right.height set to % and have %",
          right_height + diff, CS_get_external_height(right)));
      }
    }

    // check the error
    if (left_height + right_height > split.clientHeight) {
      console.log(CS_str_format(
        "Error: left.height + right.height > " +
        "split.clientHeight: % + % = % > %",
        left_height, right_height, left_height + right_height,
        split.clientHeight));
    }
  }

  // if the split is horizontal
  else {
    // get the max width
    let max_width = CS_get_external_width(left) - 15;

    // get the left element width
    let left_width;

    if (CS_has_class(left, "CS_hidden")) {
      left_width = 0;
    }
    else if (org) {
      left_width = org.left + delta;
    }
    else if (CS_has_class(right, "CS_hidden") || wrap) {
      left_width = max_width + delta;
    }
    else {
      left_width = max_width + delta;
    }

    // apply the width and reget it in case of min or max width style settings
    CS_set_external_width(left, left_width);
    left_width = CS_get_external_width(left);
    console.log(CS_str_format("left.width set to % and have %",
      left_width, CS_get_external_width(left)));

    // if the split is not wrapped
    if (!wrap) {
      // get the right width
      let right_width = CS_get_internal_width(split);

      // if the left part is visinle
      if (left_width) {
        // resize the right part
        right_width -=
          CS_get_external_width(left) +
          CS_get_external_width(gripper);
      }

      // apply the new width
      CS_set_external_width(right, right_width);
      console.log(CS_str_format(
        "right.width set to % and have %",
        right_width, CS_get_external_width(right)));

      // adjust the size against the actual size
      let diff = right_width - CS_get_external_width(right);
      if (diff) {
        CS_set_external_width(right, right_width + diff);
        console.log(CS_str_format(
          "Diff adjustment: right.width set to % and have %",
          right_width + diff, CS_get_external_width(right)));
      }

      // check te error
      if (left_width + right_width >= CS_get_internal_width(split)) {
        console.log(CS_str_format
          ("Error: left.width + right.width > " +
            "split.clientWidth: % + % = % > %",
            left_width, right_width, left_width + right_width,
            CS_get_internal_width(split)));
      }
    }

    // on wrapped split, set the gripper size
    else {
      gripper.style.left = left_width + "px";
    }
  }
}

/*! On split resize callback.
 * @param split_id the split identifier,
 * @param event the calling event,
 * @param callback the on split callback function,
 * @return void.
 */
/** @export */
function CS_split_resize_callback(split_id, event, callback) {
  // get the mouse position
  let org_x = event.clientX;
  let org_y = event.clientY;

  // get the split elements
  let split = document.getElementById(split_id);
  let left = split.children[0];
  let gripper = split.children[1];
  let right = split.children[2];

  // get the wrap mode
  let wrap = CS_has_class(split, "CS_wrap");

  // initialize the original size
  let org = {};

  // set the parent unselectable - this will be removed on mouseup evant
  CS_add_class(left.parentNode, "CS_unselectable");

  // keep the original dimensions
  if (split.vertical) {
    org.left = CS_get_internal_height(left);
    org.right = CS_get_internal_height(right);
  }
  else {
    org.left = CS_get_external_width(left);
    org.right = CS_get_external_width(right);
  }

  /*! Onmousemove event handler.
   * @param event the event,
   * @return false.
   */
  function mousemove(event) {
    let delta;

    // if the split is vertical
    if (split.vertical) {
      // compute the displacement
      delta = event.clientY - org_y;

      // add the indicator class
      CS_add_class(gripper, "CS_vgripper-hover");

      // get the left width
      left.width = CS_get_external_width(left);
    }

    // if the split is horizontal
    else {
      // get the displacement
      delta = event.clientX - org_x;

      // add the indicator class
      CS_add_class(gripper, "CS_gripper-hover");
    }

    // resize the split
    CS_split_resize(split, delta, org);

    // if the callback is provided
    if (callback) {
      // call it with the arguments
      callback(
        CS_get_external_width(left),
        CS_get_external_width(right),
        wrap);
    }

    // stop the even tpropagation
    CS_stop_propagation(event);
    return false;
  }
  CS_add_event(window, "mousemove", mousemove, true);

  /* Mouseup event handler.
   * @param event the evet,
   * @return false.
   */
  function mouseup(event) {
    // log
    console.log('Pannel drag stopped');

    // remove the inidcator clas
    if (split.vertical) {
      CS_del_class(gripper, "CS_vgripper-hover");
    }
    else {
      CS_del_class(gripper, "CS_gripper-hover");
    }

    // re-allow parent selection
    CS_del_class(left, "CS_unselectable");

    // remove the mouse event handlers
    CS_del_event(window, "mousemove", mousemove, true);
    CS_del_event(window, "mouseup", mouseup, true);

    // stop the event propagation
    CS_stop_propagation(event);
    return false;
  }

  CS_add_event(window, "mouseup", mouseup, true);
}

/*! Bind the given split widget.
 * @param split the split widget,
 * @param callback the on split callback function as
 * function (left_size, right_size, wrap_mode),
 * @return void.
 */
/** @export */
function CS_bind_split(split, callback) {
  // get the split elements
  let left = split.children[0];
  let gripper = split.children[1];
  let right = split.children[2];

  // set a default identifier on need
  if (split.id == "") {
    split.id = CS_generate_uuid("split");
  }

  // get the dimensions
  let height = CS_get_internal_height(split);
  let width = CS_get_internal_width(split);

  // get the vertical status
  let vertical;
  if (typeof split.vertical == "undefined") {
    vertical =
      typeof split.attributes.vertical != "undefined" &&
      split.attributes.vertical.value == "true";
    split.vertical = vertical;
  }
  else {
    vertical = split.vertical;
  }

  // bind the left element
  if (typeof left != "undefined" &&
    (typeof left.bound == "undefined" || !left.bound)) {
    // set the flag
    left.bound = true;

    // set a default identifier
    if (left.id == "") {
      left.id = CS_generate_uuid("left");
    }

    // if the split is vertical
    if (vertical) {
      // set the class and the height
      CS_add_class(left, "CS_vleft");
      CS_set_external_height(
        left,
        (height - CS_get_external_height(gripper)) / 2);
    }
    else {
      // set the class and the height
      CS_add_class(left, "CS_left");
      CS_set_external_height(left, height);
    }
  }

  // bind the gripper
  if (typeof gripper != "undefined" &&
    (typeof gripper.bound == "undefined" || !gripper.bound)) {
    // get the flag
    gripper.bound = true;

    // set a default identifier on need
    if (gripper.id == "") {
      gripper.id = CS_generate_uuid("gripper");
    }
    // set the onmousedown event handler
    gripper.onmousedown = function (event) {
      // on mouse down, resize the split and stop propagation
      CS_split_resize_callback(split.id, event, callback);
      CS_stop_propagation(event);
    }

    // set the gripper class
    if (vertical) {
      CS_add_class(gripper, "CS_vgripper");
    }
    else {
      CS_add_class(gripper, "CS_gripper");
      CS_set_external_height(gripper, height);
    }
  }

  // bind the right element
  if (typeof right != "undefined" &&
    (typeof right.bound == "undefined" || !right.bound)) {
    // set the flag
    right.bound = true;

    // set a default identifier on need
    if (right.id == "") {
      right.id = CS_generate_uuid("right");
    }

    // set the class and height
    if (vertical) {
      CS_add_class(right, "CS_vright");
      CS_set_external_height(right,
        height -
        CS_get_external_height(left) -
        CS_get_external_height(gripper));
    }
    else {
      CS_add_class(right, "CS_right");
      CS_set_external_height(right, height);
    }
  }
}
