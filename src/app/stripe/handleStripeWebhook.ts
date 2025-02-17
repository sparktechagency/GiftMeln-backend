import { Request, Response } from "express";
import { stripe } from "../../config/stripe";
import { Payment } from "../modules/payment/payment.model";
import { handleOneTimePayment } from "../../helpers/handleOneTimePayment";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";

export const handleStripeWebhook = async (req: Request, res: Response) => {
    let event: Stripe.Event;

    try {
        console.log('⚡️ Verifying Stripe webhook...');
        event = stripe.webhooks.constructEvent(
            req.body,
            req.headers["stripe-signature"] as string,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
        console.log('✅ Webhook verified successfully');
    } catch (error) {
        console.error('❌ Webhook verification failed:', error);
        return res.status(400).send({ error: `Webhook Error: ${error}` });
    }

    try {
        console.log(`🔄 Handling event: ${event.type}`);
        switch (event.type) {
            case "checkout.session.completed":
                const session = event.data.object as Stripe.Checkout.Session;
                console.log('🔄 Checkout session completed:', session.id);
                await handleOneTimePayment(session);
                break;

            case "payment_intent.succeeded":
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log('🔄 Payment intent succeeded:', paymentIntent.id);
                await Payment.findOneAndUpdate(
                    { trxId: paymentIntent.id },
                    { status: 'completed', updatedAt: new Date() }
                );
                break;

            case "payment_intent.payment_failed":
                const failedPayment = event.data.object as Stripe.PaymentIntent;
                console.log('🔄 Payment intent failed:', failedPayment.id);
                await Payment.findOneAndUpdate(
                    { trxId: failedPayment.id },
                    { status: 'failed', updatedAt: new Date() }
                );
                break;

            default:
                console.log(`⚠️ Unhandled event type: ${event.type}`);
        }

        console.log('✅ Event processed successfully');
    } catch (error) {
        console.error('❌ Error processing webhook event:', error);
        return res.status(500).send({ error: `Error processing webhook event: ${error}` });
    }

    return res.sendStatus(200);
};

