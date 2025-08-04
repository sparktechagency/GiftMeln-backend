import config from '../config';
import { emailTemplate } from '../shared/emailTemplate';
import sgMail from '@sendgrid/mail';
import { ISendEmail } from '../types/email';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../shared/logger';

sgMail.setApiKey(config.sendgrid.apiKey!);
const sendOtpEmail = async (email: string, name: string, otp: number) => {
  const message = emailTemplate.createAccount({ email, name, otp });

  const msg = {
    to: message.to,
    from: config.sendgrid.email as string,
    subject: message.subject,
    html: message.html,
  };
  await sgMail.send(msg);
};
const sendEmail = async (values: ISendEmail) => {
  const msg = {
    to: values.to,
    from: config.sendgrid.email,
    subject: values.subject,
    html: values.html,
  };

  try {
    // @ts-ignore
    const response = await sgMail.send(msg);
    logger.info('✅ Email sent successfully:', response[0].statusCode);
  } catch (error) {
    logger.error('❌ Failed to send OTP email:', error);
  }
};

export const emailHelper = {
  sendEmail,
  sendOtpEmail,
};
