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

/*! Return an array ["name" => "value"] from the form elements.
 * @param form the form,
 * @param init the initial array,
 * @return array: the array.
 */
/** @export */
function CS_get_form_elements(form, init) {
  // create the object
  var object = Object.assign({}, init);

  // add the tuple name: value of all the elements
  for (var i = 0; i < form.elements.length; i++) {
    var e = form.elements[i];
    if (e.name) {
      if (e.type == "checkbox" || e.type == "radio") {
        object[e.name] = e.checked ? e.value : false;
      }
      else {
        object[e.name] = e.value;
      }
    }
  }

  return object;
}

/* Load and manage a form from Ajax. The form send its result in a div with
 * the class CS_success or CS_error; a notification is displayed
 * according the type of result. On success, the form is closed. In addition
 * to the error or success status, a cookie can be set or reseted in a div as
 * <div class="CS_cookie">
 *  <span class="name">name</span>
 *  [<span class="value">value</span>
 *   [<span class="days">days</span>]]
 * </div>
 * @parent: the parent element or false,
 * @param url the url to call,
 * @param args the arguments,
 * @param onstyle called when the form is going to be displayed,
 * @param onsuccess the onsuccess callback,
 * @param onerror the on error callback,
 * @param synchronous synchronous call,
 * @return boolean: return false.
 */
/** @export */
function CS_ajax_form(parent,
  url,
  args,
  onstyle,
  onsuccess,
  onerror,
  synchronous) {
  var do_log = true;

  /*! Called on the result of the connection validation.
   * The status can be an error or the success...
   * @param form the form,
   * @param result the validation result, that is HTML,
   * @return void.
   */
  function test_form_result(form, result) {
    // log
    if (do_log) {
      console.log("test_form_result: ");
      console.log(result);
    }

    // create a div in order to attach the html
    var div = document.createElement("div");
    div.innerHTML = result;

    // initialize the error flag
    var error = false;

    // if there is no form, create a dummy one
    if (!form) {
      form = document.createElement("form");
      form.closeit = function () { };
    }

    // remove all the p object from the form (they are debug messages)
    for (var i = 0; i < form.children.length; i++) {
      var child = form.children[i];
      if (child.tagName.toLowerCase() == "p" &&
        (CS_has_class(child, "debug") || CS_has_class(child, "info"))) {
        form.removeChild(child);
        i--;
      }
    }

    // place to put the new messages
    var first = form.firstChild;

    // check for the cookie
    for (var i = 0; i < div.children.length; i++) {
      var child = div.children[i];

      // on cookie
      if (CS_has_class(child, "CS_cookie")) {
        var name = false, value = false, days = false;
        for (var j = 0; j < child.children.length; j++) {
          if (CS_has_class(child.children[j], "name")) {
            name = child.children[j].innerHTML;
          }
          else if (CS_has_class(child.children[j], "value")) {
            value = child.children[j].innerHTML;
          }
          else if (CS_has_class(child.children[j], "days")) {
            days = parseInt(child.children[j].innerHTML);
          }
        }
        if (name) {
          if (value) {
            CS_set_cookie(name, value, days);
          }
          else {
            CS_reset_cookie(name);
          }
        }
        break;
      }
    }

    // move all the message from the result to the form and check
    // for success of error
    for (var i = 0; i < div.children.length; i++) {
      var child = div.children[i];

      // on success
      if (CS_has_class(child, "CS_success")) {
        // close this form
        form.closeit();

        // remove all the capture
        CS_modal_pop(true);

        // call success
        if (onsuccess) {
          onsuccess(child.innerHTML);
        }

        // notify the user
        if (child.innerHTML) {
          CS_notify(child.innerHTML, "success");
        }

        return;
      }

      // on error
      else if (CS_has_class(child, "CS_error")) {
        // call success
        if (onerror) {
          onerror(child.innerHTML);
        }

        // notify the user
        if (child.innerHTML) {
          CS_notify(child.innerHTML, "error");
        }

        break;
      }

      // on message, move it in the form
      else {
        form.insertBefore(child, first);
        i--;
      }
    }
  }

  /*! Display a form.
   * @param result the form html,
   * @param submit submit callback,
   * @return void.
   */
  function display_form(result, submit) {
    // log
    if (do_log) {
      const regex_nl = /<!--.*-->\n/gi;
      const regex = /<!--.*-->/gi;
      console.log("display_form: ");
      console.log(result.replace(regex_nl, '').replace(regex, ''));
    }

    // create the div of the dialog box
    var div = document.createElement("div");
    div.innerHTML = result;

    // search for the form
    var form = false;
    var form_pos = 0;
    var org_visibility = 0;
    for (var i = 0; i < div.children.length; i++) {
      var child = div.children[i];

      if (child.tagName.toLowerCase() == "form") {
        // if the form is found
        form_pos = i;
        form = child;

        // force the opacity
        org_visibility = form.style.visibility;
        form.style.visibility = "hidden";

        // set its onsubmit callback
        form.onsubmit = function (event) {
          CS_stop_propagation(event);
          submit(form);
          return false;
        };

        // add the form to the parent or the body
        (parent ? parent : document.body).appendChild(form);

        break;
      }
    }

    // if there is no form, test the result directely
    if (!form) {
      test_form_result(false, result);
      return;
    }

    // move all the paragraph at the same level of the form (generally
    // they are debug message) inside the form
    // <div>          <div>
    //  <p>1</p>       <form>
    //  <p>2</p>        <p>1</p>
    //  <form>          <p>2</p>
    //    <p>3</p>      <p>3</p>
    //    <p>4</p>      <p>4</p>
    //  </form>         <p>5</p>
    //  <p>5</p>       </form>
    // </div>         </div>
    for (var i = 0; i < div.children.length; i++) {
      var child = div.children[i];

      if (child.tagName.toLowerCase() == "p" &&
        (CS_has_class(child, "debug") || CS_has_class(child, "info"))) {
        if (i < form_pos) {
          form.insertBefore(child, form.firstChild);
        }
        else {
          form.appendChild(child);
        }
      }
    }

    // apply the styles
    if (onstyle) {
      onstyle(form);
    }

    // ensure the form is visible
    CS_ensure_visible(form);

    // display the dialog
    //CS_blur_all (form, true);
    form.style.visibility = org_visibility;

    // add the TAB key handler to switch to the next input
    /* This does not work:
     * - switch the input two by two
     * - handle the input of the whole document too instead of stay limited to
     *   the form's inputs
     *
    CS_add_event (form, "keydown",
                  function (event) {
                    if (event.key == "Tab") {
                      console.log ("TAB key down");

                      // search for the current focussed input
                      for (var i = 0; i < form.elements.length; i++) {
                        // get the input
                        var input = form.elements[i];

                        // if there is no focussed input of if the input
                        // is focussed
                        if (! document.activeElement || 
                              input == document.activeElement) {
                          // search for the next input to focus
                          for (i = i + 1; form.elements[i] != input; i++) {
                            // rewind at the end of the list
                            if (i == form.elements.length) {
                              i = 0;
                            }

                            // if the next element is an input, break
                            if (form.elements[i].nodeName == 'INPUT') {
                              break;
                            }
                          }

                          // if the element to focus is not the currently focussed input
                          if (form.elements[i] != document.activeElement) {
                            // log
                            console.log ("focus from '" + document.activeElement.name + "' " +
                                         "to '" + form.elements[i].name + "'");

                            // give it the focus
                            form.elements[i].focus();

                            // log
                            console.log ("input '" + document.activeElement.name + "' " +
                                         "has actually the focus");
                          }
                          return false;
                        }
                      }
                    }
                  }, false, false);
     */

    // this is the function that is able to close the dialog box
    function closeit() {
      // avoid capture
      CS_modal_capture(false);

      // remove the form from its parent's children
      if (form.parentElement) {
        (parent ? parent : document.body).removeChild(form);
      }
    }

    // store the closeit function in the form
    form.closeit = closeit;

    // search for a autofocus input
    for (var i = 0; i < form.elements.length; i++) {
      var input = form.elements[i];

      if (input.autofocus) {
        input.focus();
        break;
      }
    }

    // capture
    CS_modal_capture(form, closeit);
  }

  // request the form content
  CS_ajax_load_promise({
    url: url,
    args: args,

    // onsuccess: called when the from is retrieved from ajax
    onsuccess:
      function (result) {
        display_form(
          result,

          // called when the form is submitted
          function (form) {
            // get the form arguments
            args = CS_get_form_elements(form, args);

            // log
            console.log('call form on success with args = ', args);

            // validate with ajax
            CS_ajax_load_promise({
              url: url,
              args: args,
              onsuccess:
                function (result) {
                  test_form_result(form, result);
                },
              synchronous: synchronous
            });
          });
      },

    // onerror
    onerror: onerror
  });

  return false;
}
