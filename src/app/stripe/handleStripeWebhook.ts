import { Request, Response } from "express";
import { stripe } from "../../config/stripe";
import { Subscription } from "../modules/payment/payment.model";
import { handleOneTimePayment } from "../../helpers/handleOneTimePayment";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import { handleSubscriptionCreated } from "../../helpers/handleSubscriptionCreated";
import { User } from "../modules/user/user.model";

/**
 * Express handler to process incoming Stripe webhook events.
 * It verifies the event using the WEBHOOK_SECRET and routes the event
 * to the appropriate handler based on its type.
 */


export const handleStripeWebhook = async (req: Request, res: Response) => {
    console.log("🔄 Webhook received");

    let event: Stripe.Event;

    try {
        const sig = req.headers["stripe-signature"];
        if (!sig) {
            console.error("❌ Missing Stripe Signature");
            return res.status(400).send({ error: "Missing Stripe Signature" });
        }

        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.WEBHOOK_SECRET as string
        );

        console.log("✅ Webhook Event Received:", event.type);
    } catch (error) {
        console.error("❌ Webhook verification failed:", error);
        return res.status(400).send({ error: `Webhook Error: ${error}` });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const customerId = session.customer as string;

                console.log("🔍 Debug: Received checkout.session.completed event");
                console.log("🔍 Debug: Customer ID from Event:", customerId);

                if (!customerId) {
                    console.error("❌ No Customer ID in session");
                    return res.status(400).send({ error: "No Customer ID in session" });
                }

                // Check if user exists in the database
                const user = await User.findOne({ stripeCustomerId: customerId });

                console.log("🔍 Debug: Searching for User with stripeCustomerId:", customerId);
                if (!user) {
                    console.error("❌ User not found for Customer ID:", customerId);
                    return res.status(404).send({ error: "User not found for this customer ID" });
                }

                const userId = user._id;
                console.log("✅ Debug: User found:", userId);

                await handleOneTimePayment(session, userId);
                console.log("✅ One-time payment handled successfully");

                break;
            }

            case "customer.subscription.created": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                console.log("🔍 Debug: Received customer.subscription.created event");
                console.log("🔍 Debug: Customer ID from Event:", customerId);

                if (!customerId) {
                    console.error("❌ No Customer ID in subscription event");
                    return res.status(400).send({ error: "No Customer ID in subscription event" });
                }

                // Find the user in the database
                const user = await User.findOne({ stripeCustomerId: customerId });

                console.log("🔍 Debug: Searching for User with stripeCustomerId:", customerId);
                if (!user) {
                    console.error("❌ User not found for Customer ID:", customerId);
                    return res.status(404).send({ error: "User not found for this customer ID" });
                }

                const userId = user._id;
                console.log("✅ Debug: User found:", userId);

                await handleSubscriptionCreated(subscription, userId);
                console.log("✅ Subscription created successfully");

                break;
            }

            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log("✅ Payment Intent Succeeded:", paymentIntent.id);

                const updatedSub = await Subscription.findOneAndUpdate(
                    { trxId: paymentIntent.id },
                    { status: "completed", updatedAt: new Date() },
                    { new: true }
                );

                if (updatedSub) {
                    console.log("✅ Subscription updated successfully:", updatedSub);
                } else {
                    console.error("❌ No Subscription found with trxId:", paymentIntent.id);
                }

                break;
            }

            case "payment_intent.payment_failed": {
                const failedPayment = event.data.object as Stripe.PaymentIntent;
                console.log("⚠️ Payment Intent Failed:", failedPayment.id);

                const updatedSub = await Subscription.findOneAndUpdate(
                    { trxId: failedPayment.id },
                    { status: "failed", updatedAt: new Date() },
                    { new: true }
                );

                if (updatedSub) {
                    console.log("⚠️ Subscription marked as failed:", updatedSub);
                } else {
                    console.error("❌ No Subscription found with trxId:", failedPayment.id);
                }

                break;
            }

            default:
                console.warn(`⚠️ Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        console.error("❌ Error processing webhook event:", error);
        return res.status(500).send({ error: `Error processing webhook event: ${error}` });
    }

    return res.sendStatus(200);
};
