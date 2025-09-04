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
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (messageContent: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: messageContent,

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

      // Handle conversational responses differently
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.conversational 
          ? data.response
          : (data.explanation || `I understand you're ${messageContent.toLowerCase()}. Let me recommend some perfect films for your mood:`),
        movies: data.conversational ? undefined : (data.movies || []),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error getting recommendations:", error)
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
