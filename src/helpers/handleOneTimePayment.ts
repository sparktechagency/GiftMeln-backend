import Stripe from "stripe";
import { User } from "../app/modules/user/user.model";
import ApiError from "../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { Payment } from "../app/modules/payment/payment.model";

export const handleOneTimePayment = async (session: Stripe.Checkout.Session) => {
    try {
        const userEmail = session.customer_email;
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }

        // Payment Data Store in Database
        const paymentData = {
            user: user._id,
            amountPaid: (session.amount_total ?? 0) / 100, // Convert cents to USD
            trxId: session.payment_intent,
            status: "completed",
            productId: session.metadata?.productId, // Ensure product ID is stored
        };

        if (!paymentData) {
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to store payment data");
        }

        const payment = new Payment(paymentData);
        await payment.save();

        // If the product is digital, send download access
        // If physical, update order status, etc.

        console.log("One-time product payment successfully stored in DB!");
    } catch (error) {
        console.error("Error handling one-time payment:", error);
    }
};
