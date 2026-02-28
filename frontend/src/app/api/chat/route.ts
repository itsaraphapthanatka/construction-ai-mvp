import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // The OpenClaw API Endpoint running on the user's server
        const OPENCLAW_URL = 'http://136.110.50.115:18789/v1/chat/completions';

        const response = await fetch(OPENCLAW_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Pass the OpenAI-compatible payload straight through
            body: JSON.stringify({
                model: body.model || "kimi 2.5", // Defaulting to the model requested in previous configs
                messages: body.messages,
                temperature: body.temperature || 0.7,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenClaw error:", errorText);
            return NextResponse.json({ error: "Failed to connect to AI engine" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Chat Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
