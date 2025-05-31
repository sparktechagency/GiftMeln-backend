import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IEventCategory } from './eventcategory.interface';
import { EventCategory } from './eventcategory.model';

const createEventCategoryIntoDB = async (payload: IEventCategory) => {
  const result = await EventCategory.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create event category',
    );
  }
  return result;
};

const getAllEventCategoryFromDB = async () => {
  const result = await EventCategory.find();
  if (!result) {
    return [];
  }
  return result;
};

const getSingleEventCategoryFromDB = async (id: string) => {
  const result = await EventCategory.findById(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Single Event category retrieve successfully',
    );
  }
  return result;
};

const deleteEventCategoryFromDB = async (id: string) => {
  const result = await EventCategory.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      ' Event category delete successfully',
    );
  }
  return result;
};

export const EventCategoryServices = {
  createEventCategoryIntoDB,
  getAllEventCategoryFromDB,
  getSingleEventCategoryFromDB,
  deleteEventCategoryFromDB,
};
