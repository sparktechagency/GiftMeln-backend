import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { ProductModel } from '../product/product.model';
import { IGiftCollection } from './giftcollection.interface';
import { GiftCollection } from './giftcollection.model';

const getAllGiftCollectionFromDB = async () => {
  const allCollections = await GiftCollection.find({
    status: { $ne: 'initial' },
  })
    .populate('user')
    .populate('product')
    .populate('event');

  return allCollections;
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
  const result = await GiftCollection.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  }).populate('user');

  const user = result?.user as any;

  // ✅ Only send email if status is 'delivery'
  if (payload.status === 'delivery' && user?.email) {
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

export const GiftCollectionServices = {
  getAllGiftCollectionFromDB,
  updateGiftCollection,
  deleteGiftCollection,
  getAllGiftFromDB,
  getProductBaseOnCategory,
};
