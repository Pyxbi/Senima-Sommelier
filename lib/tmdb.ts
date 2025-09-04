// TMDB API integration for Cinema Sommelier - SERVER SIDE ONLY
const TMDB_API_KEY = process.env.TMDB_API_KEY 
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

export interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  adult: boolean
  original_language: string
  original_title: string
  popularity: number
  video: boolean
}

export interface TMDBSearchResponse {
  page: number
  results: TMDBMovie[]
  total_pages: number
  total_results: number
}

export interface MovieSearchParams {
  query?: string
  genres?: string
  year?: number
  sort_by?: "popularity.desc" | "vote_average.desc" | "release_date.desc"
  vote_average_gte?: number
  with_keywords?: string
}
export async function searchMovies(params: MovieSearchParams): Promise<TMDBSearchResponse> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key is not configured")
  }

  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "en-US",
    page: "1",
    include_adult: "false",
    ...Object.fromEntries(Object.entries(params).filter(([_, value]) => value !== undefined)),
  })

  const endpoint = params.query ? "search/movie" : "discover/movie"
  const response = await fetch(`${TMDB_BASE_URL}/${endpoint}?${searchParams}`)

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`)
  }

  return response.json()
}

export async function getMovieDetails(movieId: number) {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key is not configured")
  }

  const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`)
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`)
  }

  return response.json()
}

export function getImageUrl(path: string | null, size: "w200" | "w300" | "w500" | "original" = "w300"): string {
  if (!path) return "/abstract-movie-poster.png"
  return `https://image.tmdb.org/t/p/${size}${path}`
}

// Genre mapping for TMDB genre IDs
export const TMDB_GENRES: Record<number, string> = {
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

// Mood to genre/keyword mapping for AI recommendations
export const MOOD_MAPPINGS = {
  // Stress and anxiety
  stressed: {
    genres: [35, 16, 10751], // Comedy, Animation, Family
    exclude_genres: [27, 53, 80], // Horror, Thriller, Crime
    keywords: "feel-good,heartwarming,uplifting,light-hearted",
    outcome: "relaxation and stress relief",
  },
  anxious: {
    genres: [35, 16, 99], // Comedy, Animation, Documentary
    exclude_genres: [27, 53, 80],
    keywords: "calming,peaceful,gentle,soothing",
    outcome: "peace and tranquility",
  },

  // Sadness and melancholy
  sad: {
    genres: [18, 10749, 35], // Drama, Romance, Comedy
    keywords: "hope,redemption,friendship,overcoming,healing",
    outcome: "emotional catharsis and hope",
  },
  melancholy: {
    genres: [18, 10402, 36], // Drama, Music, History
    keywords: "bittersweet,contemplative,beautiful,artistic",
    outcome: "thoughtful reflection",
  },
  heartbroken: {
    genres: [18, 10749], // Drama, Romance
    keywords: "healing,self-discovery,new-beginnings,empowerment",
    outcome: "emotional healing and growth",
  },

  // Energy and excitement
  energetic: {
    genres: [28, 12, 878], // Action, Adventure, Sci-Fi
    keywords: "high-energy,fast-paced,exciting,dynamic",
    outcome: "adrenaline and excitement",
  },
  adventurous: {
    genres: [12, 28, 14], // Adventure, Action, Fantasy
    keywords: "epic,journey,quest,exploration,discovery",
    outcome: "vicarious adventure",
  },
  restless: {
    genres: [28, 53, 9648], // Action, Thriller, Mystery
    keywords: "engaging,gripping,intense,captivating",
    outcome: "mental engagement",
  },

  // Contemplative and thoughtful
  thoughtful: {
    genres: [18, 878, 9648], // Drama, Sci-Fi, Mystery
    keywords: "philosophical,deep,meaningful,thought-provoking",
    outcome: "intellectual stimulation",
  },
  nostalgic: {
    genres: [18, 10749, 35], // Drama, Romance, Comedy
    keywords: "coming-of-age,childhood,memories,classic,vintage",
    outcome: "warm nostalgia",
  },
  contemplative: {
    genres: [18, 99, 36], // Drama, Documentary, History
    keywords: "introspective,meditative,profound,artistic",
    outcome: "deep reflection",
  },

  // Social and romantic
  lonely: {
    genres: [10749, 35, 18], // Romance, Comedy, Drama
    keywords: "friendship,connection,community,belonging",
    outcome: "sense of connection",
  },
  romantic: {
    genres: [10749, 35], // Romance, Comedy
    keywords: "love,romance,chemistry,passion,heartwarming",
    outcome: "romantic fulfillment",
  },

  // Inspiration and motivation
  unmotivated: {
    genres: [18, 36, 99], // Drama, History, Documentary
    keywords: "inspiring,triumph,perseverance,achievement,success",
    outcome: "motivation and inspiration",
  },
  hopeful: {
    genres: [18, 10751, 35], // Drama, Family, Comedy
    keywords: "uplifting,optimistic,positive,encouraging,bright",
    outcome: "renewed hope",
  },
}
