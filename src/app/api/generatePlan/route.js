import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request) {
    try {
        const { subject, areasToImprove, time, standard } = await request.json();
        
        const prompt = `Create a comprehensive study plan for a student in ${standard} focusing on ${subject} . The areas to improve are: ${areasToImprove}. Allocate ${time} for studying.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json()
            console.error("Error fetching data", errorData)
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json();
        const studyPlan = data.candidates[0].content.parts[0].text;

        return NextResponse.json({ studyPlan });
    } catch (error) {
        console.error("Error processing the request", error)
        return NextResponse.json({ error: error.message}, {status: 500})
    }
}