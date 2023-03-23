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

/* create a masked image.
 * @param img_src the url of the image,
 * @param classname the class name of the mask,
 * @param color the masked color,
 * @return div: the masked image.
 */
/** @export */
function CS_mask_image (img_src, color) {
  // container logo
  let mask = document.createElement ('div');
  CS_add_class (mask, 'CS_mask_image');

  // create the image
  let img = document.createElement ('img');
  img.src = img_src;
  mask.appendChild (img);

  // create the background div and set its mask-image style
  let div  = document.createElement ('div');
  let mask_url = 'url("' + img.src + '")';
  div.setAttribute ('style',
  /**/              '-webkit-mask-image: ' + mask_url + ';' +
  /**/              'background-color: ' + color + ';' +
  /**/              'opacity: 0.7;' +
  /**/              'height: 90%;' +
  /**/              '');

  // add the background div in the container
  mask.appendChild (div);

  return mask;
}
