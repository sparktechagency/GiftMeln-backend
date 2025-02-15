import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../../config/stripe";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { handleSubscriptionCreated } from "../../helpers/handleSubscriptionCreated";
import { handleOneTimePayment } from "../../helpers/handleOneTimePayment";

export const handleStripeWebhook = async (req: Request, res: Response) => {
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            req.headers["stripe-signature"] as string,
            process.env.STRIPE_WEBHOOK_SECRET as string // Get secret from environment variables
        );
    } catch (error) {
        console.error("Error verifying webhook:", error);
        throw new ApiError(StatusCodes.BAD_REQUEST, `Webhook Error: ${error}`);
    }

    if (!event) {
        console.log("Event not found");
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid event received!");
    }

    console.log("Verified event:", event);

    const eventType = event.type;
    console.log("Event type:", eventType); // Log event type

    // Handle the event
    try {
        switch (eventType) {
            case "customer.subscription.created":
                await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
                console.log("Webhook connected");
                break;
            case "checkout.session.completed":
                const session = event.data.object as Stripe.Checkout.Session;
                await handleOneTimePayment(session);
                break;

            default:
                console.log(`Unhandled event type ${eventType}`);
        }
    } catch (error) {
        console.error("Error handling event:", error);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `An error occurred while handling a webhook event: ${error}`);
    }

    res.sendStatus(200); // Send acknowledgment to Stripe
};
