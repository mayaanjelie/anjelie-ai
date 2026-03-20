import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { productTitle, productType, vendor } = await req.json();

  if (!productTitle) {
    return NextResponse.json({ error: 'Missing productTitle' }, { status: 400 });
  }

  const prompt = `Product name: "${productTitle}"
Product type: "${productType || 'fashion/apparel'}"
Brand/vendor: "${vendor || 'unknown'}"

Please suggest realistic EU Digital Product Passport data for this product.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are a fashion sustainability expert specializing in EU Digital Product Passports (DPP).
Based on the product name and category provided, suggest realistic DPP data.
Return ONLY valid JSON with these exact fields:
{
  "fiber_composition": [{ "material": "string", "percentage": number }],
  "country_of_manufacture": "string",
  "carbon_footprint": number,
  "care_instructions": "string",
  "recycling_instructions": "string",
  "repairability_score": number (1-5),
  "certifications": ["string"],
  "supplier_country": "string",
  "confidence_notes": "string (brief explanation of your estimates)"
}
Be realistic and conservative. Use common EU fashion manufacturing locations.
Carbon footprint should be in kg CO2e per unit.
Care instructions should follow standard textile care symbols descriptions.`,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Strip any markdown code fences if present
    const jsonText = content.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const suggestions = JSON.parse(jsonText);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('AI suggest error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI suggestions. Please try again.' },
      { status: 500 }
    );
  }
}
