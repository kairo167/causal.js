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

  /*! Create a separator.
   * @param index the new child index,
   * @return DOM returns the separator DOM element.
   */
  function create_separator(index) {
    // create the separator elements
    let gripper = document.createElement('div');
    let handle = document.createElement('div');
    let line = document.createElement('div');
    let left = document.createElement('div');
    let right = document.createElement('div');

    // add the class to the separator element
    CS_add_class(gripper, 'CS_gripper');
    CS_add_class(handle, 'CS_handle');
    CS_add_class(line, 'CS_line');
    CS_add_class(left, 'CS_left');
    CS_add_class(right, 'CS_right');

    // add the child index
    gripper.stacked = handle.stacked = line.stacked = left.stacked = right.stacked = index;

    // set the titles
    gripper.title = handle.title = line.title = 'resize the stack view';
    left.title = vertical ? ___('Move left') : ___('Move left');
    right.title = vertical ? ___('Move right') : ___('Move right');

    // make the hierarchy
    handle.appendChild(left);
    handle.appendChild(right);
    gripper.appendChild(handle);
    gripper.appendChild(line);

    // add the event handlers
    left.onclick = onleft;
    right.onclick = onright;
    gripper.onmousedown = handle.onmousedown = line.onmousedown = start_drag;

    return gripper;
  }

  // if the stack is vertical
  if (stack.attributes.vertical &&
    stack.attributes.vertical.value == 'true') {
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
      // create a separator
      let separator = create_separator(i);

      // insert the separator before the next child
      stack.insertBefore(separator, stack.children[i + 1]);
    }
  }

  // for all the stack children
  for (let i = 0; i < stack.children.length; i += 2) {
    // get the children
    let child = stack.children[i];

    // set its stacked size
    set_size(child, get_size(child));
  }

  // exported methods

  /*! View only one child of restore all the children.
   * @param child the optional child to view.
   */
  stack.view = function (child) {
    // view only one child
    if (child) {
      // for all the stack children, keep their actual size
      for (let i = 0; i < stack.children.length; i += 2) {
        // get the children
        let this_child = stack.children[i];

        // set its stacked size
        this_child.stacked_size = get_size(this_child);
      }

      // hide all children but child
      for (let i = 0; i < stack.children.length; i += 1) {
        // get the children
        let this_child = stack.children[i];

        // hide it if not child
        if (this_child != child) {
          CS_add_class(this_child, 'CS_hidden');
        }
      }
    }

    // restore from view
    else {
      // show all children
      for (let i = 0; i < stack.children.length; i += 1) {
        // get the children
        let this_child = stack.children[i];

        // show it
        CS_del_class(this_child, 'CS_hidden');

        // restore its size
        if (typeof this_child.stacked_size != 'undefined') {
          set_size(this_child, this_child.stacked_size);
        }
      }
    }
  };

  /*! Adds a child.
   * @param child the child to add,
   * @param position optional the position.
   */
  stack.add = function (child, position) {
    // if the position is provided and it it is valid
    if (typeof position != 'undefined'
      //         child | child | child
      // index     0   1   2   3   4
      // position  0       1       2
      && position < stack.children.length / 2) {
      // get the child at the position
      let next_child = stack.children[position * 2];

      // create a separator
      let separator = create_separator(position * 2);

      stack.insertBefore(separator, next_child);
      stack.insertBefore(child, next_child);
    }

    // otherwise, simply append the new children
    else {
      // create a separator
      let separator = create_separator(stack.children.length);

      // append the separator and the child
      stack.appendChild(separator);
      stack.appendChild(child);
    }

    // add the stacked class
    CS_add_class(child, 'CS_stacked');

    // set the stacked size of the new child
    set_size(child, get_size(child));
  }

  /*! Deletes a child.
   * @param child the child to delete or its position.
   */
  stack.del = function (child_or_position) {
    let child, position;

    // get the child and its position
    if (typeof child_or_position == 'number') {
      position = child_or_position;
      child = (position < stack.children.length / 2
        ? stack.children[position * 2]
        : false);
    }

    // if the child exists
    if (child !== false && stack.contains(child)) {
      //         child | child | child
      // index     0   1   2   3   4
      // position  0       1       2
      let separator = false;
      if (stack.children.length > 1) {
        // get the separator before if the child is not the first child
        // and the separator after the child otherwise
        separator = stack.children[position * 2 + (position > 0 ? -1 : +1)]
      }

      // remove the child and the separator
      stack.removeChild(child);
      if (separator) {
        stack.removeChild(separator);
      }

      // remove the stacked class
      CS_del_class(child, 'CS_stacked');
    }
  };
}
