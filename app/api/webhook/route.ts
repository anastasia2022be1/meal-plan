import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe"; // Initialized Stripe client
import { prisma } from "@/lib/prisma"; // ORM Prisma for database operations

// Handler for POST request to process Stripe webhook events
export async function POST(request: NextRequest) {
    const body = await request.text(); // Retrieves the JSON request body
    const signature = request.headers.get("stripe-signature"); // Retrieves the Stripe signature header for verification

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!; // Secret key for verifying Stripe webhooks

    let event: Stripe.Event;

    try {
        // Verifies that the request is legitimately from Stripe and has not been tampered with
        event = stripe.webhooks.constructEvent(body, signature || "", webhookSecret);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    try {
        switch (event.type) {
            // Handle successful payment
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutSessionCompleted(session); // Calls function to update user data in the database
                break;
            }
    
            // Handle failed invoice payment
            case "invoice.payment_failed": {
                const session = event.data.object as Stripe.Invoice;
                console.log("Invoice payment failed:", session);
                await handleInvoicePaymentFailed(session);
                break;
            }
    
            // Handle subscription cancellation
            case "customer.subscription.deleted": {   
                const session = event.data.object as Stripe.Subscription;
                console.log("Subscription deleted:", session);
                await handleCustomerSubscriptionDeleted(session);
                break;
            }
    
            default:
                console.log("Unhandled event type:", event.type);
        }
    } catch (error) {
        console.error("Error processing webhook event:", error);
        return NextResponse.json({ error: error }, { status: 400 });
    }

    return NextResponse.json({});
}

// Updates user data after a successful checkout session
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.clerkUserId; // Retrieves the user ID from session metadata

    if (!userId) {
        console.log("No user ID found in checkout session");
        return;
    }

    const subscriptionId = session.subscription as string; // Checks for the presence of a subscription ID

    if (!subscriptionId || subscriptionId === "") {
        console.log("No subscription ID found in checkout session");
        return;
    }

    try {
        console.log("Updating profile with userId:", userId, "and subscriptionId:", subscriptionId);
        const userProfile = await prisma.profile.findUnique({
            where: { userId }
        });
        console.log("Found profile:", userProfile);
        
        await prisma.profile.update({
            where: { userId },
            data: {
                stripeSubscriptionId: subscriptionId, // Stores subscription ID
                subscriptionActive: true, // Marks subscription as active
                subscriptionTier: session.metadata?.planType || null, // Stores subscription type
            },
        });

        console.log("Function handleCheckoutSessionCompleted finished");
    } catch (error) {
        console.error("Error updating user profile:", error);
    }
}

// Handles failed invoice payments
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const subId = invoice.subscription as string;

    if(!subId) {
        return;
    }

    let userId: string | undefined;
    try {
        // Searches for user profile in the database using the Stripe Subscription ID
        const profile = await prisma?.profile.findUnique({
            where: { stripeSubscriptionId: subId }, // Finds record where stripeSubscriptionId matches subId
            select: { userId: true }, // Retrieves only the userId field
        });

        // Checks if a profile was found and has a userId
        if (!profile?.userId) { 
            console.log("No user found for subscription ID:", subId); // Logs message if user not found
            return; // Exits function if no profile is found
        }

        userId = profile?.userId;
    } catch (error) {
        console.error(error);
        return;
    }
    
    try {
        await prisma?.profile.update({
            where: { userId: userId }, // Finds record where userId matches
            data: {
                subscriptionActive: false, // Marks subscription as inactive
            },
        });
    } catch (error) {
        console.log(error.message);
    }
}

// Handles subscription cancellation
async function handleCustomerSubscriptionDeleted(subscription: Stripe.Subscription) {
    const subId = subscription.id;

    try {
        // Searches for user profile in the database using the Stripe Subscription ID
        const profile = await prisma?.profile.findUnique({
            where: { stripeSubscriptionId: subId }, // Finds record where stripeSubscriptionId matches subId
            select: { userId: true }, // Retrieves only the userId field
        });

        // Checks if a profile was found and has a userId
        if (!profile?.userId) { 
            console.log("No user found for subscription ID:", subId); // Logs message if user not found
            return; // Exits function if no profile is found
        }

        userId = profile?.userId;
    } catch (error) {
        console.error(error);
        return;
    }
    
    try {
        await prisma?.profile.update({
            where: { userId: userId }, // Finds record where userId matches
            data: {
                subscriptionActive: false, // Marks subscription as inactive
                stripeSubscriptionId: null, // Removes subscription ID
                subscriptionTier: null, // Removes subscription type
            },
        });
    } catch (error) {
        console.log(error.message);
    }
}