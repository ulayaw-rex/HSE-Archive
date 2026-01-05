<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use App\Models\ContactSubmission; 

class ContactController extends Controller
{
    public function submit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'    => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|min:5',
            
            'email'   => [
                'required',
                'email:rfc,dns',
                
                function ($attribute, $value, $fail) {
                    $blockedDomains = [
                        'tempmail.com', '10minutemail.com', 'mailinator.com', 
                        'throwawaymail.com', 'yopmail.com', 'guerrillamail.com'
                    ];
                    
                    $domain = substr(strrchr($value, "@"), 1);
                    if (in_array($domain, $blockedDomains)) {
                        $fail('Please use a permanent email address.');
                    }
                },
            ],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $senderName = $request->name ?? 'Anonymous Guest';

        ContactSubmission::create([
            'name'    => $senderName,
            'email'   => $request->email,
            'subject' => $request->subject ?? 'General Inquiry',
            'message' => $request->message,
            'is_read' => false,
        ]);

        try {
            $data = [
                'name'         => $senderName,
                'email'        => $request->email,
                'subject'      => $request->subject,
                'user_message' => $request->message, 
            ];

            $adminEmail = config('mail.from.address') ?? 'admin@localhost.com'; 

            Mail::send('emails.contact', $data, function($message) use ($request, $senderName, $adminEmail) {
                $message->to($adminEmail) 
                        ->subject('New Inquiry: ' . ($request->subject ?? 'Website Contact'));
                
                $message->replyTo($request->email, $senderName); 
            });
        } catch (\Exception $e) {
            \Log::error("Contact Form Mail Error: " . $e->getMessage());
        }

        return response()->json(['message' => 'Message sent successfully!']);
    }

    public function index()
    {
        $messages = ContactSubmission::orderBy('created_at', 'desc')->get();
        return response()->json($messages);
    }

    public function markAsRead($id)
    {
        $message = ContactSubmission::findOrFail($id);
        $message->update(['is_read' => true]);
        return response()->json(['message' => 'Marked as read']);
    }

    public function destroy($id)
    {
        $message = ContactSubmission::findOrFail($id);
        $message->delete();
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
            Mail::send('emails.reply', ['replyMessage' => $request->message], function ($message) use ($submission, $request) {
                $message->to($submission->email)
                        ->subject($request->subject);
            });
            
            return response()->json(['message' => 'Reply sent successfully!']);
        } catch (\Exception $e) {
            \Log::error("Mail Error: " . $e->getMessage());
            return response()->json(['message' => 'Failed to send email. Check logs.'], 500);
        }
    }

    public function unreadCount()
    {
        $count = ContactSubmission::where('is_read', false)->count();
        return response()->json(['count' => $count]);
    }
}