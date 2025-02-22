import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { PackageServices } from './package.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { createOneTimeProductHelper } from '../../../helpers/createOneTimeProductHelper';
import { Payment } from '../payment/payment.model';
import { User } from '../user/user.model';
import { stripe } from '../../../config/stripe';





const createPackage = catchAsync(async (req: Request, res: Response) => {
    const result = await PackageServices.createPackageIntoDB(req.body);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Package created successfully.',
        data: result,
    });
});


const getAllPackages = catchAsync(async (req: Request, res: Response) => {
    const result = await PackageServices.getAllPackages();
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Packages retrieved successfully.',
        data: result,
    });
});


// Get package by ID
const getPackageById = catchAsync(async (req: Request, res: Response) => {
    const result = await PackageServices.getPackageById(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Package retrieved successfully.',
        data: result,
    });
});


// Check User Trial
const checkUserTrial = catchAsync(async (req: Request, res: Response) => {
    const result = await PackageServices.checkTrialStatus(req.user.id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Trial status checked successfully.',
        data: result,
    });
});





// single product purchase request
const createOneTimePackage = async (req: Request, res: Response) => {

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
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'User not found.'
        });
    }


    try {
        const lineItems = await Promise.all(products.map(async (product: any) => {
            const { id, price, quantity, color, size } = product;


            const stripeProduct = await stripe.products.create({
                name: `Product ${id}`,
                metadata: { productId: id, color, size }
            });

            const priceObject = await stripe.prices.create({
                unit_amount: Math.round(price * 100),
                currency: 'usd',
                product: stripeProduct.id
            });


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
            amountPaid,
        };

        const payment = new Payment(paymentData);
        await payment.save();


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


const startTrial = catchAsync(async (req: Request, res: Response) => {
    const { userId, packageId, paymentMethodId } = req.body;

    if (!userId || !packageId || !paymentMethodId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Missing required fields: userId, packageId, paymentMethodId"
        });
    }

    const result = await PackageServices.startTrialSubscription(userId, packageId, paymentMethodId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Create Trail for 7 day.',
        data: result,
    });
});

const subscribeToPackage = catchAsync(async (req: Request, res: Response) => {
    const { userId, packageId, paymentMethodId } = req.body;
    const result = await PackageServices.subscribeToPackage(userId, packageId, paymentMethodId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Subscription created successfully.',
        data: result,
    });
});

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.body;
    const result = await PackageServices.cancelSubscription(userId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Subscription canceled successfully.',
        data: result,
    });
});


// Change Subscription (Upgrade/Downgrade)
// const changeSubscription = catchAsync(async (req: Request, res: Response) => {
//     const { userId, newPackageId } = req.body;
//     const result = await PackageServices.changeSubscription(userId, newPackageId);
//     sendResponse(res, {
//         success: true,
//         statusCode: StatusCodes.OK,
//         message: 'Subscription updated successfully.',
//         data: result,
//     });
// });

const getUserSubscription = catchAsync(async (req: Request, res: Response) => {
    const result = await PackageServices.getUserSubscription(req.params.userId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'User subscription retrieved successfully.',
        data: result,
    });
});



export const PackageController = {
    createPackage,
    checkUserTrial,
    createOneTimePackage,
    startTrial,
    subscribeToPackage,
    cancelSubscription,
    // changeSubscription,
    getUserSubscription,
    getAllPackages,
    getPackageById

};
