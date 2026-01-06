<?php
$conn = mysqli_connect("localhost","root","",
  "winmore");

if (!$conn) {
  http_response_code(500);
  echo "db_error";
  exit;
}

$phone = $_POST['phone'] ?? '';
$password = $_POST['password'] ?? '';

if (!$phone || !$password) {
  echo "missing";
  exit;
}

$check = mysqli_query($conn,"SELECT * FROM users WHERE phone='".mysqli_real_escape_string($conn,$phone)."'");

if(mysqli_num_rows($check) > 0){
  $row = mysqli_fetch_assoc($check);
  if($row['password'] == $password){
    echo "login";
  } else {
    echo "wrong";
  }
} else {
  mysqli_query($conn,"INSERT INTO users(phone,password) VALUES('".mysqli_real_escape_string($conn,$phone)."','".mysqli_real_escape_string($conn,$password)."')");
  echo "register";
}
?>
