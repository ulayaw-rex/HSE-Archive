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
            'email'   => 'required|email:rfc,dns',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|min:5',
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

            Mail::send('emails.contact', $data, function($message) use ($request, $senderName) {
                $message->to(env('MAIL_FROM_ADDRESS')) 
                        ->subject('New Inquiry: ' . ($request->subject ?? 'Website Contact'));
                
                $message->replyTo($request->email, $senderName); 
            });
        } catch (\Exception $e) {
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
}