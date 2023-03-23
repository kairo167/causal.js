#! /usr/bin/php
<?php

/* Replaces in the js content read from stdin the symbols read from the
 * file given in argument and generates the new js content on stdout
 *
 * The file of symbols has the form
 *    symbol:replace:
 *    .attribute:replace:
 * 
 * cat *.js | ./symbols_hide.php symbols.txt > new.causal.min.js
 */

 /*! Escapes a symbol in a regexp.
  * @param $symbol the symbol to escape,
  * @return string the escaped symbol.
  */
function escape_symbol ($symbol) {
  return preg_quote ($symbol);
}

 /*! Escapes a replacement string in a regexp.
  * @param $replace the replacement string,
  * @return string the escaped replacement string.
  */
function escape_replace ($replace) {
  return str_replace ('$', '\$', $replace);
}

 /*! Gets the replacement regexp.
  * @param $symbol the name to replace,
  * @param $replace the replacement,
  * @param symbols the table of symbols,
  * @return list ($what, $by): the replacement regexp.
  */
function get ($symbol, $replace, & $symbols) {
  // exported symbols
  $pos = strrpos ($symbol, '.');

  // if there is a module
  if ($pos !== false) {
    // get the module
    $module = substr ($symbol, 0, $pos);

    // if the module is also replaced
    if (isset ($symbols[$module])) {
      // get the module replacement
      $module = $symbols[$module];

      // get the regexp to search
      $what = '(^|\W)'.escape_symbol ($module.'.'.substr ($symbol, 
                                                          $pos + 1)).'($|\W)';
    }
    else {
      // get the regexp
      $what = '(^|\W)'.escape_symbol ($symbol).'($|\W)';
    }

    // get the replacement
    $by = '$1'.escape_replace ($module.'.'.$replace).'$2';
  }
  else {
    // get the regexp and replacement
    $what = '(^|\W)'.escape_symbol ($symbol).'($|\W)';
    $by = '$1'.escape_replace ($replace).'$2';
  }

  /* protect when the symbol is inside quotes ou double-quotes 
   *
   * ~               # start delimiter (we could have used /, #, @ etc...)
   * "               # match a double quote
   * .*?             # match anything ungreedy until ...
   * "               # match a double quote
   * (*SKIP)(*FAIL)  # make it fail
   * |               # or
   * \btree\b        # match a tree with wordboundaries
   * ~               # end delimiter
   * s               # setting the s modifier to match newlines with dots .
   */
  //$what = '/'.$what.'/';
  $what = '/".*?"(*SKIP)(*FAIL)|\'.*?\'(*SKIP)(*FAIL)|'.$what.'/';

  // add the symbol in the table of symbols
  $symbols[$symbol] = $replace;

  return [$what, $by];
}

/*! Adds a symbol and its replacement in the tables.
 * @param $symbol the name to replace,
 * @param $replace the replacement,
 * @param $what the array of regexp to fill,
 * @param $by the array of replacement to fill,
 * @param $symbols the array of symbols to fill.
 */
function add ($symbol, $replace, & $what_array, & $by_array, &$symbols) {
  list ($what, $by) = get ($symbol, $replace, $symbols);
  $what_array[] = $what;
  $by_array  [] = $by;
}

/*! Replaces all the regexps until there is no changes.
 * @param $what the regexp to replace,
 * @param $by the replacement,
 * @param content the buffer to process
 * @return string: the modified buffer.
 */
function replace (& $what, & $by, & $content) {
  // while there is a change
  do {
    // use the new content
    $new_content = $content;

    // replace all the strings in the content
    $content = preg_replace ($what, $by, $new_content);
  } while ($new_content != $content);

  return $content;
}

// tests
if (false) {
  $symbols = [];
  foreach (
    [
      // 
      [
        'what' => 'injection', 
        'by'   => 'TOTO', 
        'in'   => 'wgl.injection = function(){}', 
        'to'   => 'wgl.TOTO = function(){}'
      ],  
      [
        'what' => 'injection', 
        'by'   => 'TO$TO', 
        'in'   => 'wgl.injection = function(){}', 
        'to'   => 'wgl.TO$TO = function(){}'
      ],  
      [
        'what' => 'injection', 
        'by'   => 'TOTO', 
        'in'   => 'x = "injection";', 
        'to'   => 'x = "injection";'
      ],  
      [
        'what' => 'injection', 
        'by'   => 'TOTO', 
        'in'   => 'x = "it is a good injection overall";', 
        'to'   => 'x = "it is a good injection overall";'
      ],  
      [
        'what' => 'injection', 
        'by'   => 'TOTO', 
        'in'   => 'x = \'injection\';', 
        'to'   => 'x = \'injection\';'
      ],  
      [
        'what' => 'injection', 
        'by'   => 'TOTO', 
        'in'   => 'x = \'it is a good injection overall\';', 
        'to'   => 'x = \'it is a good injection overall\';'
      ],  
      [
        'what' => 'anindex', 
        'by'   => 'TOTO', 
        'in'   => 'anarray[anindex] = 123;', 
        'to'   => 'anarray[TOTO] = 123;'
      ],  
      [
        'what' => '_CS_js_all_scripts', 
        'by'   => 'TOTO', 
        'in'   => '_CS_js_all_scripts[_CS_js_all_scripts.length -1].src;', 
        'to'   => 'TOTO[TOTO.length -1].src;'
      ],  
      [
        'what' => 'anobject', 
        'by'   => 'TOTO', 
        'in'   => 'anarray[anobject.length] = 123;', 
        'to'   => 'anarray[TOTO.length] = 123;'
      ],  
      [
        'what' => 'wgl.projection', 
        'by'   => 'TOTO', 
        'in'   => 'wgl.projection = function(){}', 
        'to'   => 'wgl.TOTO = function(){}'
      ],  
      [
        'what' => 'wgl.projection', 
        'by'   => 'TOTO', 
        'in'   => 'wgl.projection (1, 2, 3);', 
        'to'   => 'wgl.TOTO (1, 2, 3);',
        'reset'=> true
      ],  
      [
        'what' => 'wgl', 
        'by'   => '$WGL$', 
        'in'   => 'wgl.projection (1, 2, 3);', 
        'to'   => '$WGL$.projection (1, 2, 3);',
      ],  
      [
        'what' => 'wgl.projection', 
        'by'   => 'TOTO', 
        'in'   => '$WGL$.projection (1, 2, 3);', 
        'to'   => '$WGL$.TOTO (1, 2, 3);',
        'reset'=> true
      ],  
    ] as $test) {
    // get the symbol and its replacement  
    $symbol  = $test['what'];  
    $replace = $test['by'];  

    // get the regexp and the replacement
    list ($what, $by) = get ($symbol, $replace, $symbols);
  
    // replace the symbol
    $in = $test['in'];
    $res = replace ($what, $by, $in);
  
    // if the result is not as expected, display an error
    if ($res != $test['to']) {
      echo "ERROR: \n";
    }

    // display the processing stuff
    echo $symbol, '" => "', $replace, '", "', 
      $test['in'], '" = "', $test['to'], 
      ($res == $test['to'] ? '" == "' : '" != "'), $res, '"', chr(10),
      'what = "', $what, "\"\nby  = \"", $by, "\"\n\n";   
      
    // on reset, flushes the array of symbols  
    if (isset ($test["reset"])) {
      $symbols = [];
    }  
  }
  
  exit(1);
}

if (! $argv[1] || ! file_exists ($argv[1])) {
  echo 'Error: the name of the symbols file must be given.';
  exit (1);
}

// read the strings to replace from the given file of symbols
$file = fopen ($argv[1], 'r');
if (! $file) {
  echo 'Error: unable to open ', $argv[1], '.';
  exit (1);
}

// replacement arrays
$what_array = [];
$by_array   = [];
$symbols    = [];

// parse the file of symbols
while (($line = fgets ($file))) {
  // separate "symbol\007replace\007"
  $rep = explode (chr(7), $line);

  // get the symbol and its replacement
  $what = $rep[0];
  $by   = $rep[1];

  // extract the symbol and the replacement
  add ($what, $by, $what_array, $by_array, $symbols);
}

// close the symbol file
fclose ($file);

// get the js file content
$content = '';
while (($line = fgets (STDIN))) {
  $content .= $line;
}

// replace
echo replace ($what_array, $by_array, $content);
