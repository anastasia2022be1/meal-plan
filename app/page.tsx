"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <div className="px-6 py-10 sm:py-16 lg:py-20 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl mb-14 p-10 text-center shadow-lg">
        <h1 className="text-5xl font-bold mb-6">Personalized AI Meal Plans</h1>
        <p className="text-xl mb-8">
          Let our AI do the planning. You focus on cooking and enjoying!
        </p>
        <Link
          href="/sign-up"
          className="inline-block bg-white text-emerald-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors shadow-md">
          Get Started
        </Link>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="mb-14">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-semibold text-gray-800">How It Works</h2>
          <p className="mt-3 text-lg text-gray-600">
            Follow these simple steps to get your personalized meal plan
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-start space-y-10 md:space-y-0 md:space-x-10">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="bg-emerald-600 text-white rounded-full h-20 w-20 flex items-center justify-center mb-5 shadow-md">
              {/* Icon for Step 1 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-8 w-8">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-medium mb-3 text-gray-800">Create an Account</h3>
            <p className="text-lg text-gray-600">
              Sign up or sign in to access your personalized meal plans.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="bg-emerald-600 text-white rounded-full h-20 w-20 flex items-center justify-center mb-5 shadow-md">
              {/* Icon for Step 2 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-8 w-8">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-medium mb-3 text-gray-800">Set Your Preferences</h3>
            <p className="text-lg text-gray-600">
              Input your dietary preferences and goals to tailor your meal
              plans.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="bg-emerald-600 text-white rounded-full h-20 w-20 flex items-center justify-center mb-5 shadow-md">
              {/* Icon for Step 3 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-medium mb-3 text-gray-800">Receive Your Meal Plan</h3>
            <p className="text-lg text-gray-600">
              Get your customized meal plan delivered weekly to your account.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}