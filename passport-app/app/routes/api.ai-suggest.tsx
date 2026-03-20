import { json, type ActionFunctionArgs } from "@remix-run/node";
import Anthropic from "@anthropic-ai/sdk";
import { authenticate } from "../shopify.server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a fashion sustainability expert with deep knowledge of EU Digital Product Passport (DPP) regulations and textile supply chains. Based on the product name and category provided, suggest realistic EU Digital Product Passport data.

Return ONLY a valid JSON object (no markdown, no explanation) with these exact keys:
{
  "fiber_composition": [{ "material": "string", "percentage": number }],
  "carbon_footprint": number,
  "care_instructions": "string",
  "recycling_instructions": "string",
  "repairability_score": number
}

Rules:
- fiber_composition percentages must sum to exactly 100
- carbon_footprint is in kg CO2e per unit (realistic range: 5-80 for garments)
- repairability_score is an integer from 1-5 (1=very hard to repair, 5=easily repairable)
- care_instructions should be practical laundry/care guidance
- recycling_instructions should explain how to properly dispose of/recycle the item at end-of-life
- Be realistic based on typical industry practices for the product type`;

export const action = async ({ request }: ActionFunctionArgs) => {
  // Verify request is from authenticated admin
  try {
    await authenticate.admin(request);
  } catch {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const productTitle = String(formData.get("productTitle") || "");
  const productType = String(formData.get("productType") || "");

  if (!productTitle) {
    return json({ error: "Product title is required" }, { status: 400 });
  }

  const userMessage = `Product name: "${productTitle}"${productType ? `\nCategory: "${productType}"` : ""}

Please suggest EU Digital Product Passport data for this fashion product.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Parse JSON response
  const parsed = JSON.parse(text.trim());

  // Validate structure
  if (
    !parsed.fiber_composition ||
    !Array.isArray(parsed.fiber_composition) ||
    typeof parsed.carbon_footprint !== "number"
  ) {
    return json({ error: "Invalid AI response format" }, { status: 500 });
  }

  return json(parsed);
};
