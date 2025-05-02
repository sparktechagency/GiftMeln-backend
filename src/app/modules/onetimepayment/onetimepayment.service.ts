import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { OnetimePaymentModel } from './onetimepayment.interface';
import { OneTimePayment } from './onetimepayment.model';

const getAllProductPurchaseDataIntoDB = async () => {
    const result = await OneTimePayment.find();
    if (result.length === 0) {
        return []
    }
    return result;
};




export const OnetimepaymentServices = {
    getAllProductPurchaseDataIntoDB
};
