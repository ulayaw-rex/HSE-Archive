<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use App\Models\Publication;

class ArticleStatusNotification extends Notification
{
    use Queueable;

    public $publication;
    public $action;
    public $message;

    /**
     * Create a new notification instance.
     */
    public function __construct(Publication $publication, string $action, string $message)
    {
        $this->publication = $publication;
        $this->action = $action;
        $this->message = $message;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'publication_id' => $this->publication->publication_id,
            'title' => $this->publication->title,
            'action' => $this->action,
            'message' => $this->message,
        ];
    }
}
