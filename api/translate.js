const MODEL = "gemma-4-31b-it";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GEMMA_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured." });
  }

  try {
    const { texts, targetLang } = req.body || {};

    if (!Array.isArray(texts) || !texts.length || typeof targetLang !== "string") {
      return res.status(400).json({
        error: "texts array and targetLang are required."
      });
    }

    const safeTexts = texts.map((t) => String(t || "")).slice(0, 250);

    const requestBody = {
      system_instruction: {
        parts: [
          {
            text: [
              "You are a translation engine for a portfolio website.",
              "Translate each input string into the requested target language.",
              "Return JSON only.",
              "Do not explain anything.",
              "Keep tone professional and natural.",
              "Preserve line breaks where reasonable.",
              "Do not translate proper nouns or brand names unless natural usage clearly requires it.",
              "Keep names like Suriya Narayanan, Tableau, Power BI, SQL, Python, GitHub, LinkedIn, Syracuse University unchanged when appropriate."
            ].join(" ")
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: JSON.stringify({
                targetLang,
                texts: safeTexts
              })
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4000,
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          properties: {
            translated: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["translated"]
        }
      }
    };

    const googleRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify(requestBody)
      }
    );

    const raw = await googleRes.text();

    let apiData;
    try {
      apiData = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        error: "Gemma returned non-JSON.",
        details: raw.slice(0, 1200)
      });
    }

    if (!googleRes.ok) {
      return res.status(googleRes.status).json({
        error: apiData?.error?.message || `Gemma API error (${googleRes.status})`,
        details: JSON.stringify(apiData).slice(0, 1200)
      });
    }

    const rawText =
      apiData?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return res.status(500).json({
        error: "Translation output was not valid JSON.",
        details: rawText.slice(0, 1200)
      });
    }

    const translated = Array.isArray(parsed.translated) ? parsed.translated : [];

    return res.status(200).json({
      translated: safeTexts.map((t, i) => translated[i] || t)
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error.",
      details: String(error?.message || error)
    });
  }
};