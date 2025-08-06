const { fetch } = require('undici'); // Replaces node-fetch
require('dotenv').config();

exports.handler = async (event, context) => {
  try {
    const { prompt } = JSON.parse(event.body || '{}');

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing prompt in request body' }),
      };
    }

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Please write a polite and professionally formatted letter to a UK Member of Parliament using this prompt as the core message:\n\n${prompt}`,
            },
          ],
        },
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response error:', errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch from Gemini API' }),
      };
    }

    const data = await response.json();

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated.';

    return {
      statusCode: 200,
      body: JSON.stringify({ letter: text }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error generating letter' }),
    };
  }
};
