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

/*! Returns the operating system.
 * @return string: the os name.
 */
/** @export */
let CS_get_os = (
    function() {
      let os = "other";
      let computed = false;
      return function () {
        if (computed) {
          return os;
        }
        else {
          let agents = [
            ["windows", "msie"],
            ["linux",   "ubuntu"],
            ["osx",     "macos", "macintosh"],
            ["ios",     "iphone", "ipod"]
            ["ipados",  "ipad"]
          ];
  
          let ua = window.navigator.userAgent.toLowerCase();
  
          os = false;
          for (let a = 0; ! os && a < agents.length; a++) {
            for (let i = 0; ! os && i < agents[a].length; i++) {
              if (ua.indexOf (agents[a][i]) > 0) {
                os = agents[a][0];
              }
            }
          }
          if (! os) {
            os = "other";
          }
  
          computed = true;
          return os;
        }
      }
    })();
  
  /*! Returns the operating system architecture.
   * @return string: the architecture name.
   */
  /** @export */
  let CS_get_arch = (
    function() {
      let arch = 64;
      let computed = false;
      return function () {
        if (computed) {
          return arch;
        }
        else {
          let os = CS_get_os();
  
          // linux:
          // mozilla/5.0 (x11; ubuntu; linux x86_64; rv:53.0) gecko/20100101 firefox/53.0
          // mozilla/5.0 (x11; ubuntu; linux i686; rv:53.0) gecko/20100101 firefox/53.0
          // osx
          // mozilla/5.0 (macintosh; intel mac os x 10_12_5) applewebkit/537.36 (khtml, like gecko) chrome/58.0.3029.110 safari/537.36
          // mozilla/5.0 (macintosh; intel mac os x 10_12_5) applewebkit/603.2.4 (khtml, like gecko) version/10.1.1 safari/603.2.4
          //
          // windows
          // mozilla/5.0 (windows nt 6.3; win64, x64; trident/7.0; rv:11.0) like gecko
          // mozilla/5.0 (windows nt 10.0; win64; x64) applewebkit/537.36 (khtml, like gecko) chrome/51.0.2704.103 safari/537.36
          // mozilla/5.0 (windows nt 10.0; wow64; rv:49.0) gecko/20100101 firefox/49.
          let ua = window.navigator.userAgent.toLowerCase();
  
          switch (os) {
          case "windows": case "linux":
            arch = (ua.indexOf ("win64" ) || ua.indexOf ("wow64") ||
                    ua.indexOf ("x86_64") ? "x86_64" : "x86");
            break;
  
          case "osx": case "ios": default:
            arch = "x86_64";
            break;
          }
  
          computed = true;
          return arch;
        }
      }
    })();
  
  //! Return the browser.
  // @return string: the browser name
  /** @export */
  let CS_get_browser = (
    function() {
      let browser = "other";
      let computed = false;
      return function () {
        if (computed) {
          return browser;
        }
        else {
          // mac
          // - chrome:
          //   "mozilla/5.0 (macintosh; intel mac os x 10_13_2) applewebkit/537.36 (khtml, like gecko) chrome/62.0.3202.94 safari/537.36"
          // - safari:
          //  "mozilla/5.0 (macintosh; intel mac os x 10_13_2) applewebkit/605.1.15 (khtml, like gecko) version/11.1 safari/605.1.15"
          let agents = [
            ["chrome",  "chrome" ],
            ["firefox", "firefox"],
            ["opera",   "opera"  ],
            ["safari",  "safari" ],
          ];
  
          let ua  = window.navigator.userAgent.toLowerCase();
          let lua = ua.toLowerCase();
  
          browser = false;
          for (let a = 0; ! browser && a < agents.length; a++) {
            for (let i = 0; ! browser && i < agents[a].length; i++) {
              if (ua.indexOf (agents[a][i]) > 0) {
                browser = agents[a][0];
              }
            }
          }
          if (! browser) {
            browser = "other";
          }
  
          computed = true;
          return browser;
        }
      }
    })();
  
/*! Converts a raw bumber of bytes into human redeable string.
 * @param bytes the numberof bytes,
 * @param digits the number of digits after the comma,
 * @return string; the human redeable string.
 */
/** @export */
function CS_bytes_to_human (bytes, digits) {
  if (bytes == 0) {
    return '0B';
  }

  digits = digits !== undefined ? digits : 0;
  let precision = Math.pow (10, digits);
  let i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  return Math.round (bytes * precision / Math.pow (1024, i)) / precision + ' ' + sizes[i];
}
  
/*! Return the RAM consumed by the browser by this page.
 * @return number: the consumed RAM in bytes or -1 if there is no API in this browser.
 */
/** @export */
function CS_get_RAM() {
  if (window.performance) {
    let performance = window.performance;
  
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    
    if (performance.measureUserAgentSpecificMemory) {
      performance.measureUserAgentSpecificMemory();
    }
  }
  if (navigator && navigator.deviceMemory) {
    return navigator.deviceMemory;
  }
  return -1;
}
  
/*! Return the RAM consumed by the browser by this page.
 * @return number: the consumed RAM in bytes.
 */
/** @export */
const CS_get_consumed_RAM = (function () {
    let initial_ram = CS_get_RAM();
    return function () {
      return initial_ram == -1 ? -1 : CS_get_RAM() - initial_ram;
    }
  })();
