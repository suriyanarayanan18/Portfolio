// Vercel Serverless Function: /api/generate
// This runs on Vercel's servers, NOT in the visitor's browser.
// Your API key stays secret here.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS headers so your frontend can call this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Get the API key from Vercel environment variables
  const apiKey = process.env.GEMMA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "API key not configured. Add GEMMA_API_KEY to Vercel environment variables."
    });
  }

  try {
    const { prompt, mode } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    // Call Google AI Studio API (Gemma 4)
    // Using the Gemini API endpoint which serves Gemma 4 models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 500
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemma API error:", errorData);
      return res.status(response.status).json({
        error: "AI generation failed. Please try again.",
        details: errorData
      });
    }

    const data = await response.json();

    // Extract the generated text from Google's response format
    const generatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Could not generate a response. Please try again.";

    return res.status(200).json({ text: generatedText });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}