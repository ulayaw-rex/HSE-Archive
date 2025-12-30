<!DOCTYPE html>
<html>
<head>
    <title>New Website Inquiry</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">

    <h2 style="color: #166534;">New Message Received</h2>
    
    <p>You have received a new message from the <strong>HSE-Website Contact Form</strong>.</p>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>From:</strong> {{ $email }}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">{{ $user_message }}</p>
    </div>

    <p style="font-size: 12px; color: #888;">
        You can reply directly to this email to contact the sender.
    </p>

</body>
</html>