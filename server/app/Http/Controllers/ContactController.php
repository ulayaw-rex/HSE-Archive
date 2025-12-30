<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    public function submit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email:rfc,dns',
            'message' => 'required|string|min:5',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = [
            'email' => $request->email,
            'user_message' => $request->message, 
        ];

        Mail::send('emails.contact', $data, function($message) use ($request) {
            $message->to(env('MAIL_FROM_ADDRESS')) 
                    ->subject('New Inquiry / Tip from Website');
            
            $message->replyTo($request->email); 
        });

        return response()->json(['message' => 'Email sent successfully!']);
    }
}