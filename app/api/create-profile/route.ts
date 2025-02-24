import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";


export async function POST() {
    try {
        const clerkuser = await currentUser();
        if(!clerkuser) {
            return NextResponse.json({
                error: "User not found in Clerk"},
                { status: 404 }
            );
        }
    
        const email =clerkuser?.emailAddresses[0].emailAddress;
        if(!email) {
            return NextResponse.json(
                { error: "User does not have an email adress" },
                { status: 400 }
            );
        }
    
        const existingProfile = await prisma.profile.findUnique({
            where: {userId: clerkuser.id},
        });
        if(existingProfile) {
            return NextResponse.json(
                { message: "Profile already exists" }
            );
        }
    
        await prisma?.profile.create({
            data: {
                userId: clerkuser.id,
                email,
                subscriptionTier: null,
                stripeSubscriptionId: null,
                subscriptionActive: false,
            },
        });
    
        return NextResponse.json({ message: "Profile created successfully."}, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "An error occurred while creating the profile."}, { status: 500 });
    }
}