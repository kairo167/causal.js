/*                                                                  */
/*                       C l a r i 3 D  (r)                         */
/*                                                                  */
/*                    The ultimate 3D Explorer                      */
/*                        www.clari3d.com                           */
/*                                                                  */
/* (c) Copyright 2002 to 2018, by Andéor, SAS - All rights reserved */
/*                                                                  */
/*         Andéor, SAS - SIRET 520 295 643 00016. R.C.S Nice        */
/*  Le Sonora B. 71, avenue de la Lanterne - 06200 - Nice - FRANCE  */
/*                                                                  */
/* This document is the property of  Andéor, SAS.  It is considered */
/* confidential and proprietary.  This  document may not  be repro- */
/* duced  or  transmitted in  any form in whole or in part, without */
/* the express written permission of Andéor, SAS.                   */
/*                                                                  */
/* -*-header-*- */
function openDialog() {
    CS_ajax_load_promise({
        url: "/templates/exemple-1-dialog.html",
        onsuccess: function (content) {
            CS_dialog_open({
                content: content,
                styles: "left: 3em; top: 4em; width: 20em; height: 20em"
            });
        });
}

var menu_opened = false;

function openMenu(event) {
    if (!menu_opened) {
        menu_opened = true;
        var event = (event ? event : window.event);
        var location = {
            left: event.clientX + "px",
            top: event.clientY + "px"
        };
        if (ieversion <= 6) {
            location.width = "6em";
        }
        CS_ajax_load_promise({
            url: "/templates/exemple-1-menu.html",
            onsuccess: function (content) {
                menu(content,
                    function () {
                        menu_opened = false;
                    }, location);
            }
        });
    }
}

function updateRange(id, value, postfix) {
    var auto_refresh_value = document.getElementById(id);
    auto_refresh_value.innerHTML = value + postfix;
}

function addStatus(text) {
    var status = document.getElementsByClassName("status");
    for (var i = 0; i < status.length; i++) {
        status[i].innerHTML += text;
    }
}
