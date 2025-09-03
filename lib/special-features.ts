// Special Cinema Sommelier features: Perfect Pairings, Double Features, etc.

interface PerfectPairing {
  food: string
  drink: string
  description: string
}

interface DoubleFeatue {
  theme: string
  description: string
  movies: string[]
}

// Perfect Pairing suggestions based on movie genres and mood
export function generatePerfectPairing(genres: number[], mood: string, timeOfDay: string): PerfectPairing {
  const pairings: Record<string, PerfectPairing> = {
    // Genre-based pairings
    romance: {
      food: "Dark chocolate and strawberries",
      drink: "A glass of red wine or champagne",
      description: "The sweetness complements the romantic atmosphere, creating an indulgent viewing experience.",
    },
    comedy: {
      food: "Buttered popcorn and nachos",
      drink: "Craft beer or a fruity cocktail",
      description: "Classic comfort snacks that won't distract from the laughs and keep the mood light.",
    },
    horror: {
      food: "Spicy wings or jalapeño poppers",
      drink: "Strong coffee or an energy drink",
      description: "The heat matches the intensity, while caffeine keeps you alert for those jump scares.",
    },
    drama: {
      food: "Artisanal cheese and crackers",
      drink: "A sophisticated wine or herbal tea",
      description: "Refined flavors that complement the emotional depth without overwhelming the experience.",
    },
    action: {
      food: "Pizza slices or loaded fries",
      drink: "Cold beer or sports drink",
      description: "Hearty, satisfying food that matches the high-energy pace of the action.",
    },
    animation: {
      food: "Colorful candy and cookies",
      drink: "Hot chocolate or fruit juice",
      description: "Playful treats that capture the whimsical spirit of animated storytelling.",
    },
    scifi: {
      food: "Futuristic snacks like molecular gastronomy or space ice cream",
      drink: "Blue cocktails or energy drinks",
      description: "Innovative flavors that match the forward-thinking themes of science fiction.",
    },
    documentary: {
      food: "Healthy trail mix or fruit",
      drink: "Green tea or kombucha",
      description: "Mindful snacking that keeps you focused on learning without heavy distractions.",
    },
  }

  // Time-based adjustments
  const timeAdjustments: Record<string, Partial<PerfectPairing>> = {
    morning: {
      food: "Fresh pastries or breakfast items",
      drink: "Coffee or fresh juice",
    },
    afternoon: {
      food: "Light sandwiches or salads",
      drink: "Iced tea or sparkling water",
    },
    evening: {
      drink: "Wine or cocktails",
    },
    latenight: {
      food: "Comfort snacks like ice cream",
      drink: "Warm milk or decaf tea",
    },
  }

  // Mood-based adjustments
  const moodAdjustments: Record<string, Partial<PerfectPairing>> = {
    stressed: {
      food: "Comfort food like mac and cheese",
      drink: "Chamomile tea or warm cocoa",
      description: "Soothing comfort foods that help you relax and unwind.",
    },
    sad: {
      food: "Your favorite comfort treats",
      drink: "Warm beverages like tea or hot chocolate",
      description: "Familiar flavors that provide emotional comfort during difficult moments.",
    },
    celebratory: {
      food: "Gourmet snacks or desserts",
      drink: "Champagne or festive cocktails",
      description: "Special treats that enhance the celebratory mood.",
    },
  }

  // Determine primary genre
  const genreMap: Record<number, string> = {
    10749: "romance",
    35: "comedy",
    27: "horror",
    18: "drama",
    28: "action",
    16: "animation",
    878: "scifi",
    99: "documentary",
  }

  const primaryGenre = genres.find((g) => genreMap[g]) || 35
  const genreKey = genreMap[primaryGenre] || "comedy"

  let pairing = { ...pairings[genreKey] }

  // Apply time adjustments
  if (timeAdjustments[timeOfDay]) {
    pairing = { ...pairing, ...timeAdjustments[timeOfDay] }
  }

  // Apply mood adjustments
  const moodKey = Object.keys(moodAdjustments).find((m) => mood.toLowerCase().includes(m))
  if (moodKey && moodAdjustments[moodKey]) {
    pairing = { ...pairing, ...moodAdjustments[moodKey] }
  }

  return pairing
}

// Double feature suggestions based on themes
export function generateDoubleFeature(primaryGenres: number[], mood: string): DoubleFeatue | null {
  const doubleFeatures: DoubleFeatue[] = [
    {
      theme: "Artificial Intelligence & Humanity",
      description: "Explore the relationship between humans and AI through different cinematic lenses.",
      movies: ["Blade Runner 2049", "Her"],
    },
    {
      theme: "Coming of Age Stories",
      description: "Two perspectives on growing up and finding your place in the world.",
      movies: ["Lady Bird", "Eighth Grade"],
    },
    {
      theme: "Heist & Crime Capers",
      description: "The perfect double feature for fans of clever criminals and elaborate schemes.",
      movies: ["Ocean's Eleven", "The Italian Job"],
    },
    {
      theme: "Space Exploration",
      description: "Journey through the cosmos with these complementary space adventures.",
      movies: ["Interstellar", "Gravity"],
    },
    {
      theme: "Romantic Comedies Through Time",
      description: "Classic and modern takes on love and laughter.",
      movies: ["When Harry Met Sally", "The Big Sick"],
    },
    {
      theme: "Animated Masterpieces",
      description: "Two stunning examples of animation as an art form.",
      movies: ["Spirited Away", "WALL-E"],
    },
    {
      theme: "Psychological Thrillers",
      description: "Mind-bending stories that will keep you guessing until the end.",
      movies: ["Shutter Island", "Gone Girl"],
    },
    {
      theme: "Musical Journeys",
      description: "Celebrate the power of music through different storytelling approaches.",
      movies: ["La La Land", "A Star Is Born"],
    },
  ]

  // Simple matching based on genres and mood
  if (primaryGenres.includes(878)) return doubleFeatures[0] // Sci-Fi
  if (primaryGenres.includes(18) && mood.includes("nostalgic")) return doubleFeatures[1] // Coming of age
  if (primaryGenres.includes(80) || primaryGenres.includes(28)) return doubleFeatures[2] // Crime/Action
  if (primaryGenres.includes(878)) return doubleFeatures[3] // Space
  if (primaryGenres.includes(10749)) return doubleFeatures[4] // Romance
  if (primaryGenres.includes(16)) return doubleFeatures[5] // Animation
  if (primaryGenres.includes(53)) return doubleFeatures[6] // Thriller
  if (primaryGenres.includes(10402)) return doubleFeatures[7] // Music

  return null
}

// Palette cleanser suggestions for after heavy movies
export function generatePaletteCleaner(previousGenres: number[]): string[] {
  const heavyGenres = [18, 27, 53, 80] // Drama, Horror, Thriller, Crime
  const isHeavy = previousGenres.some((g) => heavyGenres.includes(g))

  if (!isHeavy) return []

  return [
    "A delightful Pixar short film to restore your faith in humanity",
    "A nature documentary segment showcasing beautiful landscapes",
    "A feel-good music video or concert performance",
    "A comedy sketch or stand-up routine to lighten the mood",
    "A peaceful cooking or crafting tutorial video",
  ]
}

// Location and time-aware suggestions
export function generateContextualNote(timeOfDay: string, weather?: string): string {
  const timeNotes: Record<string, string> = {
    morning: "Perfect for a leisurely morning viewing with your coffee. The gentle pace will ease you into the day.",
    afternoon: "An ideal afternoon escape that won't leave you too emotionally drained for the rest of your day.",
    evening: "The perfect way to unwind after a long day. Settle in with some comfort food and enjoy.",
    latenight:
      "A cozy late-night viewing that will give you pleasant dreams. Keep the lights dim for the full experience.",
  }

  const weatherNotes: Record<string, string> = {
    rainy: "The perfect companion for a rainy day - let the weather outside enhance the cozy atmosphere.",
    sunny: "While it's beautiful outside, sometimes the best adventures happen indoors with a great film.",
    snowy: "Bundle up with a warm blanket and let this film transport you somewhere magical.",
    cloudy: "The overcast sky creates the perfect ambiance for this cinematic journey.",
  }

  let note = timeNotes[timeOfDay] || ""
  if (weather && weatherNotes[weather]) {
    note += " " + weatherNotes[weather]
  }

  return note
}
