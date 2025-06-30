import { GiftCollection } from "../giftcollection/giftcollection.model";
import { Subscription } from "../payment/payment.model";
import { startOfYear, endOfYear } from "date-fns";

const totalDeliveryAndTotalSubscriber = async () => {
    const now = new Date();
    const start = startOfYear(now);
    const end = endOfYear(now);

    // Month-wise subscriber aggregation (based on currentPeriodStart)
    const subscriberAgg = await Subscription.aggregate([
        {
            $match: {
                currentPeriodStart: { $gte: start, $lte: end },
                status: "active",
            },
        },
        {
            $group: {
                _id: { $month: "$currentPeriodStart" },
                count: { $sum: 1 },
            },
        },
    ]);

    // Month-wise delivery aggregation
    const deliveryAgg = await GiftCollection.aggregate([
        {
            $match: {
                createdAt: { $gte: start, $lte: end },
                status: "send",
            },
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                count: { $sum: 1 },
            },
        },
    ]);

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const subscribersByMonth = Array(12).fill(0);
    const deliveriesByMonth = Array(12).fill(0);

    // Fill subscriber count
    subscriberAgg.forEach(item => {
        subscribersByMonth[item._id - 1] = item.count;
    });

    // Fill delivery count
    deliveryAgg.forEach(item => {
        deliveriesByMonth[item._id - 1] = item.count;
    });

    return months.map((month, idx) => ({
        month,
        subscribers: subscribersByMonth[idx],
        deliveries: deliveriesByMonth[idx]
    }));
};

export const DashboardService = {
    totalDeliveryAndTotalSubscriber,
};