// app/api/recommend/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { searchMovies } from "@/lib/tmdb"
import { analyzeMoodAndRecommend, getTimeContext } from "@/app/api/recommend/ai-sommelier"

export async function POST(request: NextRequest) {
  try {
    const { mood, previousAnalysis } = await request.json()

    if (!mood || typeof mood !== "string") {
      return NextResponse.json({ error: "Mood description is required" }, { status: 400 })
    }

    // Get time context for enhanced recommendations
    const timeContext = getTimeContext()
    console.log(`Processing mood request at ${timeContext.timeOfDay} on ${timeContext.dayOfWeek}`)

    // Use enhanced AI to analyze mood and generate search parameters
    const recommendation = await analyzeMoodAndRecommend(mood, previousAnalysis)

    // Check if this is a conversational response (more token efficient path)
    if (recommendation.isConversational && recommendation.conversationResponse) {
      console.log("Returning conversational response");
      return NextResponse.json({
        conversational: true,
        response: recommendation.conversationResponse,
        context: {
          time: timeContext
        }
      });
    }

    // Continue with full movie recommendation path
    console.log("Continuing with movie recommendation");

    // Log AI analysis for debugging
    console.log("AI Analysis:", {
      emotion: recommendation.primaryEmotion,
      intensity: recommendation.intensity,
      genres: recommendation.genres,
      keywords: recommendation.keywords
    })

    // Search for movies using TMDB API with AI-generated parameters
    let movieResults
    try {
      // Build search parameters from AI analysis
      const searchParams: any = {
        sort_by: "vote_average.desc",
        vote_average_gte: 7.0, // Higher threshold for quality
        vote_count_gte: 100, // Ensure movies have enough reviews
        with_genres: recommendation.genres.join(","),
      }

      // Add country preference to search if available
      if (recommendation.countryPreference) {
          searchParams.with_origin_country = recommendation.countryPreference;
      }

      // Exclude movies if requested
      if (recommendation.excludedMovies && recommendation.excludedMovies.length > 0) {
          searchParams.without_movies = recommendation.excludedMovies.join(',');
      }

      // Add keywords if available (TMDB keyword search is tricky)
      // For better results, we might need to do multiple searches
      if (recommendation.keywords) {
        // First search with genres
        const genreResults = await searchMovies(searchParams)

        // If we have keywords, we could do a text search too
        const keywordSearchParams = {
          query: recommendation.keywords.split(",")[0], // Use first keyword for text search
          sort_by: "vote_average.desc" as "vote_average.desc",
          vote_average_gte: 6.5
        }

        const keywordResults = await searchMovies(keywordSearchParams)

        // Combine and deduplicate results
        const combinedResults = [...genreResults.results, ...keywordResults.results]
        const uniqueResults = Array.from(
          new Map(combinedResults.map(movie => [movie.id, movie])).values()
        )

        // Sort by vote average and relevance
        uniqueResults.sort((a, b) => {
          // Prioritize movies that match our genres
          const aGenreMatch = a.genre_ids.some(id => recommendation.genres.includes(id))
          const bGenreMatch = b.genre_ids.some(id => recommendation.genres.includes(id))

          if (aGenreMatch && !bGenreMatch) return -1
          if (!aGenreMatch && bGenreMatch) return 1

          // Then sort by rating
          return b.vote_average - a.vote_average
        })

        movieResults = { results: uniqueResults.slice(0, 10) }
      } else {
        movieResults = await searchMovies(searchParams)
      }
    } catch (tmdbError) {
      console.error("TMDB API error:", tmdbError)

      // Enhanced fallback data based on AI analysis
      movieResults = {
        results: generateFallbackMovies(recommendation)
      }
    }

    // Select top 3 movies and add runtime info
    const selectedMovies = movieResults.results.slice(0, 3).map((movie: any) => ({
      ...movie,
      runtime: movie.runtime || Math.floor(Math.random() * 30) + 90, // Estimate if missing
      // Add AI-generated context for each movie
      aiContext: generateMovieContext(movie, recommendation)
    }))

    // Build the complete response with AI enhancements
    const response = {
      movies: selectedMovies,
      explanation: recommendation.explanation,
      sommelierNote: recommendation.sommelierNote,
      perfectPairing: recommendation.perfectPairing,
      doubleFeature: recommendation.doubleFeature,
      moodAnalysis: {
        primaryEmotion: recommendation.primaryEmotion,
        intensity: recommendation.intensity,
        desiredOutcome: recommendation.desiredOutcome
      },
      context: {
        time: timeContext,
        enhancedRecommendations: true
      },
      // Store the current movie results for future refinement
      responseMovies: selectedMovies
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Recommendation error:", error)

    // Even in error, try to provide something useful
    return NextResponse.json({
      error: "Failed to generate personalized recommendations",
      fallback: true,
      movies: getEmergencyFallbackMovies(),
      explanation: "I'm having trouble accessing my full recommendation engine, but here are some universally loved films that might suit your mood.",
      sommelierNote: "Even when technology fails us, great cinema endures. These selections are timeless for a reason."
    }, { status: 200 }) // Return 200 to not break the UI
  }
}

/**
 * Generate movie-specific context based on AI analysis
 */
function generateMovieContext(movie: any, recommendation: any): string {
  const contexts: Record<string, string[]> = {
    stressed: [
      "This film's gentle pacing will help slow your racing thoughts",
      "The beautiful cinematography serves as visual meditation",
      "A story that asks nothing of you but to watch and smile"
    ],
    sad: [
      "Characters who understand pain but choose hope anyway",
      "A narrative that honors difficult emotions while suggesting healing",
      "The kind of film that sits with you in your feelings"
    ],
    adventurous: [
      "Buckle up for a ride that never lets up",
      "Epic in scope and ambition, matching your energy",
      "The cinematic equivalent of your favorite roller coaster"
    ],
    thoughtful: [
      "Layers upon layers of meaning to unpack",
      "A film that respects your intelligence",
      "Will have you thinking about it days later"
    ],
    romantic: [
      "Chemistry so palpable you can feel it through the screen",
      "Romance done right - neither cheesy nor cynical",
      "Will make you believe in love again"
    ],
    nostalgic: [
      "Takes you back to a time when everything felt possible",
      "The kind of movie that makes you call an old friend",
      "Captures the bittersweet beauty of looking back"
    ]
  }

  const emotionContexts = contexts[recommendation.primaryEmotion] || contexts.stressed
  return emotionContexts[Math.floor(Math.random() * emotionContexts.length)]
}

/**
 * Generate fallback movies based on AI mood analysis
 */
function generateFallbackMovies(recommendation: any): any[] {
  const fallbackDatabase: Record<string, any[]> = {
    stressed: [
      {
        id: 1,
        title: "Spirited Away",
        overview: "A masterpiece of visual storytelling that transports you completely into another world, asking nothing but your wonder.",
        poster_path: "/spirited-away.jpg",
        release_date: "2001-07-20",
        vote_average: 8.5,
        genre_ids: [16, 10751, 14]
      },
      {
        id: 2,
        title: "The Grand Budapest Hotel",
        overview: "Wes Anderson's most delightful confection - a visual feast that's both melancholic and joyous, like a perfect macaron.",
        poster_path: "/grand-budapest.jpg",
        release_date: "2014-03-07",
        vote_average: 8.1,
        genre_ids: [35, 18]
      },
      {
        id: 3,
        title: "Paddington 2",
        overview: "Pure, concentrated joy. A film so genuinely good-hearted it could cure cynicism.",
        poster_path: "/paddington2.jpg",
        release_date: "2017-11-10",
        vote_average: 7.8,
        genre_ids: [10751, 35, 12]
      }
    ],
    sad: [
      {
        id: 4,
        title: "About Time",
        overview: "A film about love, loss, and the preciousness of ordinary moments that manages to be both heartbreaking and uplifting.",
        poster_path: "/about-time.jpg",
        release_date: "2013-11-01",
        vote_average: 7.8,
        genre_ids: [35, 18, 14]
      },
      {
        id: 5,
        title: "Inside Out",
        overview: "Pixar's masterpiece about emotions that validates every feeling while teaching us that sadness has its place in joy.",
        poster_path: "/inside-out.jpg",
        release_date: "2015-06-19",
        vote_average: 8.1,
        genre_ids: [16, 10751, 18]
      },
      {
        id: 6,
        title: "Her",
        overview: "A tender exploration of love and loneliness in the modern age that finds beauty in melancholy.",
        poster_path: "/her.jpg",
        release_date: "2013-12-18",
        vote_average: 8.0,
        genre_ids: [18, 10749, 878]
      }
    ],
    adventurous: [
      {
        id: 7,
        title: "Mad Max: Fury Road",
        overview: "A relentless chase that never lets up - pure cinema at its most visceral and exhilarating.",
        poster_path: "/mad-max-fury-road.jpg",
        release_date: "2015-05-15",
        vote_average: 8.1,
        genre_ids: [28, 12, 878]
      },
      {
        id: 8,
        title: "The Princess Bride",
        overview: "Adventure, romance, comedy, and heart - everything you want in a perfect adventure story.",
        poster_path: "/princess-bride.jpg",
        release_date: "1987-09-25",
        vote_average: 8.0,
        genre_ids: [12, 10751, 14]
      },
      {
        id: 9,
        title: "Spider-Man: Into the Spider-Verse",
        overview: "A visual revolution that matches its energy with heart - superhero storytelling at its finest.",
        poster_path: "/spider-verse.jpg",
        release_date: "2018-12-14",
        vote_average: 8.4,
        genre_ids: [16, 28, 12]
      }
    ],
    thoughtful: [
      {
        id: 10,
        title: "Arrival",
        overview: "Science fiction that explores language, time, and what it means to be human with breathtaking intelligence.",
        poster_path: "/arrival.jpg",
        release_date: "2016-11-11",
        vote_average: 7.9,
        genre_ids: [18, 878]
      },
      {
        id: 11,
        title: "Parasite",
        overview: "A masterclass in filmmaking that unpacks class, family, and society with surgical precision and dark humor.",
        poster_path: "/parasite.jpg",
        release_date: "2019-05-30",
        vote_average: 8.5,
        genre_ids: [35, 18, 53]
      },
      {
        id: 12,
        title: "Moonlight",
        overview: "A triptych of identity, sexuality, and masculinity told with poetry and profound empathy.",
        poster_path: "/moonlight.jpg",
        release_date: "2016-10-21",
        vote_average: 7.4,
        genre_ids: [18]
      }
    ],
    romantic: [
      {
        id: 13,
        title: "Before Sunrise",
        overview: "Two strangers, one night in Vienna, and conversations that feel like falling in love.",
        poster_path: "/before-sunrise.jpg",
        release_date: "1995-01-27",
        vote_average: 8.1,
        genre_ids: [18, 10749]
      },
      {
        id: 14,
        title: "The Princess Bride",
        overview: "True love, adventure, and perfect quotable dialogue - romance with wit and sword fights.",
        poster_path: "/princess-bride.jpg",
        release_date: "1987-09-25",
        vote_average: 8.0,
        genre_ids: [12, 10751, 14, 10749]
      },
      {
        id: 15,
        title: "Eternal Sunshine of the Spotless Mind",
        overview: "A unique exploration of love's complexity - both the pain and beauty of romantic memory.",
        poster_path: "/eternal-sunshine.jpg",
        release_date: "2004-03-19",
        vote_average: 8.3,
        genre_ids: [18, 10749, 878]
      }
    ],
    nostalgic: [
      {
        id: 16,
        title: "Stand By Me",
        overview: "The perfect coming-of-age story about friendship, growing up, and the summer that changes everything.",
        poster_path: "/stand-by-me.jpg",
        release_date: "1986-08-22",
        vote_average: 8.1,
        genre_ids: [18, 12]
      },
      {
        id: 17,
        title: "The Sandlot",
        overview: "Summer, baseball, and the kind of childhood friendships that feel like they'll last forever.",
        poster_path: "/sandlot.jpg",
        release_date: "1993-04-07",
        vote_average: 7.8,
        genre_ids: [35, 10751, 18]
      },
      {
        id: 18,
        title: "Cinema Paradiso",
        overview: "A love letter to movies and the magic of childhood, told with Italian warmth and wisdom.",
        poster_path: "/cinema-paradiso.jpg",
        release_date: "1988-11-17",
        vote_average: 8.5,
        genre_ids: [18, 10749]
      }
    ]
  }

  // Return movies for the detected emotion, or default to thoughtful films
  return fallbackDatabase[recommendation.primaryEmotion] || fallbackDatabase.thoughtful
}

/**
 * Emergency fallback for when everything fails
 */
function getEmergencyFallbackMovies(): any[] {
  return [
    {
      id: 999,
      title: "The Shawshank Redemption",
      overview: "Hope is a good thing, maybe the best of things, and no good thing ever dies.",
      poster_path: "/shawshank.jpg",
      release_date: "1994-09-23",
      vote_average: 9.3,
      genre_ids: [18],
      runtime: 142,
      aiContext: "A timeless story that reminds us why we love movies in the first place"
    },
    {
      id: 998,
      title: "Spirited Away",
      overview: "A magical journey that works for any mood, any time, any viewer.",
      poster_path: "/spirited-away.jpg",
      release_date: "2001-07-20",
      vote_average: 8.5,
      genre_ids: [16, 10751, 14],
      runtime: 125,
      aiContext: "Pure cinematic magic that transcends age, culture, and mood"
    },
    {
      id: 997,
      title: "Goodfellas",
      overview: "As far back as I can remember, I always wanted to watch a great movie.",
      poster_path: "/goodfellas.jpg",
      release_date: "1990-09-21",
      vote_average: 8.7,
      genre_ids: [18, 80],
      runtime: 146,
      aiContext: "Scorsese's masterpiece that never gets old, no matter how many times you've seen it"
    }
  ]
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "AI Movie Sommelier",
    version: "2.0.0",
    capabilities: [
      "Mood analysis with Fireworks AI",
      "TMDB integration",
      "Perfect pairing suggestions",
      "Double feature curation",
      "Contextual recommendations"
    ]
  })
}