import Stripe from 'stripe';
import { logger } from '../shared/logger';
import { OneTimePayment } from '../app/modules/onetimepayment/onetimepayment.model';
import { Cart } from '../app/modules/cart/cart.model';
import mongoose from 'mongoose';
import { ProductModel } from '../app/modules/product/product.model';
/**
 * Handles one-time payment logic after Stripe session is completed
 */
export const handleOneTimePayment = async (session: Stripe.Checkout.Session) => {
    try {
        const {
            userId,
            userEmail,
            userName,
            country,
            city,
            streetAddress,
            postCode,
            orderMessage,
            products,
        } = session.metadata || {};
        const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
        const parsedProducts = JSON.parse(products || '[]');



        const oneTimePayment = new OneTimePayment({
            user: userId ? new mongoose.Types.ObjectId(userId) : null,
            status: 'completed',
            userEmail,
            userName,
            country,
            city,
            streetAddress,
            postCode,
            orderMessage,
            checkoutSessionId: session.id,
            paymentUrl: session.url,
            amountPaid,
            products: parsedProducts,
        });
        // console.log("oneTimePayment", oneTimePayment);
        await oneTimePayment.save();

        if (userId) {
            await Cart.deleteMany({ user: new mongoose.Types.ObjectId(userId) });
        }

        logger.info('✅ One-time payment successfully saved.');
    } catch (error) {
        logger.error(`❌ Failed to handle one-time payment: ${(error as Error).message}`);
        throw error;
    }
};
