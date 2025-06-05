import { IFaq } from './faq.interface';
import { Faq } from './faq.model';
const createFAQIntoDB = async (payload: IFaq): Promise<IFaq> => {
  const result = await Faq.create(payload);
  return result;
};

const getAllFAQFromDB = async (): Promise<IFaq[]> => {
  const result = await Faq.find();
  return result;
};
const updateFaqFromDB = async (
  id: string,
  payload: Partial<IFaq>,
): Promise<IFaq | null> => {
  const result = await Faq.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};
const deleteFaqFromDB = async (id: string): Promise<IFaq | null> => {
  const result = await Faq.findByIdAndDelete(id);
  return result;
};
export const FaqServices = {
  createFAQIntoDB,
  getAllFAQFromDB,
  updateFaqFromDB,
  deleteFaqFromDB,
};
