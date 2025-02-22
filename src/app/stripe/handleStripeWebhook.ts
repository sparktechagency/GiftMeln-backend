import { Request, Response } from "express";
import { stripe } from "../../config/stripe";
import { Payment } from "../modules/payment/payment.model";
import { handleOneTimePayment } from "../../helpers/handleOneTimePayment";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import { handleSubscriptionCreated } from "../../helpers/handleSubscriptionCreated";

/**
 * Express handler to process incoming Stripe webhook events.
 * It verifies the event using the WEBHOOK_SECRET and routes the event
 * to the appropriate handler based on its type.
 */
export const handleStripeWebhook = async (req: Request, res: Response) => {
    let event: Stripe.Event;

    // Debug: Log the webhook secret to confirm it's loaded (remove in production)

    try {
        // Verify and construct the Stripe event using the raw request body,
        // the Stripe signature from the headers, and your webhook secret.
        event = stripe.webhooks.constructEvent(
            req.body,
            req.headers["stripe-signature"] as string,
            process.env.WEBHOOK_SECRET as string
        );
    } catch (error) {
        console.error("❌ Webhook verification failed:", error);
        return res.status(400).send({ error: `Webhook Error: ${error}` });
    }

    try {
        switch (event.type) {

            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                // Process one-time payment using the session details.
                await handleOneTimePayment(session);
                break;
            }
            case "customer.subscription.created": {
                const subscription = event.data.object as Stripe.Subscription;
                // Process subscription creation.
                await handleSubscriptionCreated(subscription);
                break;
            }
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                // Update the payment record status to 'completed'.
                await Payment.findOneAndUpdate(
                    { trxId: paymentIntent.id },
                    { status: 'completed', updatedAt: new Date() }
                );
                break;
            }
            case "payment_intent.payment_failed": {
                const failedPayment = event.data.object as Stripe.PaymentIntent;
                // Update the payment record status to 'failed'.
                await Payment.findOneAndUpdate(
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

    // Respond with 200 OK to acknowledge receipt of the event.
    return res.sendStatus(200);
};
