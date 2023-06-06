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

/* Slide show
 * a slide show is created as a div element with the class CS_slideshow and
 * some children slides as divs, figures or images.
 * The slide show element mode is defined with the classes:
 * - visible:    direct visibility
 * - scale:      scale transition
 * - opacity:    fading transition,
 * - translate:  translation,
 * - cube:       3D cubic transition,
 * - book:       3D book.
 *
 * The movement direction can be specified with the classes:
 * - horizontal: horizontal transition,
 * - vertical:   vertical transition,
 *
 * The slide show speed is specified with the following class:
 * - no:         direct transition,
 * - slow:       slow transition (1.2s),
 * - fast:       fast transitions (0.5s)
 *
 * The slide show div can also have the following attributes:
 * - autostart="x ms":    auto start and slide switching speed set to x ms,
 * - onconfigure="fct()": configuration callback,
 * - onslide="fct()":     slide on change callback.
 *
 * The side of the slide show can be set by the slide show element itself or by
 * the slides it contains. In this case, by default, the last slide is used as
 * reference. However, if one slide element has the "reference" class, it is
 * used as reference.
 */

"use strict";

/*! Bind the slide show - ie: rearrange the elements, create the buttons
 * and the indicators.
 * The function returns the slideshow object with the following attributes:
 * - slideshow.speeds:
 *   array of available speeds,
 * - slideshow.modes:
 *   array of available modes,
 * - slideshow.setMode (mode):
 *   method that change the current mode or speed,
 * @param slideshow the slideshow object,
 * @return object: slideshow object.
 */
/** @export */
function CS_bind_slideshow(slideshow) {
  /*! Remove all the existing modes of the given element.
   * @param elem the element,
   * @param what the modes or the speeds array,
   * @return void.
   */
  function remove(elem, what) {
    /* remove all the existing modes */
    for (let name of what) {
      CS_del_class(elem, name);
    }
  }

  /*! Return the first specified mode of the slideshow.
   * @param elem the element,
   * @param what the modes or the speeds array,
   * @return string or false: the mode name if any, or false.
   */
  function get(elem, what) {
    /* for all the modes */
    for (let mode of what) {
      if (CS_has_class(elem, mode)) {
        return mode;
      }
    }
    return false;
  }

  /*! Return the first specified mode of the slideshow.
   * @param elem the element,
   * @param what the modes or the speeds array,
   * @return string or false: the mode name if any, or false.
   */
  function replace(elem, what, by) {
    remove(elem, what);
    CS_add_class(elem, by);
  }

  /*! Set the slideshow mode and speed according to the slide specific
   * mode and speed ir any.
   * @param slide the slide to select,
   * @return void.
   */
  function set_slide_specific(slide) {
    /* if the slide specifies the mode  */
    if (slide.mode) {
      let org_mode = get(slideshow, slideshow.modes);
      slideshow.org_mode = org_mode;
      replace(slideshow, slideshow.modes, slide.mode);
    }

    /* if the previous selected slide specified the mode */
    else if (slideshow.org_mode) {
      replace(slideshow, slideshow.modes, slideshow.org_mode);
      slideshow.org_mode = false;
    }

    /* if the slide specified the speed */
    if (slide.speed) {
      let org_speed = get(slideshow, slideshow.speeds);
      slideshow.org_speed = org_speed;
      replace(slideshow, slideshow.speeds, slide.speed);
    }
    else if (slideshow.org_speed) {
      replace(slideshow, slideshow.speeds, slideshow.org_speed);
      slideshow.org_speed = false;
    }

    /* if the slide specified the direction */
    if (slide.direction) {
      let org_direction = get(slideshow, slideshow.directions);
      slideshow.org_direction = org_direction;
      replace(slideshow, slideshow.directions, slide.direction);
    }
    else if (slideshow.org_direction) {
      replace(slideshow, slideshow.directions, slideshow.org_direction);
      slideshow.org_direction = false;
    }
  }

  function set_random_mode() {
    /* if the random class is selected */
    if (CS_has_class(slideshow, 'random')) {
      /* get the random new mode */
      let mode_index = Math.trunc(Math.random()
        * (slideshow.modes.length - 1));

      let mode = slideshow.modes[mode_index];

      /* replace the previous mode by the new one */
      replace(slideshow, slideshow.modes, mode);

      /* get the random new mode */
      let direction_index = Math.trunc(Math.random()
        * (slideshow.directions.length - 1));
      let direction = slideshow.directions[direction_index];

      /* replace the previous mode by the new one */
      replace(slideshow, slideshow.directions, direction);
    }
  }

  /* Set the transition state for certain modes.
   * @param slide_to_select the slide to select (can be 'previous'
   * or 'next'),
   * @param old_slide the previously selected slide number,
   * @param new_slide the index of the new slide to select,
   * @return void.
   */
  function set_transition(slide_to_select, old_slide, new_slide) {
    // let's know if the transition is animated
    let has_animation = false;
    for (let i = slideshow.modes.indexOf('---') + 1;
      i < slideshow.modes.length;
      i++) {
      if (CS_has_class(slideshow, slideshow.modes[i])) {
        has_animation = true;
        break;
      }
    }
    if (!has_animation) {
      return;
    }

    /* for the modes that needs a transition */
    let new_state, old_state;
    switch (slide_to_select) {
      case 'previous':
        new_state = 'leftOrTopToCenter';
        old_state = 'centerToRightOrBottom';
        break;

      case 'next':
        new_state = 'rightOrBottomToCenter';
        old_state = 'centerToLeftOrTop';
        break;

      default:
        /* like next */
        if (new_slide > old_slide) {
          new_state = 'rightOrBottomToCenter';
          old_state = 'centerToLeftOrTop';
        }
        /* like previous */
        else {
          new_state = 'leftOrTopToCenter';
          old_state = 'centerToRightOrBottom';
        }
        break;
    }

    /* force immediate change */
    let has_no = CS_has_class(slideshow, 'no');
    if (!has_no) {
      CS_add_class(slideshow, 'no');
    }

    // get the carousel
    let carousel = slideshow.carousel;

    /* force the slide class to 'slide' */
    for (let i = 0; i < slideshow.nb_slides; i++) {
      carousel.children[i].className = 'slide';
    }

    /* set the new states */
    CS_add_class(carousel.children[old_slide], old_state);
    CS_add_class(carousel.children[new_slide], new_state);

    /* flush all the CSS changes */
    //for (let i = 0; i < slideshow.nb_slides; i++) {
    //  carousel.children[i].offsetHeight;
    //}

    /* remove the immediate mode */
    if (!has_no) {
      CS_del_class(slideshow, 'no');
    }
  }

  /*! Select a slide - the slide to select can be specified as previous,
   * next or by its number.
   * @param slide_to_select the slide to select,
   * @return void.
   */
  function select_slide(slide_to_select) {
    /* if the side is already selected, do nothing */
    if (slide_to_select == slideshow.current) {
      return;
    }

    /* get the carousel and the indicators */
    let carousel = slideshow.carousel;
    let indicators = slideshow.indicators;

    /* get the number of slides */
    let n = slideshow.nb_slides;

    /* new slide to select and old selected slide */
    let new_slide;
    let old_slide = slideshow.current;

    /* depending to the slide to select */
    switch (slide_to_select) {
      case 'previous':
        new_slide = (slideshow.current == 0
          ? n - 1
          : slideshow.current - 1);
        break;

      case 'next':
        new_slide = (slideshow.current == n - 1
          ? 0
          : slideshow.current + 1);
        break;

      default:
        new_slide = (slide_to_select >= 0 && slide_to_select < n
          ? slide_to_select
          : 0);
        break;
    }

    /* get the new slide if set */
    set_slide_specific(carousel.children[new_slide]);

    /* set ransom mode if set */
    set_random_mode();

    /* set the transition state if any */
    set_transition(slide_to_select, old_slide, new_slide);

    /* set the selected classes */
    CS_del_class(carousel.children[old_slide], 'selected');
    CS_add_class(carousel.children[new_slide], 'selected');

    /* set the selected indicator */
    CS_del_class(indicators.children[old_slide], 'selected');
    CS_add_class(indicators.children[new_slide], 'selected');

    /* store the selected slide */
    slideshow.current = new_slide;

    /* call the onslide callback */
    if (typeof slideshow.attributes.onslide != 'undefined') {
      eval(slideshow.attributes.onslide.value);
    }
  }

  /*! Select the next slide from the autostart timer.
   * @return void.
   */
  function select_next_slide_from_timer() {
    select_slide('next');
  }

  /*! Create the autostart timer if the autostart attribute of the slide show
   * is set.
   * @return void.
   */
  function set_autostart() {
    if (typeof slideshow.attributes.autostart != 'undefined') {
      let delay = parseInt(slideshow.attributes.autostart.value);
      if (delay > 0) {
        slideshow.timer = setInterval(select_next_slide_from_timer, delay);
      }
    }
  }

  /*! Select a slide from the user interactions.
   * @param slide_to_select the slide to select,
   * @return void.
   */
  function select_slide_from_ui(slide_to_select) {
    //if (slideshow.timer) {
    //  clearInterval (slideshow.timer);
    //  slideshow.timer = setInterval (set_autostart, 10000 /* 10 seconds */);
    //}
    select_slide(slide_to_select);
  };

  /*! Set the slide gesture event handler.
   * @param carousel the carousel to bind,
   * @return void.
   */
  function set_gesture_event_handlers(carousel) {
    // start xy position
    let start_xy;

    /* On mouse up and mouse leave handler.
     * @param event the event,
     * @return void.
     */
    function end_handler(event) {
      // stop the propagation
      CS_stop_propagation(event);

      // log
      console.log('end drag');

      // reset the handlers
      carousel.onmousedown = start_handler;
      carousel.onmouseup =
        carousel.onmouseleave = null;

      // get the last xv position
      let end_xy = CS_getxy(event);
      let dx = end_xy.x - start_xy.x;
      let dy = end_xy.y - start_xy.y;

      // get the slide to select
      let slide_to_select;
      if (Math.abs(dx) > Math.abs(dy)) {
        slide_to_select = dx > 0 ? 'previous' : 'next';
      }
      else {
        slide_to_select = dy > 0 ? 'previous' : 'next';
      }

      // select the slide
      select_slide_from_ui(slide_to_select);

      return false;
    }

    /* On mouse down handler.
     * @param event the event,
     * @return void.
     */
    function start_handler(event) {
      // stop the propagation
      CS_stop_propagation(event);

      // log
      console.log('start drag');

      // set the handlers
      carousel.onmousedown = null;
      carousel.onmouseup =
        carousel.onmouseleave = end_handler;

      // keep the mouse position
      start_xy = CS_getxy(event);
    }

    // set the side on mouse down handler
    carousel.onmousedown = start_handler;
    carousel.ondragstart = function () { return false; };
  }

  /*! Set the default mode and speed.
   * @return void.
   */
  function set_default_modes() {
    /* set the default speed */
    let found = false;
    for (let speed of slideshow.speeds) {
      if (CS_has_class(slideshow, speed)) {
        found = true;
        break;
      }
    }
    if (!found) {
      CS_add_class(slideshow, 'fast');
    }

    /* set the default mode */
    found = false;
    for (let mode of slideshow.modes) {
      if (CS_has_class(slideshow, mode)) {
        found = true;
        break;
      }
    }
    if (!found) {
      CS_add_class(slideshow, 'cube');
    }

    /* set the default direction */
    found = false;
    for (let direction of slideshow.directions) {
      if (CS_has_class(slideshow, direction)) {
        found = true;
        break;
      }
    }
    if (!found) {
      CS_add_class(slideshow, 'horizontal');
    }
  }

  /*! Change the mode of the slideshow.
   * @param mode the mode to change,
   * @return void.
   */
  function set_mode(mode) {
    let modes;
    if (slideshow.speeds.includes(mode)) {
      modes = slideshow.speeds;
    }
    else if (slideshow.directions.includes(mode)) {
      modes = slideshow.directions;
    }
    else if (slideshow.modes.includes(mode)) {
      modes = slideshow.modes;
    }
    else {
      return;
    }
    for (let s of modes) {
      if (s == mode) {
        CS_add_class(slideshow, s);
      }
      else {
        CS_del_class(slideshow, s);
      }
    }
  }

  /*! Create the previous or next button.
   * @param side 'previous' or 'next',
   * @return void.
   */
  function create_button(side) {
    let button = document.createElement('button');
    button.className = 'button ' + side;
    button.title = 'Select the ' + side + ' slide';
    button.onclick = function () { select_slide_from_ui(side); };
    slideshow.appendChild(button);
  }

  /* check the slideshow */
  if (!slideshow) {
    return null;
  }
  else if (slideshow.bound == true) {
    return slideshow;
  }
  else {
    // mark the slideshow as bound
    slideshow.bound = true;

    /* set the speeds and modes attributes */
    slideshow.speeds = ['no', 'slow', 'fast'];
    slideshow.modes = [// non animated modes
      'visible', 'scale', 'opacity',
      '---',
      // animated modes
      'translate', 'cube', 'book', 'page', 'flip'];
    slideshow.directions = ['horizontal', 'vertical'];

    /* set the setMode method */
    slideshow.setMode = set_mode;

    /* set the default modes */
    set_default_modes();

    /* create the carousel */
    let carousel = document.createElement('div');
    slideshow.carousel = carousel;
    carousel.className = 'carousel';

    /* put the slides in a slides array and set their class */
    let slides = [];
    let has_selected_slide = false;
    for (let i = 0; i < slideshow.childNodes.length; i++) {
      /* get the slide */
      let slide = slideshow.childNodes[i];

      switch (slide.nodeName) {
        case 'DIV':
        case 'IMG':
        case 'FIGURE':
          /* add the slide class to the slide */
          CS_add_class(slide, 'slide');

          /* store the specific mode and speed */
          slide.mode = get(slide, slideshow.modes);
          slide.speed = get(slide, slideshow.speeds);

          /* add the sldie in the array */
          slides.push(slideshow.childNodes[i]);

          /* if the slide is selected */
          if (CS_has_class(slideshow.childNodes[i], 'selected')) {
            /* set the flag */
            has_selected_slide = true;
          }
          break;
      }
    }

    /* add the carousel to the slideshow */
    slideshow.appendChild(carousel);

    /* initialize the number of slides */
    slideshow.nb_slides = 0;

    /* if there is no slide, set a message in the carousel and return */
    if (slides.length == 0) {
      carousel.innerHTML = 'Empty slide show...';
      return;
    }

    /* set the gesture event handlers */
    set_gesture_event_handlers(carousel);

    /* carousel slide - at the end of the for, it will be the last slide */
    let reference = false;

    /* move the slideshow children to the carousel and configure them */
    for (let slide of slides) {
      // if there is not yet a reference slide
      if (!reference) {
        // keep this slide as reference
        reference = slide;
      }

      // if the slide has the 'reference' class
      if (CS_has_class(slide, 'reference')) {
        reference = slide;
      }

      /* if no slide is selected, set the first sldie selected */
      if (!has_selected_slide) {
        CS_add_class(slide, 'selected');
        has_selected_slide = true;
      }

      /* if the slide is selected, keep its number */
      if (CS_has_class(slide, 'selected')) {
        slideshow.current = slideshow.nb_slides;
      }

      /* set the slide number and append it in the carousel */
      slide.number = slideshow.nb_slides++;
      carousel.appendChild(slide);
    }

    /* duplicate the reference slide to make is as a control slide */
    reference = reference.cloneNode(true);
    CS_del_class(reference, 'selected');
    carousel.appendChild(reference);

    /* create the left and right buttons */
    create_button('previous');
    create_button('next');

    /* configuration */
    if (typeof slideshow.attributes.onconfigure != 'undefined') {
      let config = document.createElement('button');
      config.className = 'button config';
      config.title = 'Configure the slide show';
      config.onclick = function (event) {
        event.stopPropagation();
        eval(slideshow.attributes.onconfigure.value);
        return false;
      };
      slideshow.appendChild(config);
    }

    /* create the indicator container */
    let indicators = document.createElement('div');
    slideshow.indicators = indicators;
    slideshow.appendChild(indicators);
    indicators.className = 'indicators';

    /* create one indicator per slide */
    let n = 0;
    for (let slide of slides) {
      let indicator = document.createElement('div');
      indicators.appendChild(indicator);
      indicator.className = 'indicator';
      indicator.title = 'Switch to slide ' + (n + 1);
      indicator.onclick = (function (n) {
        return function () {
          select_slide_from_ui(n);
        }
      })(n);

      if (n++ == slideshow.current) {
        CS_add_class(indicator, 'selected');
      }
    }

    /* call the onslide callback */
    if (typeof slideshow.attributes.onslide != 'undefined') {
      eval(slideshow.attributes.onslide.value);
    }

    /* auto start */
    set_autostart();

    // add touch events handlers
    carousel.ontouchstart = function () { console.log('touch start') }
    carousel.ontouchend = function () { console.log('touch end') }
    carousel.onmouseclick = function () { console.log('touch start') }

    return slideshow;
  }
}
