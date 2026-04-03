<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #166534; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 1.25rem;">The Hillside Echo</h1>
    </div>
    <div style="border: 1px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="margin-top: 0;">Password Reset Request</h2>
        <p>You are receiving this email because we received a password reset request for your account.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $url }}" 
               style="background: #166534; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Password
            </a>
        </div>
        <p>This password reset link will expire in 60 minutes.</p>
        <p style="color: #6b7280; font-size: 0.875rem;">If you did not request a password reset, no further action is required.</p>
    </div>
</body>
</html>
