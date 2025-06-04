import { subDays } from 'date-fns';
import { GiftCollection } from './app/modules/giftcollection/giftcollection.model';
import { logger } from './shared/logger';
import cron from 'node-cron';
import { Event } from './app/modules/event/event.model';
import { ProductModel } from './app/modules/product/product.model';

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
