import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { EventModel, IEvent } from './event.interface';
import { Event } from './event.model';
import { ProductModel } from '../product/product.model';
import { GiftCollection } from '../giftcollection/giftcollection.model';
import { JwtPayload } from 'jsonwebtoken';
import { Subscription } from '../payment/payment.model';
import { SurveyModel } from '../servey/servey.model';
import { Types } from 'mongoose';

const createEventIntoDB = async (userId: JwtPayload, eventData: IEvent) => {
  // // 1️⃣ Get all products
  // const products = await ProductModel.find();
  // if (!products || products.length === 0) {
  //   throw new ApiError(StatusCodes.NOT_FOUND, 'No product found');
  // }

  // 2️⃣ Event date must be 32 days ahead
  const today = new Date();
  const minEventDate = new Date(today);
  minEventDate.setDate(today.getDate() + 32);
  const selectedEventDate = new Date(eventData.eventDate);

  if (selectedEventDate <= minEventDate) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Event date must be more than 32 days from today',
    );
  }

  // 4️⃣ Get survey for this user
  const survey = await SurveyModel.findOne({
    user: new Types.ObjectId(userId.authId || userId.id || userId),
  }).lean();

  if (!survey) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Survey data not found');
  }

  // 5️⃣ Extract tags from survey answers
  const removeEmojis = (text: string) =>
    text
      .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
      .trim();
  const surveyTags: string[] =
    survey.body?.flatMap(q =>
      Array.isArray(q.answer) ? q.answer.map(ans => removeEmojis(ans)) : [],
    ) || [];

  // 6️⃣ Filter matching products
  // const matchingProducts = products.filter(product =>
  //   product.tag?.some(tag => surveyTags.includes(tag.trim().toLowerCase())),
  // );

  // 7️⃣ Get user's subscription
  const subscription = await Subscription.findOne({
    user: survey.user,
  });

  if (!subscription) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscription not found');
  }

  // 8️⃣ Gift preference answer
  // const giftPreferenceQuestion = survey.body?.[7];
  // const answer = giftPreferenceQuestion?.answer?.[0] || '';

  // const selectedProducts: string[] = [];
  // 3️⃣ Create the event
  const event = await Event.create({
    ...eventData,
    user: userId.authId || userId.id || userId,
  });

  if (!event) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create event');
  }
  // if (answer === '✅ Yes, if I have enough balance') {
  //   let totalPrice = 0;
  //   const addedProductIds = new Set<string>();
  //   for (const product of products) {
  //     if (addedProductIds.has(product._id.toString())) continue;
  //     const price = product.discountedPrice ?? product.regularPrice ?? 0;
  //     if (subscription.balance >= totalPrice + price) {
  //       selectedProducts.push(product._id.toString());
  //       totalPrice += price;
  //     } else {
  //       break;
  //     }
  //   }
  //   if (selectedProducts.length === 0) {
  //     throw new ApiError(
  //       StatusCodes.BAD_REQUEST,
  //       'Insufficient balance for any product based on your answer',
  //     );
  //   }

  //   await GiftCollection.create({
  //     event: event._id,
  //     user: event.user,
  //     product: selectedProducts,
  //     status: 'initial',
  //   });

  //   subscription.balance -= totalPrice;
  //   await subscription.save();
  // } else {
  //   // Single gift logic
  //   const product = matchingProducts[0];
  //   const price = product?.discountedPrice ?? product?.regularPrice ?? 0;

  //   if (subscription.balance < price) {
  //     throw new ApiError(
  //       StatusCodes.BAD_REQUEST,
  //       'Insufficient balance for the selected product',
  //     );
  //   }
  //   // +971 52 551 3733
  //   await GiftCollection.create({
  //     event: event._id,
  //     user: event.user,
  //     product: selectedProducts,
  //     status: 'initial',
  //   });

  //   subscription.balance -= price;
  //   await subscription.save();
  // }

  // 9️⃣ Final return
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
// edit event by user id
const eventEditFromDB = async (id: string, payload: IEvent) => {
  const result = await Event.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }
  return result;
};
export const EventServices = {
  createEventIntoDB,
  getAllEventsFromDB,
  getSingleEventFromDB,
  deleteEventFromDB,
  updateEventInDB,
  getUserEventFromDB,
  eventEditFromDB,
};
