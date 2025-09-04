"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Star, Clock, Calendar, Info, ExternalLink } from "lucide-react"
import { getImageUrl } from "@/lib/tmdb"

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

interface MovieCardProps {
  movie: Movie
  genreMap: Record<number, string>
}

export function MovieCard({ movie, genreMap }: MovieCardProps) {
  const [imageError, setImageError] = useState(false)
  const releaseYear = new Date(movie.release_date).getFullYear()

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-card border-border/50">
      <div className="flex gap-4 p-4">
        <div className="relative flex-shrink-0">
          <img
            src={imageError ? "/abstract-movie-poster.png" : getImageUrl(movie.poster_path, "w300")}
            alt={`${movie.title} poster`}
            className="w-24 h-36 object-cover rounded-md shadow-sm border border-border/20"
            onError={handleImageError}
          />
          {/* Rating overlay */}
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{movie.vote_average.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-lg text-balance text-card-foreground leading-tight">{movie.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{releaseYear}</span>
              </div>
              {movie.runtime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{movie.runtime}m</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <p className="text-sm text-muted-foreground mb-3 text-pretty leading-relaxed line-clamp-3">
              {movie.overview}
            </p>

            <div className="flex flex-wrap gap-1 mb-3">
              {movie.genre_ids.slice(0, 3).map((genreId) => (
                <Badge key={genreId} variant="destructive" className="text-xs text-accent-foreground">
                  {genreMap[genreId]}
                </Badge>
              ))}
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Info className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl text-balance">{movie.title}</DialogTitle>
                </DialogHeader>
                <MovieDetailView movie={movie} genreMap={genreMap} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}

function MovieDetailView({ movie, genreMap }: MovieCardProps) {
  const [imageError, setImageError] = useState(false)
  const releaseYear = new Date(movie.release_date).getFullYear()

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        <div className="flex-shrink-0">
          <img
            src={imageError ? "/abstract-movie-poster.png" : getImageUrl(movie.poster_path, "w500")}
            alt={`${movie.title} poster`}
            className="w-48 h-72 object-cover rounded-lg shadow-lg border border-border/20"
            onError={() => setImageError(true)}
          />
        </div>

        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Release Year:</span>
              <p className="text-foreground">{releaseYear}</p>
            </div>
            {movie.runtime && (
              <div>
                <span className="font-medium text-muted-foreground">Runtime:</span>
                <p className="text-foreground">{movie.runtime} minutes</p>
              </div>
            )}
            <div>
              <span className="font-medium text-muted-foreground">Rating:</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-foreground">{movie.vote_average.toFixed(1)}/10</span>
                </div>
              </div>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">TMDB ID:</span>
              <p className="text-foreground">#{movie.id}</p>
            </div>
          </div>

          <div>
            <span className="font-medium text-muted-foreground">Genres:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {movie.genre_ids.map((genreId) => (
                <Badge key={genreId} variant="destructive" className="text-accent-foreground">
                  {genreMap[genreId]}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-foreground mb-2">Overview</h3>
        <p className="text-muted-foreground leading-relaxed text-pretty">{movie.overview}</p>
      </div>

      <div className="flex gap-2">
        <Button asChild className="flex-1">
          <a
            href={`https://www.themoviedb.org/movie/${movie.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View on TMDB
          </a>
        </Button>
        <Button variant="outline" asChild className="flex-1 bg-transparent">
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(movie.title + " " + releaseYear + " movie watch")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Find to Watch
          </a>
        </Button>
      </div>
    </div>
  )
}
