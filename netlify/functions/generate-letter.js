import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { config } from 'dotenv';
import { fetch } from 'undici';

config();

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('API response error:', data);
      return res.status(500).json({ error: 'Failed to generate letter', detail: data });
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content returned';

    return res.status(200).json({ letter: generatedText });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
};
