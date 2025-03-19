import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// API route handler for GET request to check user's subscription status
export async function GET(request: NextRequest) {
   try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // If userId is missing, return a 400 Bad Request response
    if (!userId) {
      return new NextResponse("Missing userId", { status: 400 });
    }
    
    // Query the database to find the user's profile based on userId
    const profile = await prisma.profile.findUnique({
        where: {
            userId
        },
        select: {
            subscriptionActive: true // Retrieve only the subscription status
        }
    });

    // Return the subscription status as a JSON response
    return NextResponse.json({ subscriptionActive: profile?.subscriptionActive });

   } catch (error) {
    // Return a 500 Internal Server Error response in case of an exception
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(errorMessage, { status: 500 });
   }
}
