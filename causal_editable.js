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

/*! Return true if the given element is a CS_editable input.
 * @param elem the node,
 * @return bool: the status.
 */
/** @export */
function CS_editable_is_input (elem) {
  switch (elem.nodeName) {
    case 'INPUT': case 'SELECT': return true;
    default:                     return false;
  }
}

/*! CS_editable widget submission callback - the goal of the function is
 * to remove all the otehr CS_editable inputs in order to simplify the
 * form query and to submit the form.
 * @param event the calling event,
 * @return void.
 */
/** @export */
function CS_editable_submit (event) {
  // get the target
  let input = event.target;

  // remove all the other inputs
  let items = document.getElementsByClassName ("CS_editable");
  for (let i = 0; i < items.length; i++) {
    let test = CS_editable_is_input (items[i]) ? items[i] : items[i].input
    if (typeof test != 'undefined' && test != input) {
      test.remove();
      if (test == items[i]) {
        i--;
      }
    }
  }

  // force the value to off for checkboxes and radios - by default, off value
  // are just not sent
  if (input.tagName == "INPUT" && (input.type == "checkbox"  ||
                                   input.type == "radio"   )   ) {
    input.type = 'text';
    input.value = input.checked ? 'yes' : 'no';
  }

  // submit the form
  input.form.submit();
}

/*! Bind the editable wigets in the document.
 * 1°) Form embeded element
 *     Form embedded element are put inside a form. When edited, the generated
 *     input remains in the document with the display none style.
 *     Its value is sents to the form on submit event, generally with the
 *     button.
 *     An editable element is embedded if it does not have the ajax attribute
 *     with the ajax url to send the new value...
 *     A a standard form element, it must have a name that is taken from the
 *     attributes.
 * 2°) Ajaxed element
 * @param elem the editable element,
 * @return void.
 */
/** @export */
function CS_bind_editable (elem) {
  // bypass if already binded
  if (elem.input || elem.onchange == CS_editable_submit) {
    return;
  }

  // do not handle the inputs
  if (CS_editable_is_input (elem)) {
    elem.onchange = CS_editable_submit;
    return;
  }

  // input getter set in the attribute as get_input="code"
  let get_input = (typeof elem.attributes['get_input'] != 'undefined'
                   ? elem.attributes['get_input'].value
                   : false);

  // search for the associated input
  if (! get_input) {
    for (let i = 0, n = elem.childNodes.length; ! elem.input && i < n; i++) {
      // if found, store it
       if (CS_editable_is_input (elem.childNodes[i])) {
          // store the input
          elem.input = elem.childNodes[i];

          // remove the input, it will be re-added on click
          elem.input.remove();
      }
    }

    // if the input still unfound
    if (! elem.input) {
      // create the input
      elem.input = document.createElement ('INPUT');

      // get the name attribute if defined and name the input accordingly
      if (typeof elem.attributes['name'] != 'undefined') {
        elem.input.name = elem.attributes['name'].value;
      }

      // set the input value as the element html content
      elem.input.value = elem.innerHTML;
    }
  }

  // keep the original on click
  elem.org_onclick = elem.onclick;

  // set the new onclick
  elem.onclick = function (event) {
    // get the now time
    let now = CS_now();

    // log
    console.log ('editable clicked');

    // on first click, or too long double click
    if (typeof elem.last_click == "undefined" ||
        elem.last_click == 0                  ||
        now - elem.last_click > 800             ) {
      // store the now time
      elem.last_click = now;

      // call the original click
      if (elem.org_onclick) {
        elem.org_onclick (event);
      }
    }

    // otherwise, the input must be displayed
    else {
      // log
      console.log ('do the editable job');

      // reset the last time
      elem.last_click = 0;

      // get the input
      let input = get_input ? eval (get_input) : elem.input;

      // on change callback
      input.onchange = function (event) {
        // on ajax submission
        if (typeof elem.attributes['ajax'] != 'undefined') {
          // get the value of the name
          let name = 'value';
          if (typeof elem.attributes['name'] != 'undefined') {
            name = elem.attributes['name'].value;
          }

          // prepare the args argument
          let args = {};
          Object.defineProperty (args, name, elem.input.value);

          // ajax load the url
          CS_ajax_load ({
            url:       elem.attributes['ajax'].value,
            args:      args,
            onsuccess: function() {
              elem.innerHTML = elem.input.value;
            },
            onerror:   function() {
              CS_notify ('unable to rename the database',
                         'error');
            },
            synchronous: false,
            binary:      false,
            force:       false});
        }
        else if (typeof this.form != 'undefined') {
          CS_editable_submit (event);
        }
        else {
          alert ('error: cannot submit the change, ' +
                 'no form and no ajax specified');
        }
      }

      // append the input to the element
      elem.appendChild (input);

      // give the focus
      input.focus();

      // capture
      CS_modal_capture (input,
                        function () {
                          console.log ('remove editable input');
                          input.remove();
                        }, false);
    }
  }
}

/*! Bind the editable wigets in the document.
 * @return void.
 */
/** @export */
function CS_bind_editables() {
  let items = document.getElementsByClassName ("CS_editable");
  for (let i = 0; i < items.length; i++) {
    CS_bind_editable (items[i]);
  }
}
