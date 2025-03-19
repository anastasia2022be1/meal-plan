import { getPriceIdFromType } from "@/lib/plans";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// API route handler for creating a Stripe checkout session for a subscription
export async function POST(request: NextRequest) {
    try {
        // Parse the request body to extract required parameters
        const { planType, userId, email } = await request.json();

        // Validate required fields
        if (!planType || !userId || !email) {
            return NextResponse.json({ error: "Plan type, user id, and email are required" }, { status: 400 });
        }

        // Define allowed subscription plan types
        const allowedPlanTypes = ["week", "month", "year"];

        // Check if the provided plan type is valid
        if (!allowedPlanTypes.includes(planType)) {
            return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
        }

        // Get the Stripe price ID for the selected plan type
        const priceId = getPriceIdFromType(planType);

        // Validate the retrieved price ID
        if (!priceId) {
            return NextResponse.json({ error: "Invalid price id" }, { status: 400 });
        }

        // Create a Stripe checkout session for the subscription
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"], // Accept card payments
            mode: "subscription", // Set mode to subscription
            line_items: [
                {
                    price: priceId, // Use the price ID for the selected plan
                    quantity: 1
                }
            ],
            customer_email: email, // Associate the session with the user's email
            metadata: {
                clerkUserId: userId, // Store user ID in metadata
                planType: planType // Store selected plan type in metadata
            },
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?session_id={CHECKOUT_SESSION_ID}`, // Redirect on success
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe`, // Redirect on cancellation
        });

        // Return the checkout session URL as JSON response
        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error(error);
        // Return a 500 Internal Server Error response in case of an exception
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}