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

/*! Creates a dialog with either a html or a dom element as content.
 * @param options associative objects as
 * {
 *   animate:  true to animate the changes
 *   blur:     true to blur the web page
 *   class:    additional class name
 *   content:  the html or dom element
 *   close:    'default':  the dialog is closed either with the cross button,
 *                         with a click or a key or programmatically
 *             'explicit': the dialog is close by the cross button or
 *                         programmatically,
 *             'none'    : the dialog is closable programmatically only,
 *   modal:    true is the dialog is modal
 *   onbind:   onbind (dialog): called when the dialog is attached to the
 *                              document
 *   onclose:  called on close
 *   parent:   the parent dom element,
 *   styles:   the optional styles of the dialog as a CSS string or as an object,
 * }
 * @return DOM: the dialog.
 */
/** @export */
function CS_dialog_open(options) {
  // check the options
  Object.keys(options).forEach(option => {
    switch (option) {
      case 'close':
        switch (options[option]) {
          case 'default':
          case 'explicit':
          case 'none':
            break;

          default:
            console.error('Error: unexepected close value "',
              options[option], '"');
        }
      case 'blur':
      case 'class':
      case 'content':
      case 'modal':
      case 'onbind':
      case 'onclose':
      case 'parent':
      case 'styles':
        break;

      default:
        console.error('Error: unexepected option name "', option, '"');
    }
  });

  /* animation number of steps */
  let animation_steps = options.animate ? 10 : 0;

  /* animation duration */
  let animation_duration_ms = 400;

  // called when the dialog is moved
  // frame: the frame object
  // event: the caller event
  // return void
  function move(frame, event) {
    let org_x = event.clientX;
    let org_y = event.clientY;
    let org_z = frame.style.zindex;
    let left = frame.offsetLeft;
    let top = frame.offsetTop;
    let org_mouseup = document.onmouseup;
    let org_mousemove = document.onmousemove;

    console.log("Mouse pressed for move; click=" + org_x + ", " + org_y);

    CS_stop_propagation(event);

    frame.style.zindex = 10000;

    document.onmouseup =
      function (event) {
        console.log("Mouse released for move");
        CS_stop_propagation(event);
        document.onmousemove = org_mousemove;
        document.onmouseup = org_mouseup;
        frame.style.zindex = org_z;
      };
    document.onmousemove =
      function (event) {
        console.log("Mouse moved on move");
        CS_stop_propagation(event);

        let delta_x = event.clientX - org_x;
        frame.style.left = (left + delta_x) + "px";

        let delta_y = event.clientY - org_y;
        frame.style.top = (top + delta_y) + "px";
      };
  }

  // called when the dialog is resized
  // corner: the clicked corner
  // frame: the frame object
  // event: the caller event
  // return void
  function resize(corner, frame, event) {
    let org_x = event.clientX;
    let org_y = event.clientY;
    let org_z = corner.style.zindex;
    let left = frame.offsetLeft;
    let width = frame.clientWidth;
    let top = frame.offsetTop;
    let height = frame.offsetHeight;
    let org_mousedown = frame.onmousedown;
    let org_mouseup = document.onmouseup;
    let org_mousemove = document.onmousemove;

    console.log("Mouse pressed for resize");

    let padding_x, padding_y;
    let styles = window.getComputedStyle(frame);
    padding_x = (parseFloat(styles.paddingLeft) +
      parseFloat(styles.paddingRight));
    padding_y = (parseFloat(styles.paddingTop) +
      parseFloat(styles.paddingBottom));

    corner.style.zindex = 10000;

    CS_stop_propagation(event);

    document.onmouseup =
      function (event) {
        console.log("Mouse released for resize");
        CS_stop_propagation(event);
        frame.onmousedown = org_mousedown;
        document.onmousemove = org_mousemove;
        document.onmouseup = org_mouseup;
        corner.style.zindex = org_z;
      };
    document.onmousemove =
      function (event) {
        CS_stop_propagation(event);

        let delta_x = event.clientX - org_x;
        let w = (width - padding_x +
          corner.x_coef * delta_x);
        if (w > 10) {
          frame.style.width = w + "px";
          if (corner.x_coef == -1) {
            frame.style.left = (left + delta_x) + "px";
          }
        }

        let delta_y = event.clientY - org_y;
        let h = (height - padding_y +
          corner.y_coef * delta_y);
        if (h > 10) {
          frame.style.height = h + "px";
          if (corner.y_coef == -1) {
            frame.style.top = (top + delta_y) + "px";
          }
        }
      };
  }

  // called on close
  // dialog: the dialog itself
  function doclose(dialog) {
    // log
    console.log('close dialog', dialog);

    // animate the transition
    CS_animate(animation_steps, animation_duration_ms, (step) => {
      // step in [(steps - 1)..0]
      step = animation_steps - 1 - step;

      // on step
      if (step > 0) {
        // on blur, blur all
        if (options.blur) {
          CS_blur_all(dialog, 1 + (step / 2));
        }

        // set the opacity
        dialog.style.opacity = step / animation_steps;
      }
      else {
        // release the capture
        if (options.modal) {
          CS_modal_capture(false);
        }

        // un-blur on need
        if (options.blur) {
          CS_blur_all(dialog, 0);
        }

        // remove the dialog
        if (dialog.parentNode) {
          dialog.parentNode.removeChild(dialog);
        }
      }
      return true;
    });

    // call onclose if specified
    if (options.onclose) {
      options.onclose(content);
    }
  }

  // create the dialog
  let dialog = document.createElement("div");
  CS_add_class(dialog, "CS_dialog");

  // add the close method
  dialog.close = function (dialog) {
    doclose(dialog);
  }

  // overlay
  if (options.modal) {
    let overlay = document.createElement("div");
    dialog.appendChild(overlay);
    CS_add_class(overlay, "CS_overlay");
  }

  // frame
  let frame = document.createElement("div");
  dialog.appendChild(frame);

  // set the frame class name
  CS_add_class(frame, "CS_frame");
  if (options.class) {
    CS_add_class(frame, options.class);
  }

  // add the styles if specified
  if (options.styles) {
    // if the styles are provided as an array or an object
    if (typeof options.styles == 'object') {
      // append the key: value; strings
      let keys = (Array.isArray(options.styles)
        ? options.styles.keys()
        : Object.keys(options.styles));
      for (const key of keys) {
        frame.style[key] = options.styles[key];
      }
    }

    // at least, if the styles are a string
    else if (typeof options.styles == 'string') {
      // set the CSS
      frame.style.cssText = options.styles;
    }
  }

  // allow move for non modal dialogs
  if (true || !options.modal) {
    frame.style.cursor = "all-scroll";
    frame.onmousedown = function (event) {
      if (event.explicitOriginalTarget == this ||
        event.srcElement == this) {
        CS_stop_propagation(event);
        move(frame, event);
      }
    }
    let structs =
      [{ name: "frame_tl", x_coef: -1, y_coef: -1 },
      { name: "frame_bl", x_coef: -1, y_coef: +1 },
      { name: "frame_br", x_coef: +1, y_coef: +1 }];
    for (let i = 0; i < structs.length; i++) {
      let struct = structs[i];
      let corner = document.createElement("div");
      frame.appendChild(corner);
      CS_add_class(corner, "CS_" + struct.name);
      corner.x_coef = struct.x_coef;
      corner.y_coef = struct.y_coef;
      corner.onmousedown = function (event) {
        CS_stop_propagation(event);
        resize(this, frame, event);
      };
    }
  }

  // close button
  if (options.close != 'none') {
    let close = document.createElement("span");
    frame.appendChild(close);
    CS_add_class(close, "CS_close");
    close.id = "close";
    close.innerHTML = "&times;";
    close.innerHTML = "&nbsp;";
    close.onclick = function () {
      doclose(dialog);
    };
  }

  // content
  let content = document.createElement("form");
  frame.appendChild(content);
  CS_add_class(content, "CS_content");
  content.style.cursor = "default";
  content.method = "post";
  content.onsubmit = function () {
    if (options.onclose) {
      options.onclose(content);
    }
    doclose(dialog);
    return false;
  }

  // add the dialog content to the content div
  if (typeof options.content == "string") {
    content.innerHTML = options.content;
  }
  else {
    content.appendChild(options.content);
  }

  /* modal capture on need */
  if (options.modal) {
    CS_modal_capture(frame, function (target) {
      if (!options.close || options.close == 'default') {
        doclose(dialog);
      }
    }, true /* avoid document scroll */);
  }

  // add the dialog hidden
  dialog.style.opacity = 0;
  if (options.parent) {
    options.parent.appendChild(dialog);
    options.parent.position = null;
  }
  else {
    document.body.appendChild(dialog);
  }

  // call the onbind callback
  if (options.onbind) {
    options.onbind(dialog);
  }

  // animate the transition
  CS_animate(animation_steps, animation_duration_ms, (step) => {
    // on blur, blur all
    if (options.blur) {
      CS_blur_all(dialog, 1 + (step / 2));
    }

    // set the opacity
    dialog.style.opacity = animation_steps ? step / animation_steps : 1;

    return true;
  });

  return dialog;
}

/*! Closes a dialog box.
 * @param element the dialog or one of its child element,
 * @return void.
 * */
/** @export */
function CS_dialog_close(element) {
  if (!element) {
    return;
  }
  else if (CS_has_class(element, "CS_dialog")) {
    element.close(element);
  }
  else {
    CS_dialog_close(element.parentNode);
  }
}

/* Opens a color picker
 * title: the dialog title,
 * onclose: callback called with the selected color on close
 * onchange: callback called when the color is selected
 * blur: blur the web page if true
 * modal: the modal mode,
 * styles: the dialog styles
 * return false
 */
/** @export */
function CS_color_picker(title,
  onclose,
  onchange,
  modal,
  blur,
  styles) {
  let table = document.createElement("table");
  //table.border = 1;
  CS_add_class(table, "CS_color-picker");
  let nr = 2;
  let ng = 4;
  let nb = 7;

  // add the colors
  let nrows = 0;
  let ncols = 0;
  for (let g = 0; g < ng; g++) {
    for (let r = 0; r < nr; r++) {
      nrows++;
      ncols = 0;
      let tr = document.createElement("tr");
      for (let b = 0; b < nb; b++) {
        ncols++;
        let td = document.createElement("td");
        let bkg = ("rgb(" +
          Math.round(r * 255 / (nr - 1)) + ", " +
          Math.round(g * 255 / (ng - 1)) + ", " +
          Math.round(b * 255 / (nb - 1)) + ")");
        td.style.backgroundColor = bkg;
        if (onchange) {
          td.onclick = function (event) {
            onchange(event.target.style.backgroundColor);
          };
        }
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
  }

  // a gray row
  let tr = document.createElement("tr");
  nrows++;
  for (let r = 0; r < ncols; r++) {
    let td = document.createElement("td");
    let bkg = ("rgb(" +
      Math.round(r * 255 / (ncols - 1)) + ", " +
      Math.round(r * 255 / (ncols - 1)) + ", " +
      Math.round(r * 255 / (ncols - 1)) + ")");
    td.style.backgroundColor = bkg;
    if (onchange) {
      td.onclick = function (event) {
        onchange(event.target.style.backgroundColor);
      };
    }
    tr.appendChild(td);
  }
  table.appendChild(tr);

  // add the title
  if (title) {
    let tr = document.createElement("tr");
    let th = document.createElement("th");
    th.colSpan = ncols;
    th.innerHTML = title;
    tr.appendChild(th);
    table.insertBefore(tr, table.firstChild);
  }

  // set the location
  if (!styles) {
    styles = "";
  }
  styles += "width: " + (ncols * 3) + "em; height: " + (nrows * 2) + "em";

  // show the dialog
  CS_dialog_open({
    content: table,
    onclose: onclose,
    modal: modal,
    blur: blur,
    styles: styles
  });
}
