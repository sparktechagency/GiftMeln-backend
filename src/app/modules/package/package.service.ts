import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPackage } from './package.interface';
import { Package } from './package.model';
import { createSubscriptionProductHelper } from '../../../helpers/createSubscriptionProductHelper';

// const createPackageIntoDB = async (payload: IPackage) => {
//     // Set trial expiration date if applicable
//     const trialEndsAt = payload.duration === "7 days" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;

//     // Call helper to create Stripe product & pricing
//     const product = await createSubscriptionProductHelper({
//         name: payload.name,
//         description: payload.description,
//         duration: payload.duration,
//         price: payload.price,
//     });

//     if (!product) {
//         throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create subscription product");
//     }

//     // Save the package in the database
//     const createdPackage = await Package.create({
//         ...payload,
//         productId: product.productId,
//         paymentLink: product.paymentLink,
//         trialEndsAt,
//     });

//     if (!createdPackage) {
//         throw new ApiError(StatusCodes.BAD_REQUEST, "Package creation failed");
//     }

//     // return createdPackage;
//     console.log("Package created successfully! Id: ", createdPackage, "productId: ", product.productId, "paymentLink: ", product.paymentLink);
// };


// /**
//  * Check if a user's trial has expired
//  */

// const checkTrialStatus = async (user: string) => {
//     const userPackage = await Package.findOne({ user });

//     if (!userPackage) {
//         throw new ApiError(StatusCodes.NOT_FOUND, "No active subscription found");
//     }

//     if (userPackage.hasTrial && userPackage.trialEndsAt) {
//         if (new Date() > new Date(userPackage.trialEndsAt)) {
//             throw new ApiError(StatusCodes.FORBIDDEN, "Your free trial has expired. Please subscribe.");
//         }
//     }

//     // return userPackage;
//     console.log("Trial status checked successfully! Id: ", userPackage, "hasTrial: ", userPackage.hasTrial, "trialEndsAt: ", userPackage.trialEndsAt);
// };

// /**
//  * Disable expired trials
//  */

// const disableExpiredTrials = async () => {
//     console.log("⏳ Checking expired trials...");

//     const expiredTrials = await Package.updateMany(
//         { hasTrial: true, trialEndsAt: { $lt: new Date() } },
//         { $set: { hasTrial: false } }
//     );

//     console.log(`✅ Disabled ${expiredTrials.modifiedCount} expired trials.`);
// };


// import { StatusCodes } from 'http-status-codes';
// import ApiError from '../../../errors/ApiError';
// import { IPackage } from './package.interface';
// import { Package } from './package.model';
// import { createSubscriptionProductHelper } from '../../../helpers/createSubscriptionProductHelper';

const createPackageIntoDB = async (payload: IPackage) => {
    const trialEndsAt = payload.duration === "7 days" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;

    const product = await createSubscriptionProductHelper({
        name: payload.name,
        description: payload.description,
        duration: payload.duration,
        price: payload.price,
    });

    if (!product) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create subscription product");
    }

    const createdPackage = await Package.create({
        ...payload,
        productId: product.productId,
        paymentLink: product.paymentLink,
        trialEndsAt,
    });

    if (!createdPackage) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Package creation failed");
    }

    console.log("Package created successfully!", createdPackage);
    return createdPackage;
};

/**
 * Check if a user's trial has expired
 */
const checkTrialStatus = async (userId: string) => {
    const userPackage = await Package.findOne({ userId });

    if (!userPackage) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No active subscription found");
    }

    if (userPackage.hasTrial && userPackage.trialEndsAt) {
        if (new Date() > new Date(userPackage.trialEndsAt)) {
            await Package.updateOne({ userId }, { $set: { hasTrial: false } });
            throw new ApiError(StatusCodes.FORBIDDEN, "Your free trial has expired. Please subscribe.");
        }
    }

    return userPackage;
};

export const PackageServices = {
    createPackageIntoDB,
    checkTrialStatus,
};


// export const PackageServices = {
//     createPackageIntoDB,
//     checkTrialStatus,
//     disableExpiredTrials,
// };
