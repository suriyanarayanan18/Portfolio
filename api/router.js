const MODEL = "gemma-4-31b-it";

const ALLOWED_ACTIONS = new Set([
  "open_project_link",
  "explain_project",
  "filter_projects",
  "open_resume",
  "unknown"
]);

const ALLOWED_PROJECTS = new Set([
  "airline",
  "instacart",
  "moviematch",
  "f1",
  "underarmour",
  "erm",
  "petalpost",
  "royaltease",
  "energy",
  "streaming",
  "mindreading"
]);

const ALLOWED_ROLES = new Set([
  "recruiter",
  "data_scientist",
  "hiring_manager",
  "pm"
]);

function safeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRouterOutput(obj) {
  const action = safeString(obj?.action);
  const projectId = safeString(obj?.projectId);
  const role = safeString(obj?.role);
  const tag = safeString(obj?.tag);

  return {
    action: ALLOWED_ACTIONS.has(action) ? action : "unknown",
    projectId: ALLOWED_PROJECTS.has(projectId) ? projectId : "",
    role: ALLOWED_ROLES.has(role) ? role : "",
    tag
  };
}

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
    return res.status(500).json({
      error: "API key not configured."
    });
  }

  try {
    const { query } = req.body || {};
    const userQuery = safeString(query);

    if (!userQuery) {
      return res.status(400).json({ error: "query required." });
    }

    const requestBody = {
      system_instruction: {
        parts: [
          {
            text: [
              "You are a portfolio action router for Suriya Narayanan's website.",
              "Return JSON only.",
              "Do not explain your reasoning.",
              "Choose exactly one action.",
              "",
              "Allowed actions:",
              '1. {"action":"open_project_link","projectId":"..."}',
              '2. {"action":"explain_project","projectId":"...","role":"recruiter|data_scientist|hiring_manager|pm"}',
              '3. {"action":"filter_projects","tag":"..."}',
              '4. {"action":"open_resume"}',
              '5. {"action":"unknown"}',
              "",
              "Allowed projectId values:",
              "airline, instacart, moviematch, f1, underarmour, erm, petalpost, royaltease, energy, streaming, mindreading",
              "",
              "Examples:",
              '"open the F1 project" -> open_project_link f1',
              '"show Tableau work" -> filter_projects Tableau',
              '"explain the airline project for a recruiter" -> explain_project airline recruiter',
              '"download resume" -> open_resume',
              "",
              "Rules:",
              "- Prefer open_project_link when the user clearly wants to visit or open a project.",
              "- Prefer explain_project when the user asks to explain, summarize, or describe a project.",
              "- Prefer filter_projects when the user asks to show projects by skill/tool/topic.",
              "- If role is not specified for explain_project, default to recruiter.",
              "- If none apply, return unknown."
            ].join("\n")
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userQuery }]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 120,
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: [
                "open_project_link",
                "explain_project",
                "filter_projects",
                "open_resume",
                "unknown"
              ]
            },
            projectId: { type: "string" },
            role: {
              type: "string",
              enum: ["recruiter", "data_scientist", "hiring_manager", "pm"]
            },
            tag: { type: "string" }
          },
          required: ["action"]
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
        error: "Router output was not valid JSON.",
        details: rawText.slice(0, 1200)
      });
    }

    return res.status(200).json(normalizeRouterOutput(parsed));
  } catch (error) {
    return res.status(500).json({
      error: "Server error.",
      details: String(error?.message || error)
    });
  }
};