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

/* Nice string library:
 * https://code.google.com/p/jsxt/source/browse/trunk/js/String.js */


/*! Is a string is ended with a postfix string.
 * @param string the string where to search,
 * @param postfix the postfix to search,
 * @return boolean: the status.
 */
/** @export */
function CS_str_ends_with(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/* String.format: allow to format a string à la printf. The wildcard
 * is only %, as in "a % string".format ("nice").
 * @param fmt the format string,
 * @return string: the formated string.
 */
/** @export */
function CS_str_format(fmt) {
  let newStr = fmt, i = 0;

  newStr = newStr.replaceAll("%%", "_!___#__!__");
  newStr = newStr.replaceAll("%", () => arguments[++i]);
  newStr = newStr.replaceAll("_!___#__!__", "%");

  return newStr;
}

/* Return true if the given character is printable
 * @param c: the character
 * @return boolean
 */
/** @export */
function CS_is_print(c) {
  if ((c >= 'a' && c <= 'z') ||
    (c >= 'A' && c <= 'Z') ||
    (c >= '0' && c <= '9')) {
    return c;
  }
  let test = "\t @#&\"'({[§!çà)}]-_^¨¨$*ù%`£,?;.:/=+<>~\|";
  let pos = test.indexOf(c);
  return pos != -1;
}

// ASCII crc table
/** @export */
const CS_crc32_a_table =
  "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 " +
  "9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD " +
  "E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D " +
  "6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC " +
  "14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 " +
  "A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C " +
  "DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC " +
  "51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F " +
  "2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB " +
  "B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F " +
  "9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB " +
  "086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E " +
  "6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA " +
  "FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE " +
  "A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A " +
  "346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 " +
  "5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 " +
  "CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 " +
  "B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 " +
  "9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 " +
  "E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 " +
  "6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 " +
  "10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 " +
  "A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B " +
  "D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF " +
  "4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 " +
  "220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 " +
  "B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A " +
  "9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE " +
  "0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 " +
  "68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 " +
  "FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 " +
  "A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D " +
  "3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 " +
  "47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 " +
  "CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 " +
  "B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";

// binary CRC table
/** @export */
const CS_crc32_b_table =
  CS_crc32_a_table.split(' ').map(function (s) {
    return parseInt(s, 16);
  });

/*! Computes the CRC32 of a string.
 * @param str the string,
 * @return int: the CRC.
 */
/** @export */
function CS_crc32(str) {
  let crc = -1;
  for (let i = 0, iTop = str.length; i < iTop; i++) {
    crc = (crc >>> 8) ^ CS_crc32_b_table[(crc ^ str.charCodeAt(i)) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

/* Generate an uniq identifier.
 * @param prefix the optional prefix to use,
 * @return string: the uniq identifier.
 */
/** @export */
function CS_generate_uuid(prefix, separator) {
  let d = new Date().getTime();
  let uuid = (prefix ? prefix + separator : "") +
    ('xxxx-xx-4x-yxxx-xxxx'.replace
      (/[xy]/g,
        function (c) {
          let r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        }));

  // if the separator is provided
  if (separator && separator != '-') {
    uuid = uuid.replace(/-/g, separator);
  }
  return uuid;
};

/*! Encodes a string to UTF8.
  * @param s the string,
  * @return string: the UTF8 string.
  */
/** @export */
function CS_str_to_utf_8(s) {
  try {
    return unescape(encodeURIComponent(s));
  }
  catch (e) {
    return s;
  }
}

/*! Dencode a string from UTF8.
 *
 * code that could be inresting to use because escape() and unescape() are
 * deprecated...
 *
 * function Utf8ArrayToStr(codes, start, end) {
 *     var out, i, len, c;
 *     var char2, char3;
 *
 *     out = "";
 *     len = end - start;
 *     i = 0;
 *     while (i < len) {
 *       c = codes[start + i++];
 *       switch (c >> 4) {
 *       case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
 *         // 0xxxxxxx
 *         out += String.fromCharCode (c);
 *         break;
 *
 *       case 12: case 13:
 *         // 110x xxxx   10xx xxxx
 *         char2 = codes[start + i++];
 *         out  += String.fromCharCode (((c & 0x1F) << 6) | (char2 & 0x3F));
 *         break;
 *
 *       case 14:
 *         // 1110 xxxx  10xx xxxx  10xx xxxx
 *         char2 = codes[start + i++];
 *         char3 = codes[start + i++];
 *         out  += String.fromCharCode (((c     & 0x0F) << 12) |
 *                                      ((char2 & 0x3F) <<  6) |
 *                                      ((char3 & 0x3F) <<  0)  );
 *         break;
 *     }
 *     }
 *
 *     return out;
 * }
 *
  * @param s the string,
  * @return string: the decoded UTF8 string.
  */
/** @export */
function CS_str_from_utf_8(s) {
  try {
    return decodeURIComponent(escape(s));
  }
  catch (e) {
    return s;
  }
}

/*! Encrypts a string. This function is called when the script has not been
 * processed by causal.js/encrypt_strings.php.
 * @param string the string to encrypt,
 * @return string: the string as is.
 */
/** @export */
function ____(string) {
  return string;
}
