import { subDays, isSameDay } from 'date-fns';
import { GiftCollection } from './app/modules/giftcollection/giftcollection.model';
import { logger } from './shared/logger';
import cron from 'node-cron';
import { Event } from './app/modules/event/event.model';
import { USER_ROLES } from './enums/user';
import { User } from './app/modules/user/user.model';
import { sendNotifications } from './helpers/notificationSender';
import { ProductModel } from './app/modules/product/product.model';
import { Subscription } from './app/modules/payment/payment.model';
import { SurveyModel } from './app/modules/servey/servey.model';

export const startGiftExpiryJob = () => {
  cron.schedule(
    '*/5 * * * * *',
    async () => {
      try {
        console.log('🚀 Cron is running at:', new Date().toLocaleString());
        const today = new Date();

        const events = await Event.find({
          eventDate: { $gte: today },
        });

        for (const event of events) {
          const eventDate = new Date(event.eventDate);
          const date32DaysBefore = subDays(eventDate, 32);
          const date30DaysBefore = subDays(eventDate, 30);

          // ✅ STEP 1: Gift Creation if 32 days before
          if (isSameDay(today, date32DaysBefore)) {
            const existingGift = await GiftCollection.findOne({
              event: event._id,
              user: event.user,
            });

            if (existingGift) {
              logger.info(
                `⛔ Gift already exists for event: ${event.eventName}, skipping creation.`,
              );
              continue;
            }
            const subscriptionDetails = await Subscription.findOne({
              user: event.user,
            });

            // logger.info(`💰 subscriptionDetails: ${subscriptionDetails}`);
            const userBalance = subscriptionDetails?.balance || 0;
            logger.info(`💰 User Balance: ${userBalance}`);

            const userServe = await SurveyModel.findOne({
              user: event.user,
            });
            if (!userServe) continue;

            const removeEmojis = (text: string) =>
              text
                .replace(
                  /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
                  '',
                )
                .trim();

            const surveyAnswers = userServe.body
              .map(single => single.answer)
              .flat();
            const cleanedSurveyAnswers = surveyAnswers.map(removeEmojis);

            const preferences =
              event.preferences?.map(p => p.toLowerCase()) || [];
            const matchedPreferences = [
              ...preferences,
              ...cleanedSurveyAnswers,
            ];

            if (matchedPreferences.length === 0) {
              logger.info(
                `❌ No matched preferences for event: ${event.eventName}`,
              );
              continue;
            }

            const allProducts = await ProductModel.find({});
            const matchedTagProducts = allProducts.filter(product => {
              const productTags = product.tag.map(t => t.toLowerCase());
              return matchedPreferences.some(pref =>
                productTags.includes(pref),
              );
            });

            if (matchedTagProducts.length === 0) {
              logger.info(
                `❌ No tag-matched products for event: ${event.eventName}`,
              );
              continue;
            }

            const rawColor = userServe.body[5]?.answer?.[0];
            const preferedColor = rawColor
              ? removeEmojis(rawColor).toLowerCase()
              : '';

            const finalMatchedProducts = matchedTagProducts.filter(product =>
              product.color.map(c => c.toLowerCase()).includes(preferedColor),
            );

            if (finalMatchedProducts.length === 0) {
              logger.info(
                `❌ No color-matched products for event: ${event.eventName}`,
              );
              continue;
            }

            const sortedProducts = finalMatchedProducts.sort(
              (a, b) => a.discountedPrice - b.discountedPrice,
            );

            const selectedProducts = [];
            let total = 0;
            for (const product of sortedProducts) {
              if (total + product.discountedPrice <= userBalance) {
                selectedProducts.push(product);
                total += product.discountedPrice;
              } else {
                break;
              }
            }

            if (selectedProducts.length === 0) {
              logger.info(
                `💸 Not enough balance for any product for event: ${event.eventName}`,
              );
              continue;
            }

            const multipleGift = userServe?.body[7]?.answer?.[0];
            const giftCreate = await GiftCollection.create({
              event: event._id,
              user: event.user,
              product:
                multipleGift === '✅ Yes, if I have enough balance'
                  ? selectedProducts.map(p => p._id.toString())
                  : [selectedProducts[0]._id.toString()],
              status: 'pending',
            });

            // logger.info(`🎁 GiftCollection created: ${giftCreate}`);

            const admins = await User.find({
              role: { $in: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN] },
            });

            for (const admin of admins) {
              await sendNotifications({
                userId: admin._id.toString(),
                title: 'Gift Pending',
                message: `Gift for event "${event.eventName}" is now pending.`,
                isRead: false,
              });
            }
          }

          // ✅ STEP 2: Update Gift Status to "sent" if 30 days before
          if (isSameDay(today, date30DaysBefore)) {
            const gift = await GiftCollection.findOne({
              event: event._id,
              user: event.user,
              status: 'pending',
            });

            if (!gift) {
              logger.info(
                `⛔ No pending gift found to send for event: ${event.eventName}`,
              );
              continue;
            }

            gift.status = 'send';
            await gift.save();

            logger.info(`🚚 Gift sent for event: ${event.eventName}`);

            const admins = await User.find({
              role: { $in: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN] },
            });

            for (const admin of admins) {
              await sendNotifications({
                userId: admin._id.toString(),
                title: 'Gift Sent',
                message: `Gift for event "${event.eventName}" has been sent.`,
                isRead: false,
              });
            }
          }
        }
      } catch (error) {
        logger.error('⛔ Cron Job Error:', error);
      }
    },
    {
      scheduled: true,
      timezone: 'America/New_York'
    },
  );

  logger.info('✅ Gift Expiry Cron Job started and runs every 5 seconds');
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
