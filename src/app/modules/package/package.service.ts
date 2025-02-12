import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPackage } from './package.interface';
import { Package } from './package.model';
import { createSubscriptionProductHelper } from '../../../helpers/createSubscriptionProductHelper';






const createPackageIntoDB = async (payload: IPackage) => {

    const productPayload = {
        name: payload.name,
        description: payload.description,
        duration: payload.duration,
        price: payload.price
    }

    const product = await createSubscriptionProductHelper(productPayload);
    if (!product) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create subscription product")
    }

    if (product) {
        product.productId = product.productId;
        product.paymentLink = product.paymentLink
    }


    const createPackage = await Package.create({
        ...payload,
        productId: product.productId,
        paymentLink: product.paymentLink,
    });
    if (!createPackage) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Package not created");
    }
    return createPackage;
}





export const PackageServices = {
    createPackageIntoDB,
};
