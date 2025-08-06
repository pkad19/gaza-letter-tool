const { Readable } = require('stream');
const { request } = require('undici');
require('dotenv').config();

exports.handler = async (event, context) => {
  try {
    const { prompt } = JSON.parse(event.body || '{}');

    if (!prompt || prompt.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required.' }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const response = await request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: Readable.from([JSON.stringify(payload)]),
    });

    const { statusCode, body } = response;

    if (statusCode !== 200) {
      const text = await body.text();
      console.error('API response error:', text);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to generate letter.' }),
      };
    }

    const json = await body.json();
    const generatedText = json.candidates?.[0]?.content?.parts?.[0]?.text;

    return {
      statusCode: 200,
      body: JSON.stringify({ text: generatedText || 'No content returned from API.' }),
    };
  } catch (error) {
    console.error('Unhandled error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error occurred.' }),
    };
  }
};
