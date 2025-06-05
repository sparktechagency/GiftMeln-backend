import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { EventModel, IEvent } from './event.interface';
import { Event } from './event.model';
import { CATEGORY } from '../../../enums/category';
import { ProductModel } from '../product/product.model';
import { GiftCollection } from '../giftcollection/giftcollection.model';
import { JwtPayload } from 'jsonwebtoken';
import { sendNotifications } from '../../../helpers/notificationSender';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enums/user';

const createEventIntoDB = async (userId: JwtPayload, eventData: IEvent) => {
  const product = await ProductModel.findOne({ category: eventData.category });

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Invalid Event Category');
  }

  const event = (await Event.create(eventData)) as IEvent;
  if (!event) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create event');
  }
  await GiftCollection.create({
    event: event._id,
    user: event.user,
    product: product._id,
    status: 'initial',
  });

  return event;
};

// get all events from database
const getAllEventsFromDB = async () => {
  const events = await Event.find({}).populate('category');
  if (!events) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No events found');
  }

  return events;
};

// get single event from database
const getSingleEventFromDB = async (id: string) => {
  const event = await Event.findById(id).populate('category');
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  return event;
};

const deleteEventFromDB = async (id: string) => {
  const deletedEvent = await Event.findByIdAndDelete(id);
  if (!deletedEvent) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  return deletedEvent;
};

// update event in database
const updateEventInDB = async (id: string, eventData: EventModel) => {
  const { category }: any = eventData;

  if (!category || !Object.values(CATEGORY).includes(category)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Category must be one of: Birthday, Anniversary, Wedding, Friendship Day, Graduation, or Others',
    );
  }

  const updatedEvent = await Event.findByIdAndUpdate(id, eventData, {
    new: true,
  });
  if (!updatedEvent) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  return updatedEvent;
};

const getUserEventFromDB = async (userId: string) => {
  const result = await Event.find({ user: userId });
  return result;
};

export const EventServices = {
  createEventIntoDB,
  getAllEventsFromDB,
  getSingleEventFromDB,
  deleteEventFromDB,
  updateEventInDB,
  getUserEventFromDB,
};
