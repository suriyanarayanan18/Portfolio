// Vercel Serverless Function: /api/generate
// Securely proxies requests to Google AI Studio (Gemma 4)
// Handles prompt construction, response cleaning, and error handling

// ── Project database ──
const PROJECTS = {
  airline: {
    title: "Airline Delay Analysis",
    tech: "Tableau, calculated fields, parameter-driven filters, story points",
    summary: "Interactive Tableau dashboard story analyzing US flight delay patterns. Explored delay causes (weather, carrier, NAS, security, late aircraft), airport-level performance comparisons, and seasonal trends. Designed story points guiding viewers from high-level trends to granular root causes. Built for operations teams to identify actionable delay patterns."
  },
  instacart: {
    title: "Instacart Analysis",
    tech: "Tableau, data visualization, customer segmentation",
    summary: "Analyzed 3M+ grocery orders to understand shopping patterns, reorder behavior, and product affinities. Built dashboards showing peak ordering hours, department-level reorder rates, basket composition, and customer segmentation by purchase frequency. Found organic products had 15% higher reorder rates. Designed for product and growth teams to prioritize retention."
  },
  moviematch: {
    title: "MovieMatch - AI Movie Recommender",
    tech: "Python, Streamlit, scikit-learn, cosine similarity, collaborative filtering",
    summary: "Full-stack recommendation engine using collaborative filtering (user-user and item-item cosine similarity) on a user-item rating matrix. Features: user authentication, preference capture, real-time recommendations. Handles cold-start via popularity-based fallback. Deployed as Streamlit app with session state management."
  },
  f1: {
    title: "F1 Data Intelligence Report",
    tech: "JavaScript, Ergast API, OpenF1 API, Codex, Vercel",
    summary: "Interactive F1 analytics platform using real-world race data from Ergast and OpenF1 APIs. Features: driver performance comparisons, qualifying vs race pace, pit stop strategy breakdowns, historical trends. Used directed analysis with AI-assisted code generation. Deployed live on Vercel."
  },
  underarmour: {
    title: "Under Armour - Strategic Transformation & Analytics Vision",
    tech: "Strategic planning, analytics roadmap, risk assessment",
    summary: "Strategic transformation roadmap for Under Armour on three pillars: personalized athlete performance insights, sustainable manufacturing (DfM), smart training ecosystems. Phased rollout from data foundation to global athlete network. Identified and mitigated risks: data integration complexity, supply volatility, smart tech adoption barriers."
  },
  erm: {
    title: "ERM for Vighnaharta Food (Dairy Manufacturing)",
    tech: "Risk management frameworks, quantitative scoring, governance design",
    summary: "Enterprise Risk Management framework for a small dairy manufacturer. Created risk buckets across 7 domains (supply chain, quality, financial, market, sustainability, regulatory, technology). Built quantitative scoring to prioritize threats. Designed lightweight governance: risk champion, shared log, meeting risk moments, visual tracking dashboards."
  },
  petalpost: {
    title: "Petal Post - Plant Delivery System",
    tech: "SQL Server, Azure Data Studio, Power Pages, stored procedures",
    summary: "Plant e-commerce database system with Power Pages frontend and SQL Server backend. End-to-end flow from browsing to checkout. Normalized entity modeling (plants, orders, customers, inventory) with foreign keys and indexing. Stored procedures for order processing and inventory management."
  },
  royaltease: {
    title: "RoyaltEase - Digital Rights & Royalty Management",
    tech: "Systems design, DFDs, entity-relationship modeling",
    summary: "Digital rights and royalty management platform design. Automated royalty calculation, real-time usage tracking, secure payments. Architecture via context diagrams and multi-level DFDs. Modeled entities: artists, content, usage logs, licenses, royalties, payments for auditable distribution."
  },
  energy: {
    title: "Prediction of Energy Consumption",
    tech: "R, CART, linear regression, feature engineering",
    summary: "Predictive models for household energy consumption using building characteristics (square footage, age, insulation) and weather variables (temperature, humidity, degree days). Feature engineering for stronger signal. Compared CART and linear regression. Translated into planning-oriented energy efficiency recommendations."
  },
  streaming: {
    title: "Netflix vs Prime - User Behavior Analytics",
    tech: "Python, pandas, matplotlib, EDA",
    summary: "Comparative analysis of Netflix and Amazon Prime user datasets. Standardized two independent datasets for cross-platform comparison. Analyzed demographics, subscription models, device engagement. Found platform preference differences across age groups. Built reproducible workflow separating notebooks from production scripts."
  },
  mindreading: {
    title: "The Mind-Reading Illusion",
    tech: "Research methodology, platform analysis, responsible AI frameworks",
    summary: "Investigation into how micro-signals (dwell time, pauses, replays, social-graph effects) reshape social media recommendations without explicit user input. Ran interaction experiments measuring recommendation shift speed. Compared platform disclosures vs user assumptions. Framed as ethics and transparency issue with AI governance implications."
  }
};

// ── Role-specific system prompts ──
// These are carefully engineered to produce clean, direct output
const SYSTEM_PROMPTS = {
  recruiter: `You write portfolio project descriptions for recruiters.
Your output is EXACTLY 3-4 sentences of flowing prose in first person ("I").
Focus on: measurable outcomes, technical skills demonstrated (name specific tools), and relevance to Data Analyst / Business Analyst roles.
Use clear, professional language. Be confident, not arrogant.
Do NOT start with "I built" or "I created". Vary your opening.
Output ONLY the paragraph. No headers, no labels, no bullets, no thinking.`,

  data_scientist: `You write portfolio project descriptions for senior data scientists.
Your output is EXACTLY 3-4 sentences of flowing prose in first person ("I").
Focus on: methodology, data pipeline decisions, model/algorithm choices, feature engineering, technical tradeoffs.
Be specific about tools, libraries, and data handling approaches.
Do NOT start with "I built" or "I created". Vary your opening.
Output ONLY the paragraph. No headers, no labels, no bullets, no thinking.`,

  hiring_manager: `You write portfolio project descriptions for hiring managers evaluating problem-solving.
Your output is EXACTLY 3-4 sentences of flowing prose in first person ("I").
Focus on: what business problem was identified, how the work was scoped independently, key decisions and rationale, what the deliverable enabled.
Show ownership and initiative.
Do NOT start with "I built" or "I created". Vary your opening.
Output ONLY the paragraph. No headers, no labels, no bullets, no thinking.`,

  pm: `You write portfolio project descriptions for product managers.
Your output is EXACTLY 3-4 sentences of flowing prose in first person ("I").
Focus on: what user/business problem was solved, how analysis informed decisions, the insight-to-action pipeline, scalability.
Frame everything as impact and decision-enablement.
Do NOT start with "I built" or "I created". Vary your opening.
Output ONLY the paragraph. No headers, no labels, no bullets, no thinking.`
};

// ── Follow-up system prompt ──
const FOLLOWUP_SYSTEM = `You are Suriya Narayanan, a data analytics professional answering follow-up questions about your portfolio projects.
Your output is EXACTLY 2-3 sentences of flowing prose in first person.
Be specific to the project context provided. Be honest and confident.
Output ONLY your answer. No headers, no labels, no bullets, no thinking.`;

// ── Response cleaner ──
function cleanResponse(text) {
  if (!text) return "";

  // If model leaked multiple drafts, take only the last clean paragraph
  const draftSplit = text.split(/Draft\s*\d+\s*[:.]?\s*/gi);
  if (draftSplit.length > 1) {
    text = draftSplit[draftSplit.length - 1];
  }

  // Remove lines that are reasoning artifacts
  const lines = text.split('\n').filter(line => {
    const t = line.trim().toLowerCase();
    if (!t) return false;
    // Skip metadata/reasoning lines
    const skipPrefixes = [
      '* role:', '* audience:', '* goal:', '* focus', '* constraints:',
      '* tech:', '* actions:', '* initiative:', '* business problem:',
      '* scoping:', '* decisions', '* deliverable', '* first person',
      '* confident', '* no bullet', "* doesn't start", '* starts with',
      '* refining', '* sentence ', '* project:', '* check',
      'check constraints', '3-4 sentences', 'here is the',
      'here\'s the', 'okay, let me', 'let me ', 'i need to'
    ];
    for (const prefix of skipPrefixes) {
      if (t.startsWith(prefix)) return false;
    }
    if (t.match(/^\*\*?(check|draft|refin|task|output|rule|important)/i)) return false;
    if (t.match(/^\*\s*\*\*/)) return false;
    if (t.match(/^(yes|no)\.\s*$/i)) return false;
    return true;
  });

  text = lines.join(' ');

  // Clean formatting artifacts
  text = text
    .replace(/\*\*/g, '')           // Remove bold markdown
    .replace(/\*/g, '')             // Remove remaining asterisks
    .replace(/^#+\s*/gm, '')        // Remove heading markers
    .replace(/`/g, '')              // Remove code backticks
    .replace(/\n{2,}/g, '\n')       // Collapse multiple newlines
    .replace(/\s{2,}/g, ' ')        // Collapse multiple spaces
    .trim();

  return text;
}

// ── Main handler ──
export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMMA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured." });
  }

  try {
    const { projectId, role, followupQuestion } = req.body;

    if (!projectId || !role) {
      return res.status(400).json({ error: "projectId and role are required." });
    }

    const project = PROJECTS[projectId];
    if (!project) {
      return res.status(400).json({ error: "Unknown project." });
    }

    let systemPrompt, userMessage;

    if (followupQuestion) {
      // Follow-up mode
      systemPrompt = FOLLOWUP_SYSTEM;
      userMessage = `Project: ${project.title}
Tech: ${project.tech}
Details: ${project.summary}

Question: ${followupQuestion}`;
    } else {
      // Initial explanation mode
      systemPrompt = SYSTEM_PROMPTS[role];
      if (!systemPrompt) {
        return res.status(400).json({ error: "Unknown role." });
      }
      userMessage = `Project: ${project.title}
Tech: ${project.tech}
Details: ${project.summary}`;
    }

    // Call Gemma 4 via Google AI Studio
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userMessage }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.85,
            topK: 30,
            maxOutputTokens: 200,
            stopSequences: ["Draft", "Check", "Refin", "* Role", "* Audience"]
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemma API error:", response.status, errorData);

      // If Gemma 4 model not available, try fallback to Gemini Flash
      if (response.status === 404 || response.status === 400) {
        const fallbackResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }]
              },
              contents: [
                {
                  role: "user",
                  parts: [{ text: userMessage }]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                topP: 0.85,
                topK: 30,
                maxOutputTokens: 200
              }
            })
          }
        );

        if (!fallbackResponse.ok) {
          return res.status(500).json({ error: "AI generation failed. Please try again." });
        }

        const fallbackData = await fallbackResponse.json();
        let fallbackText = fallbackData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        fallbackText = cleanResponse(fallbackText);

        return res.status(200).json({ text: fallbackText, model: "gemini-2.0-flash" });
      }

      return res.status(response.status).json({ error: "AI generation failed." });
    }

    const data = await response.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    text = cleanResponse(text);

    if (text.length < 30) {
      return res.status(200).json({
        text: "Could not generate a clean response. Please try again.",
        error: true
      });
    }

    return res.status(200).json({ text, model: "gemma-4-31b-it" });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}