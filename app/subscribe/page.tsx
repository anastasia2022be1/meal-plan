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

    const data: SubscribeResponse = await response.json();
    return data;
}

export default function Subscribe() {
    const { user } = useUser();
    const router = useRouter();

    const userId = user?.id;
    const email = user?.emailAddresses[0].emailAddress || "";

    const { mutate, isPending } = useMutation<
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
        onMutate: () => {
            toast.loading("Subscribing...");
        },
        onSuccess: (data) => {
            toast.success("Redirecting to checkout...");
            window.location.href = data.url;
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to subscribe");
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
        <div className="px-6 py-12 sm:py-16 lg:py-20 max-w-6xl mx-auto">
            <Toaster />
            <div className="text-center mb-14">
                <h2 className="text-4xl font-semibold text-gray-800">Pricing</h2>
                <p className="mt-3 text-lg text-gray-600">
                    Get started on our weekly plan or upgrade to monthly or yearly when you are
                    ready
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {availiblePlans.map((plan, key) => (
                    <div
                        key={key}
                        className="relative flex flex-col justify-between p-8 bg-white rounded-xl shadow-lg border border-gray-300 h-full hover:shadow-xl transition-shadow">
                        {plan.isPopular && (
                            <span className="absolute -top-3 -right-3 bg-emerald-600 text-white px-4 py-1 rounded-full text-xs shadow-md">
                                Most Popular
                            </span>
                        )}

                        <h3 className="text-2xl font-semibold text-gray-900 mb-3">{plan.name}</h3>
                        <p className="text-gray-700 text-lg">
                            <span className="text-3xl font-bold">{plan.amount}</span> {plan.currency} per {plan.interval}
                        </p>
                        <p className="text-gray-500 text-sm mt-2">{plan.description}</p>

                        <ul className="mt-6 space-y-3 flex-grow">
                            {plan.features.map((feature, key) => (
                                <li key={key} className="flex items-center text-gray-800 text-sm">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 text-emerald-600 mr-2"
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
                            disabled={isPending}
                            className="mt-6 bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors shadow-md w-full">
                            {isPending ? "Please wait..." : `Subscribe to ${plan.name}`}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}