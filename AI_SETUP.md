# AI Integration Setup Guide

This app now uses **Claude AI** by Anthropic for intelligent sustainable fashion design recommendations.

## Getting Your API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy your API key

## Local Development Setup

1. Create a `.env.local` file in the project root:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your API key to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-...your-key-here
   ```

3. Restart your dev server:
   ```bash
   npm run dev
   ```

## Vercel Deployment Setup

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Your Anthropic API key
   - **Environment:** Production (and Preview if desired)
4. Click **Save**
5. Redeploy your app

## API Pricing

Claude API pricing (as of Dec 2024):
- **Claude 3.5 Sonnet:** $3 per million input tokens, $15 per million output tokens
- Most conversations cost less than $0.01
- Get $5 free credits when you sign up

## Features Enabled by AI

- ✅ Real-time intelligent design recommendations
- ✅ Accurate sustainability analysis
- ✅ Custom fabric suggestions based on user requirements
- ✅ Detailed environmental impact calculations
- ✅ Smart conversational interface

## Troubleshooting

**Error: "API key not configured"**
- Make sure `.env.local` exists and contains your API key
- Restart your dev server after adding the key
- On Vercel, check that the environment variable is set correctly

**Error: "Invalid API key"**
- Verify your API key is correct at https://console.anthropic.com/
- Make sure there are no extra spaces in your `.env.local` file
