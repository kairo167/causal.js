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

/*! Return a value for a style of an element. The coordinates are converted
 * in pixels.
 * @param el the element,
 * @param styleProp the style,
 * @return string: the value.
 */
/** @export */
function CS_get_style(el, styleProp) {
  let value, defaultView = (el.ownerDocument ||
    document).defaultView;
  // W3C standard way:
  if (defaultView && defaultView.getComputedStyle) {
    // sanitize property name to css notation
    // (hypen separated words eg. font-Size)
    styleProp = styleProp.replace(/([A-Z])/g,
      "-$1").toLowerCase();
    return defaultView.getComputedStyle(
      el, null).getPropertyValue(styleProp);
  }
  else if (el.currentStyle) { // IE
    // sanitize property name to camelCase
    styleProp = styleProp.replace(/\-(\w)/g,
      function (str, letter) {
        return letter.toUpperCase();
      });
    value = el.currentStyle[styleProp];
    // convert other units to pixels on IE
    if (/^\d+(em|pt|%|ex)?$/i.test(value)) {
      return (function (value) {
        let oldLeft = el.style.left;
        let oldRsLeft = el.runtimeStyle.left;
        el.runtimeStyle.left = el.currentStyle.left;
        el.style.left = value || 0;
        value = el.style.pixelLeft + "px";
        el.style.left = oldLeft;
        el.runtimeStyle.left = oldRsLeft;
        return value;
      })(value);
    }
    return value;
  }
}

/*! Return an integer value for a style of an element.
 * The coordinates are converted
 * in pixels.
 * @param el the element,
 * @param styleProp the style,
 * @return string: the value.
 */
/** @export */
function CS_get_int_style(el, styleProp) {
  let str = CS_get_style(el, styleProp);
  let ret = str == "" || str == "0px" ? 0 : parseInt(str);
  if (ret < -10000 || ret > 10000) {
    console.log('error');
  }
  return ret;
}

/*! Return the horizontal padding value of an element.
 * @param el the element,
 * @return number: the value.
 */
/** @export */
function CS_get_width_pad(element) {
  let pad =
    (CS_get_int_style(element, 'padding-left') +
      CS_get_int_style(element, 'padding-right') +
      CS_get_int_style(element, 'border-left-width') +
      CS_get_int_style(element, 'border-right-width') +
      CS_get_int_style(element, "margin-left") +
      CS_get_int_style(element, "margin-right"));
  return pad;
}

/*! Return the vertical padding value of an element.
 * @param el the element,
 * @return number: the value.
 */
/** @export */
function CS_get_height_pad(element) {
  let pad =
    (CS_get_int_style(element, 'padding-bottom') +
      CS_get_int_style(element, 'padding-top') +
      CS_get_int_style(element, 'border-top-width') +
      CS_get_int_style(element, 'border-bottom-width') +
      CS_get_int_style(element, "margin-top") +
      CS_get_int_style(element, "margin-bottom"));
  return pad;
}

/*! Return the external width of an element.
 * @param el the element,
 * @return number: the value.
 */
/** @export */
function CS_get_external_width(element) {
  return (element.offsetWidth +
    CS_get_int_style(element, "margin-left") +
    CS_get_int_style(element, "margin-right"));
}

/*! Return the external height of an element.
 * @param el the element,
 * @return number: the value.
 */
/** @export */
function CS_get_external_height(element) {
  return (element.offsetHeight +
    CS_get_int_style(element, "margin-top") +
    CS_get_int_style(element, "margin-bottom"));
}

/*! Set the external width of an element.
 * @param el the element,
 * @param value the value as a string or an integer,
 * @return void.
 */
/** @export */
function CS_set_external_width(element, width) {
  switch (typeof width) {
    case "undefined":
      element.style.width = null;
      break;

    case "string":
      element.style.width = width;
      break;

    default:
      let pad = CS_get_width_pad(element);
      pad += CS_get_int_style(element, "border-right-width");
      pad += CS_get_int_style(element, "border-left-width");

      element.style.width = (width >= pad ? width - pad : 0) + 'px';
      break;
  }
}

/*! Set the external height of an element.
 * @param el the element,
 * @param value the value as a string or an integer,
 * @return void.
 */
/** @export */
function CS_set_external_height(element, height) {
  switch (typeof height) {
    case "undefined":
      element.style.height = null;
      break;

    case "string":
      element.style.height = height;
      break;

    default:
      let pad = CS_get_height_pad(element);
      pad += CS_get_int_style(element, "border-right-height");
      pad += CS_get_int_style(element, "border-left-height");

      element.style.height = (height >= pad ? height - pad : 0) + 'px';
      break;
  }
}

/*! Return the internal width of an element.
 * @param el the element,
 * @return number: the value.
 */
/** @export */
function CS_get_internal_width(element) {
  return (element.clientWidth -
    CS_get_int_style(element, "padding-left") -
    CS_get_int_style(element, "padding-right"));
}

/*! Return the internal height of an element.
 * @param el the element,
 * @return number: the value.
 */
/** @export */
function CS_get_internal_height(element) {
  return (element.clientHeight -
    CS_get_int_style(element, "padding-top") -
    CS_get_int_style(element, "padding-bottom"));
}

/*! Set the internet width of an element.
 * @param el the element,
 * @param value the value as a string or an integer,
 * @return void.
 */
/** @export */
function CS_set_internal_width(element, width) {
  switch (typeof width) {
    case "undefined":
      element.style.width = null;
      break;

    case "string":
      element.style.width = width;
      break;

    default:
      element.style.width = width + 'px';
      break;
  }
}

/*! Set the internet height of an element.
 * @param el the element,
 * @param value the value as a string or an integer,
 * @return void.
 */
/** @export */
function CS_set_internal_height(element, height) {
  switch (typeof height) {
    case "undefined":
      element.style.height = null;
      break;

    case "string":
      element.style.height = height;
      break;

    default:
      element.style.height = height + 'px';
      break;
  }
}

/*! return the top position of an element against another owner element.
 * @param element the starting element,
 * @param parent the optional parent element
 * @return int: the top position.
 */
/** @export */
function CS_get_top(element, parent) {
  let top;
  for (top = 0;
    element && (!parent || CS_is_descendant(parent, element));
    element = element.offsetParent || element.parentElement) {
    top += element.offsetTop;
  }
  return top;
}

/*! return the left position of an element against another owner element.
 * @param element the starting element,
 * @param parent the optional parent element
 * @return int: the left position.
 */
/** @export */
function CS_get_left(element, parent) {
  let left;
  for (left = 0;
    element && (!parent || CS_is_descendant(parent, element));
    element = element.offsetParent || element.parentElement) {
    left += element.offsetLeft;
  }
  return left;
}

/*! return the top position of an element against the windows.
 * @param element the starting element,
 * @param parent the optional parent element
 * @return int: the top position.
 */
/** @export */
function CS_get_y(element, parent) {
  let rect = element.getBoundingClientRect();
  return rect.top;
}

/*! return the left position of an element against the window.
 * @param element the starting element,
 * @param parent the optional parent element
 * @return int: the left position.
 */
/** @export */
function CS_get_x(element, parent) {
  let rect = element.getBoundingClientRect();
  return rect.left;
}

/*! ensure an element is visible.
 * @param element the element,
 * @param container the container,
 * @return void.
 */
/** @export */
function CS_ensure_visible(element, container = window) {
  function get_relative(element) {
    if (CS_get_style(element, "position") == "relative") {
      return element;
    }
    else if (element.parentElement) {
      return get_relative(element.parentElement);
    }
    else {
      return false;
    }
  }

  let rel;
  let pos = CS_get_style(element, "position");

  if (pos == 'absolute') {
    rel = get_relative(element.parentElement);
  }
  else {
    rel = false;
  }

  let x = CS_get_x(element);
  let y = CS_get_y(element);
  let w = CS_get_external_width(element);
  let h = CS_get_external_height(element);

  let rx = rel ? CS_get_x(rel) : 0;
  let ry = rel ? CS_get_y(rel) : 0;

  let W = window.innerWidth;
  let H = window.innerHeight;

  let nx = x, ny = y;

  let offset = 20;

  if (w < W) {
    if (x < 0) {
      nx = -rx + offset;
    }
    else if (x > 0 && x + w > W) {
      //   |-----------------------|W
      //                       x|------|w
      nx = W - w - offset - rx;
    }
  }
  else {
    element.style.width = W + 'px';
    nx = -rx;
  }

  if (h < H) {
    if (y < 0) {
      ny = -ry + offset;
    }
    else if (y > 0 && y + h > H) {
      ny = H - h - offset - ry;
    }
  }
  else {
    element.style.height = H + 'px';
    ny = -ry;
  }

  if (nx != x) {
    element.style.left = nx + 'px';
    element.style.right = "auto";
  }

  if (ny != y) {
    element.style.top = ny + 'px';
    element.style.bottom = "auto";
  }
}


/* get the scroll position.
 * @param what the scroll value to get,
 * return void
 */
/** @export */
function CS_get_document_scroll(what) {
  let elem = null;
  if (typeof document.scrollingElement != "undefined") {
    elem = document.scrollingElement;
  }
  if (elem == null) {
    elem = document.documentElement;
  }

  switch (what) {
    case 'top': return elem.scrollTop;
    case 'bottom': return elem.scrollBottom;
    case 'right': return elem.scrollRight;
    case 'left': return elem.scrollLeft;
    default: return 0;
  }
}

/* set the scroll position.
 * @param what the scroll value to set,
 * @param value the value,
 * return void
 */
/** @export */
function CS_set_document_scroll(what, value) {
  let elem = null;
  if (typeof document.scrollingElement != "undefined") {
    elem = document.scrollingElement;
  }
  if (elem == null) {
    elem = document.documentElement;
  }

  switch (what) {
    case 'top': elem.scrollTop = value; break;
    case 'bottom': elem.scrollBottom = value; break;
    case 'right': elem.scrollRight = value; break;
    case 'left': elem.scrollLeft = value; break;
    default: break;
  }
}

/* add or remove the blur class to all the body element but
 * the dialog
 * dialog: the dialog
 * set: add or remove the CS_blur class; can be a boolean of an integer value,
 * return void
 */
/** @export */
function CS_blur_all(dialog, set) {
  // if the dialog is still attached
  if (dialog.parentNode) {
    // for all the children of the dialog's parent
    for (let i = 0, m = dialog.parentNode.children.length; i < m; i++) {
      // get the child
      let child = dialog.parentNode.children[i];

      // if the child is not the dialog
      if (child != dialog) {
        // set the bluring
        if (set === true) {
          CS_add_class(child, "CS_blur");
        }
        else if (set === false) {
          CS_del_class(child, "CS_blur");
        }
        else if (set === 0) {
          child.style.filter = "";
        }
        else {
          child.style.filter = "blur(" + set + "px)";
        }
      }
    }
  }
}

/**
 * Converts a named color to RGB.
 * returns r, g, and b in the set [0, 255].
 *
 * @param name the web color name as "aliceblue"
 * @return  {r: r, g: g, b: b}
 */
/** @export */
function CS_color_to_rgb(name) {
  // Create fake div
  let div = document.createElement("div");
  div.style.display = 'none';
  div.style.color = name;
  document.body.appendChild(div);

  // Get color of div
  let cs = window.getComputedStyle(div);
  let pv = cs.getPropertyValue("color"); // as rgb(r, g, b)

  let vs = /rgb\s*\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(pv);

  // Remove div after obtaining desired color value
  document.body.removeChild(div);

  return {
    r: parseInt(vs[1]),
    g: parseInt(vs[2]),
    b: parseInt(vs[3])
  };
}

/*! Add a stylesheet from a string.
 * @param styles the styles as a string,
 * @return void.
 */
/** @export */
function CS_add_styles(styles) {
  const style = document.createElement('style');
  style.textContent = styles;
  document.head.append(style);
}

/*! Add a stylesheet to set the gui color settings to the inputs.
 * @param color the web color to use for gui,
 * @param rounded use rounded inputs,
 * @return void.
 */
/** @export */
function CS_set_input_color(color, rounded = true) {
  // get the checkbox check mark constrasted color
  let rgb = CS_color_to_rgb(color);
  let gray = (rgb.r + rgb.g + rgb.b) / 3;
  let check = gray > 128 ? '#000' : '#fff';

  // create the stylesheet
  const styles = `
  input[type="range"],
  input[type="radio"],
  input[type="checkbox"] {
    /* remove standard background appearance */
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    outline: none;
    display: inline-block;
    padding: 0.05em;
    border: 2px solid ${color};
    background-clip: content-box;
    position: relative;
    height: 1.2em;
  }

  input[type="radio"],
  input[type="checkbox"] {
    width: 1.2em;
    cursor: hand;
  }

  .rounded input[type="range"] {
    background: none !important;
  }

  .rounded input[type="radio"] {
    border-radius: 50%;
  }

  .rounded input[type="checkbox"] {
    border-radius: 25%;
  }

  .rounded input[type="range"] {
    border-radius: 1em;
  }

  /* appearance for checked radiobutton */
  input[type="radio"]:checked,
  input[type="checkbox"]:checked {
    background-color: ${color};
  }

  input[type="checkbox"]:checked:after {
    content: '✓';
    position: absolute;
    top: 0.5em;
    left: 0.1em;
    font-size: 1em;
    color: ${check};
    line-height: 0;
    -webkit-transition: all .2s;
    transition: all .2s;
  }

  input[type='range']::-webkit-slider-runnable-track {
    height: 10px;
    -webkit-appearance: none;
    color: red;
    margin-top: -1px;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 0.85em;
    height: 0.85em;
    cursor: ew-resize;
    background: ${color};
    border-radius: 1em;
    border: 0;
  }
  `.trim();

  // append the stylesheet to the document
  CS_add_styles(styles);
}
