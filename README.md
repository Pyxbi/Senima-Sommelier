# 🎬 Cinema Sommelier

An AI-powered movie recommendation service that analyzes your mood and preferences to suggest perfect films for any occasion.

## ✨ Features

- **Intelligent Mood Analysis**: AI analyzes your current mood and context to recommend fitting movies
- **Conversational Interface**: Chat naturally with the AI sommelier about your movie preferences  
- **Learning Feedback Loop**: Tracks rejected recommendations to refine future suggestions
- **Real Movie Data**: Powered by TMDB API for accurate movie information and posters
- **Responsive Design**: Beautiful UI built with Next.js and Tailwind CSS

## 🚀 Quick Start

1. **Clone and install**:
   ```bash
   git clone <repo-url>
   cd cinema-sommelier
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Add your API keys:
   - `FIREWORKS_API_KEY` - For AI recommendations
   - `TMDB_API_KEY` - For movie data

3. **Run the development server**:
   ```bash
   pnpm dev
   ```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **AI**: Fireworks API (Llama 3.3 70B model)
- **Movie Data**: The Movie Database (TMDB) API (will add the anime movie for further)
- **Package Manager**: pnpm

## 💬 How It Works

1. Tell the AI how you're feeling or what you're looking for
2. The AI analyzes your mood and preferences using advanced language models
3. Get personalized movie recommendations with detailed explanations
4. Like or reject suggestions to help the AI learn your taste
5. Enjoy your perfectly matched movie experience!

---

*Built with  for movie lovers who want the perfect film for every moment.*
