// Vercel Serverless Function: /api/generate
// Uses Claude (Anthropic) for clean, reliable portfolio explanations

const PROJECTS = {
  airline: {
    title: "Airline Delay Analysis",
    tech: "Tableau, calculated fields, parameter-driven filters, story points",
    detail: "Interactive Tableau dashboard analyzing US flight delay patterns across weather, carrier, NAS, security, and late aircraft causes. Airport-level performance comparisons and seasonal trend analysis. Story points guide viewers from high-level trends to granular root causes. Designed for operations teams to identify actionable delay patterns."
  },
  instacart: {
    title: "Instacart Analysis",
    tech: "Tableau, data visualization, customer segmentation",
    detail: "Analyzed 3M+ grocery orders for shopping patterns, reorder behavior, and product affinities. Built dashboards covering peak ordering hours, department reorder rates, basket composition, and customer segmentation by purchase frequency. Found organic products had 15% higher reorder rates. Designed for product and growth teams to prioritize retention strategies."
  },
  moviematch: {
    title: "MovieMatch - AI Movie Recommender",
    tech: "Python, Streamlit, scikit-learn, cosine similarity, collaborative filtering",
    detail: "Full-stack recommendation engine using user-user and item-item collaborative filtering with cosine similarity on a user-item rating matrix. Streamlit app with authentication, preference capture, real-time recommendations. Cold-start handled via popularity-based fallback. Session state management for persistent user experience."
  },
  f1: {
    title: "F1 Data Intelligence Report",
    tech: "JavaScript, Ergast API, OpenF1 API, AI-assisted code generation (Codex), Vercel",
    detail: "Interactive F1 analytics platform with real race data from Ergast and OpenF1 APIs. Driver performance comparisons, qualifying vs race pace analysis, pit stop strategy breakdowns, historical trend visualization. Directed analysis approach with Codex-assisted development. Deployed live on Vercel with responsive design."
  },
  underarmour: {
    title: "Under Armour - Strategic Transformation & Analytics Vision",
    tech: "Strategic planning, analytics roadmap, risk assessment, phased rollout design",
    detail: "Transformation roadmap built on three pillars: personalized athlete performance insights, sustainable manufacturing through Design for Manufacturing (DfM), and smart training ecosystems. Phased rollout from data foundation to global athlete network expansion. Identified and mitigated risks across data integration complexity, supply chain volatility, and smart tech adoption."
  },
  erm: {
    title: "ERM for Vighnaharta Food (Dairy Manufacturing)",
    tech: "Risk management frameworks, quantitative scoring, governance design",
    detail: "Enterprise Risk Management framework for a small dairy manufacturer spanning 7 risk domains: supply chain, quality control, financial, market, sustainability, regulatory, technology. Quantitative threat scoring to prioritize risks by likelihood and impact. Lightweight governance: risk champion role, shared risk log, meeting risk moments, and visual tracking dashboards for early warning."
  },
  petalpost: {
    title: "Petal Post - Plant Delivery System",
    tech: "SQL Server, Azure Data Studio, Power Pages, stored procedures, normalization",
    detail: "Plant e-commerce database system with Power Pages frontend and SQL Server/Azure Data Studio backend. End-to-end data flow from browsing to checkout. Normalized entity modeling for plants, orders, customers, inventory with foreign keys and indexing. Stored procedures for order processing and inventory management."
  },
  royaltease: {
    title: "RoyaltEase - Digital Rights & Royalty Management",
    tech: "Systems design, context diagrams, DFDs, entity-relationship modeling",
    detail: "Digital rights and royalty management platform design with automated royalty calculation, real-time usage tracking, and secure payment processing. System architecture documented through context diagrams and multi-level DFDs showing interactions between artists, users, monitoring systems, and payment flows. Entity modeling for fully traceable, auditable royalty distribution."
  },
  energy: {
    title: "Prediction of Energy Consumption",
    tech: "R, CART (classification/regression trees), linear regression, feature engineering",
    detail: "Predictive models for household energy consumption using building characteristics (square footage, age, insulation type) and weather variables (temperature, humidity, heating/cooling degree days). Targeted data cleaning and feature engineering for stronger signal. Compared CART and linear regression to understand key drivers and predictive accuracy. Results translated into energy efficiency planning recommendations."
  },
  streaming: {
    title: "Netflix vs Prime - User Behavior Analytics",
    tech: "Python, pandas, matplotlib, exploratory data analysis",
    detail: "Comparative analysis of Netflix and Amazon Prime user datasets. Cleaned and structured two independent streaming datasets for consistent cross-platform comparison. Analyzed age distribution, gender breakdown, subscription models, and device engagement patterns. Key insights: platform preference differences across age groups and subscription tier correlations. Restructured into reproducible workflow separating notebooks from production scripts."
  },
  mindreading: {
    title: "The Mind-Reading Illusion - Why Social Media Shows You What You Never Search",
    tech: "Research methodology, platform analysis, responsible AI frameworks, model card review",
    detail: "Investigation into how micro-signals (dwell time, pauses, replays, social-graph effects) reshape social media recommendations without explicit user input. Ran user-side interaction experiments including micro-pause tests and social graph influence analysis to observe recommendation shift speed. Reviewed platform documentation and model-card style sources to compare what platforms disclose vs what users assume. Framed the disclosure gap as an ethics and transparency issue with implications for AI governance and regulation."
  }
};

const ROLE_CONFIG = {
  recruiter: {
    label: "Recruiter",
    system: `You write concise portfolio project descriptions for recruiters reviewing candidates for Data Analyst and Business Analyst roles. 

Your output is always exactly 3-4 sentences of polished, flowing prose written in first person as Suriya Narayanan. Focus on measurable outcomes, name specific technical tools used, and connect the work to DA/BA role relevance.

Never start with "I built" or "I created" - vary your opening. Be confident but not arrogant. Output only the paragraph, nothing else.`
  },
  data_scientist: {
    label: "Data Scientist",
    system: `You write concise portfolio project descriptions for senior data scientists evaluating technical depth.

Your output is always exactly 3-4 sentences of polished, flowing prose written in first person as Suriya Narayanan. Focus on methodology, algorithms or analytical approaches used, data pipeline decisions, and technical tradeoffs.

Never start with "I built" or "I created" - vary your opening. Be specific about tools, libraries, and data handling. Output only the paragraph, nothing else.`
  },
  hiring_manager: {
    label: "Hiring Manager",
    system: `You write concise portfolio project descriptions for hiring managers evaluating problem-solving ability and ownership.

Your output is always exactly 3-4 sentences of polished, flowing prose written in first person as Suriya Narayanan. Focus on the business problem identified, how the work was scoped independently, key decisions and their rationale, and what the deliverable enabled for stakeholders.

Never start with "I built" or "I created" - vary your opening. Show initiative and judgment. Output only the paragraph, nothing else.`
  },
  pm: {
    label: "Product Manager",
    system: `You write concise portfolio project descriptions for product managers evaluating product thinking.

Your output is always exactly 3-4 sentences of polished, flowing prose written in first person as Suriya Narayanan. Focus on the user or business problem being solved, how analysis informed product or strategy decisions, the insight-to-action pipeline, and scalability of the approach.

Never start with "I built" or "I created" - vary your opening. Frame everything as impact and decision-enablement. Output only the paragraph, nothing else.`
  }
};

const FOLLOWUP_SYSTEM = `You are Suriya Narayanan, a data analytics professional with a Master's in Information Systems and a Data Science certificate from Syracuse University. You have experience at Dentsu International (campaign analytics) and Syracuse's Nexis Lab (ETL pipelines, recommendation systems).

Answer follow-up questions about your portfolio projects in exactly 2-3 sentences. Be specific to the project context. Write in first person, flowing prose. Be honest and confident. Output only your answer.`;

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured. Add CLAUDE_API_KEY to Vercel environment variables." });
  }

  try {
    const { projectId, role, followupQuestion } = req.body;
    if (!projectId || !role) return res.status(400).json({ error: "projectId and role required." });

    const project = PROJECTS[projectId];
    if (!project) return res.status(400).json({ error: "Unknown project." });

    const roleConfig = ROLE_CONFIG[role];
    if (!roleConfig) return res.status(400).json({ error: "Unknown role." });

    let systemPrompt, userMessage;

    if (followupQuestion) {
      systemPrompt = FOLLOWUP_SYSTEM;
      userMessage = `Project: ${project.title}
Tools used: ${project.tech}
What I did: ${project.detail}

Question: "${followupQuestion}"`;
    } else {
      systemPrompt = roleConfig.system;
      userMessage = `Project: ${project.title}
Tools used: ${project.tech}
What I did: ${project.detail}`;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 250,
        system: systemPrompt,
        messages: [
          { role: "user", content: userMessage }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Claude API error:", response.status, errorData);
      return res.status(response.status).json({ error: "AI generation failed. Please try again." });
    }

    const data = await response.json();

    const text = data.content
      ?.filter(item => item.type === "text")
      .map(item => item.text)
      .join(" ")
      .trim() || "Could not generate a response.";

    return res.status(200).json({ text, model: "claude-sonnet" });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}