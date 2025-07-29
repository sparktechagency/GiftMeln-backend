import { Request, Response } from 'express';
import Stripe from 'stripe';
import colors from 'colors';
import { StatusCodes } from 'http-status-codes';
import { stripe } from '../../config/stripe';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import { handleSubscriptionCreated } from '../../helpers/handleSubscriptionCreated';
import { logger } from '../../shared/logger';
import { InvoiceModel } from '../modules/invoiceModel/invoiceModel.model';
import { emailHelper } from '../../helpers/emailHelper';
import { handleOneTimePayment } from '../../helpers/handleOneTimePayment';

const handleStripeWebhook = async (req: Request, res: Response) => {
  let event: Stripe.Event | undefined;

  // Verify the event signature
  try {
    // Use raw request body for verification
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'] as string,
      config.stripe.webhookSecret as string,
    );
  } catch (error) {
    // Return an error if verification fails
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Webhook signature verification failed. ${error}`,
    );
  }

  // Check if the event is valid
  if (!event) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid event received!');
  }

  // Extract event data and type
  const data = event.data.object;

  const eventType = event.type;

  try {
    switch (eventType) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(data as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded': {
        const invoice = data as unknown as Stripe.Invoice;

        const userEmail = invoice.customer_email;
        const amount = invoice.amount_paid / 100;
        const invoiceUrl = invoice.invoice_pdf;

        if (userEmail && invoiceUrl) {
          await InvoiceModel.create({
            userEmail,
            amount,
            invoiceUrl,
            date: new Date(),
          });

          // Send email to the user with the invoice
          const emailData = {
            to: userEmail,
            subject: 'Your Invoice from Giftmelan',
            html: `
                <p>Hi there!</p>
                <p>Thank you for your payment. Please find your invoice below:</p>
                <p><a href="${invoiceUrl}">Download Invoice</a></p>
                <p>Best regards,</p>
                <p>Giftmelan Team</p>
            `,
          };
          await emailHelper.sendEmail(emailData);
        } else {
          console.warn('⚠️ Missing email or invoice URL.');
        }

        break;
      }
      case 'checkout.session.completed':
        const session = data as Stripe.Checkout.Session;
        await handleOneTimePayment(session);
        break

      default:
        logger.warn(colors.bgGreen.bold(`Unhandled event type: ${eventType}`));
    }
  } catch (error) {
    logger.error(
      `Webhook error: ${(error as Error).message || 'Unknown error'}\n${(error as Error).stack || 'No stack trace provided'
      }`
    );
  }

  res.sendStatus(200);
};

export default handleStripeWebhook;
