import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import {prisma} from "@/lib/prisma";

export async function POST(request: NextRequest) {
    const body = await request.text(); // получает JSON-тело запроса
    const signature = request.headers.get("stripe-signature"); // заголовок stripe-signature, который нужен для верификации подлинности события

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!; // секретный ключ вебхука, который Stripe использует для подписи запросов

    let event: Stripe.Event;

    try {
       // console.log("Webhook received. Verifying event...");
        event = stripe.webhooks.constructEvent(body, signature || "", webhookSecret); // проверяет, что запрос действительно пришел от Stripe и не был подделан.
       // console.log("Webhook verified successfully:", event.type);
    } catch (error) {
      //  console.error("Error verifying webhook signature:", error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    try {
        switch (event.type) {
            // Обработка успешного платежа
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
              //  console.log("Checkout session completed:", session);
                await handleCheckoutSessionCompleted(session); // Вызывается handleCheckoutSessionCompleted(session), которая обновляет данные пользователя в БД
                break;
            }
    
            // Обработка неудачной оплаты счета
            case "invoice.payment_failed": {
                const session = event.data.object as Stripe.Invoice;
                console.log("Invoice payment failed:", session);
                await handleInvoicePaymentFailed(session);
                break;
            }
    
            // Обработка отмены подписки
            case "customer.subscription.deleted": {   
                const session = event.data.object as Stripe.Subscription;
                console.log("Subscription deleted:", session);
                await handleCustomerSubscriptionDeleted(session);
                break;
            }
    
            default:
                console.log("Unhandled event type:", event.type);
        }
    } catch (error: any) {
        console.error("Error processing webhook event:", error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({});
}

// обновляет данные пользователя
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    // console.log("Function handleCheckoutSessionCompleted started", session);

    const userId = session.metadata?.clerkUserId; // обновляет данные пользователя

    if (!userId) {
        console.log("No user ID found in checkout session");
        return;
    }

    const subscriptionId = session.subscription as string; // Проверяет наличие subscriptionId (ID подписки)

    if (!subscriptionId || subscriptionId === "") {
        console.log("No subscription ID found in checkout session");
        return;
    }

    try {
        console.log("Updating profile with userId:", userId, "and subscriptionId:", subscriptionId);
        const userProfile = await prisma.profile.findUnique({
            where: { userId }
        });
        console.log("Found profile:", userProfile);
        
        await prisma.profile.update({
            where: { userId },
            data: {
                stripeSubscriptionId: subscriptionId, // сохраняет ID подписки
                subscriptionActive: true, // помечает подписку как активную
                subscriptionTier: session.metadata?.planType || null, // тип подписки
            },
        });

        console.log("Function handleCheckoutSessionCompleted finished");
    } catch (error: any) {
        console.error("Error updating user profile:", error.message);
        console.error(error.stack); 
    }
}

// обработкa неудачных оплат счета
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const subId = invoice.subscription as string;

    if(!subId) {
        return;
    }

    let userId: string | undefined;
    try {
            // Ищем профиль пользователя в базе данных по его Stripe Subscription ID
        const profile = await prisma?.profile.findUnique({
            where: { stripeSubscriptionId: subId }, // Условие поиска: ищем запись, где поле stripeSubscriptionId равно subId
            select: { userId: true }, // Запрашиваем только поле userId, остальные данные не загружаем
        });

        // Проверяем, найден ли профиль и есть ли у него userId
        if (!profile?.userId) { 
            console.log("No user found for subscription ID:", subId); // Логируем сообщение, если пользователя не найдено
            return; // Завершаем выполнение функции, если профиль не найден
        }

        // Если профиль найден, присваиваем userId из объекта profile
        userId = profile?.userId;

    } catch (error:any) {
        console.log(error.message);
        return;
    }
    
    try {
        await prisma?.profile.update({
            where: { userId: userId }, // Условие поиска: ищем запись, где поле userId равно userId
            data: {
                subscriptionActive: false, // Помечаем подписку как неактивную
            },
        });
    } catch (error) {
        console.log(error.message);
    }
}

//  обработкa удаления подписки
async function handleCustomerSubscriptionDeleted(subscription: Stripe.Subscription) {

    const subId = subscription.id;

    try {
            // Ищем профиль пользователя в базе данных по его Stripe Subscription ID
        const profile = await prisma?.profile.findUnique({
            where: { stripeSubscriptionId: subId }, // Условие поиска: ищем запись, где поле stripeSubscriptionId равно subId
            select: { userId: true }, // Запрашиваем только поле userId, остальные данные не загружаем
        });

        // Проверяем, найден ли профиль и есть ли у него userId
        if (!profile?.userId) { 
            console.log("No user found for subscription ID:", subId); // Логируем сообщение, если пользователя не найдено
            return; // Завершаем выполнение функции, если профиль не найден
        }

        // Если профиль найден, присваиваем userId из объекта profile
        userId = profile?.userId;

    } catch (error:any) {
        console.log(error.message);
        return;
    }
    
    try {
        await prisma?.profile.update({
            where: { userId: userId }, // Условие поиска: ищем запись, где поле userId равно userId
            data: {
                subscriptionActive: false, // Помечаем подписку как неактивную
                stripeSubscriptionId: null, // Удаляем ID подписки
                subscriptionTier: null, // Удаляем тип подписки
            },
        });
    } catch (error) {
        console.log(error.message);
    }
}
