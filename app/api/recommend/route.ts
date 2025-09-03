import { type NextRequest, NextResponse } from "next/server"
import { searchMovies } from "@/lib/tmdb"
import { analyzeMoodAndRecommend } from "@/app/api/recommend/ai-sommelier"

export async function POST(request: NextRequest) {
  try {
    const { mood } = await request.json()

    if (!mood || typeof mood !== "string") {
      return NextResponse.json({ error: "Mood description is required" }, { status: 400 })
    }

    // Use AI to analyze mood and generate search parameters
    const recommendation = await analyzeMoodAndRecommend(mood)

    // Search for movies using TMDB API with fallback to mock data
    let movieResults
    try {
      movieResults = await searchMovies({
        genres: recommendation.genres.join(","),
        sort_by: "vote_average.desc",
        vote_average_gte: 6.5,
        with_keywords: recommendation.keywords,
      })
    } catch (tmdbError) {
      console.warn("TMDB API unavailable, using fallback data:", tmdbError)
      // Fallback to curated movie data
      movieResults = {
        results: [
          {
            id: 1,
            title: "The Grand Budapest Hotel",
            overview:
              "A whimsical tale of adventure and friendship set in a legendary European hotel, perfect for lifting spirits with its visual charm and witty dialogue.",
            poster_path: "/the-grand-budapest-hotel-movie-poster.png",
            release_date: "2014-03-28",
            vote_average: 8.1,
            genre_ids: recommendation.genres,
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
            genre_ids: recommendation.genres,
            runtime: 103,
          },
          {
            id: 3,
            title: "Studio Ghibli Collection",
            overview:
              "Immerse yourself in the magical worlds of Miyazaki, where every frame is a work of art and every story touches the soul.",
            poster_path: "/studio-ghibli-spirited-away-movie-poster.jpg",
            release_date: "2001-07-20",
            vote_average: 9.3,
            genre_ids: recommendation.genres,
            runtime: 125,
          },
        ],
      }
    }

    // Select top 3 movies and add runtime/genre info
    const selectedMovies = movieResults.results.slice(0, 3).map((movie) => ({
      ...movie,
      runtime: movie || Math.floor(Math.random() * 60) + 90, // Simulate runtime data if missing
    }))

    return NextResponse.json({
      movies: selectedMovies,
      explanation: recommendation.explanation,
      sommelierNote: recommendation.sommelierNote,
    })
  } catch (error) {
    console.error("Recommendation error:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
