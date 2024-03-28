<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $taskInfo = $_POST['taskInfo'];

    $recipientEmail = 'krasilnikov1967@bk.ru'; // Замените на вашу почту
    $emailSubject = 'New Inquiry from ' . $name;

    $message = "Name: $name\n";
    $message .= "Email: $email\n";
    $message .= "Task Information: $taskInfo\n";

    $headers = 'From: ' . $name;

    // Отправка письма
    $success = mail($recipientEmail, $emailSubject, $message, $headers);

    if ($success) {
        echo 'Email sent successfully!';
    } else {
        echo 'Error sending email.';
    }
} else {
    echo 'Invalid request method.';
}