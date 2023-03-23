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

/*! print a HTML contents. Notice that the contens may not contain the
  * <html> and <body> that are automatically added.
  * @param contents the html contents to print,
  * @erturn void.
  */
/** @export */
function CS_print_html (contents) {
  /* create an iframe and put it out of the screen */
  var frame1            = document.createElement ('iframe');
  frame1.name           = "frame1";
  frame1.style.position = "absolute";
  frame1.style.top      = "-1000000px";
  document.body.appendChild (frame1);

  var frameDoc = (frame1.contentWindow
                  ? frame1.contentWindow
                  : frame1.contentDocument.document
                  ? frame1.contentDocument.document
                  : frame1.contentDocument);

  /* open the frame document */
  frameDoc.document.open();

  /* write the missing tags */
  if (contents.indexOf ('<html') == -1) {
    frameDoc.document.write ('<html>');
  }
  if (contents.indexOf ('<body') == -1) {
    frameDoc.document.write ('<body>');
  }

  /* write the contents */
  frameDoc.document.write (contents);

  /* write the missing tags */
  if (contents.indexOf ('</html>') == -1) {
    frameDoc.document.write ('</html>');
  }
  if (contents.indexOf ('</body>') == -1) {
    frameDoc.document.write ('</body>');
  }

  /* close the document */
  frameDoc.document.close();

  /* wait a while and ... */
  setTimeout (function () {
    /* put the focus on the iframe, print it and remoe it */
    window.frames["frame1"].focus();
    window.frames["frame1"].print();
    document.body.removeChild (frame1);
  }, 500);
}
