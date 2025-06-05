import { subDays, isSameDay } from 'date-fns';
import { GiftCollection } from './app/modules/giftcollection/giftcollection.model';
import { logger } from './shared/logger';
import cron from 'node-cron';
import { Event } from './app/modules/event/event.model';
import { USER_ROLES } from './enums/user';
import { User } from './app/modules/user/user.model';
import { sendNotifications } from './helpers/notificationSender';

export const startGiftExpiryJob = () => {
  cron.schedule(
    '*/1 * * * *',
    async () => {
      try {
        const today = new Date();

        const events = await Event.find({
          eventDate: { $gte: today },
        });

        for (const event of events) {
          const eventDate = new Date(event.eventDate);
          const date32DaysBefore = subDays(eventDate, 32);
          const date30DaysBefore = subDays(eventDate, 30);
          if (isSameDay(today, date32DaysBefore)) {
            const updated = await GiftCollection.updateMany(
              { event: event._id, status: 'initial' },
              { $set: { status: 'pending' } },
            );

            if (updated.modifiedCount > 0) {
              logger.info(
                `🎁 GiftCollection updated to 'pending' for ${event.eventName}`,
              );

              const admins = await User.find({
                role: { $in: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN] },
              });

              for (const admin of admins) {
                await sendNotifications({
                  userId: admin._id.toString(),
                  title: 'Gift Pending',
                  message: `Gift for event ${event.eventName} is now pending.`,
                  isRead: false,
                });
              }
            }
          }
          if (today >= date30DaysBefore) {
            const updated = await GiftCollection.updateMany(
              { event: event._id, status: 'pending' },
              { $set: { status: 'send' } },
            );
            if (updated.modifiedCount > 0) {
              logger.info(
                `✅ GiftCollection updated to 'send' for ${event.eventName}`,
              );
            }
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
    '0 0  * * *',
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
