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
