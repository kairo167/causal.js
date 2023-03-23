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

// https://stackoverflow.com/questions/18279141/ \
//                                javascript-string-encryption-and-decryption

/*! Encrypt a string.
 * @param salt the encryption key,
 * @param encoded the decrypted string,
 * @return string: the encrypted string.
 */
/** @export */
function CS_crypt (salt, text) {
  const textToChars =
  (text) => text.split ('').map ((c) => c.charCodeAt (0));

  const byteHex =
  (n) => {
    let str = '0' + Number (n).toString (16);
    str.substring (str.length - 2);
  }

  const applySaltToChar =
  (code) => textToChars(salt).reduce ((a, b) => a ^ b, code);

  return (text
          .split ('')
          .map   (textToChars)
          .map   (applySaltToChar)
          .map   (byteHex)
          .join  (''));
};

/*! Decrypt a string.
 * @partam salt: the encryption key,
 * @param encoded the encrypyed string,
 * @return string: the decrypted string.
 */
/** @export */
function CS_decrypt (salt, encoded) {
  const textToChars =
  (text) => text.split ('').map ((c) => c.charCodeAt (0));

  const applySaltToChar =
  (code) => textToChars (salt).reduce ((a, b) => a ^ b, code);

  return (encoded
          .match (/.{1,2}/g)
          .map   ((hex) => parseInt(hex, 16))
          .map   (applySaltToChar)
          .map   ((charCode) => String.fromCharCode(charCode))
          .join  (''));
};
