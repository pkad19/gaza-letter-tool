import { config as dotenvConfig } from 'dotenv';
import { fetch } from 'undici';

// Load environment variables from the .env file
dotenvConfig();

export default async function handler(req, res) {
  try {
    // Ensure this is a POST request
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt in request body' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not defined in the environment variables.');
      return res.status(500).json({ error: 'Internal Server Error: Missing API Key' });
    }

    // Make request to Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error('Gemini API returned an error:', errorDetails);
      return res.status(500).json({ error: 'Failed to generate content' });
    }

    const data = await response.json();

    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';
    return res.status(200).json({ text: generatedText });

  } catch (error) {
    console.error('Unhandled error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
