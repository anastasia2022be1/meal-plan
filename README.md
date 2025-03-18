# AI Meal Plan Generator 🥗 - Full Stack SaaS App

A **full-stack AI-powered SaaS** web application that generates personalized meal plans based on dietary preferences, allergies, calorie goals, and cuisine preferences. The app offers subscription-based access with authentication, secure payment processing via **Stripe**, and user management via **Clerk**.

## 🚀 Overview

This project is a **Next.js 15** application with **TypeScript**, **Prisma**, and **PostgreSQL**, offering an AI-powered meal planning service. Users can sign up, manage their subscriptions, and generate meal plans based on their preferences.

## ✨ Features

- 🔑 **Authentication & Authorization**: Secure user authentication with **Clerk**
- 📅 **AI-Generated Meal Plans**: Personalized meal plans using **OpenAI**
- 💰 **Subscription Management**: Paid plans powered by **Stripe**
- 📜 **Serverless API**: Built with **Next.js API routes** for scalability
- 📊 **Database Management**: **Prisma ORM** with **PostgreSQL**
- 🎨 **Responsive UI**: Styled with **TailwindCSS**
- 🔒 **Middleware Protection**: Ensures only subscribed users can access meal plans
- ⚡ **Optimized Performance**: Uses **React Query** for data fetching and caching

## 🛠 Tech Stack

|Technology         | Description                     |
|-------------------|---------------------------------|
|Next.js 15         |Full-stack framework for React   |
|TypeScript         |Type safety and maintainability  |
|TailwindCSS        |Responsive styling|
|Clerk|User authentication and profile management|
|Stripe|Payment processing and subscriptions|
|Prisma|ORM for database interaction|
|PostgreSQL|Relational database for storing user data|
|React Query|API data caching and state management|
|OpenAI API|AI-powered meal plan generation|


## 📦 Installation & Setup
1.  Clone the Repository
```
git clone https://github.com/yourusername/ai-mealplan.git
cd ai-mealplan
```
2. Install Dependencies
```
npm install
```
3. Setup Environment Variables
Create a .env.local file in the root directory and add the following variables:

```
# Database
DATABASE_URL=your_postgres_connection_string

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PRICE_WEEKLY=your_weekly_price_id
STRIPE_PRICE_MONTHLY=your_monthly_price_id
STRIPE_PRICE_YEARLY=your_yearly_price_id
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# OpenAI
OPEN_ROUTER_API_KEY=your_openai_api_key

# App Settings
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🏗 Database Setup
1. Generate Prisma Client
```
npx prisma generate
```
2. Apply Migrations
```
npx prisma migrate dev --name init
```
3.  Seed the Database (Optional)
```
npx prisma db seed
```
## 🚀 Running the Project
#### Development Mode
```
npm run dev
```
App will be available at http://localhost:3000

#### Production Build
```
npm run build
npm start
```

## 🔑 Authentication with Clerk
- Uses middleware.ts to protect routes
- Redirects users to /sign-up if unauthenticated
- Blocks access to /mealplan if subscription is inactive
## 💳 Subscription & Payments
- Stripe handles subscription payments via checkout sessions
- Plans: Weekly, Monthly, Yearly
- Uses webhooks to update user subscriptions in the database

## 🔄 API Endpoints
|Route|	Method|	Description|
|------|------|------------|
|/api/check-subscription|	GET|	Checks if user has an active subscription|
|/api/checkout|	POST|	Creates Stripe checkout session|
|/api/profile/create|	POST|	Creates a new user profile in DB|
|/api/profile/subscription-status|	GET|	Fetches user subscription status|
|/api/profile/change-plan|	POST|	Updates user subscription plan|
|/api/profile/unsubscribe|	POST|	Cancels subscription|
|/api/generate-mealplan|	POST|	AI generates meal plan|


## ⚡ Future Improvements
- 📌 Add AI meal suggestions based on weekly trends
- 📌 Implement calorie tracking dashboard
- 📌 Offer customized meal plan printouts
- 📌 Add multilingual support

## 🎉 Acknowledgments
Special thanks to **OpenAI, Clerk, Prisma, and Stripe** for providing amazing tools to build this application!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
