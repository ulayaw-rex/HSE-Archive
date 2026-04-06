<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Approved</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
        .wrapper { background-color: #f4f7f6; padding: 40px 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background-color: #008543; padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; }
        .body { padding: 40px; color: #333333; line-height: 1.6; }
        .body p { margin-top: 0; margin-bottom: 20px; font-size: 16px; }
        .btn-container { text-align: center; margin: 35px 0; }
        .btn { display: inline-block; background-color: #008543; color: #ffffff !important; text-decoration: none; font-size: 18px; font-weight: bold; padding: 15px 35px; border-radius: 30px; box-shadow: 0 4px 6px rgba(0, 133, 67, 0.2); transition: background-color 0.3s; }
        .btn:hover { background-color: #006e36; }
        .footer { background-color: #fafafa; padding: 20px; text-align: center; color: #888888; font-size: 13px; border-top: 1px solid #eeeeee; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="email-container">
            <div class="header">
                <h1>HSE-Archive</h1>
            </div>
            <div class="body">
                <p>Hello <strong>{{ $name }}</strong>!</p>
                <p>Great news! Your account has been reviewed and <strong>approved</strong> by our administrator. Welcome to the Hillsider community.</p>
                <p>You can now log in and access all platform features, including reading publications, submitting article feedback, and exploring print media archives.</p>
                
                <div class="btn-container">
                    <a href="{{ $loginUrl }}" class="btn">Log In Now</a>
                </div>
                
                <p>Thank you for being part of the Hillsider community!</p>
            </div>
            <div class="footer">
                &copy; {{ date('Y') }} HSE-Archive. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
