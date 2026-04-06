<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Registration Verification Code</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
        .wrapper { background-color: #f4f7f6; padding: 40px 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background-color: #008543; padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; }
        .body { padding: 40px; color: #333333; line-height: 1.6; }
        .body p { margin-top: 0; margin-bottom: 20px; font-size: 16px; }
        .otp-container { text-align: center; margin: 30px 0; }
        .otp-code { display: inline-block; background-color: #e8f5e9; color: #008543; font-size: 36px; font-weight: bold; padding: 15px 30px; border-radius: 8px; letter-spacing: 5px; }
        .footer { background-color: #fafafa; padding: 20px; text-align: center; color: #888888; font-size: 13px; border-top: 1px solid #eeeeee; }
        .alert { font-size: 14px; color: #666; margin-top: 30px; border-left: 4px solid #008543; padding-left: 15px; background: #f9f9f9; padding: 10px 15px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="email-container">
            <div class="header">
                <h1>HSE-Archive</h1>
            </div>
            <div class="body">
                <p>Hello <strong>{{ $name }}</strong>,</p>
                <p>Thank you for registering at HSE-Archive! To complete your registration step, please enter the following 6-digit verification code:</p>
                
                <div class="otp-container">
                    <div class="otp-code">{{ $otp }}</div>
                </div>
                
                <p>This code will expire in <strong>15 minutes</strong>.</p>
                
                <div class="alert">
                    If you did not attempt to register an account with us, you can safely ignore this email.
                </div>
            </div>
            <div class="footer">
                &copy; {{ date('Y') }} HSE-Archive. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
