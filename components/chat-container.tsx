import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "@/components/chat-message"
import { TypingIndicator } from "@/components/typing-indicator"

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

interface ChatContainerProps {
  messages: {
    id: string
    type: "user" | "assistant"
    content: string
    movies?: Movie[]
  }[]
  isLoading: boolean
  genreMap: Record<number, string>
}

export function ChatContainer({ messages, isLoading, genreMap }: ChatContainerProps) {
  return (
    <ScrollArea className="h-[calc(100vh-200px)] mb-6">
      <div className="space-y-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} genreMap={genreMap} />
        ))}

        {isLoading && <TypingIndicator />}
      </div>
    </ScrollArea>
  )
}
