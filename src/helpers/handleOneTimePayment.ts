import { StatusCodes } from "http-status-codes";
import ApiError from "../errors/ApiError";
import { User } from "../app/modules/user/user.model";
import Stripe from "stripe";
import { Payment } from "../app/modules/payment/payment.model";
import { CartServices } from "../app/modules/cart/cart.service";

export const handleOneTimePayment = async (session: Stripe.Checkout.Session) => {

    try {
        // const userEmail = session.customer_email;

        // const user = await User.findOne({ email: userEmail });
        // if (!user) {
        //     console.error('❌ User not found for email:', userEmail);
        //     throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        // }
        const userEmail = session.customer_email;

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            console.error("❌ User not found for email:", userEmail);
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }


        const products = session.metadata?.products ? JSON.parse(session.metadata.products) : [];

        const paymentData = {
            user: user._id,
            amountPaid: (session.amount_total ?? 0) / 100,
            trxId: session.payment_intent,
            status: "completed",
            paymentType: session.metadata?.paymentType || 'one-time',
            products: products,
            orderDetails: {
                userName: session.metadata?.userName,
                userEmail: session.metadata?.userEmail,
                country: session.metadata?.country,
                city: session.metadata?.city,
                streetAddress: session.metadata?.streetAddress,
                postCode: session.metadata?.postCode,
                orderMessage: session.metadata?.orderMessage,
            },
        };

        const payment = new Payment(paymentData);
        await payment.save();


        // Ensure this log is printed

        // Clear the cart after payment
        const cartClearResult = await CartServices.clearCart(user._id.toString());

        return {
            success: true,
            message: 'Payment processed and stored successfully!',
            data: {
                paymentId: payment._id,
                status: payment.status,
                amountPaid: payment.amountPaid,
                deletedCartItems: cartClearResult.deletedItems || [],
            }
        };
    } catch (error) {
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Payment processing error: ${error}`
        );
    }
};
