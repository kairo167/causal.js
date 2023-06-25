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

/*! bind the upload elements
 * inspired from: http://html5demos.com/dnd-upload
 * @param check function that checks the uploaded file names or
 * false,
 * @param onclose on close callback or false,
 * @return void.
 */
/** @export */
function CS_bind_upload(form, check, onclose) {
  // the item must be a form
  if (form.tagName != 'FORM') {
    alert('Error: form expected');
    return;
  }

  // search for the progress indicator
  var progress = false;
  if (!form.attributes['onprogress']) {
    for (var i = 0; i < form.children.length; i++) {
      if (form.children[i].tagName == 'PROGRESS') {
        progress = form.children[i];
        break;
      }
    }

    // if progress is not supported, hide it
    if (progress && !("upload" in new XMLHttpRequest)) {
      CS_add_class(progress, 'CS_hidden');
      progress = false;
    }
    else if (!progress) {
      progress = document.createElement('progress');
      form.appendChild(progress);
    }
  }

  // initialize the progress indicator
  if (progress) {
    CS_add_class(progress, 'CS_hidden');
    progress.min = 0;
    progress.max = 100;
    progress.value = 0;
    progress.innerHTML = "0";
  }

  // upload the given files array; take the upload url from the form
  // action
  // files: the files array
  // return void
  function upload_files(files) {
    // file to upload
    let args = [];
    let n = 0;

    // check the file to upload if the checker function is provided
    for (var i = 0; i < files.length; i++) {
      if (!check || check(files[i].name)) {
        args['file' + i] = files[i];
        n++;
      }
    }

    // if there is no file to upload, return
    if (n == 0) {
      return;
    }

    // fill the array with the file
    for (var i = 0; i < form.elements.length; i++) {
      switch (form.elements[i].type) {
        case 'checkbox':
        case 'radio':
          if (form.elements[i].checked) {
            args[form.elements[i].name] = form.elements[i].value;
          }
          break;

        default:
          args[form.elements[i].name] = form.elements[i].value;
          break;
      }
    }

    // initially, hide the progress par
    if (progress) {
      CS_del_class(progress, 'CS_hidden');
    }

    // function that updates the progress indicator
    function set_progress(percent) {
      if (form.attributes['onprogress']) {
        form.progress = percent;
        eval(!form.attributes['onprogress'].value);
      }
      else if (progress) {
        progress.value = percent;
      }
    }

    // load the files
    CS_ajax_load_promise({
      url: form.action,
      args: args,
      onsuccess: function (result) {
        set_progress(100);
        if (form.attributes['onsuccess']) {
          eval(form.attributes['onsuccess'].value);
        }
        else {
          CS_notify('Files uploaded', 'success');
        }
        CS_add_class(progress, 'CS_hidden');

        // call the onclose callbak on need
        if (onclose) {
          onclose(result);
        }
      },
      onerror: function (result) {
        if (form.attributes['onerror']) {
          eval(form.attributes['onerror'].value);
        }
        else {
          CS_notify('Files not uploaded: ' + result, 'error');
        }
        if (onclose) {
          onclose(false);
        }
      },

      onprogress: !progress && !form.attributes['onprogress']
        ? false : set_progress
    });
  }

  // if dragging is supported
  if ('draggable' in form) {
    // hide the <input type="file"> if any
    for (var i = 0; i < form.elements.length; i++) {
      let input = form.elements[i];
      if (input.tagName == 'INPUT' && input.type == 'file') {
        // hide the input
        CS_add_class(input, 'CS_hidden');

        // on file change, upload
        input.onchange = function () {
          upload_files(input.files);
        };
      }
    }

    if (false == ("upload" in new XMLHttpRequest)) {
      CS_add_class(progress, 'CS_hidden');
    }

    // prepare dragging
    form.ondragover = function (event) {
      CS_stop_propagation(event);
      CS_add_class(this, 'CS_hover');
      return false;
    };
    form.ondragend = function (event) {
      CS_stop_propagation(event);
      CS_del_class(this, 'CS_hover');
      return false;
    };
    form.ondrop = function (event) {
      CS_stop_propagation(event);
      CS_del_class(this, 'CS_hover');
      upload_files(event.dataTransfer.files);
      return false;
    }
  }
  else {
    // get the <input type="file"> if any
    var input = false;
    for (var i = 0; i < form.elements.length; i++) {
      if (form.elements[i].tagName == 'INPUT' &&
        form.elements[i].type == 'file') {
        input = form.elements[i];
        break;
      }
    }

    // if there is no such an input
    if (!input) {
      // create one
      input = document.createElement('input');
      input.type = 'file';
      form.appendChild(input);
    }

    // allow multiple files
    input.multiple = "multiple";

    // show it
    CS_del_class(form.elements[i], 'CS_hidden');

    // on file change, upload
    input.onchange = function () {
      upload_files(input.files);
    };
  }
}
