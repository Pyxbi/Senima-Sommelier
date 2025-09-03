"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleSend = () => {
    if (!inputValue.trim()) return
    onSendMessage(inputValue)
    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="space-y-4">
      {/* Input Area */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your mood... (e.g., 'feeling nostalgic and want something heartwarming')"
            className="min-h-[50px] resize-none"
            disabled={isLoading}
          />
        </div>
        <Button onClick={handleSend} disabled={!inputValue.trim() || isLoading} size="lg" className="px-6">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Mood Suggestions */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">Quick mood suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "feeling stressed and need to unwind",
            "want something uplifting and hopeful",
            "in the mood for a good cry",
            "craving adventure and excitement",
            "need something thought-provoking",
          ].map((mood) => (
            <Button
              key={mood}
              variant="outline"
              size="sm"
              onClick={() => setInputValue(mood)}
              className="text-xs"
              disabled={isLoading}
            >
              {mood}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
