<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Models\ContactSubmission; 
use App\Http\Requests\StoreContactRequest;

class ContactController extends Controller
{
    public function submit(StoreContactRequest $request)
    {
        $senderName = $request->name ?? 'Anonymous Guest';

        ContactSubmission::create([
            'name'    => $senderName,
            'email'   => $request->email,
            'subject' => $request->subject ?? 'General Inquiry',
            'message' => $request->message,
            'is_read' => false,
        ]);

        \Illuminate\Support\Facades\Cache::forget('contact_unread_count');

        try {
            $data = [
                'name'         => $senderName,
                'email'        => $request->email,
                'subject'      => $request->subject ?? 'Website Contact',
                'user_message' => $request->message, 
            ];

            $adminEmail = config('mail.from.address') ?? 'admin@localhost.com'; 

            Mail::to($adminEmail)->queue(new \App\Mail\ContactInquiry($data));

        } catch (\Exception $e) {
            \Log::error("Contact Form Mail Error: " . $e->getMessage());
        }

        return response()->json(['message' => 'Message sent successfully!']);
    }

    public function index(Request $request)
    {
        $messages = ContactSubmission::orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));
        return response()->json($messages);
    }

    public function markAsRead($id)
    {
        $message = ContactSubmission::findOrFail($id);
        $message->update(['is_read' => true]);
        
        \Illuminate\Support\Facades\Cache::forget('contact_unread_count');
        
        return response()->json(['message' => 'Marked as read']);
    }

    public function destroy($id)
    {
        $message = ContactSubmission::findOrFail($id);
        $message->delete();

        \Illuminate\Support\Facades\Cache::forget('contact_unread_count');

        return response()->json(['message' => 'Message deleted']);
    }

    public function reply(Request $request, $id)
    {
        $submission = ContactSubmission::findOrFail($id);

        $request->validate([
            'subject' => 'required|string',
            'message' => 'required|string',
        ]);

        try {
            Mail::to($submission->email)->queue(new \App\Mail\ContactReply($request->message, $request->subject));
            
            return response()->json(['message' => 'Reply queued successfully!']);
        } catch (\Exception $e) {
            \Log::error("Mail Error: " . $e->getMessage());
            return response()->json(['message' => 'Failed to queue email.'], 500);
        }
    }

    public function unreadCount()
    {
        $count = \Illuminate\Support\Facades\Cache::remember('contact_unread_count', 60, function () {
            return ContactSubmission::where('is_read', false)->count();
        });
        
        return response()->json(['count' => $count]);
    }
}