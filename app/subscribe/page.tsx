"use client";

import { availiblePlans } from "@/lib/plans";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

type SubscribeResponse = {
    url: string;
};

type SubscribeError = {
    error: string;
};

async function subscribeToPlan(
    planType: string,
    userId: string,
    email: string
): Promise<SubscribeResponse> {
    const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ planType, userId, email }),
    });

    if (!response.ok) {
        const errorData: SubscribeError = await response.json();
        throw new Error(errorData.error || "Failed to subscribe");
    }
    return response.json();
}

export default function Subscribe() {
    const { user } = useUser();
    const router = useRouter();

    const userId = user?.id;
    const email = user?.emailAddresses[0]?.emailAddress || "";

    const { mutate, isLoading } = useMutation<
        SubscribeResponse,
        SubscribeError,
        { planType: string }
    >({
        mutationFn: async ({ planType }) => {
            if (!userId) {
                throw new Error("User not signed in");
            }
            return subscribeToPlan(planType, userId, email);
        },
        onSuccess: (data) => {
            toast.success("Redirecting to checkout...");
            window.location.href = data.url;
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    function handleSubscribe(planType: string) {
        if (!userId) {
            router.push("/sign-up");
            return;
        }

        mutate({ planType });
    }

    return (
        <div className="px-4 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto">
            <Toaster />
            <div className="text-center mb-12">
                <h2 className="text-3xl font-semibold">Pricing</h2>
                <p className="mt-2 text-gray-600">
                    Get started on our weekly plan or upgrade to monthly or yearly when you are
                    ready
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {availiblePlans.map((plan, key) => (
                    <div
                        key={key}
                        className="relative flex flex-col justify-between p-6 bg-white rounded-lg shadow-md border border-gray-200 h-full"
                    >
                        {plan.isPopular && (
                            <span className="absolute -top-3 -right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs shadow-lg">
                                Most Popular
                            </span>
                        )}

                        <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                        <p className="text-gray-600">
                            <span className="text-2xl font-bold">{plan.amount}</span>{" "}
                            {plan.currency} per {plan.interval}
                        </p>
                        <p className="text-gray-500">{plan.description}</p>

                        <ul className="mt-4 space-y-2 flex-grow">
                            {plan.features.map((feature, key) => (
                                <li key={key} className="flex items-center text-gray-700">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 text-emerald-500 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSubscribe(plan.interval)}
                            disabled={isLoading}
                            className="mt-auto bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                            {isLoading ? "Please wait..." : `Subscribe ${plan.name}`}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
