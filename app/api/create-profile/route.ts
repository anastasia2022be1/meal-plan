import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// API route handler for creating a user profile in the database
export async function POST() {
    try {
        // Retrieve the currently authenticated user from Clerk
        const clerkUser = await currentUser();
        if (!clerkUser) {
            return NextResponse.json(
                { error: "User not found in Clerk" },
                { status: 404 }
            );
        }
    
        // Extract the user's email address
        const email = clerkUser.emailAddresses[0].emailAddress;
        if (!email) {
            return NextResponse.json(
                { error: "User does not have an email address" },
                { status: 400 }
            );
        }
    
        // Check if a profile already exists for this user in the database
        const existingProfile = await prisma.profile.findUnique({
            where: { userId: clerkUser.id },
        });
        
        // If a profile already exists, return a response indicating so
        if (existingProfile) {
            return NextResponse.json(
                { message: "Profile already exists" }
            );
        }
    
        // Create a new user profile in the database with default values
        await prisma.profile.create({
            data: {
                userId: clerkUser.id, // Store the user's Clerk ID
                email, // Store the user's email address
                subscriptionTier: null, // Default subscription tier is null
                stripeSubscriptionId: null, // No Stripe subscription ID initially
                subscriptionActive: false, // Subscription is inactive by default
            },
        });
    
        // Return a success response after profile creation
        return NextResponse.json(
            { message: "Profile created successfully." },
            { status: 201 }
        );
    } catch (error: any) {
        // Log and return an error response in case of a failure
        console.error("Error creating profile:", error.message);
        return NextResponse.json(
            { error: "An error occurred while creating the profile." },
            { status: 500 }
        );
    }
}