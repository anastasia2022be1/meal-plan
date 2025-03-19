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
        console.error("Stripe webhook error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: errorMessage }, { status: 400 });
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
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    return NextResponse.json({});
}

// Updates user data after a successful checkout session
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.clerkUserId; // Retrieves the user ID from session metadata

    if (!userId) {
        console.warn("No user ID found in checkout session");
        return;
    }

    const subscriptionId = session.subscription as string; // Checks for the presence of a subscription ID

    if (!subscriptionId || subscriptionId === "") {
        console.warn("No subscription ID found in checkout session");
        return;
    }

    try {
        console.log(`Updating profile for userId: ${userId}, subscriptionId: ${subscriptionId}`);

        // const userProfile = await prisma.profile.findUnique({
        //     where: { userId }
        // });

        // console.log("Found profile:", userProfile);
        
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
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

   // let userId: string | undefined;
    try {
        // Searches for user profile in the database using the Stripe Subscription ID
        const profile = await prisma.profile.findUnique({
            where: { stripeSubscriptionId: subscriptionId }, // Finds record where stripeSubscriptionId matches subId
            select: { userId: true }, // Retrieves only the userId field
        });

        if (!profile) {
            console.warn(`No user found for subscription ID: ${subscriptionId}`);
            return;
        }

        // // Checks if a profile was found and has a userId
        // if (!profile?.userId) { 
        //     console.log("No user found for subscription ID:", subscriptionId); // Logs message if user not found
        //     return; // Exits function if no profile is found
        // }

        // userId = profile?.userId;
    // } catch (error) {
    //     console.error(error);
    //     return;
    // }
    
    // try {
        await prisma?.profile.update({
            where: { userId: profile.userId }, // Finds record where userId matches
            data: {
                subscriptionActive: false, // Marks subscription as inactive
            },
        });
    } catch (error) {
        console.error("Error handling failed payment:", error);
    }
}

// Handles subscription cancellation
async function handleCustomerSubscriptionDeleted(subscription: Stripe.Subscription) {
    const subscriptionId = subscription.id;
    if (!subscriptionId) return;

    try {
        // Searches for user profile in the database using the Stripe Subscription ID
        const profile = await prisma.profile.findUnique({
            where: { stripeSubscriptionId: subscriptionId }, // Finds record where stripeSubscriptionId matches subId
            select: { userId: true }, // Retrieves only the userId field
        });

        if (!profile) {
            console.warn(`No user found for subscription ID: ${subscriptionId}`);
            return;
        }

    //     // Checks if a profile was found and has a userId
    //     if (!profile?.userId) { 
    //         console.log("No user found for subscription ID:", subId); // Logs message if user not found
    //         return; // Exits function if no profile is found
    //     }

    //     userId = profile?.userId;
    // } catch (error) {
    //     console.warn(`No user found for subscription ID: ${subscriptionId}`);
    //     return;
    // }
    
    // try {
        await prisma?.profile.update({
            where: { userId: profile.userId }, // Finds record where userId matches
            data: {
                subscriptionActive: false, // Marks subscription as inactive
                stripeSubscriptionId: null, // Removes subscription ID
                subscriptionTier: null, // Removes subscription type
            },
        });
        console.log(`Subscription for user ${profile.userId} canceled.`);
    } catch (error) {
        console.error("Error handling subscription cancellation:", error);
    }
}