import { OneTimePayment } from './onetimepayment.model';

const getAllProductPurchaseDataIntoDB = async () => {
  const result = await OneTimePayment.find();
  if (result.length === 0) {
    return [];
  }
  return result;
};

export const OnetimePaymentServices = {
  getAllProductPurchaseDataIntoDB,
};
 