import { IGiftCollection } from './giftcollection.interface';
import { GiftCollection } from './giftcollection.model';

const getAllGiftCollectionFromDB = async () => {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  await GiftCollection.updateMany(
    {
      status: 'pending',
      createdAt: { $lt: fortyEightHoursAgo },
    },
    {
      $set: { status: 'send' },
    },
  );

  const allCollections = await GiftCollection.find();
    
  return allCollections;
};
const updateGiftCollection = async (
  id: string,
  payload: Partial<IGiftCollection>,
) => {
  const result = await GiftCollection.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};
const deleteGiftCollection = async (id: string) => {
  const result = await GiftCollection.findByIdAndDelete(id);
  return result;
};
export const GiftCollectionServices = {
  getAllGiftCollectionFromDB,
  updateGiftCollection,
  deleteGiftCollection,
};
