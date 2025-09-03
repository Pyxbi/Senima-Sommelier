"use client"

import { MovieCard } from "@/components/movie-card"

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

interface MovieGridProps {
  movies: Movie[]
  genreMap: Record<number, string>
  title?: string
}

export function MovieGrid({ movies, genreMap, title }: MovieGridProps) {
  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No movies found for your current mood.</p>
        <p className="text-sm text-muted-foreground mt-1">Try describing your feelings differently.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
      <div className="space-y-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} genreMap={genreMap} />
        ))}
      </div>
    </div>
  )
}
