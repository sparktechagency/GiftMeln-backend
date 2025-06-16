import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { EventModel, IEvent } from './event.interface';
import { Event } from './event.model';
import { CATEGORY } from '../../../enums/category';
import { ProductModel } from '../product/product.model';
import { GiftCollection } from '../giftcollection/giftcollection.model';
import { JwtPayload } from 'jsonwebtoken';
import { Subscription } from '../payment/payment.model';
import { SurveyModel } from '../servey/servey.model';

const createEventIntoDB = async (userId: JwtPayload, eventData: IEvent) => {
  const products = await ProductModel.find({
    category: eventData.category,
  });

  if (!products || products.length === 0) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'No product found for this category',
    );
  }

  // 2️⃣ Event date validation
  const today = new Date();
  const thirtyTwoDaysLater = new Date(today);
  thirtyTwoDaysLater.setDate(today.getDate() + 32);

  const selectedEventDate = new Date(eventData.eventDate);

  if (selectedEventDate <= thirtyTwoDaysLater) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Event date must be more than 32 days from today',
    );
  }

  // 3️⃣ Create event
  const event = await Event.create(eventData);
  if (!event) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create event');
  }

  // 4️⃣ Get survey data
  const surveyQuestion = await SurveyModel.findOne({
    user: userId.authId || userId,
  }).lean();

  if (!surveyQuestion) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Survey data not found for user');
  }

  // 5️⃣ Get target question and answer
  const targetQuestion = surveyQuestion.body?.[7];
  const answer = targetQuestion?.answer?.[0] || '';

  // 6️⃣ Get subscription
  const subscription = await Subscription.findOne({
    user: surveyQuestion.user,
  });

  if (!subscription || subscription.balance === undefined) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Subscription not found or invalid',
    );
  }

  // 7️⃣ Now decide product list based on answer
  let selectedProducts: typeof products = [];

  if (answer === '✅ Yes, if I have enough balance') {
    let totalPrice = 0;
    for (const product of products) {
      const price = product.discountedPrice ?? product.regularPrice ?? 0;
      if (subscription.balance >= totalPrice + price) {
        selectedProducts.push(product);
        totalPrice += price;
      } else {
        break;
      }
    }

    if (selectedProducts.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Insufficient balance for any product based on your answer',
      );
    }

    // Create gifts
    for (const product of selectedProducts) {
      await GiftCollection.create({
        event: event._id,
        user: event.user,
        product: product._id,
        status: 'initial',
      });
    }

    // Update balance
    subscription.balance -= totalPrice;
    await subscription.save();
  } else {
    const product = products[0];
    const price = product.discountedPrice ?? product.regularPrice ?? 0;

    if (subscription.balance < price) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Insufficient balance for even one product',
      );
    }

    await GiftCollection.create({
      event: event._id,
      user: event.user,
      product: product._id,
      status: 'initial',
    });

    subscription.balance -= price;
    await subscription.save();
  }

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
