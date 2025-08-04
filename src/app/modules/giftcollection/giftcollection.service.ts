import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { Subscription } from '../payment/payment.model';
import { ProductModel } from '../product/product.model';
import { IGiftCollection } from './giftcollection.interface';
import { GiftCollection } from './giftcollection.model';

const getAllGiftCollectionFromDB = async () => {
  const allCollections = await GiftCollection.find()
    .populate('user')
    .populate('product')
    .populate('event');

  // Calculate total price for each collection
  const updatedCollections = allCollections.map(collection => {
    const products = Array.isArray(collection.product)
      ? collection.product
      : [collection.product];

    const selectedGiftPrice = products.reduce(
      (acc, curr) => acc + (curr?.discountedPrice || 0),
      0,
    );

    return {
      ...collection.toObject(),
      selectedGiftPrice,
    };
  });

  return updatedCollections;
};

const getAllGiftFromDB = async () => {
  const allGifts = await GiftCollection.find({
    status: 'pending',
  });
  return allGifts;
};


const updateGiftCollection = async (
  id: string,
  payload: Partial<IGiftCollection>,
) => {
  const previousGift = await GiftCollection.findById(id)
    .populate('product')
    .lean();

  const oldProducts = previousGift?.product || [];
  const oldTotal = oldProducts.reduce((acc: number, curr: any) => {
    return acc + (curr?.discountedPrice || 0);
  }, 0);

  const result = await GiftCollection.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  })
    .populate('user')
    .populate('product');

  const user = result?.user as any;
  const newProducts = result?.product || [];

  const newTotal = newProducts.reduce((acc: number, curr: any) => {
    return acc + (curr?.discountedPrice || 0);
  }, 0);

  const subscription = await Subscription.findOne({ user: user._id });

  const currentBalance = subscription?.balance || 0;


  if (payload.status === 'send') {
    if (currentBalance < newTotal) {
      throw new ApiError(400, `Insufficient balance. Current: $${currentBalance}, Required: $${newTotal}`);
    }
    await Subscription.findOneAndUpdate(
      { user: user._id },
      { $inc: { balance: -newTotal } }
    );

  }




  // ✅ 5. Email send
  if (payload.status === 'delivered' && user?.email) {
    const emailContent = emailTemplate.giftStatusUpdate({
      email: user.email,
      name: user.name || 'User',
      status: payload.status,
    });
    await emailHelper.sendEmail(emailContent);
  }
  return result;
};

const deleteGiftCollection = async (id: string) => {
  const result = await GiftCollection.findByIdAndDelete(id);
  return result;
};

const getProductBaseOnCategory = async (category: string) => {
  const result = await ProductModel.find({ category });
  if (!result) {
    return [];
  }
  return result;
};

const getAllGiftBaseOnUserFromDBAlsoStatusSend = async (userId: string) => {
  const result = await GiftCollection.find({ user: userId }, { status: "send" }).populate("event").populate("product");
  if (!result) {
    return [];
  }
  return result;
};

export const GiftCollectionServices = {
  getAllGiftCollectionFromDB,
  updateGiftCollection,
  deleteGiftCollection,
  getAllGiftFromDB,
  getProductBaseOnCategory,
  getAllGiftBaseOnUserFromDBAlsoStatusSend
};
