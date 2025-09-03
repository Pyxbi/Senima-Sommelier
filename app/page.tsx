"use client"
import { useState } from "react"
import { ChatHeader } from "@/components/chat-header"
import { ChatContainer } from "@/components/chat-container"
import { ChatInput } from "@/components/chat-input"

interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  release_date: string
  vote_average: number
  genre_ids: number[]
  runtime?: number
}

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  movies?: Movie[]
  timestamp: Date
}

const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
}

export default function CinemaSommelier() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Good evening! I'm your Cinema Sommelier, here to pair the perfect film with your current mood. What kind of cinematic journey are you in the mood for today?",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (messageContent: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: messageContent,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mood: messageContent }),
      })

      if (!response.ok) {
        throw new Error("Failed to get recommendations")
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          data.explanation ||
          `I understand you're ${messageContent.toLowerCase()}. Let me recommend some perfect films for your mood:`,
        movies: data.movies || [],
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error getting recommendations:", error)

      // Fallback to mock data if API fails
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `I understand you're ${messageContent.toLowerCase()}. Let me recommend some perfect films for your mood:`,
        movies: [
          {
            id: 1,
            title: "The Grand Budapest Hotel",
            overview:
              "A whimsical tale of adventure and friendship set in a legendary European hotel, perfect for lifting spirits with its visual charm and witty dialogue.",
            poster_path: "/the-grand-budapest-hotel-movie-poster.png",
            release_date: "2014-03-28",
            vote_average: 8.1,
            genre_ids: [35, 18, 12],
            runtime: 99,
          },
          {
            id: 2,
            title: "Paddington 2",
            overview:
              "A heartwarming story that acts like a warm hug, full of genuine kindness and optimism that gently lifts the spirits without feeling cheesy.",
            poster_path: "/paddington-2-movie-poster.jpg",
            release_date: "2017-11-10",
            vote_average: 7.8,
            genre_ids: [10751, 35, 12],
            runtime: 103,
          },
        ],
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <ChatHeader />

      {/* Main Chat Interface */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <ChatContainer messages={messages} isLoading={isLoading} genreMap={GENRE_MAP} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
