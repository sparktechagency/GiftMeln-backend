import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { PackageServices } from './package.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { createOneTimeProductHelper } from '../../../helpers/createOneTimeProductHelper';
import { Payment } from '../payment/payment.model';
import { User } from '../user/user.model';
import { stripe } from '../../../config/stripe';





const createPackage = catchAsync(
    async (req: Request, res: Response) => {
        const { ...productData } = req.body;
        const result = await PackageServices.createPackageIntoDB(productData);
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Package Create successfully.',
            data: result,
        });
    }
);


/*
*checkUserTrial 
*/
const checkUserTrial = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await PackageServices.checkTrialStatus(userId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Trial status checked successfully.',
        data: result,
    });
})


// single product purchase request
const createOneTimePackage = async (req: Request, res: Response) => {
    console.log('🚀 Starting payment process with request body:', JSON.stringify(req.body, null, 2));

    const {
        products,
        userName,
        userEmail,
        country,
        city,
        streetAddress,
        postCode,
        orderMessage
    } = req.body;

    const user = await User.findOne({ email: userEmail });
    if (!user) {
        console.log('❌ User not found for email:', userEmail);
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'User not found.'
        });
    }

    console.log('✅ User found:', userEmail);

    try {
        const lineItems = await Promise.all(products.map(async (product: any) => {
            const { id, price, quantity, color, size } = product;

            console.log(`🛒 Creating Stripe product for:`, product);

            const stripeProduct = await stripe.products.create({
                name: `Product ${id}`,
                metadata: { productId: id, color, size }
            });

            const priceObject = await stripe.prices.create({
                unit_amount: Math.round(price * 100),
                currency: 'usd',
                product: stripeProduct.id
            });

            console.log(`💲 Created Stripe price for product ${id}: ${priceObject.id}`);

            return {
                price: priceObject.id,
                quantity: quantity || 1
            };
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems.map(item => ({
                price: item.price,
                quantity: item.quantity
            })),
            mode: 'payment',
            success_url: 'http://localhost:3000/payment/success',
            cancel_url: 'http://localhost:3000/payment/cancel',
        });

        // Add the amountPaid calculation
        const amountPaid = (session.amount_total ?? 0) / 100;  // amount_total is in cents, so divide by 100

        const paymentData = {
            user: user._id,
            status: 'pending',
            paymentType: 'one-time',
            products: products.map((p: any) => ({
                id: p.id,
                name: p.name,
                quantity: p.quantity || 1,
                price: p.price,
                color: p.color,
                size: p.size
            })),
            orderDetails: {
                userName,
                userEmail,
                country,
                city,
                streetAddress,
                postCode,
                orderMessage,
            },
            checkoutSessionId: session.id,
            paymentUrl: session.url,
            amountPaid,  // Assign calculated amountPaid here
        };

        const payment = new Payment(paymentData);
        await payment.save();

        console.log('💾 Payment record saved:', payment._id);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Checkout session created successfully.',
            data: {
                sessionId: session.id,
                paymentUrl: session.url
            },
        });
    } catch (error) {
        console.error('❌ Error during the Stripe session creation:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `Error during the payment process: ${error}`,
        });
    }
};




export const PackageController = {
    createPackage,
    checkUserTrial,
    createOneTimePackage
};
