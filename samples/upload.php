<?php

$file = fopen ('/tmp/'.basename (__FILE__, '.php').'.log', 'a');

fprintf ($file, print_r ($_REQUEST, true));
fprintf ($file, print_r ($_FILES, true));

echo 'Working!', PHP_EOL;

foreach ($_FILES as $id => $data) {
  if (isset ($data['error']) && $data['error']) {
    echo 'Error: unable to transfert ', $data['name'], PHP_EOL;
  }
  else {
    echo 'Success: file ', $data['name'], ' now in /tmp', PHP_EOL;
    rename ($data['tmp_name'], '/tmp/'.$data['name']);
  }
}

fclose ($file);
