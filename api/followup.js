const MODEL = "gemma-4-31b-it";

const PROJECT_CONTEXT = {
  airline: {
    title: "Airline Delay Analysis",
    tools: "Tableau, calculated fields, parameter-driven filters, story points",
    problem:
      "Operational flight delay data needed to be shaped into a story-driven dashboard for operations teams and business stakeholders.",
    approach:
      "I built interactive Tableau story points and calculated fields to compare delay categories, airports, and seasonal patterns for root-cause analysis.",
    outcome:
      "The final output was a decision-focused dashboard that surfaces airport-level performance and seasonal trends in a structured, explorable format.",
    audience:
      "Operations teams, business stakeholders, and reviewers interested in data storytelling and dashboarding.",
    challenges:
      "turning noisy operational data with multiple delay categories into patterns that stayed interpretable across airports and time periods",
    keyMetrics:
      "Airport-level comparisons, delay category breakdowns, and seasonality views.",
    businessImpact:
      "The dashboard makes it easier for stakeholders to move from high-level delay monitoring to clearer root-cause exploration, which supports better operational decisions.",
    learned:
      "I learned how important data framing is when working with operational datasets that are noisy and multi-dimensional. It reinforced that a dashboard becomes much more useful when the analysis flow guides the user from summary to root cause.",
    whyItMatters:
      "This matters because delay data is only useful when it helps people see where performance is breaking down and why. A structured dashboard can turn operational complexity into decisions teams can actually act on."
  },

  instacart: {
    title: "Instacart Analysis",
    tools: "Tableau, data visualization, customer segmentation",
    problem:
      "The goal was to understand reorder behavior, basket composition, and customer segments across millions of grocery orders.",
    approach:
      "I analyzed 3M+ grocery orders and built dashboards around reorder trends, department-level patterns, and customer behavior segments.",
    outcome:
      "The project produced actionable customer insights for merchandising, targeting, and product analysis.",
    audience:
      "Product, growth, and merchandising teams.",
    challenges:
     "working at scale while separating meaningful customer behavior patterns from large amounts of routine transaction noise",
    keyMetrics:
      "3M+ orders and stronger reorder performance in organic categories.",
    businessImpact:
      "The analysis helps teams understand what customers reorder, how baskets vary, and where stronger category loyalty exists, which can support better targeting and merchandising decisions.",
    learned:
      "I learned how much value comes from combining behavioral segmentation with reorder analysis instead of looking at orders in isolation. It also showed me how large retail datasets need clear framing before they become useful for decision-making.",
    whyItMatters:
      "This matters because retail growth depends on understanding repeat behavior, not just one-time purchases. Better visibility into reorder patterns can support smarter category and customer decisions."
  },

  moviematch: {
    title: "MovieMatch - AI Recommender",
    tools: "Python, Streamlit, collaborative filtering, cosine similarity",
    problem:
      "The goal was to deliver a working movie recommendation experience with reasonable relevance and practical cold-start handling.",
    approach:
      "I built user-user and item-item collaborative filtering with cosine similarity, added fallback popularity logic, and deployed the experience in Streamlit.",
    outcome:
      "The result was an interactive recommender that demonstrates applied machine learning in a usable product format.",
    audience:
      "Product, engineering, and technical reviewers.",
    challenges:
       "balancing recommendation quality with cold-start handling while keeping the live interaction experience simple and responsive",
    keyMetrics:
      "Real-time recommendations with fallback logic for cold-start scenarios.",
    businessImpact:
      "The project shows how recommendation logic can be translated into a user-facing product experience instead of remaining only a technical prototype.",
    learned:
      "I learned that a recommendation system is only as useful as the experience wrapped around it. It reinforced the importance of combining model logic with fallback design and usability decisions.",
    whyItMatters:
      "This matters because recommendation systems create value only when users can meaningfully interact with them. Bridging modeling and product experience is what makes applied machine learning useful."
  },

  f1: {
    title: "F1 Data Intelligence Report",
    tools: "JavaScript, Ergast API, OpenF1 API, Vercel",
    problem:
      "The objective was to turn racing telemetry and race data into an explorable analytics product.",
    approach:
      "I combined external race APIs into an interactive experience for driver comparisons, race pace analysis, and strategy views.",
    outcome:
      "The project became a live analytics experience for performance comparisons and race strategy exploration.",
    audience:
      "Sports analytics users, product-oriented reviewers, and data storytelling audiences.",
    challenges:
       "shaping multiple external data sources into one coherent experience that stayed clear and interactive",
    keyMetrics:
      "Live data-driven race comparisons, strategy views, and performance analysis.",
    businessImpact:
      "The project demonstrates how API-driven analytics can be turned into a polished product experience rather than staying as raw data or isolated charts.",
    learned:
      "I learned how much product thinking matters when combining multiple APIs into a single analytical flow. It also showed me that interactivity and clarity are just as important as the data itself.",
    whyItMatters:
      "This matters because great analytics products depend on how users experience the information, not just on access to data. Turning raw external data into a coherent story is what makes the work valuable."
  },

  underarmour: {
    title: "Under Armour Strategic Transformation",
    tools: "Strategy, analytics roadmap, risk assessment",
    problem:
      "The challenge was to map analytics opportunities to broader product and operational transformation goals.",
    approach:
      "I framed strategic opportunities and phased rollout ideas from data foundations to athlete-facing experiences.",
    outcome:
      "The result was a roadmap of analytics-led opportunities tied to product and operational value.",
    audience:
      "Leadership, strategy, and transformation stakeholders.",
    challenges:
      "translating broad strategic ambition into practical analytics opportunities that could be phased and prioritized",
    keyMetrics:
      "Phased roadmap for analytics-led transformation opportunities.",
    businessImpact:
      "The work connects high-level strategic goals to specific analytics-driven initiatives, making transformation ideas more actionable.",
    learned:
      "I learned how important it is to connect strategy with execution logic instead of treating them as separate layers. It reinforced that analytics vision becomes stronger when it is phased and grounded in adoption realities.",
    whyItMatters:
      "This matters because transformation efforts often fail when they stay too abstract. Structuring strategy into clearer analytics opportunities makes it easier for teams to prioritize and act."
  },

  erm: {
    title: "ERM - Dairy Manufacturing",
    tools: "Risk frameworks, scoring, governance design",
    problem:
      "The goal was to create a usable enterprise risk framework across multiple domains for a dairy manufacturer.",
    approach:
      "I designed seven risk domains, practical scoring, and lightweight governance for repeatable monitoring and review.",
    outcome:
      "The output was a governance-ready ERM approach that could support operational decision-making.",
    audience:
      "Risk, operations, and business stakeholders.",
    challenges:
       "balancing completeness with usability so the framework stayed practical rather than overly heavy",
    keyMetrics:
      "Seven structured risk domains with scoring and governance support.",
    businessImpact:
      "The framework helps make risk conversations more structured, visible, and repeatable, which improves operational discipline and accountability.",
    learned:
      "I learned that risk frameworks only work when they are lightweight enough for people to actually use. It reinforced the value of balancing structure with practicality in operational settings.",
    whyItMatters:
      "This matters because unmanaged risk creates operational blind spots. A usable ERM structure improves visibility and supports better decisions before issues escalate."
  },

  petalpost: {
    title: "Petal Post - Plant Delivery System",
    tools: "SQL Server, Power Pages, stored procedures",
    problem:
      "The goal was to design a transactional backend for a plant delivery e-commerce experience.",
    approach:
      "I created a normalized database design, stored procedures, and a Power Pages frontend to handle orders and inventory flows.",
    outcome:
      "The result was a structured database-backed system for orders, inventory, and delivery-related workflows.",
    audience:
      "Engineering, database, and product reviewers.",
    challenges:
      "maintaining data integrity while designing workflows that connected orders, inventory, and operational processes cleanly",
    keyMetrics:
      "Database-backed order and inventory workflow design.",
    businessImpact:
      "The design creates a stronger operational backbone for a delivery platform by making transactions and inventory workflows more reliable and maintainable.",
    learned:
      "I learned how much the quality of a user-facing workflow depends on the structure underneath it. It reinforced the importance of normalized design and process clarity in transactional systems.",
    whyItMatters:
      "This matters because delivery systems break down quickly when orders and inventory are not modeled clearly. A strong backend foundation supports reliability, maintainability, and scale."
  },

  royaltease: {
    title: "RoyaltEase - DRM System",
    tools: "Systems design, Data Flow Diagrams (DFDs), Entity-Relationship (ER) modeling",
    problem:
      "The goal was to automate usage tracking and royalty calculations across a digital rights workflow.",
    approach:
      "I designed structured data flows, royalty calculation logic, and auditable workflows for rights and payments.",
    outcome:
      "The result was a concept for traceable and auditable royalty management.",
    audience:
      "Product and business teams reviewing rights and payments workflows.",
    challenges:
       "designing a system that stayed clear, traceable, and reliable across multiple entities and financial relationships",
    keyMetrics:
      "Conceptual system design focused on auditability and process clarity.",
    businessImpact:
      "The design helps reduce ambiguity in royalty workflows by making rights, usage, and payment relationships more structured and transparent.",
    learned:
      "I learned how important auditability and process clarity are when designing systems that handle multi-party rights and payments. It also reinforced how strongly good data flow design affects business trust and operational reliability.",
    whyItMatters:
      "This matters because royalty and rights workflows quickly become difficult to manage without clear structure and traceability. A well-designed system improves transparency, reduces friction, and makes financial processes easier to trust."
  },

  energy: {
    title: "Energy Consumption Prediction",
    tools: "R, CART, linear regression, feature engineering",
    problem:
      "The objective was to predict household energy consumption in a way that could support efficiency insights.",
    approach:
      "I compared CART and linear regression models using engineered features from building and weather variables.",
    outcome:
      "The project produced practical predictive models and energy-efficiency-oriented insights.",
    audience:
      "Energy analysts and data reviewers.",
    challenges:
      "translating raw environmental and household variables into predictors that were both useful and interpretable",
    keyMetrics:
      "Model comparison across CART and regression approaches.",
    businessImpact:
      "The project shows how predictive analytics can support clearer energy-efficiency recommendations and more structured data-driven insight generation.",
    learned:
      "I learned the value of comparing interpretable models instead of defaulting to complexity. It reinforced how important feature engineering is when prediction quality depends heavily on context variables.",
    whyItMatters:
      "This matters because prediction is most useful when it leads to clearer decisions or recommendations. Interpretable modeling makes the output easier to trust and apply."
  },

  streaming: {
    title: "Netflix vs Prime - EDA",
    tools: "Python, pandas, matplotlib, EDA",
    problem:
      "The goal was to compare user behavior across streaming platforms using structured exploratory analysis.",
    approach:
      "I standardized the datasets and compared behavior across demographics, subscriptions, and engagement patterns.",
    outcome:
      "The result was a clearer picture of cross-platform behavioral differences and usage patterns.",
    audience:
      "Research, product, and analytics audiences.",
    challenges:
      "aligning two different datasets so that platform comparisons remained meaningful and fair",
    keyMetrics:
      "Comparative analysis across demographics, subscriptions, and engagement.",
    businessImpact:
      "The project helps reveal how audience behavior differs across platforms, which can support comparative product and engagement thinking.",
    learned:
      "I learned that comparative analysis depends heavily on clean dataset alignment before interpretation begins. It also reinforced the importance of framing exploratory analysis around a clear comparison question.",
    whyItMatters:
      "This matters because platform decisions are stronger when they are grounded in how audience behavior actually differs. Good exploratory analysis can make those differences easier to understand."
  },

  mindreading: {
    title: "The Mind-Reading Illusion",
    tools: "Responsible AI, governance analysis, research methodology",
    problem:
      "The aim was to understand how subtle behavioral signals shape recommendations and what that means for transparency and privacy.",
    approach:
      "I used interaction experiments and governance analysis to explore recommendation inference and disclosure gaps.",
    outcome:
      "The output was a clearer framing of recommendation-system opacity and responsible AI implications.",
    audience:
      "Responsible AI, governance, and policy-oriented audiences.",
    challenges:
      "discussing subtle behavioral inference carefully without overstating what could be concluded",
    keyMetrics:
      "Governance-focused analysis of recommendation signals and transparency issues.",
    businessImpact:
      "The project highlights how recommendation design affects trust, transparency, and user understanding, which are important for product governance decisions.",
    learned:
      "I learned how closely product behavior, analytics, and governance are connected in recommendation systems. It reinforced that responsible AI work often depends on interpreting subtle system behaviors carefully and honestly.",
    whyItMatters:
      "This matters because recommendation systems influence user experience in ways people may not fully see. Better understanding of that opacity supports more responsible design and governance."
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

    const q = String(question || "").toLowerCase();

    if (q.includes("tool") && ctx.tools) {
      return res.status(200).json({
        answer: `For this project, I used ${ctx.tools}. These were central to how I structured and delivered the work.`
      });
    }

    if ((q.includes("learn") || q.includes("learned")) && ctx.learned) {
      return res.status(200).json({
        answer: ctx.learned
      });
    }

    if ((q.includes("why it matter") || q.includes("why does this matter") || q.includes("why does it matter")) && ctx.whyItMatters) {
      return res.status(200).json({
        answer: ctx.whyItMatters
      });
    }

    if ((q.includes("business impact") || q.includes("impact")) && ctx.businessImpact) {
      return res.status(200).json({
        answer: ctx.businessImpact
      });
    }

    if ((q.includes("challenge") || q.includes("hardest")) && ctx.challenges) {
    const challenge = String(ctx.challenges).trim();

    return res.status(200).json({
    answer: challenge.endsWith(".")
      ? `The main challenge was ${challenge.slice(0, -1)}.`
      : `The main challenge was ${challenge}.`
  });
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