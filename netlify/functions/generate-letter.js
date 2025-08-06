const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  console.log("🔁 Function triggered");

  try {
    // Log the incoming event
    console.log("📦 Incoming event body:", event.body);

    // Parse the request body
    const { prompt } = JSON.parse(event.body);
    console.log("🧠 Prompt received:", prompt);

    // Get the Gemini API key from the environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing GEMINI_API_KEY environment variable");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server misconfiguration: missing API key' }),
      };
    }

    // Make the request to Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    console.log("📨 Response from Gemini API:", data);

    if (response.ok && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const letter = data.candidates[0].content.parts[0].text;
      return {
        statusCode: 200,
        body: JSON.stringify({ letter }),
      };
    } else {
      console.error("⚠️ Gemini API returned an unexpected response:", data);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to generate letter from Gemini' }),
      };
    }
  } catch (error) {
    console.error("🔥 Error caught in function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
