import { currentUser } from "@clerk/nextjs/server"; // Function to retrieve the current user from Clerk
import { NextResponse } from "next/server"; // Next.js API module for handling HTTP responses
import { prisma } from "@/lib/prisma"; // ORM Prisma for database interaction

// GET request handler to fetch user subscription information
export async function GET() {
  try {
    // Retrieve the current user from Clerk
    const clerkUser = await currentUser();
    
    // If the user is not authenticated, return a 401 (Unauthorized) error
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Search for the user profile in the database using their userId
    const profile = await prisma.profile.findUnique({
      where: {
        userId: clerkUser.id, // Look up the profile by the user's Clerk ID
      },
      select: {
        subscriptionTier: true, // Retrieve only the subscription tier (subscriptionTier)
      },
    });

    // If the profile is not found, return a 404 (Not Found) error
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Return a successful response with subscription information
    return NextResponse.json({ subscription: profile }, { status: 200 });
  } catch (error: any) {
    // Log the error to the console
    console.error("API Error:", error);
    
    // Return a 500 (Internal Server Error) response in case of server failure
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
