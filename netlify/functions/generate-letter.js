import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { config } from 'dotenv';
import { fetch } from 'undici';

config(); // Load environment variables from .env

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("API error:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error || 'API Error' })
      };
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';

    return {
      statusCode: 200,
      body: JSON.stringify({ result: resultText })
    };

  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error', details: err.message })
    };
  }
}
