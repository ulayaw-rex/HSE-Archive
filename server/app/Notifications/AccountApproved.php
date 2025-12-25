<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountApproved extends Notification
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->subject('Welcome to HSE-Archive! Account Approved')
                    ->greeting('Hello ' . $notifiable->name . '!')
                    ->line('Great news! Your account has been reviewed and approved by our administrator.')
                    ->line('You can now log in and access all features.')
                    ->action('Log In Now', url('/')) 
                    ->line('Thank you for being part of the Hillsider community!');
    }
}