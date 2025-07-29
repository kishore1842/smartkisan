export function generateverificationotpemailtemplate(otpcode) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
    </head>
<body>
    <div class="container">
        <h1>Verification Code</h1>
        <p>Your verification code is: <strong>${otpcode}</strong></p>
        <p>Please enter this code to verify your email address.</p>
        <a href="#" class="button">Verify Now</a>
    </div>  
</body>
</html>
`;
}

export function generatepasswordresetemailtemplate(resetpasswordurl) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
    </head>
<body>
    <div class="container">
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetpasswordurl}" class="button">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
    </div>
    <p>Note: This link will expire in 10 minutes.</p>
    <p>If you have any questions, feel free to contact us.</p>
    <p>Thank you!</p>
    <p>Best regards,</p>
    
</body>
</html>
`;
}


