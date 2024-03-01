<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $recipientEmail = $_POST['krasilnikov1967@bk.ru'];
  $emailSubject = $_POST['krasilnikov1967@bk.ru'];
  $emailBody = $_POST['krasilnikov1967@bk.ru'];

  $headers = 'From: krasilnikov1967@bk.ru'; // Замените на ваш email
  $success = mail($recipientEmail, $emailSubject, $emailBody, $headers);

  if ($success) {
    echo 'Email sent successfully!';
  } else {
    echo 'Error sending email.';
  }
} else {
  echo 'Invalid request method.';
}
?>