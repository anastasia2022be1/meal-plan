import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai"; // Import OpenAI SDK for AI processing

// Create an OpenAI instance with API settings
const openAI = new OpenAI({
    apiKey: process.env.OPEN_ROUTER_API_KEY, // API key for accessing OpenRouter (stored in environment variables)
    baseURL: "https://openrouter.ai/api/v1", // Base URL for OpenRouter API
});

// Handler for POST request to generate a meal plan
export async function POST(request: NextRequest) {
    try {
        // Extract parameters from the request body
        const { dietType, calories, allergies, cuisine, snacks, days } = await request.json();

        // Create a prompt for AI
        const prompt = `
         You are a professional nutritionist. Create a ${days}-day meal plan for an individual following a ${dietType} diet aiming for ${calories} calories per day.
      
      Allergies or restrictions: ${allergies || "none"}.
      Preferred cuisine: ${cuisine || "no preference"}.
      Snacks included: ${snacks ? "yes" : "no"}.
      
      For each day, provide:
        - Breakfast
        - Lunch
        - Dinner
        ${snacks ? "- Snacks" : ""}
      
      Use simple ingredients and provide brief instructions. Include approximate calorie counts for each meal.
      
      Structure the response as a JSON object where each day is a key, and each meal (breakfast, lunch, dinner, snacks) is a sub-key. Example:
      
      {
        "Monday": {
          "Breakfast": "Oatmeal with fruits - 350 calories",
          "Lunch": "Grilled chicken salad - 500 calories",
          "Dinner": "Steamed vegetables with quinoa - 600 calories",
          "Snacks": "Greek yogurt - 150 calories"
        },
        "Tuesday": {
          "Breakfast": "Smoothie bowl - 300 calories",
          "Lunch": "Turkey sandwich - 450 calories",
          "Dinner": "Baked salmon with asparagus - 700 calories",
          "Snacks": "Almonds - 200 calories"
        }
        // ...and so on for each day
      }

      Return just the json with no extra commentaries and no backticks. `;

        // Send a request to OpenAI to generate a meal plan
        const response = await openAI.chat.completions.create({
            model: "meta-llama/llama-3.3-70b-instruct:free", // AI model used
            messages: [
                {
                    role: "user", // Define that the request is from a user
                    content: prompt, // Pass the generated prompt
                },
            ],
            temperature: 0.7, // Define randomness in AI responses
            max_tokens: 1500, // Limit the number of tokens in the response
        });

        // Retrieve AI-generated JSON response and trim unnecessary spaces
        const aiContent = response.choices[0].message.content!.trim();

        let parsedMealPlan: { [day: string]: DailyMealPlan };

        try {
            // Parse JSON response from OpenAI into a JavaScript object
            parsedMealPlan = JSON.parse(aiContent);
        } catch (parseError) {
            console.error("Failed to parse meal plan: ", parseError);
            return NextResponse.json({ error: "Failed to parse meal plan. Please try again"}, {status: 500});
        }

        // Ensure the parsed response is a valid object
        if (typeof parsedMealPlan !== "object" || parsedMealPlan === null) {
            return NextResponse.json({ error: "Invalid meal plan format"}, {status: 500});
        }

        // Return a successful JSON response with the meal plan
        return NextResponse.json({ mealPlan: parsedMealPlan });

    } catch (error) {
        console.error(error);
        // Return a 500 Internal Server Error response in case of failure
        return NextResponse.json({ error: "Failed to generate meal plan"}, {status: 500});
    }
}

// Define the interface for the meal plan structure
interface DailyMealPlan {
    Breakfast?: string; 
    Lunch?: string;
    Dinner?: string; 
    Snacks?: string; 
}
