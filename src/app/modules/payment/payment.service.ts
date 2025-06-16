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
} from 'date-fns';
import { Response } from 'express';

const subscriptionDetailsFromDB = async (
  user: JwtPayload,
): Promise<{ subscription: IPayment | {} }> => {
  const subscription = await Subscription.findOne({ user: user?.id })
    .populate('package')
    .populate('user')
    .populate('balanceAmount')
    .lean();
    console.log('subscription', subscription);
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
//
const getAllSubscriptionIntoDB = async () => {
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

  if (!totalAmount && !activeUser) {
    return [];
  }

  return { totalAmount, activeUser };
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
      startDate = startOfDay(subDays(now, 6)); // last 7 days
      endDate = endOfDay(now);
      groupFormat = 'EEE';
      groupByLabels = eachDayOfInterval({ start: startDate, end: endDate }).map(
        date => format(date, 'EEE'),
      );
      break;

    case 'monthly':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now); // ✅ fix to include full month
      groupFormat = 'dd'; // two-digit day label (01, 02, ..., 31)
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
      Name: sub?.user?.name,
      Email: sub?.user?.email,
      Phone: sub?.user?.phone,
      Package: sub?.package?.name,
      Price: sub?.package?.price,
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
};
