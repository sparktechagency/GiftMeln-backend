import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPackage } from './package.interface';
import { Package } from './package.model';
import { createSubscriptionProductHelper } from '../../../helpers/createSubscriptionProductHelper';


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

    // console.log("Package created successfully!", createdPackage);
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
