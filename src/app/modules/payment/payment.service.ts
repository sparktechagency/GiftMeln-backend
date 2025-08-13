import { JwtPayload } from 'jsonwebtoken';
import { IPayment } from './payment.interface';
import { Subscription } from './payment.model';
import { stripe } from '../../../config/stripe';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { format as csvFormat } from 'fast-csv';
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  startOfYear,
  endOfYear,
  endOfDay as endOfDayFn,
  eachHourOfInterval,
  eachDayOfInterval,
  eachMonthOfInterval,
  subDays,
  format,
  startOfWeek,
  formatDate,
  endOfMonth,
  sub,
} from 'date-fns';
import { Response } from 'express';
import { ProductModel } from '../product/product.model';
import { GiftCollection } from '../giftcollection/giftcollection.model';
import { OneTimePayment } from '../onetimepayment/onetimepayment.model';

const subscriptionDetailsFromDB = async (
  user: JwtPayload,
): Promise<{ subscription: IPayment | {} }> => {
  const subscription = await Subscription.findOne({ user: user?.id })
    .populate('package')
    .populate('user')
    .populate('balanceAmount')
    .lean();
  // if not found any subscription for the user, return an empty object
  if (!subscription) {
    return { subscription: {} };
  }
  const subscriptionFromStripe = await stripe.subscriptions.retrieve(
    subscription?.subscriptionId,
  );
  if (subscriptionFromStripe?.status !== 'active') {
    await Promise.all([
      User.findByIdAndUpdate(user.id, { isSubscribed: false }, { new: true }),
      Subscription.findOneAndUpdate(
        {
          user: user.id,
        },
        { status: 'expired' },
        { new: true },
      ),
    ]);
  }

  return { subscription };
};
// it's for just show user subscription
const getAllSubscriptionIntoDB = async (userId: string) => {
  const subscription = await Subscription.find({ user: userId })
    .limit(20)
    .populate({
      path: 'package',
      select: 'name  duration',
    })
    .populate({
      path: 'user',
      select: 'name email phone image',
    });

  const userBalance = subscription[0]?.balance!;
  const giftCollection = await GiftCollection.find({ user: userId, status: 'delivered' }).lean();
  const oneTimePayment = await OneTimePayment.find({ user: userId }).lean();
  // @ts-ignore
  const totalOneTimePayment = oneTimePayment.map(price => price.amountPaid).reduce((a, b) => a + b, 0);
  // 1. Flatten all product IDs from all gift collections
  const allProductIds = giftCollection.flatMap(gift => gift.product);
  // 2. Fetch all matching products and get only discountedPrice
  const products = await ProductModel.find(
    { _id: { $in: allProductIds } },
    { discountedPrice: 1 }
  ).lean();

  const totalGiftProductPrice = products.reduce(
    (sum, p) => sum + (p.discountedPrice || 0),
    0
  );
  const totalSpentPrice = totalGiftProductPrice + totalOneTimePayment!;

  const product = await (
    await ProductModel.find()
  ).map(prices => prices.discountedPrice);

  const sortedPrices = product.sort((a, b) => a - b);

  // Calculate how many products user can afford
  let affordableProductCount = 0;
  let totalCost = 0;

  for (const price of sortedPrices) {
    if (totalCost + price <= userBalance) {
      totalCost += price;
      affordableProductCount++;
    } else {
      break;
    }
  }

  if (!subscription.length) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, "Can't Find any Subscription");
  }

  const subscriptionsWithAffordableProducts = subscription.map(sub => ({
    ...sub.toObject(),
    affordableProductCount,
    totalSpentPrice,
  }));
  return subscriptionsWithAffordableProducts;
};
// it's for show all user subscription
const getUserSubscriptionIntoDB = async () => {
  const subscription = await Subscription.find()
    .limit(20)
    .populate({
      path: 'package',
      select: 'name  duration',
    })
    .populate({
      path: 'user',
      select: 'name email phone image',
    });
  if (!subscription.length) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, "Can't Find any Subscription");
  }
  return subscription;
};

// get all subscription history base this user
const getSubscriptionHistory = async (user: JwtPayload) => {
  const subscription = await Subscription.find({ user: user.id }).populate({
    path: 'package',
    model: 'package',
  });
  if (!subscription) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, "Can't Find any Subscription");
  }
  return subscription;
};

const editPriceByAdminFromDB = async (userId: string, newAmount: number) => {
  const subscription = await Subscription.findOneAndUpdate(
    { user: userId },
    { $set: { balance: newAmount } },
    { new: true },
  ).lean();

  if (!subscription) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Subscription not found for this user.',
    );
  }

  return subscription;
};

// TODO: revenue overview
const overViewFromDB = async () => {
  const result = await Subscription.find();
  const activeUser = await Subscription.countDocuments({ status: 'active' });

  const allAmountPaid = result.map(item => item.amountPaid || 0);
  const totalAmount = allAmountPaid.reduce((sum, val) => sum + val, 0);
  const giftSend = await (await GiftCollection.find())
  const totalGiftSend = giftSend.length;
  const selectedGiftOrder = giftSend.filter(item => item.status === 'pending').length;
  const showOrder = await OneTimePayment.find().countDocuments();
  if (!totalAmount && !activeUser && !totalGiftSend && !showOrder && !selectedGiftOrder) {
    return [];
  }

  return { totalAmount, activeUser, totalGiftSend, showOrder, selectedGiftOrder };
};

// TODO: Revenue analytics base on daily, weekly, monthly also yearly
const getRevenueAnalytics = async (query: Record<string, any>) => {
  const type = query.type;
  const now = new Date();

  let startDate: Date;
  let endDate: Date;
  let groupFormat: string;
  let groupByLabels: string[];

  switch (type) {
    case 'daily':
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      groupFormat = 'HH';
      groupByLabels = eachHourOfInterval({
        start: startDate,
        end: endDate,
      }).map(date => format(date, 'HH'));
      break;

    case 'weekly':
      startDate = startOfDay(subDays(now, 6));
      endDate = endOfDay(now);
      groupFormat = 'EEE';
      groupByLabels = eachDayOfInterval({ start: startDate, end: endDate }).map(
        date => format(date, 'EEE'),
      );
      break;

    case 'monthly':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      groupFormat = 'dd';
      groupByLabels = eachDayOfInterval({ start: startDate, end: endDate }).map(
        date => format(date, 'dd'),
      );
      break;

    case 'yearly':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      groupFormat = 'MMM';
      groupByLabels = eachMonthOfInterval({
        start: startDate,
        end: endDate,
      }).map(date => format(date, 'MMM'));
      break;

    default:
      throw new Error('Invalid type. Use daily, weekly, monthly, or yearly');
  }

  const subscriptions = await Subscription.find({
    status: 'active',
    currentPeriodStart: { $gte: startDate, $lte: endDate },
  }).lean();

  const groupedRevenue: Record<string, number> = {};

  for (const sub of subscriptions) {
    const dateForLabel =
      sub?.currentPeriodStart ||
      (sub?._id?.getTimestamp?.() as Date) ||
      new Date();

    const label = format(new Date(dateForLabel), groupFormat);
    groupedRevenue[label] =
      (groupedRevenue[label] || 0) + (sub?.amountPaid || 0);
  }

  const completeGroupedData: Record<string, number> = {};
  for (const label of groupByLabels) {
    completeGroupedData[label] = groupedRevenue[label] || 0;
  }

  const orderedData = groupByLabels.map(label => ({
    label,
    amount: completeGroupedData[label],
  }));

  return orderedData;
};

// TODO: active user
const activeUserFromDB = async () => {
  const result = await Subscription.countDocuments({ status: 'active' });
  if (!result) {
    return 0;
  }
  return result;
};

// TODO: export csv file
const exportRevenueCSVIndoDB = async (
  query: Record<string, any>,
  res: Response,
) => {
  const type = query.type;
  if (!type) {
    throw new Error('Query parameter "type" is required');
  }

  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  let groupFormat: string;
  let groupByLabels: string[];

  switch (type) {
    case 'daily':
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      groupFormat = 'HH';
      groupByLabels = eachHourOfInterval({
        start: startDate,
        end: endDate,
      }).map(date => format(date, 'HH'));
      break;

    case 'weekly':
      startDate = startOfWeek(now, { weekStartsOn: 0 });
      endDate = now;
      groupFormat = 'EEE';
      groupByLabels = eachDayOfInterval({ start: startDate, end: endDate }).map(
        date => format(date, 'EEE'),
      );
      break;

    case 'monthly':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      groupFormat = 'd';
      groupByLabels = eachDayOfInterval({ start: startDate, end: endDate }).map(
        date => format(date, 'd'),
      );
      break;

    case 'yearly':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      groupFormat = 'MMM';
      groupByLabels = eachMonthOfInterval({
        start: startDate,
        end: endDate,
      }).map(date => format(date, 'MMM'));
      break;

    default:
      throw new Error('Invalid type. Use daily, weekly, monthly, or yearly');
  }

  // Fetch active subscriptions in date range
  const subscriptions = await Subscription.find({
    status: 'active',
    currentPeriodStart: { $gte: startDate, $lte: endDate },
  }).lean();

  // Group revenue
  const groupedRevenue: Record<string, number> = {};
  for (const sub of subscriptions) {
    const dateForLabel = sub?.currentPeriodStart || new Date();
    const label = format(new Date(dateForLabel), groupFormat);
    groupedRevenue[label] =
      (groupedRevenue[label] || 0) + (sub?.amountPaid || 0);
  }

  // Fill missing labels with zero
  const completeGroupedData: Record<string, number> = {};
  for (const label of groupByLabels) {
    completeGroupedData[label] = groupedRevenue[label] || 0;
  }

  // Prepare headers
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="revenue-${type}-${formatDate(new Date(), 'yyyy-MM-dd_HH-mm')}.csv"`,
  );

  // 👇 Custom Header Row (manual write)
  res.write(
    `Revenue Report - ${type.toUpperCase()} (${formatDate(new Date(), 'yyyy-MM-dd')})\n\n`,
  );

  // Start CSV stream
  const csvStream = csvFormat({ headers: true });
  csvStream.pipe(res);

  // 👇 Actual CSV headers
  csvStream.write(['Label', 'Amount']);

  // 👇 Write each data row
  for (const label of groupByLabels) {
    csvStream.write([label, completeGroupedData[label]]);
  }

  csvStream.end();
};

// TODO: all subscriber list export csv
const exportAllSubscriberCSVIndoDB = async (res: Response) => {
  const subscriptions = await Subscription.find({ status: 'active' })
    .populate({
      path: 'user',
      select: 'name email phone',
    })
    .populate({
      path: 'package',
      select: 'name price duration',
    })
    .lean();

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="active-users-${formatDate(new Date(), 'yyyy-MM-dd_HH-mm')}.csv"`,
  );

  const csvStream = csvFormat({ headers: true });
  csvStream.pipe(res);

  subscriptions.forEach(sub => {
    csvStream.write({
      // @ts-ignore
      Name: sub?.user?.name,
      // @ts-ignore
      Email: sub?.user?.email,
      // @ts-ignore
      Phone: sub?.user?.phone,
      // @ts-ignore
      Package: sub?.package?.name,
      // @ts-ignore
      Price: sub?.package?.price,
      // @ts-ignore
      Duration: sub?.package?.duration,
      Status: sub?.status,
    });
  });

  csvStream.end();
};

// TODO: Active user and inactive user
const getActiveAndInactiveUserFromDB = async () => {
  const activeUserIds = await Subscription.find({ status: 'active' }).distinct(
    'user',
  );

  const activeUsers = await User.find({
    _id: { $in: activeUserIds },
    role: 'USER',
  });

  const inactiveUsers = await User.find({
    _id: { $nin: activeUserIds },
    role: 'USER',
  });
  return {
    activeUsers,
    inactiveUsers,
  };
};

export const PaymentServices = {
  subscriptionDetailsFromDB,
  getAllSubscriptionIntoDB,
  getSubscriptionHistory,
  editPriceByAdminFromDB,
  overViewFromDB,
  getRevenueAnalytics,
  activeUserFromDB,
  exportRevenueCSVIndoDB,
  exportAllSubscriberCSVIndoDB,
  getActiveAndInactiveUserFromDB,
  getUserSubscriptionIntoDB,
};
