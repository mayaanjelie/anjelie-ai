import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

const SYSTEM_PROMPT = `You are an expert sustainable fashion design AI assistant. Your role is to:

1. Help users create eco-friendly fashion designs
2. Recommend sustainable fabrics and materials (organic cotton, Tencel, hemp, recycled materials)
3. Provide detailed environmental impact metrics (water savings, CO2 reduction, energy efficiency)
4. Suggest ethical manufacturing practices and certifications (GOTS, Fair Trade, OEKO-TEX)
5. Design clothing items based on user descriptions

When a user asks for a design:
- Describe the garment in detail (style, cut, features)
- Recommend the most sustainable fabric options with specific environmental benefits
- Provide estimated sustainability metrics (water saved, CO2 reduced, etc.)
- Suggest colors and patterns that align with eco-friendly practices
- Recommend sustainable trims, buttons, and accessories

Be enthusiastic, knowledgeable, and focus on making sustainability accessible and appealing.

IMPORTANT: When describing a design, format your response with clear sections using markdown:
- **Design Specifications:**
- **Sustainability Analysis:**
- **Recommended Fabric:**
- **Impact Metrics:**
- **Certifications:**`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
    })

    const content = response.content[0]
    const text = content.type === 'text' ? content.text : ''

    return NextResponse.json({
      message: text,
      usage: response.usage
    })
  } catch (error: any) {
    console.error('Error calling Claude API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}
