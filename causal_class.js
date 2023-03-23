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

/* Return the regular expression for matching a class name.
 * @param name the class name
 * @return regular expresison
 */
// /** @export */
function CS_re_class(name) {
  let re = new RegExp("(?:^|\\s)" + name + "(?!\\S)", "i");
  return re;
}

/* return true if the element has the given class
 * @param element the element to check
 * @param name the class name
 * @return boolean
 */
/** @export */
function CS_has_class(element, name) {
  //try {
  return element.className.match(CS_re_class(name)) ? true : false;
  //}
  //catch (e) {
  //  console.log (e);
  //}
}

/* add a class in the element classes
 * @param element the element
 * @param name the class name
 * @return void
 */
/** @export */
function CS_add_class(element, name) {
  element.classList.add(name);
}

/* remove a class from the element classes
 * @param element the element
 * @param name the class name
 * @return void
 */
/** @export */
function CS_del_class(element, name) {
  element.classList.remove(name);
}

/* allow to know if an element is a descendant of another element in the
 * hierachy.
 * @param parent the suposed parent element
 * @param child the supposed child element
 * @return boolean
 */
/** @export */
function CS_is_descendant(parent, child) {
  if (child && child != parent) {
    let node = child.parentNode;
    while (node != null) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
  }
  return false;
}

/*! Return the child with the given id in the children hierarchy of the
 * given element.
 * @param element the ancestor element,
 * @param id the identifier to search,
 * @param search_in_hierachy if true, search in the whold hierarchy,
 * otherwise, search in the direct children; it is false by default,
 * @param uniq if true, return te first matching element,
 * @return false or array: false if not found or the array of found
 * element.
 */
/** @export */
function CS_get_children_by_id(element,
  id,
  search_in_hierachy = false,
  uniq = true) {
  // the result
  let res = [];

  /*! Return the child with the given id in the children hierarchy of the
   * given element.
   * @param element the ancestor element,
   * @return void.
   */
  function search(element) {
    // search in the direct children
    let n = element.children ? element.children.length : 0
    for (let c = 0; c < n; c++) {
      // if an element is already found and uniq is set, stop the loop
      if (res.length != 0 && uniq) {
        break;
      }

      // if the ids match
      if (element.children[c].id == id) {
        // add the element
        res.push(element.children[c]);

        // on uniq, return
        if (uniq) {
          return;
        }
      }

      // if search in the full hierarchy
      if (search_in_hierachy) {
        // search in the child
        search(element.children[c]);
      }
    }
  }

  // search
  search(element);

  // return either the array, the element or false depending on conditions
  return res.length > 0 ? (uniq ? res[0] : res) : false;
}
