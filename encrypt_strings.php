#! /usr/bin/php
<?php

function process ($line, $debug = false) {
  // if the line has no string to encrypt, return it
  if (strpos ($line, '____') === false) {
    return $line;
  }

  // get the string to encrypt commands
  $matches = false;
  $regexp = '/____\s*\("[^"]*"\)|____\s*\(\'[^\']*\'\)/';
  $result = preg_match_all ($regexp, $line, $matches);

  // if there is no string, return the line
  if ($result == 0) {
    return $line;
  }

  // dump the matchs on debug
  if ($debug) {
    echo "----------------------------\n";
    var_dump ($matches);
  }

  // for all the matching strings
  $result = $line;
  foreach ($matches[0] as $match) {
    // print the command on debug
    if ($debug) {
      var_dump ($match);
    }

    // the the position of the quotes
    $pos1 = strpos ($match, '(');
    $quote = $match[$pos1 + 1];
    $pos2 = strrpos ($match, $quote);

    // extract the string and dump it on debug
    $string = substr ($match, $pos1 + 2, $pos2 - $pos1 - 2);
    if ($debug) {
      var_dump ($string);
    }

    // get the replacement string 
    $replace = 'window.atob("'.str_replace ('=', '', base64_encode ($string)).'")';

    // replace the string
    $result = str_replace ($match, $replace, $result);
  }

  return $result;
}

/* Replaces in the js content read from stdin the string to encrypt 
 * that are written as ____("string") or ____('string')
 * 
 * cat *.js | ./encrypt_strings.php > output.js
 */

// tests
if (false) {
  foreach (
    [
      [
        'input'  => 'echo f ("roro"), 123;', 
        'output' => 'echo f ("roro"), 123;', 
      ],  
      [
        'input'  => 'echo ____("roro"), 123;', 
        'output' => 'echo window.atob("cm9ybw"), 123;', 
      ],  
      [
        'input'  => 'echo ____(\'roro\'), 123;', 
        'output' => 'echo window.atob("cm9ybw"), 123;', 
      ],  
      [
        'input'  => 'echo ____(\'roro\'), 123,  ____(\'riri\');', 
        'output' => 'echo window.atob("cm9ybw"), 123,  window.atob("cmlyaQ");', 
      ],  
    ] as $test) {
      $input  = $test['input'];  
      $output = $test['output'];  

      $result = process ($input, true);
      if ($result != $output) {
        echo 'Error   : "', $input, 
        "\"\nresult  : \"", $result, 
        "\"\nexpected: \"", $output, "\"\n\n";
      }
    }
  
  exit(1);
}

// read the input file line by line
while (($line = fgets (STDIN))) {
  echo process ($line);
}
