"use client";

export default function MealPlanDashboard() {
    interface MealPlanInput {
        dietType: string;
        calories: number;
        allergies: string;
        cuisine: string;
        snacks: boolean;
        days?: number;
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const payload: MealPlanInput = {
            dietType: (formData.get("dietType") as string) || "",
            calories: Number(formData.get("calories")) || 2000,
            allergies: (formData.get("allergies") as string) || "",
            cuisine: (formData.get("cuisine") as string) || "",
            snacks: formData.get("snacks") === "on",
            days: 7,
        };

        console.log(payload);
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-10 px-4">
            <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    AI Meal Plan Generator
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col">
                        <label htmlFor="dietType" className="font-medium text-gray-700">
                            Diet Type
                        </label>
                        <input
                            type="text"
                            id="dietType"
                            name="dietType"
                            required
                            placeholder="e.g. Vegetarian, Vegan, Keto..."
                            className="mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="calories" className="font-medium text-gray-700">
                            Daily Calorie Goal
                        </label>
                        <input
                            type="number"
                            id="calories"
                            name="calories"
                            required
                            min={500}
                            max={15000}
                            placeholder="e.g. 2000"
                            className="mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="allergies" className="font-medium text-gray-700">
                            Allergies
                        </label>
                        <input
                            type="text"
                            id="allergies"
                            name="allergies"
                            required
                            placeholder="e.g. Nuts, Dairy, None..."
                            className="mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="cuisine" className="font-medium text-gray-700">
                            Preferred Cuisine
                        </label>
                        <input
                            type="text"
                            id="cuisine"
                            name="cuisine"
                            required
                            placeholder="e.g. Italian, Chinese, No Preference..."
                            className="mt-1 px-4 py-2 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="snacks" name="snacks" className="h-5 w-5" />
                        <label htmlFor="snacks" className="text-gray-700">
                            Include Snacks
                        </label>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full bg-emerald-500 text-white font-medium py-2 px-4 rounded-md shadow-lg hover:bg-emerald-600 transition-all"
                        >
                            Generate Meal Plan
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-800">Weekly Meal Plan</h2>
            </div>
        </div>
    );
}
