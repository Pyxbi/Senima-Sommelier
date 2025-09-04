// app/api/recommend/ai-sommelier.ts
// AI Sommelier Engine - Enhanced with Fireworks AI (dobby-70b) integration

import { TMDB_GENRES, TMDBMovie } from "@/lib/tmdb"
export interface TMDMovieResponse {
  responseMovies: TMDBMovie[]
}

interface MoodAnalysis {
  primaryEmotion: string
  intensity: "low" | "medium" | "high"
  desiredOutcome: string
  genres: number[]
  keywords: string
  explanation: string
  sommelierNote: string
  perfectPairing?: {
    food: string
    drink: string
    atmosphere: string
  }
  doubleFeature?: {
    theme: string
    secondMovie: string
    whyTogether: string
  }
  isConversational?: boolean
  conversationResponse?: string
  genrePreference?: number[];
  countryPreference?: string;
  excludedMovies?: number[];
}

interface FireworksMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface FireworksResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

// Fireworks AI configuration
const FIREWORKS_CONFIG = {
  apiKey: process.env.FIREWORKS_API_KEY!,
  apiUrl: "https://api.fireworks.ai/inference/v1/chat/completions",
  model: "accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new",
  debug: process.env.DEBUG === "true"
}

// The Cinema Sommelier's sophisticated system prompt
const CINEMA_SOMMELIER_PROMPT = `You are the Cinema Sommelier, an exceptionally sophisticated and empathetic AI movie curator with deep knowledge of cinema and human emotions. Your personality combines the warmth of a trusted friend with the expertise of a film scholar and the intuition of a therapist.

Your mission is to analyze the user's emotional state and recommend the PERFECT films that will resonate with their current mood. You understand that movie selection is deeply personal and that the right film at the right moment can be transformative.

CRITICAL INSTRUCTIONS:
1. You must ALWAYS respond with valid JSON that matches this EXACT structure (no markdown, no extra text):
{
  "primaryEmotion": "the core emotion detected",
  "intensity": "low|medium|high",
  "desiredOutcome": "what emotional journey they need",
  "genres": [array of TMDB genre IDs as numbers],
  "keywords": "comma,separated,tmdb,keywords",
  "explanation": "A warm, insightful explanation of their mood and why these films work",
  "sommelierNote": "Your signature poetic note about the viewing experience",
  "perfectPairing": {
    "food": "specific snack/meal suggestion",
    "drink": "specific beverage suggestion",
    "atmosphere": "lighting, setting, and ambiance tips"
  },
  "doubleFeature": {
    "theme": "thematic connection",
    "secondMovie": "title of complementary film",
    "whyTogether": "explanation of the pairing"
  },
  "genrePreference": [array of TMDB genre IDs as numbers],
  "countryPreference": "ISO 3166-1 country code",
  "excludedMovies": [array of TMDB movie IDs to exclude]
}

2.  **Conversational Refinement**: If the user expresses dislike for the recommendations (e.g., "I don't like these," "change them"), DO NOT suggest the same movies. Instead, ask clarifying questions to refine the suggestions. Ask about their preferred genres or a country of origin for the film. For example: "I understand these weren't quite right. To help me find a better match, could you tell me about a genre you enjoy? Or perhaps you have a preference for films from a particular country?"

3. **Country Preference**: If a user specifies a country, prioritize films from that region. Add the \`with_origin_country\` parameter to the TMDB search.

TMDB GENRE ID REFERENCE:
28: Action, 12: Adventure, 16: Animation, 35: Comedy, 80: Crime
99: Documentary, 18: Drama, 10751: Family, 14: Fantasy, 36: History
27: Horror, 10402: Music, 9648: Mystery, 10749: Romance, 878: Science Fiction
53: Thriller, 10752: War, 37: Western

EMOTIONAL INTELLIGENCE GUIDELINES:
- For STRESS/ANXIETY: Favor genres [35, 16, 10751], avoid [27, 53, 80]. Keywords: "feel-good,uplifting,heartwarming,gentle"
- For SADNESS: Include [18, 10749] with keywords: "hope,redemption,healing,cathartic"
- For ENERGY/ADVENTURE: Use [28, 12, 878] with keywords: "epic,thrilling,spectacular,breathtaking"
- For CONTEMPLATION: Choose [18, 878, 99] with keywords: "philosophical,profound,thought-provoking,artistic"
- For NOSTALGIA: Select [18, 10749, 35] with keywords: "classic,timeless,coming-of-age,memories"
- For ROMANCE: Focus on [10749, 35] with keywords: "chemistry,passion,heartfelt,romantic"

KEYWORD GENERATION RULES:
- Generate 3-7 highly specific TMDB search keywords
- Include emotional tone words (uplifting, dark, whimsical, intense)
- Include visual/aesthetic words (stunning, minimalist, colorful, atmospheric)
- Include thematic words (redemption, friendship, self-discovery, adventure)
- Avoid generic terms, be specific and evocative

PERFECT PAIRING PHILOSOPHY:
- Food should complement the film's mood (comfort food for sad films, light snacks for comedies)
- Drinks should enhance the experience (wine for romance, tea for contemplation)
- Atmosphere details should be specific (dim lights for thrillers, fairy lights for romance)

SOMMELIER NOTE STYLE:
- Write like a wine sommelier describing a vintage
- Use sensory language and emotional metaphors
- Make it personal and poetic, not clinical
- Example: "Like a warm embrace on a winter evening, this film wraps you in nostalgia while gently nudging you toward hope."

Remember: You're not just suggesting movies; you're curating emotional experiences.`

// Example few-shot prompts for consistency
const FEW_SHOT_EXAMPLES = [
  {
    user: "I'm feeling overwhelmed and stressed from work",
    assistant: {
      primaryEmotion: "stressed",
      intensity: "high",
      desiredOutcome: "mental escape and gentle restoration",
      genres: [16, 35, 10751],
      keywords: "visually-stunning,feel-good,whimsical,escapist,colorful,peaceful",
      explanation: "I sense the weight of your workday pressing down. You need films that transport you completely away from daily pressures - visual feasts that ask nothing of you but to watch and smile.",
      sommelierNote: "These selections act like a gentle massage for your overstimulated mind. Each frame is designed to slowly unknot the tension, replacing stress hormones with the warm glow of simple joy.",
      perfectPairing: {
        food: "Buttery popcorn with a touch of truffle salt",
        drink: "Chamomile lavender tea or a light, fruity mocktail",
        atmosphere: "Soft amber lighting, your coziest blanket, phone on silent"
      },
      doubleFeature: {
        theme: "Whimsical Escapes",
        secondMovie: "The Grand Budapest Hotel",
        whyTogether: "Both films create complete worlds of visual delight where problems are solved with charm and everything is slightly more beautiful than reality."
      }
    }
  }
]

/**
 * Call Fireworks AI API with dobby-70b model
 */
async function callFireworksAI(messages: FireworksMessage[]): Promise<string> {
  if (!FIREWORKS_CONFIG.apiKey) {
    throw new Error("FIREWORKS_API_KEY is not configured")
  }

  try {
    const response = await fetch(FIREWORKS_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${FIREWORKS_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: FIREWORKS_CONFIG.model,
        messages,
        temperature: 0.8, // Balanced creativity
        max_tokens: 1000,
        top_p: 0.95,
        frequency_penalty: 0.3, // Reduce repetition
        presence_penalty: 0.3
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Fireworks API error: ${response.status} - ${error}`)
    }

    const data: FireworksResponse = await response.json()

    if (FIREWORKS_CONFIG.debug) {
      console.log("Fireworks AI Response:", data)
    }

    return data.choices[0]?.message?.content || ""
  } catch (error) {
    console.error("Error calling Fireworks AI:", error)
    throw error
  }
}

/**
 * Check if user input is conversational rather than a movie recommendation request
 * Optimized for efficient pattern matching
 */
function isConversationalInput(input: string): boolean {
  // Convert to lowercase for case-insensitive matching
  const text = input.toLowerCase().trim();

  // Quick check for very short inputs (likely greetings)
  if (text.split(' ').length <= 3) {
    return true;
  }

  // Common greetings and conversational starters - most common ones only to save processing
  const conversationalStarters = [
    'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon',
    'who are you', 'what can you do', 'help', 'how are you'
  ];

  // Movie-specific indicators - core terms only
  const movieIndicators = [
    'movie', 'film', 'watch', 'feeling', 'mood', 'recommend', 'sad', 'happy', 'bored'
  ];

  // Check for direct conversational starters
  for (const starter of conversationalStarters) {
    if (text.startsWith(starter)) {
      return true;
    }
  }

  // Check for movie-related content
  const hasMovieContent = movieIndicators.some(term => text.includes(term));

  // If clearly movie-related, not conversational
  if (hasMovieContent) {
    return false;
  }

  // For uncertain cases, check if it's a question not about movies
  const questionStarters = ['what', 'who', 'where', 'when', 'why', 'how', 'can you', 'could you'];
  const isQuestion = questionStarters.some(q => text.startsWith(q));

  return isQuestion;
}

/**
 * Generate a conversational response for non-movie queries
 */
async function getConversationalResponse(input: string): Promise<string> {
  try {
    // Create a lighter system prompt for conversations to save tokens
    const conversationPrompt = `You are the Cinema Sommelier, a movie recommendation expert. Be warm but concise.
Respond briefly to "${input}" (max 50 words). If it's a greeting or question, mention you're a movie recommendation specialist.
If unrelated to movies, guide user back to movie topics. Maintain a warm, slightly poetic personality.`;

    // Use a more lightweight message structure with fewer tokens
    const messages: FireworksMessage[] = [
      {
        role: "user",
        content: conversationPrompt
      }
    ];

    // Use specific parameters to limit token usage
    const response = await fetch(FIREWORKS_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${FIREWORKS_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: FIREWORKS_CONFIG.model,
        messages,
        temperature: 0.7,
        max_tokens: 100, // Limit the response length
        top_p: 0.95
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: FireworksResponse = await response.json();
    return data.choices[0]?.message?.content || "Hello! I'm the Cinema Sommelier. Tell me your mood, and I'll suggest the perfect films for you.";
  } catch (error) {
    console.error("Error getting conversational response:", error);
    return "Hello! I'm your friendly Cinema Sommelier. Tell me how you're feeling, and I'll recommend the perfect film for your mood.";
  }
}

/**
 * Main function to analyze mood and generate recommendations using AI
 */
export async function analyzeMoodAndRecommend(
  moodDescription: string,
  previousAnalysis?: TMDMovieResponse
): Promise<MoodAnalysis> {
  try {
    if (previousAnalysis) {
        // Check if the user is rejecting previous recommendations
        const isRejecting = /don't like|dislike|not in the mood|something else|different|change|not interested/i.test(moodDescription);
        
        if (isRejecting) {
            // Create a basic MoodAnalysis structure
            const newAnalysis: MoodAnalysis = {
                primaryEmotion: "neutral",
                intensity: "medium",
                desiredOutcome: "better recommendations",
                genres: [35, 18], // Default to comedy and drama
                keywords: "popular,well-reviewed",
                explanation: "Based on your feedback, I'm adjusting my recommendations.",
                sommelierNote: "Finding the perfect film is a journey of discovery, sometimes requiring a few attempts to find the right match."
            };
            
            // Add previously recommended movies to exclusion list
            newAnalysis.excludedMovies = previousAnalysis.responseMovies?.map(m => m.id) || [];
            console.log(`Excluding movies: ${newAnalysis.excludedMovies.join(', ')}`);
            
            // Check if user provides specific reason for rejection
            const genreDislikeRegex = /(?:don't|not) (?:like|want|into) (\w+)(?:\s+movies|\s+films)?/i;
            const genreDislikeMatch = moodDescription.match(genreDislikeRegex);
            
            if (genreDislikeMatch) {
                // User has indicated a disliked genre
                const dislikedGenreName = genreDislikeMatch[1].toLowerCase();
                const dislikedGenreId = Object.entries(TMDB_GENRES).find(
                    ([_, name]) => name.toLowerCase() === dislikedGenreName
                )?.[0];
                
                if (dislikedGenreId) {
                    // Remove this genre from recommendations if it was included
                    newAnalysis.genres = (newAnalysis.genres || []).filter(
                        g => g !== parseInt(dislikedGenreId)
                    );
                    console.log(`Removed disliked genre: ${dislikedGenreName} (${dislikedGenreId})`);
                    
                    // If we still have genres, return refined recommendations
                    if (newAnalysis.genres.length > 0) {
                        return newAnalysis;
                    }
                }
            }
            
            // Ask for more specific preferences if we couldn't determine from rejection
            return {
                ...newAnalysis,
                isConversational: true,
                conversationResponse: "I understand these weren't quite what you're looking for. To help me find better matches, could you tell me about a specific genre you enjoy? Or perhaps a mood or theme you're interested in right now? You can also mention films from a particular country if you have a preference."
            };
        }

        // Check for genre or country preferences in the user's response
        const genreRegex = /(?:i like|i want|how about|what about|looking for|prefer) (\w+)(?:\s+movies|\s+films)?/i;
        const countryRegex = /(?:movie|film)s? from ([\w\s]+)/i;
        const specificMovieRegex = /(?:like|similar to|enjoyed) ["']?([^"']+)["']?/i;
        
        const genreMatch = moodDescription.match(genreRegex);
        const countryMatch = moodDescription.match(countryRegex);
        const specificMovieMatch = moodDescription.match(specificMovieRegex);

        if (genreMatch || countryMatch || specificMovieMatch) {
            // Create a basic MoodAnalysis structure with default values
            const newAnalysis: MoodAnalysis = {
                primaryEmotion: "interested",
                intensity: "medium",
                desiredOutcome: "entertainment that matches preferences",
                genres: [35, 18], // Default to comedy and drama
                keywords: "popular,well-reviewed",
                explanation: "I've refined my recommendations based on your preferences.",
                sommelierNote: "A curated selection based on your expressed tastes and preferences."
            };
            
            // Add exclusion for previously shown movies
            newAnalysis.excludedMovies = previousAnalysis.responseMovies?.map(m => m.id) || [];
            
            if (genreMatch) {
                const genreName = genreMatch[1].toLowerCase();
                const genreEntry = Object.entries(TMDB_GENRES).find(
                    ([_, name]) => name.toLowerCase() === genreName
                );
                
                if (genreEntry) {
                    const genreId = parseInt(genreEntry[0]);
                    newAnalysis.genres = [genreId];
                    newAnalysis.genrePreference = [genreId];
                    console.log(`Using genre preference: ${genreName} (${genreId})`);
                    newAnalysis.explanation = `I've found some ${genreName} films that should be more to your liking.`;
                }
            }
            
            if (countryMatch) {
                const countryName = countryMatch[1].trim();
                newAnalysis.countryPreference = countryName;
                console.log(`Using country preference: ${countryName}`);
                newAnalysis.explanation = newAnalysis.explanation.replace(
                    'preferences', 
                    `preferences, including films from ${countryName}`
                );
            }
            
            if (specificMovieMatch) {
                const movieTitle = specificMovieMatch[1].trim();
                newAnalysis.keywords = `similar to ${movieTitle},${newAnalysis.keywords}`;
                console.log(`Looking for movies similar to: ${movieTitle}`);
                newAnalysis.explanation = `I've selected films that have a similar feel to "${movieTitle}".`;
            }
            
            return newAnalysis;
        }
    }
    // Check if this is a conversational input rather than a movie recommendation request
    if (isConversationalInput(moodDescription)) {
      const response = await getConversationalResponse(moodDescription);
      return {
        primaryEmotion: "neutral",
        intensity: "medium",
        desiredOutcome: "conversation",
        genres: [35, 18], // Default genres
        keywords: "popular,well-reviewed",
        explanation: "I'm here to help with movie recommendations when you're ready.",
        sommelierNote: "When you share your mood or preferences, I can suggest the perfect cinematic experience.",
        isConversational: true,
        conversationResponse: response
      };
    }

    // Prepare messages for the AI
    const messages: FireworksMessage[] = [
      {
        role: "system",
        content: CINEMA_SOMMELIER_PROMPT
      },
      {
        role: "user",
        content: moodDescription
      }
    ]

    // Add a few-shot example for better consistency
    if (moodDescription.toLowerCase().includes("stress") || moodDescription.toLowerCase().includes("overwhelm")) {
      messages.splice(1, 0,
        {
          role: "user",
          content: FEW_SHOT_EXAMPLES[0].user
        },
        {
          role: "assistant",
          content: JSON.stringify(FEW_SHOT_EXAMPLES[0].assistant)
        }
      )
    }

    // Call the AI
    const aiResponse = await callFireworksAI(messages)

    // Parse the AI response
    try {
      // Clean the response in case it has markdown or extra text
      let cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      // Additional JSON validation/cleaning - look for the first { and last }
      const startIndex = cleanedResponse.indexOf('{');
      const endIndex = cleanedResponse.lastIndexOf('}');

      if (startIndex >= 0 && endIndex > startIndex) {
        cleanedResponse = cleanedResponse.substring(startIndex, endIndex + 1);
      }

      try {
        const analysis: MoodAnalysis = JSON.parse(cleanedResponse)

        // Validate and ensure all required fields are present
        if (!analysis.genres || analysis.genres.length === 0) {
          analysis.genres = [35, 18] // Default to comedy and drama
        }

        if (!analysis.keywords) {
          analysis.keywords = "feel-good,entertaining,engaging"
        }

        // Ensure intensity is valid
        if (!["low", "medium", "high"].includes(analysis.intensity)) {
          analysis.intensity = "medium"
        }

        return analysis
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        console.log("Attempted to parse:", cleanedResponse);
        // If we can't parse the JSON, treat it as a conversational response
        const response = aiResponse.trim();
        return {
          primaryEmotion: "neutral",
          intensity: "medium",
          desiredOutcome: "conversation",
          genres: [35, 18],
          keywords: "popular,well-reviewed",
          explanation: "I detected your mood but encountered an issue with my recommendation engine.",
          sommelierNote: "While I prepare better recommendations, here's a thoughtful response to your query.",
          isConversational: true,
          conversationResponse: response
        };
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      console.log("Raw AI response:", aiResponse)      // Fallback to enhanced rule-based system if AI fails
      return fallbackAnalysis(moodDescription)
    }

  } catch (error) {
    console.error("Error in AI mood analysis:", error)
    // Fallback to rule-based system
    return fallbackAnalysis(moodDescription)
  }
}

/**
 * Enhanced fallback analysis with more sophisticated pattern matching
 */
function fallbackAnalysis(moodDescription: string): MoodAnalysis {
  const mood = moodDescription.toLowerCase()

  // Enhanced mood patterns with more nuanced detection
  const moodPatterns = {
    stressed: {
      patterns: ["stressed", "overwhelmed", "exhausted", "burnt out", "anxious", "tense"],
      analysis: {
        primaryEmotion: "stressed",
        intensity: detectIntensity(mood),
        desiredOutcome: "mental restoration and peace",
        genres: [16, 35, 10751],
        keywords: "feel-good,relaxing,visually-beautiful,uplifting,calming",
        explanation: "I understand you're feeling the weight of stress. These films are carefully chosen to gently lift that burden, offering visual comfort and emotional lightness without demanding much from your tired mind.",
        sommelierNote: "Like a warm bath for your consciousness, these selections will slowly dissolve the tension, replacing anxiety with gentle wonder and quiet joy."
      }
    },
    sad: {
      patterns: ["sad", "down", "depressed", "heartbroken", "lonely", "melancholy"],
      analysis: {
        primaryEmotion: "sad",
        intensity: detectIntensity(mood),
        desiredOutcome: "emotional catharsis and gentle hope",
        genres: [18, 10749, 35],
        keywords: "heartwarming,hopeful,emotional,redemption,healing,uplifting",
        explanation: "Your sadness deserves to be honored. These films understand pain but also believe in healing, offering stories that validate your feelings while gently suggesting that brighter days exist.",
        sommelierNote: "These are films that sit with you in your sadness without rushing you through it, offering a hand to hold and eventually, a reason to smile again."
      }
    },
    adventurous: {
      patterns: ["adventurous", "excited", "energetic", "restless", "bored", "ambitious"],
      analysis: {
        primaryEmotion: "adventurous",
        intensity: detectIntensity(mood),
        desiredOutcome: "thrilling escapism and inspiration",
        genres: [12, 28, 878],
        keywords: "epic,spectacular,thrilling,adventure,breathtaking,exciting",
        explanation: "Your spirit is craving adventure! These films will take you on journeys to satisfy that restless energy, offering spectacular vistas and heart-pounding excitement.",
        sommelierNote: "Buckle up for cinematic journeys that match your adventurous spirit - each film is a portal to worlds where anything is possible and every moment pulses with life."
      }
    },
    thoughtful: {
      patterns: ["thoughtful", "contemplative", "philosophical", "curious", "introspective"],
      analysis: {
        primaryEmotion: "thoughtful",
        intensity: detectIntensity(mood),
        desiredOutcome: "intellectual stimulation and profound insights",
        genres: [18, 878, 99],
        keywords: "thought-provoking,philosophical,profound,artistic,meaningful,cerebral",
        explanation: "Your mind seeks depth and meaning. These films respect your intelligence, offering layers of interpretation and ideas that will linger long after the credits roll.",
        sommelierNote: "Like a conversation with a brilliant friend at 2 AM, these films challenge assumptions, pose questions, and leave you seeing the world through slightly different eyes."
      }
    },
    romantic: {
      patterns: ["romantic", "love", "yearning", "passion", "affectionate", "sentimental"],
      analysis: {
        primaryEmotion: "romantic",
        intensity: detectIntensity(mood),
        desiredOutcome: "romantic fulfillment and emotional connection",
        genres: [10749, 35, 18],
        keywords: "romantic,chemistry,passionate,love-story,heartfelt,swooning",
        explanation: "Love is in the air! These films celebrate romance in all its forms - the butterflies, the yearning, the joy of connection that makes everything else fade away.",
        sommelierNote: "These selections understand that sometimes we need to believe in love's magic, to watch two souls find each other and remember why hearts skip beats."
      }
    },
    nostalgic: {
      patterns: ["nostalgic", "reminiscent", "wistful", "homesick", "sentimental", "memories"],
      analysis: {
        primaryEmotion: "nostalgic",
        intensity: detectIntensity(mood),
        desiredOutcome: "warm memories and bittersweet reflection",
        genres: [18, 35, 10751],
        keywords: "nostalgic,coming-of-age,classic,period-piece,memories,timeless",
        explanation: "There's something beautiful about looking back. These films capture the bittersweet nature of memory, celebrating the past while acknowledging its passing.",
        sommelierNote: "Like thumbing through an old photo album, these films evoke that particular ache of nostalgia - part joy, part longing, wholly human."
      }
    }
  }

  // Find the best matching mood pattern
  for (const [key, pattern] of Object.entries(moodPatterns)) {
    if (pattern.patterns.some(p => mood.includes(p))) {
      const analysis = pattern.analysis as MoodAnalysis

      // Add perfect pairing based on mood
      analysis.perfectPairing = generatePerfectPairing(key)

      // Add double feature suggestion
      analysis.doubleFeature = generateDoubleFeature(key)

      return analysis
    }
  }

  // Default response if no pattern matches
  return {
    primaryEmotion: "curious",
    intensity: "medium",
    desiredOutcome: "engaging entertainment",
    genres: [18, 35, 12],
    keywords: "entertaining,engaging,popular,acclaimed,must-see",
    explanation: "Based on your mood, I've selected versatile films that offer a balance of entertainment and emotional engagement.",
    sommelierNote: "These are films that remind us why we love cinema - they transport, engage, and leave us feeling like we've experienced something worthwhile.",
    perfectPairing: {
      food: "Classic movie theater popcorn",
      drink: "Your favorite beverage",
      atmosphere: "Comfortable setting with good screen visibility"
    },
    doubleFeature: {
      theme: "Crowd Pleasers",
      secondMovie: "A highly-rated recent release",
      whyTogether: "Both films offer that perfect balance of entertainment and quality that makes for a satisfying movie night."
    }
  }
}

/**
 * Generate perfect pairing based on mood
 */
function generatePerfectPairing(mood: string): { food: string; drink: string; atmosphere: string } {
  const pairings: Record<string, { food: string; drink: string; atmosphere: string }> = {
    stressed: {
      food: "Dark chocolate squares and fresh berries",
      drink: "Lavender chamomile tea or a CBD-infused sparkling water",
      atmosphere: "Soft fairy lights, weighted blanket, essential oil diffuser with lavender"
    },
    sad: {
      food: "Homemade mac and cheese or warm chocolate chip cookies",
      drink: "Hot cocoa with marshmallows or soothing herbal tea",
      atmosphere: "Cozy nest of pillows, warm lighting, maybe some candles"
    },
    adventurous: {
      food: "International snack mix or exotic fruits",
      drink: "Craft beer flight or adventurous cocktails",
      atmosphere: "Bright screen, surround sound if available, sitting forward engaged"
    },
    thoughtful: {
      food: "Artisanal cheese and crackers, dark chocolate",
      drink: "Red wine or sophisticated coffee",
      atmosphere: "Minimal distractions, notebook nearby for thoughts, focused lighting"
    },
    romantic: {
      food: "Chocolate-covered strawberries, fine chocolates",
      drink: "Champagne or rosé wine",
      atmosphere: "Candlelight, soft blankets, intimate seating arrangement"
    },
    nostalgic: {
      food: "Childhood favorites - PB&J, milk and cookies",
      drink: "Classic soda or the drink from your youth",
      atmosphere: "Comfortable familiar space, maybe old photos nearby"
    }
  }

  return pairings[mood] || {
    food: "Your favorite snacks",
    drink: "Whatever you're craving",
    atmosphere: "However you're most comfortable"
  }
}

/**
 * Generate double feature suggestion
 */
function generateDoubleFeature(mood: string): { theme: string; secondMovie: string; whyTogether: string } {
  const features: Record<string, { theme: string; secondMovie: string; whyTogether: string }> = {
    stressed: {
      theme: "Gentle Escapes",
      secondMovie: "Paddington 2",
      whyTogether: "Both films offer visual beauty and kindness without any harsh edges, creating a cocoon of comfort."
    },
    sad: {
      theme: "Healing Journey",
      secondMovie: "About Time",
      whyTogether: "Together they acknowledge life's pain while celebrating its beauty, offering tears and smiles in perfect measure."
    },
    adventurous: {
      theme: "Epic Quests",
      secondMovie: "Mad Max: Fury Road",
      whyTogether: "A double dose of adrenaline and spectacle, each offering different flavors of epic adventure."
    },
    thoughtful: {
      theme: "Mind Benders",
      secondMovie: "Arrival",
      whyTogether: "Both films reward careful attention and offer ideas that will fuel hours of contemplation."
    },
    romantic: {
      theme: "Love Stories",
      secondMovie: "Before Sunrise",
      whyTogether: "Two approaches to romance - one grand, one intimate - showing love's many beautiful forms."
    },
    nostalgic: {
      theme: "Memory Lane",
      secondMovie: "Stand By Me",
      whyTogether: "Films that understand how memory works - not as perfect record but as emotional impression."
    }
  }

  return features[mood] || {
    theme: "Perfect Pair",
    secondMovie: "A complementary classic",
    whyTogether: "These films complement each other beautifully, creating a complete viewing experience."
  }
}

/**
 * Detect intensity of mood from text
 */
function detectIntensity(text: string): "low" | "medium" | "high" {
  const highIntensityWords = ["very", "extremely", "incredibly", "totally", "absolutely", "completely", "utterly"]
  const lowIntensityWords = ["slightly", "a bit", "somewhat", "kind of", "a little", "mildly"]

  const lowerText = text.toLowerCase()

  if (highIntensityWords.some(word => lowerText.includes(word))) {
    return "high"
  }

  if (lowIntensityWords.some(word => lowerText.includes(word))) {
    return "low"
  }

  return "medium"
}

/**
 * Extract location context if available (for future enhancement)
 */
export function getLocationContext(): { city: string; country: string; timeZone: string } {
  // This could be enhanced with actual geolocation
  return {
    city: "Ho Chi Minh City",
    country: "Vietnam",
    timeZone: "Asia/Ho_Chi_Minh"
  }
}

/**
 * Get time-based context for recommendations
 */
export function getTimeContext(): { timeOfDay: string; dayOfWeek: string; season: string } {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()
  const month = now.getMonth()

  // Determine time of day
  let timeOfDay = "evening"
  if (hour < 6) timeOfDay = "late-night"
  else if (hour < 12) timeOfDay = "morning"
  else if (hour < 17) timeOfDay = "afternoon"
  else if (hour < 22) timeOfDay = "evening"

  // Day of week
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const dayOfWeek = days[day]

  // Simple season detection (adjust for Southern hemisphere if needed)
  let season = "dry" // Vietnam has dry/wet seasons
  if (month >= 4 && month <= 10) season = "wet"

  return { timeOfDay, dayOfWeek, season }
}

// Export the functions
export default {
  analyzeMoodAndRecommend,
  getLocationContext,
  getTimeContext
}