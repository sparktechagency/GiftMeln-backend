import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { PackageServices } from './package.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { createOneTimeProductHelper } from '../../../helpers/createOneTimeProductHelper';
import { User } from '../user/user.model';
import { stripe } from '../../../config/stripe';
import { OneTimePayment } from '../onetimepayment/onetimepayment.model';
import { Cart } from '../cart/cart.model';
import ApiError from '../../../errors/ApiError';
import { ProductModel } from '../product/product.model';
import { Types } from 'mongoose';





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
// Ensure the path is correct

// export const createOneTimePackage = async (req: Request, res: Response) => {
//     const {
//         products,
//         userName,
//         userEmail,
//         country,
//         city,
//         streetAddress,
//         postCode,
//         orderMessage
//     } = req.body;
//     // Debug: Log incoming products
//     console.log(products);
//     const user = await User.findOne({ email: userEmail });
//     if (!user) {
//         return res.status(StatusCodes.BAD_REQUEST).json({
//             success: false,
//             message: 'User not found.'
//         });
//     }

//     try {
//         // Merge duplicate products (if any)
//         const mergedProducts = products.reduce((acc: any[], product: any) => {
//             const existing = acc.find(item => item.id === product.id);
//             if (existing) {
//                 existing.quantity += product.quantity;
//             } else {
//                 acc.push({ ...product });
//             }
//             return acc;
//         }, []);


//         const lineItems = await Promise.all(mergedProducts.map(async (product: any) => {
//             const { id, price, quantity, color, size, productName } = product;

//             // Log incoming price for each product
//             const stripeProduct = await stripe.products.create({
//                 name: product.productName || `Product ${product.id}`,
//                 metadata: { productId: product.id, color, size }
//             });




//             // If the price is already in cents (e.g., 450), use it directly
//             const unitAmount = price * 100;

//             const priceObject = await stripe.prices.create({
//                 unit_amount: unitAmount,
//                 currency: 'usd',
//                 product: stripeProduct.id
//             });

//             return {
//                 price: priceObject.id,
//                 quantity: quantity || 1
//             };
//         }));

//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             line_items: lineItems.map(item => ({
//                 price: item.price,
//                 quantity: item.quantity
//             })),
//             mode: 'payment',
//             success_url: 'http://localhost:3000/payment/success',
//             cancel_url: 'http://localhost:3000/payment/cancel',
//         });

//         // Stripe returns amount_total in cents

//         // If you want to store the amount in dollars, divide by 100
//         // For now, we'll assume you want to store dollars
//         const amountPaid = session.amount_total ?? 0;

//         const paymentData = {
//             user: user._id,
//             status: 'completed',
//             products: mergedProducts.map((p: any) => ({
//                 id: p.id,
//                 name: p.productName || `Product ${p.id}`,
//                 quantity: p.quantity || 1,
//                 price: p.price,
//                 color: p.color,
//                 size: p.size
//             })),
//             userName,
//             userEmail,
//             country,
//             city,
//             streetAddress,
//             postCode,
//             orderMessage,
//             checkoutSessionId: session.id,
//             paymentUrl: session.url,
//             amountPaid,
//         };



//         const oneTimePayment = new OneTimePayment(paymentData);
//         const confirmPayment = await oneTimePayment.save();
//         if (confirmPayment.status === 'completed') {
//             await Cart.deleteMany({ user: user._id });
//         }

//         return res.status(StatusCodes.OK).json({
//             success: true,
//             message: 'Checkout session created successfully.',
//             data: {
//                 sessionId: session.id,
//                 paymentUrl: session.url
//             },
//         });
//     } catch (error) {
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//             success: false,
//             message: `Error during the payment process: ${error}`,
//         });
//     }
// };


export const createOneTimePackage = async (req: Request, res: Response) => {
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

    // Debug: Log incoming products
    console.log(products);

    // Find the user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'User not found.'
        });
    }

    try {
        const lineItems = await Promise.all(products.map(async (product: any) => {
            const { productName, price, quantity, color, size, id } = product;

            // Log incoming price for each product
            const stripeProduct = await stripe.products.create({
                name: product.productName || `Product ${id}`,
                metadata: { productId: id, color, size }
            });

            // If the price is already in cents (e.g., 450), use it directly
            const unitAmount = price * 100;

            const priceObject = await stripe.prices.create({
                unit_amount: unitAmount,
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

        // Stripe returns amount_total in cents
        const amountPaid = session.amount_total ?? 0;

        // Store only the productName for each product
        const paymentData = {
            user: user._id,
            status: 'completed',
            products: products.map((p: any) => ({
                id: p.id,
                name: p.productName || `Product ${p.id}`,
                price: p.price,
                quantity: p.quantity || 1,
            })),
            userName,
            userEmail,
            country,
            city,
            streetAddress,
            postCode,
            orderMessage,
            checkoutSessionId: session.id,
            paymentUrl: session.url,
            amountPaid,
        };


        const oneTimePayment = new OneTimePayment(paymentData);
        const confirmPayment = await oneTimePayment.save();

        if (confirmPayment.status === 'completed') {
            await Cart.deleteMany({ user: user._id });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Checkout session created successfully.',
            data: {
                sessionId: session.id,
                paymentUrl: session.url
            },
        });
    } catch (error) {
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

// const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
//     const { userId } = req.body;
//     const result = await PackageServices.cancelSubscription(userId);
//     sendResponse(res, {
//         success: true,
//         statusCode: StatusCodes.OK,
//         message: 'Subscription canceled successfully.',
//         data: result,
//     });
// });


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

// get all user subscription
const getAllSubscription = catchAsync(async (req: Request, res: Response) => {
    const result = await PackageServices.getAllUserSubscriptions();
    // console.log("result", result);
    // if (!result || result.length === 0) {
    //     throw new ApiError(StatusCodes.NOT_FOUND, "No subscriptions found");
    // }

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'All subscriptions retrieved successfully.',
        data: result,
    });
});


export const PackageController = {
    createPackage,
    checkUserTrial,
    createOneTimePackage,
    startTrial,
    subscribeToPackage,
    // cancelSubscription,
    // changeSubscription,
    getUserSubscription,
    getAllPackages,
    getPackageById,
    getAllSubscription

};
