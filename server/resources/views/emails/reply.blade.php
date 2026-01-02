<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Response from The Hillside Echo</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            color: #374151;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
        }
        .header {
            background-color: #15803d; 
            padding: 24px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 0.5px;
        }
        .content {
            padding: 32px 24px;
            background-color: #ffffff;
            color: #1f2937;
        }
        .message-box {
            white-space: pre-wrap; 
            font-size: 16px;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .footer a {
            color: #15803d;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>The Hillside Echo</h1>
        </div>

        <div class="content">
            <div class="message-box">
{!! nl2br(e($replyMessage)) !!}
            </div>
            
            <p style="margin-top: 30px; font-style: italic; color: #6b7280; font-size: 14px;">
                Best regards,<br>
                <strong>The Hillside Echo Team</strong>
            </p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} The Hillside Echo. All rights reserved.</p>
            <p>
                Filamer Christian University<br>
                Roxas City, Capiz, Philippines
            </p>
            <p style="margin-top: 10px;">
                <a href="{{ url('/') }}">Visit our Website</a>
            </p>
        </div>
    </div>
</body>
</html>