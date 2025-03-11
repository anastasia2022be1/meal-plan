"use client";

import { useUser } from "@clerk/nextjs";
import { Spinner } from "../components/spinner";
import { Toaster } from "react-hot-toast";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { availiblePlans } from "@/lib/plans";

async function fetchSubscriptionStatus() {
  const response = await fetch("/api/profile/subscription-status");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export default function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();

  const {
    data: subscription,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscriptionStatus,
    enabled: isLoaded && isSignedIn,
    staleTime: 1000 * 60 * 5,
  });

  const currentPlan = availiblePlans.find(
    (plan) => plan.interval === subscription?.subscription?.subscriptionTier
  );

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner />
        <span className="text-gray-600 mt-2">Loading...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-700">
        <span>Please sign in to view your profile.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center text-center">
          {user.imageUrl && (
            <Image
              src={user.imageUrl}
              alt="Profile Image"
              width={100}
              height={100}
              className="rounded-full border border-gray-300"
            />
          )}
          <h1 className="text-2xl font-semibold text-gray-800 mt-4">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700">Subscription Details</h2>
          {isFetching ? (
            <div className="flex items-center justify-center mt-4">
              <Spinner /> <span className="text-gray-600 ml-2">Loading subscription details...</span>
            </div>
          ) : isError ? (
            <div className="text-red-500 mt-4">
              <span>Error: {error.message}</span>
            </div>
          ) : subscription ? (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold">Current Plan:</h3>
              {currentPlan ? (
                <div className="mt-2">
                  <p><strong>Plan:</strong> {currentPlan.name}</p>
                  <p><strong>Amount:</strong> {currentPlan.amount}</p>
                  <p className="text-green-600 font-bold"><strong>Status:</strong> ACTIVE</p>
                </div>
              ) : (
                <p className="text-gray-500">Current plan not found</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 mt-4">You are not subscribed to any plan</p>
          )}
        </div>
      </div>
    </div>
  );
}