import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICheckout } from './checkout.interface';
import { Checkout } from './checkout.model';



const createCheckout = async (checkoutData: ICheckout): Promise<ICheckout> => {
    const newCheckout = await Checkout.create(checkoutData);
    if (!newCheckout) {
        throw new ApiError(StatusCodes.BAD_GATEWAY, 'Failed to create checkout');
    }
    return newCheckout;
};



export const CheckoutServices = {
    createCheckout,
};
