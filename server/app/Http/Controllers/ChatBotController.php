<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;

class ChatBotController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $userMessage = $request->input('message');
        $apiKey = env('GEMINI_API_KEY');

        $systemContext = "You are the AI assistant for 'The Hillside Echo', the official student publication of Filamer Christian University.

        YOUR KNOWLEDGE BASE:
        - Purpose: To inform, inspire, and empower within and beyond the Filamerian student body.
        - Location: 2nd Floor Suman Building, Filamer Christian University Inc., Roxas City, Capiz. Near FCU Student Republic and The Filamerian office.
        - Office Hours: Monday to Friday, 9:00 AM – 5:00 PM.
        - Editors/Staff: Info is on the 'About Us' page.
        - Submitting Articles: Must be a bona fide FCU student. Register on the website > Profile > 'Submit Article'. Review takes ~1 week.
        - Feedback: Scroll down to the 'Reach out to us' section on the website.
        - Joining: Apply during recruitment week (announced on FB: facebook.com/thehillsidecho).
        - Collaboration: Email thehillsideecho@gmail.com or message the FB page.
        - Event Coverage Request: Email thehillsideecho@gmail.com at least 2 days prior. Include: Contact Person, FB Link, Event Name, Short Desc, Org, Date/Time. Depends on staff availability.
        - Urgent Coverage (<48 hrs): Message the Facebook page directly with the event details.
        - Founding Date: No confirmed year. Earliest documented article: Sept 1956 by Joel M. Panadro.

        STRICT RULES:
        1. Answer ONLY questions related to The Hillside Echo, the website, journalism, or campus events/processes mentioned above.
        2. If the user asks about homework, math, or general topics, politely REFUSE. Say: 'I can only answer questions about The Hillside Echo or our website.'
        3. Keep answers concise (under 3 sentences).
        4. Be friendly and professional.

        User Question: $userMessage";

        $model = 'gemini-flash-latest';

        $client = new Client();

        try {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

            $response = $client->post($url, [
                'headers' => ['Content-Type' => 'application/json'],
                'query' => ['key' => $apiKey],
                'json' => [
                    'contents' => [['parts' => [['text' => $systemContext]]]]
                ],
                'verify' => false,
            ]);

            $body = json_decode($response->getBody()->getContents(), true);
            $botReply = $body['candidates'][0]['content']['parts'][0]['text'] ?? "I'm having trouble thinking right now.";
            
            return response()->json(['reply' => $botReply]);

        } catch (\Exception $e) {
            \Log::error("Gemini API Error: " . $e->getMessage());
            
            if (str_contains($e->getMessage(), '429')) {
                return response()->json([
                    'reply' => "I'm getting too many questions right now! Please wait a moment."
                ], 200);
            }

            return response()->json([
                'reply' => "I'm sorry, I can't connect right now. (Debug: " . $e->getCode() . ")"
            ], 200);
        }
    }
}