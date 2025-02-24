

export interface Plan {
    name: string,
    amount: number,
    currency: string,
    interval: string,
    isPopular: boolean,
    description: string,
    features: string[]
}

export const availiblePlans: Plan[] = [
    {
        name: "Weekly Plan",
        amount: 9.99,
        currency: "USD",
        interval: "week",
        isPopular: false,
        description: "Great if you want to try the service before commiting longer",
        features: [
            "Unlimited AI meal plans",
            "AI Nutrition Insights",
            "Cancel anytime"
        ],
    },
    {
        name: "Monthly Plan",
        amount: 29.99,
        currency: "USD",
        interval: "month",
        isPopular: true,
        description: "Perfect for those who want flexibility with full access to premium features",
        features: [
            "Unlimited AI meal plans",
            "AI Nutrition Insights",
            "Exclusive healthy recipes",
            "Priority customer support",
            "Cancel anytime"
        ],
    },
    {   
        name: "Yearly Plan",
        amount: 299.99,
        currency: "USD",
        interval: "year",
        isPopular: false,
        description: "Best value – commit for a year and save 20% compared to the monthly plan",
        features: [
            "Unlimited AI meal plans",
            "AI Nutrition Insights",
            "Exclusive healthy recipes",
            "Personalized meal recommendations",
            "Early access to new features",
            "Priority customer support",
            "Cancel anytime"
        ],
    }
]

const priceIdMap: Record<string, string> = {
    week: process.env.STRIPE_PRICE_WEEKLY!,
    month: process.env.STRIPE_PRICE_MONTHLY!,
    year: process.env.STRIPE_PRICE_YEARLY!
}

export const getPriceIdFromType = (planType: string) => priceIdMap[planType];

