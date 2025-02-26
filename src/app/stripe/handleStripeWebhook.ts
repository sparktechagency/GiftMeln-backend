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
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            req.headers["stripe-signature"] as string,
            process.env.WEBHOOK_SECRET as string
        );
    } catch (error) {
        console.error("❌ Webhook verification failed:", error);
        return res.status(400).send({ error: `Webhook Error: ${error}` });
    }

    console.log('✅ Webhook Event Received:', event.type);

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const customerId = session.customer as string;
                console.log('🔍 Debug: Customer ID from Event:', customerId);

                // Get the corresponding user from the database
                const user = await User.findOne({ stripeCustomerId: customerId });
                console.log('🔍 Debug: Searching for User with stripeCustomerId:', customerId);

                if (!user) {
                    console.error("❌ User not found for Customer ID:", customerId);
                    throw new ApiError(StatusCodes.NOT_FOUND, "User not found for this customer ID");
                }

                const userId = user._id;
                await handleOneTimePayment(session, userId);
                break;
            }

            case "customer.subscription.created": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Get the corresponding user from the database
                const user = await User.findOne({ stripeCustomerId: customerId });

                if (!user) {
                    throw new ApiError(StatusCodes.NOT_FOUND, "User not found for this customer ID");
                }

                const userId = user._id;
                console.log('🔍 Debug: User ID:', userId);

                // Pass userId to handleSubscriptionCreated
                await handleSubscriptionCreated(subscription, userId);
                break;
            }

            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await Subscription.findOneAndUpdate(
                    { trxId: paymentIntent.id },
                    { status: 'completed', updatedAt: new Date() }
                );
                break;
            }

            case "payment_intent.payment_failed": {
                const failedPayment = event.data.object as Stripe.PaymentIntent;
                await Subscription.findOneAndUpdate(
                    { trxId: failedPayment.id },
                    { status: 'failed', updatedAt: new Date() }
                );
                break;
            }

            default:
                console.log(`⚠️ DEBUG: Unhandled event type: ${event.type}`);
        }

    } catch (error) {
        console.error("❌ Error processing webhook event:", error);
        return res.status(500).send({ error: `Error processing webhook event: ${error}` });
    }

    return res.sendStatus(200);
};
