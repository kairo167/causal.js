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

/*! Returns the extension of a filename.
 * @param filename the file name,
 * @return string the extension.
 */
/** @export */
function CS_extension(filename) {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

/*! Parses and evaluate the javascript scripts that are embedded
 * in the given html source text.
 * @param source the html source text,
 * @param callback the callback function to call when the script is loaded,
 * notice that the script is also called if the file is already loaded,
 * @return void.
 */
/** @export */
function CS_parse_scripts(source, callback) {
  // load the javascripts
  let rx = /<script[^]*?(src="([\s\S]*?)")*>([\s\S]*?)<\/script>/gmi;
  let match;

  /* 0: <script type="text/javascript"
   * src="/htgen/php/login/script.js"></script>
   *
   * 1: src="/htgen/php/login/script.js"
   *
   * 2: /htgen/php/login/script.js
   *
   * 3:
   *
   * 0: <script>alert ("123")</script>
   * 1:
   * 2:
   * 3: alert ("123")
   */

  let has_eval = false;
  while (match = rx.exec(source)) {
    if (typeof match[1] == "string" && match[1].trim() != ""
      && typeof match[2] == "string" && match[2].trim() != "") {
      CS_load_file_dynamically(match[2], callback);
    }
    else if (typeof match[3] == "string" && match[3].trim() != "") {
      try {
        eval(match[3]);
        has_eval = true;
      }
      catch (exception) {
        // do what you want here when a script fails
        console.log("The evaluation of:", match[3]);
        console.log("causes an error:", exception.message);
      }
    }
  }

  // if there is some evals, call the ready functions
  if (has_eval) {
    CS_call_ready();
  }

  // load the css
  // <link rel="stylesheet" type="text/css" href="url"/>
  rx = /<link[\s\S]*?text\/css[\s\S]*?href="([\s\S]*?)"[\s\S]*?\/>/gmi;
  while (match = rx.exec(source)) {
    if (typeof match[1] == "string" && match[1].trim() != "") {
      CS_load_file_dynamically(match[1], callback);
    }
  }
}

/* Downloads the file at the given url.
 * @param url the url to download.
 */
/** @export */
function CS_download(url) {
  // Create iFrame
  let iframe = document.createElement('iframe');
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  // Get the iframe's document
  let iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  iframeDoc.location = url;
}

/* Downloads any kind of data.
 * @param data the data,
 * @param name the filename.
 */
/** @export */
function CS_download_data(data, name) {
  // open the data in a new window and let the user to save it
  // window.open (data, 'screenshot');
  // return;

  /*! Converts base64 data to a blob.
   * @param b64Data the base64 encoded data,
   * @param contentType the content type,
   * @param sliceSize the optional slice size,
   * @return blob.
   */
  function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    let byteCharacters = atob(b64Data.replace(/(\r\n|\n|\r|\s+)/gm, ""));
    let byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);

      let byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      let byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    let blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  let a = document.createElement("a");
  a.style.display = "none";
  document.body.appendChild(a);

  let tag = "base64,";
  let n = data.indexOf(tag);
  let blob;
  if (n >= 0) {
    blob = b64toBlob(data.substr(n + tag.length), data.substr(0, n - 1));
  }
  else {
    blob = new Blob([data], { type: 'text/plain; charset=x-user-defined' });
  }

  let url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  window.URL.revokeObjectURL(url);
}

/*! Copies data to the clipboard.
 * https://bl.ocks.org/dvreed77/c37759991b0723eebef3647015495253
 * @param type the type of the data as "text" or "image"
 * @param data the data
 * @return boolean: the status.
 */
/** @export */
function CS_copy_to_clipboard(type, data) {
  // clipboard API available?
  if (!document.body || !navigator.clipboard) {
    return false;
  }

  switch (type) {
    case 'text':
      return navigator.clipboard.writeText
        && navigator.clipboard.writeText(data);

    default:
    case 'image':
      let img = document.createElement('img');
      img.src = data;
      document.body.appendChild(img);
      let range = document.createRange();
      range.setStartBefore(img);
      range.setEndAfter(img);
      range.selectNode(img);
      let sel = window.getSelection();
      sel.addRange(range);
      document.execCommand('Copy');
      img.remove();
      return true;
  }
}

/*! Creates an Ajax request.
 * @return XHR: the ajax request.
 */
/** @export */
function CS_create_xhr() {
  if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  }
  if (window.ActiveXObject) {
    const names = [
      "Msxml2.XMLHTTP.6.0",
      "Msxml2.XMLHTTP.3.0",
      "Msxml2.XMLHTTP",
      "Microsoft.XMLHTTP"
    ];
    for (let i in names) {
      try {
        return new ActiveXObject(names[i]);
      }
      catch (e) {
      }
    }
  }
  window.alert("unable to load ajax");

  // not supported (good luck!)
  return null;
}

var CS_ajax_error_notified = false;

/* Uses ajax to load a URL and call a callback on load. Notice that if
 * options.onsuccess
 * @param options object as
 * {
 *   args:        the arguments { 'name': 'value, ...} or false,
 *   binary:      the data to retrieve are binary (false by default),
 *   data:        send the args as 'form', 'json' or 'url',
 *   debug:       the debug boolean,
 *   force:       force the download, bypassing the browser cache
 *                (false by default),
 *   headers:     additional headers as {"name": value, "name": "value", ...},
 *   method:      'get' or 'post' ('post' by default),
 *   onerror:     the error message if any,
 *   onprogress:  the progress function
 *   onsuccess:   the callback function called with the content of the file
 *   synchronous: if true, the call is synchronous (false by default),
 *   url:         the url of the file to load
 * }.
 */
/** @export */
function _CS_ajax_load(options) {
  // check the options
  Object.keys(options).forEach(option => {
    switch (option) {
      case 'args':
      case 'binary':
        break;

      case 'data':
        switch (options[option]) {
          case 'form':
          case 'json':
          case 'url':
            break;
          default:
            console.error('Error: unexpected data option "', option, '"');
            return false;
        }
      case 'debug':
      case 'force':
      case 'headers':
      case 'method':
      case 'onerror':
      case 'onprogress':
      case 'onsuccess':
      case 'synchronous':
      case 'url':
        break;

      default:
        console.error('Error: unexpected option name "', option, '"');
        return false;
    }
  });

  // get the url (that cound be change on options.data = 'url')
  let url = options.url;

  // on debug, log the url
  if (options.debug) {
    console.log(
      'ajax load',
      'url=', url,
      'headers=', options.headers,
      'args=', options.args);
  }

  // check the url
  if (!url) {
    return;
  }

  // check the method
  if (!options.method) {
    options.method = "POST";
  }

  switch (options.method) {
    case 'post':
    case 'POST':
    case 'get':
    case 'GET': break;

    default: return;
  }

  /* prepare the values from the form */
  let data = null;
  if (options.args) {
    switch (options.data) {
      case 'form': {
        data = ! !window.FormData ? new FormData() : false;
        if (data) {
          for (let index in options.args) {
            data.append(index, options.args[index]);
          }
        }
        break;
      }

      case 'json': {
        data = JSON.stringify(options.args);
        break;
      }

      case 'url': {
        first = true;
        for (let index in options.args) {
          if (first) {
            first = false;
            url += '?';
          }
          else {
            url += '&';
          }
          url += index + '=' + encodeURIComponent(options.args[index]);
        }
        break;
      }
    }
  }

  // create the ajax query
  let xhr = CS_create_xhr();

  // set the on progress callback
  if (options.onprogress && "upload" in xhr) {
    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable) {
        let complete = (event.loaded / event.total * 100 | 0);
        options.onprogress(complete);
      }
    }
  }

  // indicate start loading
  xhr.onloadstart = () => {
    // log
    if (options.debug) {
      console.log('start to load ', url);
    }

    // on synchronous load
    if (options.synchronous) {
      // on first loading
      if (!document.causal_wait_count) {
        // initialize the wait count
        document.causal_wait_count = 1;

        // create a timer
        document.causal_wait_timer = window.setTimeout(function () {
          // set the wait indicator
          // CS_blur_all (false, true);
          document.body.style.cursor = "wait";
        }, 1000);
      }

      // on further wait, increment the count
      else {
        document.causal_wait_count++;
      }
    }
  };

  // stop loading
  xhr.onloadend = () => {
    // log
    //console.log('end to load ', url, ' ', options.args);

    // on synchronous load
    if (options.synchronous) {
      // on last wait
      if (document.causal_wait_count == 1) {
        // delete the time
        window.clearTimeout(document.causal_wait_timer);

        // reset the wait indicator
        // CS_blur_all (false, false);
        document.body.style.cursor = null;
      }

      // on other wait end, decrement the count
      document.causal_wait_count--;
    }
  };

  // add the event listeners
  xhr.onload = () => {
    switch (xhr.status) {
      case 200:     // OK
        if (options.onsuccess) {
          // get the headers
          let headers_str = xhr.getAllResponseHeaders();
          let headers = {};
          if (headers_str) {
            headers_str.split("\n").forEach(line => {
              if (line.trim()) {
                let couple = line.split(':');
                headers[couple[0].trim()] = couple[1].trim();
              }
            });
          }

          // on success, call the onsuccess callback
          if (options.binary) {
            options.onsuccess(new Uint8Array(xhr.response), headers);
          }
          else {
            options.onsuccess(xhr.responseText, headers);
          }
        }
        break;

      case 404:     // not found
      default:
        console.log("Ajax error: " + xhr.statusText + ": " + url);
        if (options.onerror) {
          options.onerror(xhr.statusText);
        }
        break;
    }
  };

  // open the query
  xhr.open(
    options.method,
    url,
    options.synchronous == true ? false : true);

  // IE11 fix: the response type must be set after the open
  if (options.binary) {
    xhr.responseType = 'arraybuffer';
  }

  // add the additional headers
  if (options.headers) {
    Object.entries(options.headers).forEach(key_value => {
      xhr.setRequestHeader(key_value[0], key_value[1]);
    });
  }

  // set the request header if provided
  if (data && typeof data == 'string') {
    if (!options.headers || !options.headers.hasOwnProperty("Content-Type")) {
      xhr.setRequestHeader(
        "Content-Type",
        options.data == 'json' ? "application/json; charset=UTF-8"
          : "application/x-www-form-urlencoded; charset=UTF-8");
    }
  }

  // set the header in case of force
  if (options.force) {
    xhr.setRequestHeader("Cache-Control",
      "no-cache, no-store, must-revalidate");
  }

  // send the query
  xhr.send(data);
}

/* Uses ajax to load a file URL as a promise.
 * @param options object as
 * {
 *   args:        the arguments { 'name': 'value, ...} or false,
 *   binary:      the data to retrieve are binary (false by default),
 *   data:        send the args as 'form', 'json' or 'url',
 *   force:       force the download, bypassing the browser cache
 *                (false by default),
 *   headers:     additional headers as {"name": value, "name": "value", ...},
 *   method:      'get' or 'post' ('post' by default),
 *   onprogress:  the progress function
 *   url:         the url of the file to load
 * },
 * @return Promise.
 */
/** @export */
function CS_ajax_load_promise(options) {
  return new Promise((resolve, reject) => {
    options.onerror = options.onerror ? options.onerror : reject;
    options.onsuccess = options.onsuccess ? options.onsuccess : resolve;
    _CS_ajax_load(options);
  });
}

/*! Returns true if a file is already loaded.
 * @param file the file to load,
 * @return boolean: the loaded status.
 */
/** @export */
function CS_loaded(file) {
  // get the head
  let head
    = (document.getElementsByTagName('head')[0] || document.documentElement);

  for (let i = 0, n = head.children.length; i < n; i++) {
    let child = head.children[i];
    if (child.nodeName == "LINK" && child.href
      && child.href.search(file) != -1) {
      return true;
    }
    else if (child.nodeName == "SCRIPT" && child.src
      && child.src.search(file) != -1) {
      return true;
    }
  }
  return false;
}

/* Requires include a script once.
 * @param filename the file url to load, or an array of file urls,
 * @param callback the callback function to call once the file is
 * loaded, notive that the callback is also called if the file is already
 * loaded,
 * @param synchronous if true, the file is loaded synchronusly.
 */
/** @export */
function CS_load_file_dynamically(filename, callback, synchronous) {
  let target, fileref;
  let ext = CS_extension(filename);

  if (CS_loaded(filename)) {
    if (callback) {
      callback();
    }
    return;
  }
  else if (filename.indexOf("file://") == 0) {
    let reader = new FileReader();
    reader.onload = function (e) {
      let contents = e.target.result;
      let div = document.createElement('div');
      div.innerHTML = contents;
      document.body.appendChild(div);
    };
    reader.readAsText(filename);
    return;

    /*
    let fileref = document.createElement ('object');
    fileref.setAttribute ("type", "binary/binary");
    fileref.setAttribute ("data", filename);
    target = document.body;
    */
  }
  else if (ext == "js") {
    fileref = document.createElement('script');
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("src", filename);
    if (synchronous) {
      fileref.setAttribute("async", false);
      fileref.async = false;
    }
    fileref.onload = (function (callback) {
      return function () {
        CS_call_ready();
        if (callback) {
          callback();
        }
      }
    })(callback);

    target = document.getElementsByTagName("head")[0];
  }
  else if (ext == "css") {
    fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", filename);
    if (synchronous) {
      fileref.setAttribute("async", false);
    }
    if (callback) {
      fileref.onload = callback;
    }

    target = document.getElementsByTagName("head")[0];
  }
  else {
    return;
  }

  if (typeof fileref != "undefined") {
    target.appendChild(fileref);
  }
  return true;
}

/*! Logs an array of bytes.
 * @param array the array,
 * @param start the start index,
 * @param size the number of bytes to dump.
 */
/** @export */
function CS_dump_log(data, start, size) {
  if (start == undefined) {
    start = 0;
  }
  if (size == undefined) {
    size = data.length;
  }
  if (start > data.length) {
    return;
  }
  if (start + size > data.length) {
    size = data.length - start;
  }

  let hexa = "";
  let str = "";
  let n = 20;
  for (let i = 1; start < size; start++, i++) {
    if (i > n) {
      console.log(hexa + "   " + str);
      i = 1;
      hexa = "";
      str = "";
    }
    let v = data[start].toString(16);
    if (v.length < 2) {
      v = "0" + v;
    }
    hexa += v + (i % 4 == 0 && i && i != n ? " | " : " ");
    let c = String.fromCharCode(data[start]);
    c = CS_is_print(c) ? c : '.';
    str += c + (i % 4 == 0 && i ? " " : "");
  }
  if (hexa) {
    console.log(hexa + "   " + str);
  }
}

/*! Watches a change to a property of an object.
 * @param object the object to watch
 * @param property the property to scan.
 */
/** @export */
function CS_watch(object, property) {
  let private_property = "$_" + property + "_$";
  object[private_property] = object[property];

  // overwrite with accessor
  Object.defineProperty(object, property, {
    get: function () {
      return object[private_property];
    },

    set: function (value) {
      console.log("watch change: setting " + property + " to " + value);
      object[private_property] = value;
    }
  });
}

/*! Manage the cookie GDPR authorization. */
/** @export */
var CS_cookie_allowed = false;

/*! Manage the cookie GDPR authorization. */
/** @export */
var CS_cookie_allowed_checked = false;

/*! Return the GDPR cookie authorization.
 * @return boolean: the authorizaton status.
 */
/** @export */
function CS_is_cookie_allowed() {
  if (!CS_cookie_allowed_checked) {
    CS_cookie_allowed = CS_get_cookie("gdpr") == "true";
    CS_cookie_allowed_checked = true;
  }
  return CS_cookie_allowed;
}

/*! Returns the GDPR cookie authorization.
 * @return boolean: the authorizaton status.
 */
/** @export */
function CS_set_cookie_allowed() {
  CS_cookie_allowed = true;
  CS_cookie_allowed_checked = true;
  CS_set_cookie("gdpr", "true", 400);
}

/*! Set a cookie.
 * @param name the cookie name,
 * @param value the cookie value,
 * @param days the number of validity days, or 0.
 */
/** @export */
function CS_set_cookie(name, value, days) {
  if (CS_is_cookie_allowed()) {
    let expires = "";
    if (days) {
      let date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toGMTString();
    }
    document.cookie = name + "=" + value + expires + "; path=/;SameSite=Strict";
  }
}

/*! Gets a cookie.
 * @param name the cookie name,
 * @return string: the cookie value or false.
 */
/** @export */
function CS_get_cookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) == 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return name.undefined;
}

/*! Deletes a cookie if the name is provided, or all the cookies otherwise.
 * @param name the cookie name or false.
 */
/** @export */
function CS_reset_cookie(name) {
  if (name) {
    if (CS_is_cookie_allowed()) {
      CS_set_cookie(name, "", -1);
    }
  }
  else {
    // keep the current state
    let cookie_allowed = CS_cookie_allowed;
    let cookie_allowed_checked = CS_cookie_allowed_checked;

    // set cookies allowed
    CS_cookie_allowed = true;
    CS_cookie_allowed_checked = true;

    // get the cookies
    let cookies = document.cookie.split("; ");

    // for all the cookies
    for (let c = 0; c < cookies.length; c++) {
      // get the name and reset it
      let name = cookies[c];
      CS_set_cookie(name, "", -1);
    }

    // restore the state
    CS_cookie_allowed = cookie_allowed;
    CS_cookie_allowed_checked = cookie_allowed_checked;
  }
}

/*! Returns an object that gathers all the local cookie.
 * @return object: an association object.
 */
/** @export */
function CS_get_cookies() {
  let cookies = {};

  // if some cookie are defined
  if (document.cookie && document.cookie != '') {
    // split them
    let split = document.cookie.split(';');

    // for all of them
    for (let i = 0; i < split.length; i++) {
      // get the name/value
      let name_value = split[i].split("=");
      name_value[0] = name_value[0].replace(/^ /, '');
      cookies[decodeURIComponent(name_value[0])]
        = decodeURIComponent(name_value[1]);
    }
  }

  return cookies;
}
