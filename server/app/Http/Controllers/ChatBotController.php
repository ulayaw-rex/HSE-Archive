<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class ChatBotController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'history' => 'nullable|array', 
        ]);

        $userMessage = $request->input('message');
        $history = $request->input('history', []); 
        $apiKey = env('GEMINI_API_KEY');

        $systemInstruction = <<<EOT
            You are the AI assistant for 'The Hillside Echo', the official student publication of Filamer Christian University.

            YOUR KNOWLEDGE BASE:
            - Purpose: To inform, inspire, and empower within and beyond the Filamerian student body.
            - Location: 2nd Floor Suman Building, Filamer Christian University Inc., Roxas City, Capiz. Near FCU Student Republic and The Filamerian office.
            - Office Hours: Monday to Friday, 9:00 AM – 5:00 PM.
            - Editors/Staff: Info is on the 'About Us' page.
            - Submitting Articles: Must be a bona fide FCU student and part of the Hillside Echo. Register on the website > Profile > 'Submit Article'. Review takes ~1 week.
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
        EOT;

        $contents = [];

        foreach ($history as $chat) {
            $role = ($chat['role'] === 'bot' || $chat['role'] === 'assistant') ? 'model' : 'user';
            
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $chat['text']]]
            ];
        }

        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userMessage]]
        ];

        $model = 'gemini-flash-latest'; 
        $client = new Client();

        try {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

            $response = $client->post($url, [
                'headers' => ['Content-Type' => 'application/json'],
                'json' => [
                    'systemInstruction' => [
                        'parts' => [['text' => $systemInstruction]]
                    ],
                    'contents' => $contents,
                    'generationConfig' => [
                        'temperature' => 0.3, 
                        'maxOutputTokens' => 1000,
                    ]
                ],
                'verify' => false, 
            ]);

            $body = json_decode($response->getBody()->getContents(), true);
            
            $botReply = $body['candidates'][0]['content']['parts'][0]['text'] ?? "I'm having trouble connecting to the server.";

            return response()->json(['reply' => $botReply]);

        } catch (\Exception $e) {
            Log::error("Gemini Chat Error: " . $e->getMessage());
            return response()->json(['reply' => "I'm currently unavailable. Please try again later."], 500);
        }
    }
}