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

/*! Bind the given stack widget.
 * @param stack the widget,
 * @return void.
 */
/** @export */
function CS_bind_stack(stack) {
  // vertical flag
  let vertical = false;

  /*! Get the size of a child.
   * @param child the child element,
   * @return number the size.
   */
  function get_size(child) {
    // on vertical stack
    if (vertical) {
      return CS_get_external_height(child);
    }
    else {
      return CS_get_external_width(child);
    }
  }

  /*! Set the size of a child.
   * @param child the child element,
   * @param size the size to set.
   */
  function set_size(child, size) {
    // on vertical stack
    if (vertical) {
      CS_set_external_height(child, size);
    }
    else {
      CS_set_external_width(child, size);
    }
  }

  /*! Onright button pressed callback.
   * @param envent the event.
   */
  function onright(event) {
    // get the child element
    let child = stack.children[event.target.stacked];
    let next_child = stack.children[event.target.stacked + 2];

    // if there is previous size stored
    if (child.stacked_size) {
      // restore it
      set_size(child, child.stacked_size);
      set_size(next_child, next_child.stacked_size);

      // delete the stored sizes
      delete child.stacked_size;
      delete next_child.stacked_size;
    }
    else {
      // get the child size and save it, and the next child size
      child.stacked_size = get_size(child);
      next_child.stacked_size = get_size(next_child);

      // maximize this child and minimize the next child
      set_size(child, child.stacked_size + next_child.stacked_size);
      set_size(next_child, 0);
    }
  }

  /*! Onleft button pressed callback.
   * @param envent the event.
   */
  function onleft(event) {
    // get the child elements
    let child = stack.children[event.target.stacked];
    let next_child = stack.children[event.target.stacked + 2];

    // if there is previous size stored
    if (child.stacked_size) {
      // restore it
      set_size(child, child.stacked_size);
      set_size(next_child, next_child.stacked_size);
      
      // delete the stored sizes
      delete child.stacked_size;
      delete next_child.stacked_size;
    }
    else {
      // get the child size and save it, and the next child size
      child.stacked_size = get_size(child);
      next_child.stacked_size = get_size(next_child);

      // minimize this child and maximize the next child
      set_size(child, 0);
      set_size(next_child, next_child.stacked_size + child.stacked_size);
    }
  }

  /*! Gripper mouse down callback.
   * @param envent the event.
   */
  function start_drag(event) {
    // get the child element
    let child = stack.children[event.target.stacked];
    let next_child = stack.children[event.target.stacked + 2];

    let size, next_size;
    CS_drag(
      window,

      // onstart
      (mouse) => {
        console.log('start drag');
        size = get_size(child);
        next_size = get_size(next_child);
        
        delete child.stacked_size;
        delete next_child.stacked_size;
        
        return true;
      },

      //ondrag,
      (start, delta) => {
        console.log('dragging');
        set_size(child, size + (vertical ? delta.y : delta.x));
        set_size(next_child, next_size - (vertical ? delta.y : delta.x));
        return true;
      },

      //onend
      (mouse, draged) => {
        console.log('end dragging');
      }
    );
  }

  // if the stack is vertical
  if (stack.attributes.vertical && stack.attributes.vertical.value == 'true') {
    // add the corresponding class
    CS_add_class(stack, 'CS_vertical');
    vertical = true;
  }

  // for all the stack children
  for (let i = 0; i < stack.children.length; i += 2) {
    // get the children
    let child = stack.children[i];

    // add the stacked class
    CS_add_class(child, 'CS_stacked');

    // if there is a child after, insert a separator
    if (i < stack.children.length - 1) {
      // create the separator elements
      let line = document.createElement('div');
      let gripper = document.createElement('div');
      let left = document.createElement('div');
      let right = document.createElement('div');

      // add the class to the separator element
      CS_add_class(line, 'CS_line');
      CS_add_class(gripper, 'CS_gripper');
      CS_add_class(left, 'CS_left');
      CS_add_class(right, 'CS_right');

      // add the child index
      line.stacked = gripper.stacked = left.stacked = right.stacked = i;

      // set the titles
      line.title = gripper.title = 'resize the stack view';
      left.title = vertical ? ___('Move left') : ___('Move left');
      right.title = vertical ? ___('Move right') : ___('Move right');

      // make the hierarchy
      gripper.appendChild(left);
      gripper.appendChild(right);
      line.appendChild(gripper);

      // add the event handlers
      left.onclick = onleft;
      right.onclick = onright;
      line.onmousedown = gripper.onmousedown = start_drag;

      // insert the separator before the next child
      stack.insertBefore(line, stack.children[i + 1]);
    }
  }

  // for all the stack children
  for (let i = 0; i < stack.children.length; i += 2) {
    // get the children
    let child = stack.children[i];

    // set its stacked size
    set_size(child, get_size(child));
  }
}
