"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wine, Clock, MapPin, Sparkles } from "lucide-react"
import {
  generatePerfectPairing,
  generateDoubleFeature,
  generatePaletteCleaner,
  generateContextualNote,
} from "@/lib/special-features"

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

interface SommelierFeaturesProps {
  movies: Movie[]
  mood: string
}

export function SommelierFeatures({ movies, mood }: SommelierFeaturesProps) {
  if (!movies || movies.length === 0) return null

  const currentTime = new Date()
  const hour = currentTime.getHours()
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 22 ? "evening" : "latenight"

  const primaryMovie = movies[0]
  const perfectPairing = generatePerfectPairing(primaryMovie.genre_ids, mood, timeOfDay)
  const doubleFeature = generateDoubleFeature(primaryMovie.genre_ids, mood)
  const paletteCleansers = generatePaletteCleaner(primaryMovie.genre_ids)
  const contextualNote = generateContextualNote(timeOfDay)

  return (
    <div className="space-y-4 mt-6">
      {/* Perfect Pairing */}
      <Card className="bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wine className="w-5 h-5 text-accent" />
            Perfect Pairing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Recommended Snack:</p>
              <p className="text-sm text-foreground">{perfectPairing.food}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Recommended Drink:</p>
              <p className="text-sm text-foreground">{perfectPairing.drink}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground italic">{perfectPairing.description}</p>
        </CardContent>
      </Card>

      {/* Double Feature */}
      {doubleFeature && (
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              Double Feature Suggestion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Badge variant="secondary" className="mb-2">
                {doubleFeature.theme}
              </Badge>
              <p className="text-sm text-muted-foreground mb-3">{doubleFeature.description}</p>
              <div className="space-y-1">
                {doubleFeature.movies.map((movie, index) => (
                  <p key={index} className="text-sm text-foreground">
                    {index + 1}. {movie}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contextual Note */}
      <Card className="bg-gradient-to-r from-secondary/5 to-accent/5 border-secondary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-secondary" />
            Timing & Atmosphere
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{contextualNote}</p>
        </CardContent>
      </Card>

      {/* Palette Cleanser */}
      {paletteCleansers.length > 0 && (
        <Card className="bg-gradient-to-r from-muted/50 to-card border-muted">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              Palette Cleanser Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              After this intense viewing experience, consider one of these lighter options:
            </p>
            <ul className="space-y-1">
              {paletteCleansers.map((suggestion, index) => (
                <li key={index} className="text-sm text-foreground">
                  • {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
