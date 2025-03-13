import { currentUser } from "@clerk/nextjs/server"; // Retrieve the current user from Clerk
import { NextRequest, NextResponse } from "next/server"; // Next.js API modules for handling requests
import { prisma } from "@/lib/prisma"; // ORM Prisma for database operations
import { stripe } from "@/lib/stripe"; // Initialized Stripe client

// POST request handler for canceling a subscription
export async function POST(request: NextRequest) {
  try {
    // Retrieve the current user from Clerk
    const clerkUser = await currentUser();

    // If the user is not found, return a 401 (Unauthorized) error
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Search for the user's profile in the database using their Clerk userId
    const profile = await prisma.profile.findUnique({
      where: {
        userId: clerkUser.id,
      },
    });

    // If the profile is not found, return a 404 (Not Found) error
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if the user has an active subscription in Stripe
    if (!profile.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" }, // Error if no subscription exists
        { status: 404 }
      );
    }

    // Retrieve the Stripe subscription ID
    const subscriptionId = profile.stripeSubscriptionId;

    // Update the subscription in Stripe to cancel at the end of the current billing period
    const canceledSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    // Update the subscription details in the database
    await prisma?.profile.update({
      where: {
        userId: clerkUser.id,
      },
      data: {
        subscriptionTier: null, // Remove subscription tier information
        stripeSubscriptionId: null, // Remove subscription ID
        subscriptionActive: false, // Set subscription status to inactive
      },
    });

    // Return a successful response with the canceled subscription details
    return NextResponse.json(
      { subscription: canceledSubscription },
      { status: 200 }
    );
  } catch (error: any) {
    // Log the error to the console
    console.error("API Error:", error);

    // Return a 500 (Internal Server Error) response
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}