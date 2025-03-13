"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser, SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
export default function NavBar() {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) {
    // Optionally, return a loading indicator or skeleton here
    return null;
  }
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/">
          <Image
            className="cursor-pointer hover:opacity-80 transition-opacity"
            src="/logo.svg"
            width={60}
            height={60}
            alt="Logo"
          />
        </Link>
        {/* Navigation Links */}
        <div className="space-x-6 flex items-center">
          {/* Authentication Buttons */}
          <SignedIn>
            <Link
              href="/mealplan"
              className="text-gray-700 hover:text-emerald-500 font-medium transition-colors"
            >
              Mealplan
            </Link>
            {/* Profile Picture */}
            {user?.imageUrl ? (
              <Link href="/profile">
                <Image
                  src={user.imageUrl}
                  alt="Profile Picture"
                  width={40}
                  height={40}
                  className="rounded-full border border-gray-300 shadow-sm hover:shadow-md transition"
                />
              </Link>
            ) : (
              // Placeholder for users without a profile picture
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            )}
            {/* Sign Out Button */}
            <SignOutButton>
              <button className="ml-4 px-5 py-2 bg-emerald-500 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600 transition-all">
                Sign Out
              </button>
            </SignOutButton>
          </SignedIn>
          <SignedOut>
            <Link
              href="/"
              className="text-gray-700 hover:text-emerald-500 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href={isSignedIn ? "/subscribe" : "/sign-up"}
              className="text-gray-700 hover:text-emerald-500 font-medium transition-colors"
            >
              Subscribe
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-2 bg-emerald-500 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600 transition-all"
            >
              Sign Up
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}