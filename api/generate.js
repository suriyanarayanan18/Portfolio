// Vercel Serverless Function: /api/generate
// Uses Gemini 2.0 Flash (clean output) as primary
// Falls back to Gemma 4 with aggressive extraction if needed

const PROJECTS = {
  airline: {
    title: "Airline Delay Analysis",
    tech: "Tableau, calculated fields, parameter-driven filters, story points",
    detail: "Interactive Tableau dashboard analyzing US flight delay patterns across weather, carrier, NAS, security, and late aircraft causes. Airport-level performance comparisons and seasonal trend analysis. Story points guide viewers from high-level trends to granular root causes. Designed for operations teams."
  },
  instacart: {
    title: "Instacart Analysis",
    tech: "Tableau, data visualization, customer segmentation",
    detail: "Analyzed 3M+ grocery orders for shopping patterns, reorder behavior, and product affinities. Built dashboards covering peak ordering hours, department reorder rates, basket composition, and customer segmentation by purchase frequency. Found organic products had 15% higher reorder rates. Designed for product and growth teams."
  },
  moviematch: {
    title: "MovieMatch AI Movie Recommender",
    tech: "Python, Streamlit, scikit-learn, cosine similarity, collaborative filtering",
    detail: "Full-stack recommendation engine using user-user and item-item collaborative filtering with cosine similarity on a user-item rating matrix. Streamlit app with authentication, preference capture, real-time recommendations. Cold-start handled via popularity fallback. Session state for persistent UX."
  },
  f1: {
    title: "F1 Data Intelligence Report",
    tech: "JavaScript, Ergast API, OpenF1 API, AI-assisted code generation, Vercel",
    detail: "Interactive F1 analytics platform with real race data from Ergast and OpenF1 APIs. Driver performance comparisons, qualifying vs race pace analysis, pit stop strategy breakdowns, historical trend visualization. Directed analysis with Codex-assisted development. Deployed live on Vercel."
  },
  underarmour: {
    title: "Under Armour Strategic Transformation",
    tech: "Strategic planning, analytics roadmap, risk assessment",
    detail: "Transformation roadmap built on three pillars: personalized athlete performance insights, sustainable manufacturing through DfM, and smart training ecosystems. Phased rollout from data foundation to global athlete network. Identified and mitigated risks across data integration, supply volatility, and tech adoption."
  },
  erm: {
    title: "ERM for Vighnaharta Food Dairy Manufacturing",
    tech: "Risk management frameworks, quantitative scoring, governance design",
    detail: "Enterprise Risk Management framework for a small dairy manufacturer spanning 7 risk domains: supply chain, quality control, financial, market, sustainability, regulatory, technology. Quantitative threat scoring to prioritize risks. Lightweight governance with risk champion, shared log, meeting risk moments, and visual dashboards."
  },
  petalpost: {
    title: "Petal Post Plant Delivery System",
    tech: "SQL Server, Azure Data Studio, Power Pages, stored procedures, normalization",
    detail: "Plant e-commerce database system with Power Pages frontend and SQL Server backend. End-to-end flow from browsing to checkout. Normalized entity modeling for plants, orders, customers, inventory with foreign keys and indexing. Stored procedures for order processing and inventory management."
  },
  royaltease: {
    title: "RoyaltEase Digital Rights and Royalty Management",
    tech: "Systems design, DFDs, entity-relationship modeling",
    detail: "Digital rights and royalty management platform design with automated royalty calculation, real-time usage tracking, and secure payment processing. Architecture documented through context diagrams and multi-level DFDs. Entity modeling for artists, content, usage logs, licenses, royalties, and payments."
  },
  energy: {
    title: "Prediction of Energy Consumption",
    tech: "R, CART, linear regression, feature engineering",
    detail: "Predictive models for household energy consumption using building characteristics and weather variables. Feature engineering for stronger signal. Compared CART and linear regression models to understand drivers. Translated findings into energy efficiency planning recommendations."
  },
  streaming: {
    title: "Netflix vs Prime User Behavior Analytics",
    tech: "Python, pandas, matplotlib, exploratory data analysis",
    detail: "Comparative analysis of Netflix and Amazon Prime user datasets. Standardized two independent datasets for consistent comparison. Analyzed demographics, subscription models, device engagement patterns. Found platform preference differences across age groups. Built reproducible workflow separating notebooks from production scripts."
  },
  mindreading: {
    title: "The Mind-Reading Illusion",
    tech: "Research methodology, platform analysis, responsible AI frameworks",
    detail: "Investigation into how micro-signals like dwell time, pauses, replays, and social-graph effects reshape social media recommendations without explicit user input. Ran interaction experiments measuring recommendation shift speed. Compared platform disclosures versus user assumptions. Framed as an ethics and transparency issue with AI governance implications."
  }
};

const ROLE_NAMES = {
  recruiter: "recruiter",
  data_scientist: "data scientist",
  hiring_manager: "hiring manager",
  pm: "product manager"
};

const ROLE_FOCUS = {
  recruiter: "measurable outcomes, specific technical skills used, and why this is relevant to Data Analyst or Business Analyst roles",
  data_scientist: "methodology, algorithms, data pipeline architecture, and technical tradeoffs made",
  hiring_manager: "the business problem identified, how I scoped the work, key decisions I made, and what the deliverable enabled",
  pm: "the user or business problem solved, how the analysis informed decisions, and the impact on stakeholders"
};

function buildPrompt(project, role, followupQuestion) {
  if (followupQuestion) {
    return `I am Suriya Narayanan, a data analytics professional. I worked on "${project.title}" using ${project.tech}. Here is what I did: ${project.detail}

Someone asks me: "${followupQuestion}"

I answer directly in 2 sentences:`;
  }

  return `Write a 4-sentence paragraph in first person as Suriya Narayanan, a data analytics professional, describing the project below for a ${ROLE_NAMES[role]}. Focus on ${ROLE_FOCUS[role]}. Do not start with "I built" or "I created". Output only the paragraph, nothing else.

Project: ${project.title}
Tools: ${project.tech}
What was done: ${project.detail}`;
}

// Extract clean paragraph from potentially messy model output
function extractClean(raw) {
  if (!raw) return "";

  let text = raw;

  // If output contains "My description:" or similar, take everything after
  const afterMarkers = [
    /my (?:description|answer|response|paragraph)\s*:\s*/i,
    /here(?:'s| is)(?: the)? (?:paragraph|description|answer)\s*:\s*/i,
    /final (?:version|paragraph|answer|output)\s*:\s*/i,
    /output\s*:\s*/i
  ];
  for (const re of afterMarkers) {
    const idx = text.search(re);
    if (idx !== -1) {
      text = text.slice(idx).replace(re, '');
    }
  }

  // Split into paragraph blocks
  const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

  // Score each block: higher = more likely to be the final answer
  const scored = blocks.map(block => {
    let score = 0;
    const lower = block.toLowerCase();
    const len = block.length;

    // Length: real paragraphs are 150-600 chars
    if (len >= 150 && len <= 800) score += 10;
    else if (len >= 80 && len < 150) score += 3;
    else if (len < 50) score -= 20;

    // Penalty for reasoning markers
    if (lower.startsWith('*')) score -= 15;
    if (lower.startsWith('-')) score -= 15;
    if (lower.startsWith('draft')) score -= 20;
    if (lower.startsWith('check')) score -= 20;
    if (lower.startsWith('refin')) score -= 15;
    if (lower.startsWith('let me')) score -= 15;
    if (lower.startsWith('okay')) score -= 15;
    if (lower.startsWith('constraint')) score -= 15;
    if (lower.startsWith('sentence ')) score -= 15;
    if (lower.match(/^\d+[\.\)]/)) score -= 10;
    if (lower.includes('yes (')) score -= 15;
    if (lower.includes('? yes')) score -= 15;
    if (lower.includes('? no')) score -= 15;

    // Bonus for prose-like content
    const sentences = block.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length >= 2 && sentences.length <= 6) score += 8;

    // Penalty for bullet-heavy content
    const bulletLines = block.split('\n').filter(l => l.trim().match(/^[\*\-•]/));
    if (bulletLines.length > 1) score -= 10;

    // Bonus for first-person voice
    if (lower.includes(' i ') || lower.startsWith('i ')) score += 3;

    return { block, score };
  });

  // Sort by score descending, take the best
  scored.sort((a, b) => b.score - a.score);

  if (scored.length > 0 && scored[0].score > 0) {
    text = scored[0].block;
  } else if (blocks.length > 0) {
    // Fallback: take the last block (usually the final version)
    text = blocks[blocks.length - 1];
  }

  // Final cleanup
  text = text
    .replace(/\*\*/g, '')
    .replace(/(?<![a-zA-Z])\*(?![a-zA-Z])/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/`/g, '')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Remove any trailing self-check lines that got merged
  text = text.replace(/\s*\d+-\d+ sentences\?.*$/i, '');
  text = text.replace(/\s*(?:yes|no)\s*[\(\.].*$/i, '');
  text = text.replace(/\s*check\s*:.*$/i, '');
  text = text.replace(/\s*constraint.*$/i, '');

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
    if (!ROLE_NAMES[role]) return res.status(400).json({ error: "Unknown role." });

    const prompt = buildPrompt(project, role, followupQuestion);

    // Try models in order: Gemini Flash (cleanest), then Gemma 4
    const models = ["gemini-2.0-flash", "gemma-4-31b-it"];
    let finalText = "";
    let usedModel = "";

    for (const model of models) {
      try {
        const resp = await fetch(
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
                maxOutputTokens: 250
              }
            })
          }
        );

        if (!resp.ok) continue;
        const data = await resp.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!raw) continue;

        finalText = extractClean(raw);
        usedModel = model;

        // If we got a good paragraph (80+ chars), stop
        if (finalText.length >= 80) break;
      } catch (e) {
        continue;
      }
    }

    if (!finalText || finalText.length < 50) {
      return res.status(200).json({
        text: "Could not generate a response. Please try again.",
        model: usedModel
      });
    }

    return res.status(200).json({ text: finalText, model: usedModel });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Server error." });
  }
}