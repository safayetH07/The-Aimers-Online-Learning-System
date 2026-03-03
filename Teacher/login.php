<?php
session_start();
include("../config/db.php");

$email = $_POST['email'];
$password = $_POST['password'];

$result = mysqli_query($conn,
"SELECT * FROM teachers WHERE email='$email'");

$user = mysqli_fetch_assoc($result);

if($user){
    $_SESSION['teacher_id'] = $user['id'];
    header("Location: dashboard.php");
}
?>