<?php
/* VERY small, secure mailer – no libraries needed */
header('Content-Type: text/plain; charset=utf-8');

$recipient = 'info@sweetbuns.com';          // same as JS constant
$allowed   = ['name','email','message','formType','enquiryType','eventDate'];

// basic checks
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}
if (!filter_var($_POST['email']??'', FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    exit('Invalid email');
}

// build message
$subject = $_POST['formType'].' from '.$_POST['name'];
$headers = "From: ".$_POST['email']."\r\n"
         . "Reply-To: ".$_POST['email']."\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n";

$body = "";
foreach ($allowed as $key){
  if (!empty($_POST[$key])) $body .= ucfirst($key).": ".$_POST[$key]."\n";
}

// send & respond
if (mail($recipient, $subject, $body, $headers)) echo 'OK';
else { http_response_code(500); echo 'Mail server error'; }
?>