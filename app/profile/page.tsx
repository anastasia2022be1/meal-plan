"use client";

import { useUser } from "@clerk/nextjs";
import { Spinner } from "../components/spinner";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { availiblePlans } from "@/lib/plans";
import { useState } from "react";
import { useRouter } from "next/navigation";

async function fetchSubscriptionStatus() {
  const response = await fetch("/api/profile/subscription-status");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

async function updatePlan(newPlan: string) {
  const response = await fetch("/api/profile/change-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newPlan }),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

async function unsubscribe() {
  const response = await fetch("/api/profile/unsubscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export default function Profile() {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const { isLoaded, isSignedIn, user } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: subscription,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscriptionStatus,
    enabled: isLoaded && isSignedIn,
    staleTime: 1000 * 60 * 5,
  });

  const {
    // data: updatedPlan,
    mutate: updatePlanMutation,
    isPending: isUpdatePlanPending,
  } = useMutation({
    mutationFn: updatePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Plan updated successfully");
      refetch();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update plan");
    },
  });

  const {
    // data: canceledPlan,
    mutate: unsubscribeMutation,
    isPending: isUnsubscribePending,
  } = useMutation({
    mutationFn: unsubscribe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      router.push("/subscribe");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to unsubscribe");
    },
  });

  const currentPlan = availiblePlans.find(
    (plan) => plan.interval === subscription?.subscription?.subscriptionTier
  );

  function handleUpdatePlan() {
    if (selectedPlan) {
      updatePlanMutation(selectedPlan);
    }

    setSelectedPlan("");
  }

  function handleUnsubscribe() {
    if (
      confirm(
        "Are you sure you want to unsubscribe? You will lose access to premium features."
      )
    ) {
      unsubscribeMutation();
    }
  }


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
  <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-6">
    <Toaster position="top-center" />
    <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">

      {/* Profile */}
      <div className="flex flex-col items-center text-center bg-gray-50 p-6 rounded-lg shadow-sm">
        {user.imageUrl && (
          <Image
            src={user.imageUrl}
            alt="Profile Image"
            width={100}
            height={100}
            className="rounded-full border border-gray-400 shadow-md"
          />
        )}
        <h1 className="text-3xl font-semibold text-gray-800 mt-4">
          {user.firstName} {user.lastName}
        </h1>
        <p className="text-gray-600 text-lg">
          {user.primaryEmailAddress?.emailAddress}
        </p>
      </div>

        {/* Subscription Details */}
      <div className="mt-8 border-b pb-6 bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-700">
          Subscription Details
        </h2>
        {isFetching ? (
          <div className="flex items-center justify-center mt-4">
            <Spinner />{" "}
            <span className="text-gray-600 ml-2">
              Loading subscription details...
            </span>
          </div>
        ) : isError ? (
          <div className="text-red-500 mt-4">
            <span>Error: {error.message}</span>
          </div>
        ) : subscription ? (
          <div className="mt-4 p-5 border rounded-lg bg-white shadow-sm">
            <h3 className="text-lg font-semibold">Current Plan:</h3>
            {currentPlan ? (
              <div className="mt-2">
                <p>
                  <strong>Plan:</strong> {currentPlan.name}
                </p>
                <p>
                  <strong>Amount:</strong> {currentPlan.amount}
                </p>
                <p className="text-green-600 font-bold">
                  <strong>Status:</strong>
                  ACTIVE
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Current plan not found</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 mt-4">
            You are not subscribed to any plan
          </p>
        )}
      </div>

      {/* Change Subscribtion Plan */}
      <div className="mt-8 border-b pb-6">
        <h3 className="text-2xl font-semibold text-gray-700">Change Subscribtion Plan</h3>
        {currentPlan && (
          <>
            <select
              defaultValue={currentPlan?.interval}
              disabled={isUpdatePlanPending}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedPlan(e.target.value)
              }
              className="mt-4 p-3 border rounded-lg w-full bg-gray-50 text-gray-800 focus:ring focus:ring-emerald-300">
              <option value="" disabled>
                Select a New Plan
              </option>

              {availiblePlans.map((plan, key) => (
                <option key={key} value={plan.interval}>
                  {plan.name} - ${plan.amount} / {plan.interval}
                </option>
              ))}
            </select>
            <button 
            onClick={handleUpdatePlan}
            className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 w-full">
              Save Change
              </button>
            {isUpdatePlanPending && (
              <div>
                <Spinner />
                <span>Updating plan...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Unsubscribe */}
      <div className="mt-8 border-b pb-6">
        <h3 className="text-2xl font-semibold text-gray-700">Unsubscribe</h3>
        <button onClick={handleUnsubscribe} disabled={isUnsubscribePending} className="mt-4 px-6 py-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 w-full disabled:opacity-50">
          {isUnsubscribePending ? "Unsubscribing..." : "Unsubscribe"}
        </button>
      </div>
    </div>
  </div>
);
}