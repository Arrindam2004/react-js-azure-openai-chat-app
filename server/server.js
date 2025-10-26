import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Allow requests from your frontend (ports 5173 and 5174)
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174",
  "https://thankful-field-0f6bca710.3.azurestaticapps.net" // ✅ Add this
  ],
  methods: ["POST", "GET"],
  allowedHeaders: ["Content-Type", "api-key"]
}));

// ✅ Initialize OpenAI client for Azure
const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
  defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY },
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME, // your deployed model name
      messages,
    });

    res.json(response);
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
