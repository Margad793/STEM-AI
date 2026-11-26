# STEM-AI (STEM2Connect AI Hackathon)

An AI-powered digital business card and STEM research portfolio platform built with **Next.js**, **Supabase**, **Tailwind CSS**, and **Google Gemini API**.

## Inspiration
At academic conferences, hackathons, and STEM networking events, thousands of paper business cards are handed out and quickly discarded—wasting paper and water while failing to showcase dynamic research, GitHub repositories, or live projects. We built **STEM-AI** to transform static networking into an intelligent, sustainable digital portfolio.

## What It Does & Key Features
- **AI-Powered STEM Bio Generator:** Uses Google Gemini (`gemini-2.5-flash`) with a built-in smart fallback to generate concise, role- and research-focused STEM bios.
- **Interactive Smart Card & Research Overlay:** A mobile-first digital card featuring a clean slide-up overlay for **STEM Bio & Research** highlights, direct links to GitHub, LinkedIn, research labs, QR code sharing, and one-tap vCard contact downloads.
- **Sustainability Impact Tracker:** Tracks card taps/views and estimates paper and water savings compared to traditional printed business cards.
- **Live Cloud Backend:** Powered by Supabase for authentication, profiles, and database storage.

## How We Built It
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`) with server-side fallback handling
- **Backend & Auth:** Supabase (PostgreSQL database, Authentication, Row-Level Security)
- **Deployment:** Vercel

## Links & Judge Demo Credentials
- **Live Demo:** https://stem-connect2026.vercel.app
- **Public Sample Card (No login required):** https://stem-connect2026.vercel.app/c/dxyfmvc07h
- **Repository:** https://github.com/Margad793/STEM-AI
- **Demo Account Email:** `Stem2ConnectAI@gmail.com`
- **Demo Account Password:** `Stem2ConnectAI1234`



## How to Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/Margad793/STEM-AI.git
cd STEM-AI

# 2. Install dependencies
npm install

# 3. Create a .env.local file and add your keys:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# GEMINI_API_KEY=your_google_gemini_api_key

# 4. Start the development server
npm run dev

# 5. Open http://localhost:3000 in your browser
```
