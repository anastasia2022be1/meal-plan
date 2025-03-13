import { currentUser } from "@clerk/nextjs/server"; // Retrieve the current user from Clerk
import { NextRequest, NextResponse } from "next/server"; // Next.js API modules for handling requests
import { prisma } from "@/lib/prisma"; // ORM Prisma for database operations
import { stripe } from "@/lib/stripe"; // Initialized Stripe client
import { getPriceIdFromType } from "@/lib/plans"; // Function to get price ID based on plan type
import { availiblePlans } from "@/lib/plans"; // Available subscription plans

// POST request handler for updating a user's subscription
export async function POST(request: NextRequest) {
  try {
    // Retrieve the current user from Clerk
    const clerkUser = await currentUser();
    
    // If the user is not found, return a 401 (Unauthorized) error
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract the new subscription plan from the request body
    const { newPlan } = await request.json();

    // Check if a new subscription plan was provided
    if (!newPlan) {
      return NextResponse.json(
        { error: "New plan is required" }, // Error if the parameter is missing
        { status: 400 }
      );
    }

    // Verify if the provided plan exists among the available plans
    if (!availiblePlans.some((plan) => plan.interval === newPlan)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    // Find the user's profile in the database using their Clerk userId
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

    // Fetch the user's current subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Retrieve the Subscription Item ID
    const subscriptionItemId = subscription?.items?.data?.[0]?.id;

    // If the subscription item is not found, return a 404 error
    if (!subscriptionItemId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Update the subscription in Stripe with the new plan
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: false, // Disable automatic subscription cancellation
        items: [
          {
            id: subscriptionItemId, // Subscription Item ID
            price: getPriceIdFromType(newPlan), // Get the new price ID
          },
        ],
        proration_behavior: "create_prorations", // Enable prorated billing
      }
    );

    // Update the subscription details in the database
    await prisma?.profile.update({
      where: {
        userId: clerkUser.id,
      },
      data: {
        subscriptionTier: newPlan, // Update the subscription tier
        stripeSubscriptionId: updatedSubscription.id, // Save the new subscription ID
        subscriptionActive: true, // Mark the subscription as active
      },
    });

    // Return a successful response with the updated subscription
    return NextResponse.json(
      { subscription: updatedSubscription },
      { status: 200 }
    );
  } catch (error: any) {
    // Log the error to the console
    console.error("API Error:", error);
    
    // Return a 500 (Internal Server Error) response
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
