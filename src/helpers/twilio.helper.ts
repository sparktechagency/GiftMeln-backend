import twilio from 'twilio';
import config from '../config';

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

const sendEmailOTP = async (email: string) => {
  const verification = await client.verify.v2
    .services(config.twilio.serviceId!)
    .verifications.create({ to: email, channel: 'email' });

  return verification;
};

const verifyEmailOTP = async (email: string, otp: string) => {
  const verification_check = await client.verify.v2
    .services(config.twilio.serviceId!)
    .verificationChecks.create({ to: email, code: otp });

  return verification_check;
};

export const twilioHelper = {
  sendEmailOTP,
  verifyEmailOTP,
};
