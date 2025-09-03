// AI Sommelier Engine - Analyzes mood and generates movie recommendations

interface MoodAnalysis {
  primaryEmotion: string
  intensity: "low" | "medium" | "high"
  desiredOutcome: string
  genres: number[]
  keywords: string
  explanation: string
  sommelierNote: string
}

// Mood keyword mappings for different emotional states
const MOOD_PATTERNS = {
  // Stress and anxiety
  stressed: {
    genres: [35, 16, 10751], // Comedy, Animation, Family
    excludeGenres: [27, 53, 80], // Horror, Thriller, Crime
    keywords: "feel-good,heartwarming,uplifting,light-hearted",
    outcome: "relaxation and stress relief",
  },
  anxious: {
    genres: [35, 16, 99], // Comedy, Animation, Documentary
    excludeGenres: [27, 53, 80],
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

export async function analyzeMoodAndRecommend(moodDescription: string): Promise<MoodAnalysis> {
  const mood = moodDescription.toLowerCase()

  // Simple keyword matching for mood analysis
  let matchedPattern = null
  let bestMatch = ""

  for (const [pattern, config] of Object.entries(MOOD_PATTERNS)) {
    if (mood.includes(pattern) || mood.includes(pattern.slice(0, -2))) {
      matchedPattern = config
      bestMatch = pattern
      break
    }
  }

  // Fallback patterns based on common words
  if (!matchedPattern) {
    if (mood.includes("tired") || mood.includes("exhausted")) {
      matchedPattern = MOOD_PATTERNS.stressed
      bestMatch = "tired"
    } else if (mood.includes("happy") || mood.includes("good")) {
      matchedPattern = MOOD_PATTERNS.hopeful
      bestMatch = "happy"
    } else if (mood.includes("bored")) {
      matchedPattern = MOOD_PATTERNS.restless
      bestMatch = "bored"
    } else if (mood.includes("confused") || mood.includes("lost")) {
      matchedPattern = MOOD_PATTERNS.contemplative
      bestMatch = "confused"
    } else {
      // Default to uplifting content
      matchedPattern = MOOD_PATTERNS.hopeful
      bestMatch = "general"
    }
  }

  // Generate explanation based on the matched mood
  const explanation = generateExplanation(moodDescription, bestMatch, matchedPattern.outcome)
  const sommelierNote = generateSommelierNote(bestMatch, matchedPattern.outcome)

  return {
    primaryEmotion: bestMatch,
    intensity: determineIntensity(moodDescription),
    desiredOutcome: matchedPattern.outcome,
    genres: matchedPattern.genres,
    keywords: matchedPattern.keywords,
    explanation,
    sommelierNote,
  }
}

function determineIntensity(mood: string): "low" | "medium" | "high" {
  const highIntensityWords = ["extremely", "very", "really", "so", "incredibly", "absolutely"]
  const lowIntensityWords = ["a bit", "slightly", "somewhat", "kind of", "a little"]

  if (highIntensityWords.some((word) => mood.toLowerCase().includes(word))) {
    return "high"
  } else if (lowIntensityWords.some((word) => mood.toLowerCase().includes(word))) {
    return "low"
  }
  return "medium"
}

function generateExplanation(originalMood: string, detectedEmotion: string, outcome: string): string {
  const explanations = {
    stressed: `I can sense you're feeling overwhelmed. For ${outcome}, I've selected films that offer gentle escapism without additional tension.`,
    sad: `I understand you're going through a difficult time. These films are chosen to provide ${outcome} through stories of resilience and human connection.`,
    adventurous: `Your adventurous spirit calls for epic storytelling! These selections will satisfy your craving for ${outcome} and grand narratives.`,
    thoughtful: `I appreciate your contemplative mood. These films are curated to provide ${outcome} and meaningful cinematic experiences.`,
    nostalgic: `There's something beautiful about looking back. These films will embrace your ${outcome} with stories that honor the past.`,
    lonely: `Connection is what you're seeking. These films celebrate ${outcome} and the power of human relationships.`,
    romantic: `Love is in the air! These selections are perfect for indulging in ${outcome} and heartwarming romance.`,
    tired: `You need something that won't demand too much energy. These gentle films offer ${outcome} and easy viewing.`,
    happy: `Your positive energy deserves to be celebrated! These uplifting films will amplify your ${outcome}.`,
    bored: `Time to shake things up! These engaging films will provide the ${outcome} you're craving.`,
    general: `Based on your mood, I've selected films that should provide ${outcome} and an enjoyable viewing experience.`,
  }

  return explanations[detectedEmotion as keyof typeof explanations] || explanations.general
}

function generateSommelierNote(emotion: string, outcome: string): string {
  const notes = {
    stressed:
      "Like a warm cup of tea on a rainy day, these films offer comfort without complexity. Each selection provides gentle humor and heartwarming moments that naturally ease tension.",
    sad: "These films understand that sometimes we need to feel our emotions fully before we can heal. They offer hope without dismissing your current feelings.",
    adventurous:
      "Bold flavors for a bold spirit! These cinematic journeys will transport you to worlds where anything is possible and heroes rise to meet their destiny.",
    thoughtful:
      "Intellectual palate cleansers that respect your desire for depth. Each film offers layers of meaning that will satisfy your contemplative nature.",
    nostalgic:
      "Like finding a treasured photograph, these films capture the bittersweet beauty of memory and the passage of time.",
    lonely:
      "Stories that remind us we're never truly alone. These films celebrate the connections that make life meaningful.",
    romantic:
      "Pure romantic indulgence - like the perfect wine paired with candlelight. These films understand the language of the heart.",
    tired:
      "Comfort food for the soul. These selections require minimal emotional investment while providing maximum satisfaction.",
    happy:
      "Effervescent and bright, like champagne bubbles. These films will amplify your joy without overwhelming your senses.",
    bored:
      "Sharp, engaging flavors to awaken your interest. These films provide the mental stimulation you're craving.",
    general:
      "A carefully balanced selection designed to complement your current emotional palette and enhance your viewing experience.",
  }

  return notes[emotion as keyof typeof notes] || notes.general
}

// Export mood patterns for use in other components
export { MOOD_PATTERNS }
