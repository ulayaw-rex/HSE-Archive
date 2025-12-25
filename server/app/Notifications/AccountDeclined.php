<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountDeclined extends Notification
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
                    ->subject('Update regarding your HSE-Archive Registration')
                    ->greeting('Hello ' . $notifiable->name . ',')
                    ->error() 
                    ->line('We regret to inform you that your registration request for HSE-Archive has been declined.')
                    ->line('This may be due to unverified alumni status or incomplete information provided.')
                    ->line('If you believe this is a mistake, please contact the administration or try registering again with correct details.')
                    ->line('Thank you.');
    }
}