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

/*! Binds the tree objects.
 * @param tree the tree to bind,
 * @return void.
 */
/** @export */
function CS_bind_tree (tree) {
    /*! Toggles the item visibility.
     * @param event the event,
     * @return void.
     */
    function toggle (evt) {
	let event = (evt ? evt : window.event);
	let span2 = event.target;
	let span1 = span2.parentNode;
	let display, from, to;

	// get the new item class and the display mode
	if (CS_has_class (span2, "CS_expanded")) {
	  from    = /(?:^|\s)CS_expanded(?!\S)/g;
	  to      = " CS_collapsed";
	  display = false;
	}
	else if (CS_has_class (span2, "CS_collapsed")) {
	  from    = /(?:^|\s)CS_collapsed(?!\S)/g;
	  to      = " CS_expanded";
	  display = true;
	}

	// change the blockquote height
	for (let i = 0, n = span1.parentNode.children.length;
	     i < n;
	     i++) {
	  let blockquote = span1.parentNode.children[i];
	  if (blockquote.tagName.toLowerCase() == "blockquote") {
	    if (! display) {
	      blockquote.org_height = CS_get_external_height (blockquote);
	      CS_set_external_height (blockquote, blockquote.org_height);
	      CS_set_external_height (blockquote, 0);
	    }
	    else if (blockquote.org_height) {
	      CS_set_external_height (blockquote, blockquote.org_height);
	    }
	    else {
	      blockquote.style.height = "auto";
	    }
	  }
	}

	// change the item class
	span2.className = span2.className.replaceAll (from, to);
    }

    /*! Bind the divs of the tree.
     * @param parent the parent tree,
     * @return void.
     */
    function bind_divs (parent) {
	// for all the children
	for (let i = 0, ni = parent.children.length; i < ni; i++) {
	    // if the children is a div
	    let div = parent.children[i];
	    if (div.tagName.toLowerCase() == "div") {
		// add the item class
		CS_add_class (div, "CS_item");

		// get the item class from the div
		let cls = "CS_expanded";
		if (typeof div.attributes.collapsed != "undefined") {
		    cls = "CS_collapsed";
		}

		// number of children
		let nb_children = 0;

		// for all the children
		for (let j = 0, nj = div.children.length;
		     j < nj;
		     j++) {
		    if (div.children[j].tagName.toLowerCase() ==
			"blockquote") {
			// increment the number of children
			nb_children++;

			// search for the first text node that is
			// the item name
			let node = div.childNodes[0];
			let span1 = document.createElement ("span");
			let span2 = document.createElement ("span");
			span1.appendChild (span2);
			span2.className = cls;
			span2.innerHTML = "&nbsp;";

			// if the node is a simple text, move it
			// into a span
			if (node.nodeName == "#text") {
			    let span = document.createElement ("span");
			    span.innerHTML = node.data;
			    span1.appendChild (span);
			}
			else {
			    span1.appendChild (node);
			}
			div.insertBefore (span1, div.firstChild);

			// set the onclick event handler
			span2.onclick = toggle;

			break;
		    }
		}

		// if there is no children, add the class CS_nochild
		if (nb_children == 0) {
  		  CS_add_class (div, "CS_nochild");
		}


		// bind the quotes
		bind_blockquote (div, cls == "CS_collapsed");
	    }
	}
    }

    // bind the blockquote of an item in the tree
    // parent: the parent owner
    // return void
    function bind_blockquote (parent, collapsed) {
	// for all the blockquote
	for (let i = 0, ni = parent.children.length; i < ni; i++) {
	    let blockquote = parent.children[i];
	    if (blockquote.tagName.toLowerCase() == "blockquote") {
		// if the blockquote is collapsed, hide it
		if (collapsed) {
		    CS_set_external_height (blockquote, 0);
		}

		// bind the sub divs
		if (blockquote.children.length > 0) {
		    bind_divs (blockquote);
		}
	    }
	}
    }

    // bind the toplevel divs
    bind_divs (tree);
}

