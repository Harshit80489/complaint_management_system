const departmentRules = [
  { keys: ["water", "pipeline", "leak", "sewer", "drain"], department: "Water Supply Department" },
  { keys: ["electric", "power", "wire", "transformer", "street light"], department: "Electricity Department" },
  { keys: ["garbage", "waste", "trash", "clean", "sanitation"], department: "Sanitation Department" },
  { keys: ["road", "pothole", "traffic", "signal"], department: "Public Works Department" },
  { keys: ["health", "hospital", "medicine", "ambulance"], department: "Health Department" },
  { keys: ["crime", "theft", "violence", "police"], department: "Police Department" }
];

const highPriorityWords = ["danger", "urgent", "fire", "accident", "shock", "critical", "burst", "unsafe"];
const mediumPriorityWords = ["damaged", "broken", "blocked", "overflow", "delay", "leakage"];

const ruleBasedAnalysis = ({ title = "", description = "", category = "", location = "" }) => {
  const text = `${title} ${description} ${category}`.toLowerCase();
  const matchedDepartment = departmentRules.find((rule) =>
    rule.keys.some((keyword) => text.includes(keyword))
  );

  let priority = "Low";
  if (highPriorityWords.some((word) => text.includes(word)) || description.length > 260) {
    priority = "High";
  } else if (mediumPriorityWords.some((word) => text.includes(word)) || description.length > 120) {
    priority = "Medium";
  }

  if (text.includes("fire") || text.includes("electric shock") || text.includes("accident")) {
    priority = "Critical";
  }

  const department = matchedDepartment?.department || `${category || "General"} Department`;
  const cleanDescription = description.replace(/\s+/g, " ").trim();
  const summary =
    cleanDescription.length > 150
      ? `${cleanDescription.slice(0, 147)}...`
      : cleanDescription || "Complaint details require review.";

  const response = `Dear citizen, your complaint regarding "${title || category}" at ${location || "the reported location"} has been received. It has been marked as ${priority} priority and forwarded to the ${department}.`;

  return {
    priority,
    department,
    summary,
    response
  };
};

const parseJsonFromText = (text) => {
  const jsonBlock = text.match(/\{[\s\S]*\}/);
  if (!jsonBlock) return null;
  return JSON.parse(jsonBlock[0]);
};

const analyzeWithOpenRouter = async (complaint) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:5173",
      "X-Title": process.env.OPENROUTER_APP_NAME || "Smart Complaint Management System"
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You classify municipal complaints. Return only valid JSON with keys: priority, department, summary, response. priority must be one of Low, Medium, High, Critical."
        },
        {
          role: "user",
          content: JSON.stringify({
            title: complaint.title,
            description: complaint.description,
            category: complaint.category,
            location: complaint.location
          })
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error("OpenRouter AI analysis failed");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  const parsed = parseJsonFromText(content);

  if (!parsed) {
    throw new Error("OpenRouter returned invalid AI analysis format");
  }

  return {
    priority: parsed.priority || "Medium",
    department: parsed.department || "General Administration",
    summary: parsed.summary || complaint.description || "",
    response: parsed.response || "Your complaint has been received and forwarded to the concerned department."
  };
};

export const analyzeComplaint = async (complaint) => {
  try {
    const aiAnalysis = await analyzeWithOpenRouter(complaint);
    return aiAnalysis || ruleBasedAnalysis(complaint);
  } catch (error) {
    console.warn(`Using rule-based AI fallback: ${error.message}`);
    return ruleBasedAnalysis(complaint);
  }
};
