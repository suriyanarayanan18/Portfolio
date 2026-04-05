// Vercel Serverless Function: /api/generate
// Proxies to Google AI Studio, extracts ONLY the final clean paragraph

const PROJECTS = {
  airline: {
    title: "Airline Delay Analysis",
    tech: "Tableau, calculated fields, parameter-driven filters, story points",
    summary: "Interactive Tableau dashboard analyzing US flight delay patterns. Explored delay causes (weather, carrier, NAS, security, late aircraft), airport performance comparisons, seasonal trends. Story points guide viewers from trends to root causes. Built for operations teams."
  },
  instacart: {
    title: "Instacart Analysis",
    tech: "Tableau, data visualization, customer segmentation",
    summary: "Analyzed 3M+ grocery orders for shopping patterns, reorder behavior, product affinities. Dashboards: peak ordering hours, department reorder rates, basket composition, customer segmentation. Organic products had 15% higher reorder rates. For product and growth teams."
  },
  moviematch: {
    title: "MovieMatch - AI Movie Recommender",
    tech: "Python, Streamlit, scikit-learn, cosine similarity, collaborative filtering",
    summary: "Recommendation engine using collaborative filtering (user-user and item-item cosine similarity). Streamlit app with auth, preference capture, real-time recommendations. Cold-start fallback to popularity-based. Session state management."
  },
  f1: {
    title: "F1 Data Intelligence Report",
    tech: "JavaScript, Ergast API, OpenF1 API, Codex, Vercel",
    summary: "F1 analytics platform using Ergast/OpenF1 APIs. Driver comparisons, qualifying vs race pace, pit strategy, historical trends. AI-assisted code generation. Live on Vercel."
  },
  underarmour: {
    title: "Under Armour Strategic Transformation",
    tech: "Strategic planning, analytics roadmap, risk assessment",
    summary: "Transformation roadmap: personalized athlete performance, sustainable manufacturing (DfM), smart training ecosystems. Phased rollout. Risk mitigation for data integration, supply volatility, tech adoption."
  },
  erm: {
    title: "ERM for Vighnaharta Food",
    tech: "Risk frameworks, quantitative scoring, governance design",
    summary: "ERM framework for dairy manufacturer. 7 risk domains. Quantitative threat scoring. Lightweight governance: risk champion, shared log, meeting moments, visual dashboards."
  },
  petalpost: {
    title: "Petal Post Plant Delivery System",
    tech: "SQL Server, Azure Data Studio, Power Pages, stored procedures",
    summary: "Plant e-commerce database. Power Pages frontend, SQL backend. Normalized entities, foreign keys, indexing. Stored procedures for orders and inventory."
  },
  royaltease: {
    title: "RoyaltEase Digital Rights Management",
    tech: "Systems design, DFDs, ER modeling",
    summary: "Digital rights/royalty platform. Automated royalty calculation, usage tracking, secure payments. Context diagrams, multi-level DFDs. Auditable distribution."
  },
  energy: {
    title: "Prediction of Energy Consumption",
    tech: "R, CART, linear regression, feature engineering",
    summary: "Predictive models for household energy using building and weather variables. Feature engineering. CART vs linear regression comparison. Energy efficiency recommendations."
  },
  streaming: {
    title: "Netflix vs Prime User Behavior",
    tech: "Python, pandas, matplotlib, EDA",
    summary: "Comparative streaming analysis. Standardized two datasets. Demographics, subscriptions, device engagement. Age-based platform preferences. Reproducible workflow."
  },
  mindreading: {
    title: "The Mind-Reading Illusion",
    tech: "Research methodology, platform analysis, responsible AI",
    summary: "How micro-signals (dwell time, pauses, social graph) reshape recommendations silently. Interaction experiments. Platform disclosure gaps. AI governance implications."
  }
};

const ROLE_LABELS = {
  recruiter: "Recruiter",
  data_scientist: "Data Scientist",
  hiring_manager: "Hiring Manager",
  pm: "Product Manager"
};

// Minimal, direct prompts that give the model no room to reason out loud
function buildPrompt(project, role, followupQuestion) {
  const roleFraming = {
    recruiter: "for a recruiter, emphasizing measurable outcomes, specific technical skills, and relevance to Data Analyst and Business Analyst roles",
    data_scientist: "for a data scientist, emphasizing methodology, algorithms, data pipeline decisions, and technical tradeoffs",
    hiring_manager: "for a hiring manager, emphasizing the business problem identified, how work was scoped, key decisions, and what the deliverable enabled",
    pm: "for a product manager, emphasizing user/business impact, insight-to-action pipeline, and decision enablement"
  };

  if (followupQuestion) {
    return `I am Suriya Narayanan. Someone asked me "${followupQuestion}" about my project "${project.title}" (${project.tech}). ${project.summary}

My answer in 2-3 sentences:`;
  }

  return `I am Suriya Narayanan. Write a 3-4 sentence paragraph describing my project ${roleFraming[role]}. Do not start with "I built" or "I created".

Project: ${project.title}. Tech: ${project.tech}. What I did: ${project.summary}

My description:`;
}

// Extract only the final clean paragraph from potentially messy output
function extractFinalParagraph(raw) {
  if (!raw) return "";

  // Strategy: Gemma often outputs reasoning then the final answer.
  // The final answer is usually the last block of continuous prose
  // that doesn't contain reasoning markers.

  let text = raw;

  // Remove common thinking markers and everything before them
  const thinkingMarkers = [
    /[\s\S]*?(?:My description:|My answer[^:]*:)\s*/i,
    /[\s\S]*?(?:Here is the paragraph:|Here's the paragraph:)\s*/i,
    /[\s\S]*?(?:Final version:|Final paragraph:|Final answer:)\s*/i,
    /[\s\S]*?(?:Output:)\s*/i
  ];

  for (const marker of thinkingMarkers) {
    const match = text.match(marker);
    if (match) {
      text = text.slice(match[0].length);
    }
  }

  // Split into paragraphs (blocks separated by double newlines)
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Filter out paragraphs that are clearly reasoning
  const cleanParagraphs = paragraphs.filter(p => {
    const lower = p.toLowerCase();
    // Skip if it starts with reasoning indicators
    if (lower.startsWith('*')) return false;
    if (lower.startsWith('- ')) return false;
    if (lower.startsWith('check')) return false;
    if (lower.startsWith('constraint')) return false;
    if (lower.startsWith('let me')) return false;
    if (lower.startsWith('okay')) return false;
    if (lower.startsWith('here is')) return false;
    if (lower.startsWith('here\'s')) return false;
    if (lower.startsWith('draft')) return false;
    if (lower.startsWith('refin')) return false;
    if (lower.startsWith('project:')) return false;
    if (lower.startsWith('tech:')) return false;
    if (lower.startsWith('role:')) return false;
    if (lower.startsWith('focus:')) return false;
    if (lower.startsWith('sentence ')) return false;
    if (lower.match(/^\d+[\.\)]/)) return false;
    if (lower.match(/^(yes|no)[.\s]/)) return false;
    // Skip if more than 30% of lines start with * or -
    const lines = p.split('\n');
    const bulletLines = lines.filter(l => l.trim().startsWith('*') || l.trim().startsWith('-')).length;
    if (bulletLines / lines.length > 0.3) return false;
    // Must be at least 80 chars to be a real paragraph
    if (p.length < 80) return false;
    return true;
  });

  // Take the last clean paragraph (most likely the final polished version)
  if (cleanParagraphs.length > 0) {
    text = cleanParagraphs[cleanParagraphs.length - 1];
  }

  // Final cleanup
  text = text
    .replace(/\*\*/g, '')
    .replace(/(?<!\w)\*(?!\w)/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/`/g, '')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return text;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMMA_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured." });

  try {
    const { projectId, role, followupQuestion } = req.body;
    if (!projectId || !role) return res.status(400).json({ error: "projectId and role required." });

    const project = PROJECTS[projectId];
    if (!project) return res.status(400).json({ error: "Unknown project." });
    if (!ROLE_LABELS[role]) return res.status(400).json({ error: "Unknown role." });

    const prompt = buildPrompt(project, role, followupQuestion);

    // Try Gemma 4 first, fallback to Gemini Flash
    const models = ["gemma-4-31b-it", "gemini-2.0-flash"];
    let text = "";
    let usedModel = "";

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                topP: 0.85,
                topK: 30,
                maxOutputTokens: 300
              }
            })
          }
        );

        if (!response.ok) continue;

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        text = extractFinalParagraph(rawText);
        usedModel = model;
        if (text.length >= 80) break; // Good enough, stop trying
      } catch (e) {
        continue; // Try next model
      }
    }

    if (!text || text.length < 50) {
      return res.status(200).json({
        text: "Could not generate a clean response. Please try again.",
        model: usedModel
      });
    }

    return res.status(200).json({ text, model: usedModel });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}