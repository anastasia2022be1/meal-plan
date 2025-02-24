"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


type ApiResponce = {
    message: string,
    error?: string
}

async function createProfileRequest() {
    const response = await fetch("/api/create-profile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
    });
    const data = await response.json();
    return data as ApiResponce;
}

export default function CreateProfile() {
    const {isLoaded, isSignedIn} = useUser();
    const router = useRouter();
    const {mutate, isPending} = useMutation<ApiResponce, Error>({
        mutationFn: createProfileRequest,
        onSuccess: () => {
            router.push("/subscribe");
        },
        onError: (error) => {
            console.error(error);
        }
    })

    useEffect(() => {
        if(isLoaded && isSignedIn && !isPending) {
            mutate();
        }
    }, [isLoaded, isSignedIn]);

    return (
        <div>
        Processing sign in ...
        </div>
    );
}