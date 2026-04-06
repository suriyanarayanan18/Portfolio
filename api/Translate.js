// Vercel Serverless Function: /api/translate
// Translates portfolio text using Gemini 2.0 Flash
// Simple single-task prompt = no thinking leaks

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMMA_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured." });

  try {
    const { texts, targetLang } = req.body;

    if (!texts || !targetLang) {
      return res.status(400).json({ error: "texts array and targetLang required." });
    }

    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: "texts must be a non-empty array." });
    }

    const langNames = {
      ta: "Tamil",
      es: "Spanish"
    };

    const langName = langNames[targetLang];
    if (!langName) return res.status(400).json({ error: "Unsupported language." });

    // Build a single prompt with all texts to translate in one API call
    // This is efficient (1 call instead of 20+) and translation is a clean single-task
    const numberedTexts = texts.map((t, i) => `[${i}] ${t}`).join("\n");

    const prompt = `Translate each numbered line below from English to ${langName}. 
Keep the same numbering format [0], [1], [2] etc.
Translate ONLY the text. Do not add explanations, notes, or commentary.
Keep any technical terms, tool names, and proper nouns in English (like Tableau, Python, SQL, Streamlit, Power BI, Vercel, Codex).

${numberedTexts}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            maxOutputTokens: 4000
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("API error:", response.status, err);
      return res.status(500).json({ error: "Translation failed." });
    }

    const data = await response.json();
    const rawOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse the numbered translations back into an array
    const translated = [];
    const lines = rawOutput.split("\n").filter(l => l.trim());

    for (let i = 0; i < texts.length; i++) {
      // Find the line starting with [i]
      const pattern = new RegExp(`\\[${i}\\]\\s*(.+)`);
      let found = false;
      for (const line of lines) {
        const match = line.match(pattern);
        if (match) {
          translated.push(match[1].trim());
          found = true;
          break;
        }
      }
      if (!found) {
        // Fallback: use original English text
        translated.push(texts[i]);
      }
    }

    return res.status(200).json({ translated, lang: targetLang });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Server error." });
  }
}