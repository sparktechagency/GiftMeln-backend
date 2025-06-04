import { subDays } from 'date-fns';
import { GiftCollection } from './app/modules/giftcollection/giftcollection.model';
import { logger } from './shared/logger';
import cron from 'node-cron';
import { Event } from './app/modules/event/event.model';
import { ProductModel } from './app/modules/product/product.model';
import { USER_ROLES } from './enums/user';
import { User } from './app/modules/user/user.model';

export const startGiftExpiryJob = () => {
  cron.schedule(
    '*/1 * * * *',
    async () => {
      try {
        const thirtyTwoDaysAgo = new Date(
          new Date().setDate(new Date().getDate() - 32),
        );
        const oldEvents = await Event.find({
          eventDate: { $lte: thirtyTwoDaysAgo },
          giftCreated: { $ne: true },
        });

        if (oldEvents.length > 0) {
          for (const event of oldEvents) {
            const product = await ProductModel.findOne({
              category: event.category,
            });
            await GiftCollection.create({
              event: event._id,
              user: event.user,
              product: product?._id,
            });
            logger.info(`🎉 Gift Collections created for ${event.eventName}`);
            await Event.findOneAndUpdate(
              { _id: event._id },
              { $set: { giftCreated: true } },
            );
          }
        }
      } catch (error) {
        logger.error('⛔ Cron Job Error:', error);
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Dhaka',
    },
  );

  logger.info('✅ Gift Expiry Cron Job started and runs every minute');
};
export const unVerifiedUserDeleteJob = () => {
  cron.schedule(
    // delete after 12 hours
    '0 0 */12 * * *',
    async () => {
      try {
        const twelveHoursAgo = subDays(new Date(), 1);
        const result = await User.deleteMany({
          role: USER_ROLES.USER,
          verified: false,
          createdAt: { $lte: twelveHoursAgo },
        });
        logger.info(`Deleted ${result.deletedCount} unverified users`);
      } catch (error) {
        logger.error('⛔ Cron Job Error:', error);
      }
    },
  );
};
