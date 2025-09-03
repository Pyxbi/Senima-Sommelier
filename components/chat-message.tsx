import { MovieCard } from "@/components/movie-card"
import { SommelierFeatures } from "@/components/sommelier-features"
import { EnhancedSommelierNote } from "@/components/enhanced-sommelier-note"

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
  explanation?: string
  sommelierNote?: string
  timestamp: Date
}

interface ChatMessageProps {
  message: ChatMessage
  genreMap: Record<number, string>
}

export function ChatMessage({ message, genreMap }: ChatMessageProps) {
  return (
    <div className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] ${
          message.type === "user" ? "bg-primary text-primary-foreground" : "bg-card"
        } rounded-lg p-4 shadow-sm`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>

        {/* Movie Recommendations */}
        {message.movies && message.movies.length > 0 && (
          <div className="mt-4 space-y-4">
            {message.movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} genreMap={genreMap} />
            ))}

            {/* Enhanced Sommelier's Note */}
            <EnhancedSommelierNote
              mood={message.content}
              explanation={message.explanation || "These selections are carefully curated to match your current mood."}
              customNote={message.sommelierNote}
            />

            {/* Special Features */}
            <SommelierFeatures movies={message.movies} mood={message.content} />
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-2 opacity-70">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  )
}
