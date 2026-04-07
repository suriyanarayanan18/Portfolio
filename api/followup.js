const MODEL = "gemini-2.5-flash";

const PROJECT_CONTEXT = {
  airline: {
    title: "Airline Delay Analysis",
    tools: "Tableau, calculated fields, parameter-driven filters",
    problem:
      "Operational flight delay data needed to be shaped into a story-driven dashboard for operations teams.",
    approach:
      "Created interactive Tableau story points and calculated fields to compare delay categories, airports, and seasonal patterns for root-cause analysis.",
    outcome:
      "A decision-focused dashboard that surfaces airport-level performance and seasonal trends for stakeholders.",
    audience: "Operations teams and business stakeholders",
    challenges:
      "Noisy operational data and multiple delay categories required careful aggregation and interpretation.",
    keyMetrics: "Airport-level comparisons and seasonal trend views"
  },
  instacart: {
    title: "Instacart Analysis",
    tools: "Tableau, data visualization, customer segmentation",
    problem:
      "Understand reorder behavior and basket composition across millions of orders to inform product and growth decisions.",
    approach:
      "Analyzed 3M+ grocery orders, built dashboards for reorder trends, department-level patterns, and customer segments.",
    outcome:
      "Actionable insights for merchandising and targeting, including stronger reorder performance in organic categories.",
    audience: "Product and growth teams",
    challenges:
      "Working at scale while separating meaningful customer behavior patterns from noise.",
    keyMetrics: "3M+ orders; organic products showed stronger reorder performance"
  },
  moviematch: {
    title: "MovieMatch - AI Recommender",
    tools: "Python, Streamlit, collaborative filtering, cosine similarity",
    problem:
      "Deliver real-time movie recommendations with reasonable accuracy and cold-start handling.",
    approach:
      "Built user-user and item-item collaborative filtering with cosine similarity and fallback popularity logic, then deployed it in Streamlit.",
    outcome:
      "An interactive recommender that demonstrates applied machine learning and product thinking.",
    audience: "Product and engineering reviewers",
    challenges:
      "Cold-start user scenarios and making recommendations feel responsive in a live interface.",
    keyMetrics: "Real-time recommendations with fallback handling"
  },
  f1: {
    title: "F1 Data Intelligence Report",
    tools: "JavaScript, Ergast API, OpenF1 API, Vercel",
    problem:
      "Turn racing telemetry and race data into an explorable analytics product.",
    approach:
      "Combined external race APIs into an interactive experience for performance comparisons, strategy views, and historical analysis.",
    outcome:
      "A live analytical experience for race comparisons and strategy insights.",
    audience: "Sports analytics and product audiences",
    challenges:
      "Shaping multiple data sources into a coherent and interactive flow.",
    keyMetrics: "Live race-data driven comparisons and strategy analysis"
  },
  underarmour: {
    title: "Under Armour Strategic Transformation",
    tools: "Strategy, analytics roadmap, risk assessment",
    problem:
      "Map analytics opportunities to product and operational transformation.",
    approach:
      "Framed strategic opportunities and phased rollouts from data foundations to athlete experiences.",
    outcome:
      "A roadmap of analytics-driven opportunities tied to product and operational value.",
    audience: "Leadership and strategy teams",
    challenges:
      "Balancing broad strategic ambition with phased adoption and execution realism.",
    keyMetrics: "Phased transformation roadmap"
  },
  erm: {
    title: "ERM - Dairy Manufacturing",
    tools: "Risk frameworks, scoring, governance design",
    problem:
      "Create a usable enterprise risk framework across domains for a dairy manufacturer.",
    approach:
      "Designed seven risk domains, scoring, and lightweight governance for repeatable monitoring.",
    outcome:
      "A governance-ready ERM approach for operational teams.",
    audience: "Risk and operations stakeholders",
    challenges:
      "Balancing completeness with usability in a practical operating environment.",
    keyMetrics: "Seven structured risk domains"
  },
  petalpost: {
    title: "Petal Post - Plant Delivery System",
    tools: "SQL Server, Power Pages, stored procedures",
    problem:
      "Design a transactional backend for an e-commerce plant delivery product.",
    approach:
      "Created a normalized database design, stored procedures, and a Power Pages frontend.",
    outcome:
      "A structured database-backed order and inventory system.",
    audience: "Engineering and product reviewers",
    challenges:
      "Maintaining operational data integrity across orders and inventory flows.",
    keyMetrics: "Database-backed order and inventory workflow"
  },
  royaltease: {
    title: "RoyaltEase - DRM System",
    tools: "Systems design, DFDs, ER modeling",
    problem:
      "Automate usage tracking and royalty calculations with clearer auditability.",
    approach:
      "Designed data flows, royalty calculation logic, and auditable workflows.",
    outcome:
      "A concept for traceable royalty management and secure payment logic.",
    audience: "Product and business teams",
    challenges:
      "Ensuring traceability across rights, usage, and payment relationships.",
    keyMetrics: "Auditable royalty workflow concept"
  },
  energy: {
    title: "Energy Consumption Prediction",
    tools: "R, CART, linear regression, feature engineering",
    problem:
      "Predict household energy consumption for efficiency insights.",
    approach:
      "Compared CART and linear regression using engineered features from building and weather variables.",
    outcome:
      "Practical predictive models and energy-efficiency recommendations.",
    audience: "Energy analysts and data reviewers",
    challenges:
      "Feature quality and translating environmental variables into useful predictors.",
    keyMetrics: "Model comparison across CART and regression"
  },
  streaming: {
    title: "Netflix vs Prime - EDA",
    tools: "Python, pandas, matplotlib, EDA",
    problem:
      "Compare user behavior across streaming platforms.",
    approach:
      "Standardized datasets and conducted comparative exploratory analysis across demographics, subscriptions, and engagement.",
    outcome:
      "Insights into behavioral and platform differences across streaming services.",
    audience: "Research and product audiences",
    challenges:
      "Aligning two datasets so comparisons stayed meaningful.",
    keyMetrics: "Comparative cross-platform behavior analysis"
  },
  mindreading: {
    title: "The Mind-Reading Illusion",
    tools: "Responsible AI, governance analysis, research methodology",
    problem:
      "Understand how micro-signals shape recommendations and what that means for transparency and privacy.",
    approach:
      "Used interaction experiments and governance analysis to explore recommendation inference and disclosure gaps.",
    outcome:
      "A clearer framing of recommendation-system opacity and responsible AI implications.",
    audience: "Responsible AI and policy audiences",
    challenges:
      "Discussing subtle behavioral inference without overstating what can be proven.",
    keyMetrics: "Governance-focused analysis of recommendation signals"
  }
};

function cleanJsonText(text) {
  return String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function shortenAnswer(text) {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const sentences = cleaned.match(/[^.!?]+[.!?]*/g) || [cleaned];
  return sentences.slice(0, 3).join(" ").trim();
}

function buildPrompt(ctx, role, question) {
  return [
    "You answer follow-up questions about a portfolio project.",
    "Use only the project context provided below.",
    "Do not invent facts.",
    "Answer in 2 to 3 sentences maximum.",
    "Use a professional tone.",
    "Do not use bullets or headings.",
    "If the question cannot be answered from the provided context, say that briefly and honestly.",
    "",
    `Role: ${role}`,
    `Question: ${question.trim()}`,
    "",
    "Project context:",
    JSON.stringify(ctx, null, 2)
  ].join("\n");
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
    process.env.GOOGLE_API_KEY ||
    process.env.GEMMA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured." });
  }

  try {
    const { projectId, role, question } = req.body || {};

    if (!projectId || !role || !question) {
      return res.status(400).json({
        error: "projectId, role and question required."
      });
    }

    const ctx = PROJECT_CONTEXT[projectId];
    if (!ctx) {
      return res.status(400).json({ error: "Unknown project." });
    }

    const prompt = buildPrompt(ctx, role, question);

    const googleRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            topP: 0.9,
            maxOutputTokens: 180,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                answer: {
                  type: "STRING"
                }
              },
              required: ["answer"]
            }
          }
        })
      }
    );

    const raw = await googleRes.text();

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        error: "Model returned non-JSON.",
        details: raw.slice(0, 1000)
      });
    }

    if (!googleRes.ok) {
      return res.status(googleRes.status).json({
        error: data?.error?.message || `Model error (${googleRes.status})`,
        details: JSON.stringify(data).slice(0, 1200)
      });
    }

    const modelText =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n") || "";

    let answer = "";
    try {
      const parsed = JSON.parse(cleanJsonText(modelText));
      answer = typeof parsed.answer === "string" ? parsed.answer.trim() : "";
    } catch {
      answer = "";
    }

    if (!answer) {
      return res.status(200).json({
        answer: "I can’t answer that confidently from the saved project context."
      });
    }

    return res.status(200).json({
      answer: shortenAnswer(answer)
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error.",
      details: String(error?.message || error)
    });
  }
};