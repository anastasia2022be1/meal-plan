"use client";

import { useMutation } from "@tanstack/react-query";
import { Spinner } from "../components/spinner";

interface MealPlanInput {
  dietType: string;
  calories: number;
  allergies: string;
  cuisine: string;
  snacks: boolean;
  days?: number;
}

interface DailyMealPlan {
  Breakfast?: string;
  Lunch?: string;
  Dinner?: string;
  Snacks?: string;
}

interface WeeklyMealPlan {
  [day: string]: DailyMealPlan;
}

interface MealPlanResponse {
  mealPlan?: WeeklyMealPlan;
  error?: string;
}

async function generateMealPlan(payload: MealPlanInput) {
  const response = await fetch("/api/generate-mealplan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

export default function MealPlanDashboard() {
  const { mutate, isPending, data } = useMutation<
    MealPlanResponse,
    Error,
    MealPlanInput
  >({
    mutationFn: generateMealPlan,
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const payload: MealPlanInput = {
      dietType: (formData.get("dietType") as string) || "",
      calories: Number(formData.get("calories")) ?? 2000,
      allergies: (formData.get("allergies") as string) || "",
      cuisine: (formData.get("cuisine") as string) || "",
      snacks: formData.get("snacks") === "on",
      days: 7,
    };

    mutate(payload, {
      onSuccess: (data) => {
        console.log("Meal Plan Response:", data);
      },
      onError: (error) => {
        console.error("Error generating meal plan:", error);
      },
    });
  }

  // const daysOfTheWeek = [
  //   "Monday",
  //   "Tuesday",
  //   "Wednesday",
  //   "Thursday",
  //   "Friday",
  //   "Saturday",
  //   "Sunday",
  // ];

  // const getMealPlanForDay = (day: string): DailyMealPlan | undefined => {
  //   if (!data?.mealPlan) {
  //     return undefined;
  //   }

  //   return data?.mealPlan[day];
  // };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-start justify-center bg-gray-100 py-12 px-6 gap-8">
      <div className="w-full md:w-1/3 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-6">
          AI Meal Plan Generator
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            id="dietType"
            name="dietType"
            placeholder="Diet Type"
            className="w-full px-4 py-3 border rounded-lg text-black focus:ring-2 focus:ring-emerald-300"
          />
          <input
            type="number"
            id="calories"
            name="calories"
            placeholder="Daily Calorie Goal"
            className="w-full px-4 py-3 border rounded-lg text-black focus:ring-2 focus:ring-emerald-300"
          />
          <input
            type="text"
            id="allergies"
            name="allergies"
            placeholder="Allergies"
            className="w-full px-4 py-3 border rounded-lg text-black focus:ring-2 focus:ring-emerald-300"
          />
          <input
            type="text"
            id="cuisine"
            name="cuisine"
            placeholder="Preferred Cuisine"
            className="w-full px-4 py-3 border rounded-lg text-black focus:ring-2 focus:ring-emerald-300"
          />
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="snacks"
              name="snacks"
              className="h-5 w-5 accent-emerald-500"
            />
            <label htmlFor="snacks" className="text-lg">Include Snacks</label>
          </div>
          <button
            type="submit"
            className="w-full bg-white text-emerald-600 font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition-all">
            {isPending ? "Generating..." : "Generate Meal Plan"}
          </button>
        </form>
      </div>
      <div className="w-full md:w-2/3 bg-white rounded-xl shadow-xl p-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Weekly Meal Plan
        </h2>
        {isPending ? (
          <Spinner />
        ) : data?.mealPlan ? (
          Object.entries(data.mealPlan).map(([day, meals]) => (
            <div key={day} className="mb-6 p-6 border rounded-xl bg-gray-50 shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800">{day}</h3>
              <ul className="list-disc list-inside text-lg text-gray-700 mt-2">
                {meals.Breakfast && (
                  <li>
                    <strong>Breakfast:</strong> {meals.Breakfast}
                  </li>
                )}
                {meals.Lunch && (
                  <li>
                    <strong>Lunch:</strong> {meals.Lunch}
                  </li>
                )}
                {meals.Dinner && (
                  <li>
                    <strong>Dinner:</strong> {meals.Dinner}
                  </li>
                )}
                {meals.Snacks && (
                  <li>
                    <strong>Snacks:</strong> {meals.Snacks}
                  </li>
                )}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-lg text-gray-600">Please generate a meal plan to see results.</p>
        )}
      </div>
    </div>
  );
}
