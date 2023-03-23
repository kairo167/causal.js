#! /usr/bin/php
<?php

/* Removes the c comments stdin and generates the output in stdout */

// get the options
$input_name = false;
$output     = STDOUT;
$test       = false;

$options = getopt ('hi:o:t', ['help', 'input:', 'output:', 'test']);

foreach ($options as $key => $value) {
  switch ($key) {
  case 'h': case 'help':
    echo "uncomment.php [OPTIONS]\n";
    echo "OPTION\n";
    echo " -h|--help       : This help\n";
    echo " -i|--input FILE : Use FILE as input (STDIN otherwise)\n";
    echo " -o|--output FILE: Use FILE as output (STDOUT otherwise)\n";
    echo " -t|--test       : Test\n";
    exit (0);
    break;

  case 'i': case 'input':
    if (! is_string ($value)) {
      die ('only one input can be specified');
    }
    if (! file_exists ($value)) {
      die ('Error: unable to open '.$value);
    }
    $input_name = $value;
    break;

  case 'o': case 'output':
    if (! is_string ($value)) {
      die ('only one output can be specified');
    }
    if (! ($output = fopen ($value, 'w+'))) {
      die ('Error: unable to open '.$value);
    }
    break;

  case 't': case 'test':
    $test = true;
    break;

  default:
    die ('Error: unreconized option '.$key);
    break;
  }
}

// put a character on the output
function put ($c) {
  global $test, $test_output, $output;

  if ($test) {
    $test_output .= $c;
  }
  else {
    fputs ($output, $c);
  }
}

// get the file contents to parse
if ($test) {
  $contents = <<<EOL
  'use strict'
  var toto = /* this is toto */ 12;
  let rx=/<script[^]*?(src="([\s\S]*?)")*>([\s\S]*?)<\/script>/gmi
  /* this is f
   */
  f() {
    return 3;
  }
  var titi = "122\3'/*\/45"; // titi
  EOL;
  $test_output = '';
}
elseif ($input_name) {
  $contents = file_get_contents ($input_name);
}
else {
  $contents = '';
  while ($buffer = fread (STDIN, 9999999)) {
    $contents .= $buffer;
  }
}

if (! $contents) {
  return;
}

$comment = $string = false;

for ($offset = 0, $length = strlen ($contents); $offset < $length; $offset++) {
  $c = $contents[$offset];
  $n = $offset < $length - 1 ? $contents[$offset + 1] : false;

  if ($test) {
    echo "c=$c, n=$n, comment=$comment, string=$string\n";
    echo $test_output, "\n";
  }

  if ($comment == false) {
    if ($c == '\\') {
      put ($c);
      put ($n);
      $offset++;
    }
    elseif (! $string && $c == '/' && $n == '/') {
      $comment = 'c++';
      $offset++;
    }
    elseif (! $string && $c == '/' && $n == '*') {
      $comment = 'c';
      $offset++;
    }
    elseif ($c == '"' || $c == "'") {
      if ($string == $c) {
        $string = false;
      }
      elseif (! $string) {
        $string = $c;
      }
      put ($c);
    }
    else {
      put ($c);
    }
  }
  elseif ($comment == 'c++' && $c == "\n") {
    $comment = false;
  }
  elseif ($comment == 'c' && $c == '*' && $n == '/') {
    $comment = false;
    $offset++;
    if (false) {
      $offset++;
      while ($offset < $length &&
             strchr ("\n\t ", $contents[$offset]) !== false) {
        $offset++;
      }
      $offset--;
    }
  }
}

if ($output != STDOUT) {
  fclose ($output);
}
