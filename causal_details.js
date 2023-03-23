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

/*! Bind the details tag for firefox.
 * @param details a details tag,
 * @return void.
 */
/** @export */
function CS_bind_details (details) {
  /*! change the state of the details tag.
    * @param open set the satte to opened if true, and to closed
    * otherwise,
    * @return void.
    */
  function state (open) {
    if (open) {
      CS_del_class (details, "CS_details_closed");
      CS_add_class (details, "CS_details_opened");
    }
    else {
      CS_add_class (details, "CS_details_closed");
      CS_del_class (details, "CS_details_opened");
    }
  }

  // get the open attribute of the details tag
  var open = typeof details.attributes["open"] != "undefined";

  // search for the symmary child
  for (var i = 0; i < details.children.length; i++) {
    var child = details.children[i];
    if (child.tagName.toLowerCase() == "summary") {
      // if found, bind its onclick function
	    child.onclick = function() {
        state (CS_has_class (details, "CS_details_closed"));
      };
      break;
    }
  }

  // set the state
  state (open);
}
