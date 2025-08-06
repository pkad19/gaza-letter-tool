{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // Netlify Function: generate-letter.js\
// This calls Google Gemini API (Generative Language API) to generate a letter\
\
// In Node 18+ on Netlify, fetch is built in \'97 no need for node-fetch\
exports.handler = async (event) => \{\
  try \{\
    // Ensure it's a POST request\
    if (event.httpMethod !== "POST") \{\
      return \{\
        statusCode: 405,\
        body: JSON.stringify(\{ error: "Method Not Allowed" \}),\
      \};\
    \}\
\
    // Parse the request body\
    const \{ prompt \} = JSON.parse(event.body || "\{\}");\
    if (!prompt) \{\
      return \{\
        statusCode: 400,\
        body: JSON.stringify(\{ error: "Missing 'prompt' in request body" \}),\
      \};\
    \}\
\
    // Load API key from Netlify environment variable\
    const apiKey = process.env.GEMINI_API_KEY;\
    if (!apiKey) \{\
      return \{\
        statusCode: 500,\
        body: JSON.stringify(\{ error: "Server misconfiguration: API key missing" \}),\
      \};\
    \}\
\
    // Google Gemini stable model endpoint\
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$\{apiKey\}`;\
\
    // Build the payload for the API\
    const payload = \{\
      contents: [\
        \{\
          role: "user",\
          parts: [\{ text: prompt \}],\
        \},\
      ],\
    \};\
\
    // Send request to Google Gemini\
    const response = await fetch(apiUrl, \{\
      method: "POST",\
      headers: \{ "Content-Type": "application/json" \},\
      body: JSON.stringify(payload),\
    \});\
\
    if (!response.ok) \{\
      const errText = await response.text();\
      return \{\
        statusCode: response.status,\
        body: JSON.stringify(\{\
          error: "Error from Gemini API",\
          details: errText,\
        \}),\
      \};\
    \}\
\
    // Parse Gemini API response\
    const data = await response.json();\
\
    // Return the API's JSON to the frontend\
    return \{\
      statusCode: 200,\
      body: JSON.stringify(data),\
    \};\
  \} catch (err) \{\
    console.error("Function error:", err);\
    return \{\
      statusCode: 500,\
      body: JSON.stringify(\{ error: "Server error", details: err.message \}),\
    \};\
  \}\
\};\
}