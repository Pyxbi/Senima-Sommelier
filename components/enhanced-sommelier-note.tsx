"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wine, Sparkles } from "lucide-react"

interface EnhancedSommelierNoteProps {
  mood: string
  explanation: string
  customNote?: string
}

export function EnhancedSommelierNote({ mood, explanation, customNote }: EnhancedSommelierNoteProps) {
  const generatePersonalizedNote = (mood: string): string => {
    const personalizedNotes: Record<string, string> = {
      stressed:
        "Like a master sommelier selecting the perfect vintage to calm the nerves, I've chosen these films for their gentle, restorative qualities. Each one offers a different path to tranquility.",

      sad: "In moments of sorrow, cinema becomes our companion. These selections understand that healing happens not by avoiding our feelings, but by finding stories that honor them while offering hope.",

      adventurous:
        "Your spirit craves the extraordinary! These cinematic journeys will satisfy your hunger for adventure, each offering a different flavor of excitement and discovery.",

      nostalgic:
        "There's poetry in looking backward. These films capture the bittersweet beauty of memory, like finding a treasured photograph that brings both joy and longing.",

      romantic:
        "Love deserves the finest pairing. These selections celebrate romance in all its forms - passionate, tender, complicated, and transformative.",

      thoughtful:
        "For the contemplative soul, I present films that respect your desire for depth. Each offers layers of meaning that will satisfy your intellectual palate.",

      lonely:
        "Connection is the most essential human need. These stories remind us that we're never truly alone, celebrating the bonds that make life meaningful.",

      energetic:
        "Your vibrant energy calls for equally dynamic storytelling! These high-octane selections will match your enthusiasm and keep your adrenaline flowing.",
    }

    // Find matching mood or return a general note
    const moodKey = Object.keys(personalizedNotes).find((key) => mood.toLowerCase().includes(key))
    return moodKey
      ? personalizedNotes[moodKey]
      : "Like a skilled sommelier, I've carefully selected these films to complement your current emotional palette, creating the perfect cinematic experience for this moment."
  }

  const sommelierNote = customNote || generatePersonalizedNote(mood)

  return (
    <Card className="mt-4 bg-gradient-to-r from-accent/10 via-primary/5 to-secondary/10 border-accent/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
              <Wine className="w-4 h-4 text-accent" />
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-accent/10 text-accent-foreground border-accent/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Sommelier's Expertise
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">{explanation}</p>

              <div className="border-l-2 border-accent/30 pl-3">
                <p className="text-sm text-foreground font-medium italic leading-relaxed">"{sommelierNote}"</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
