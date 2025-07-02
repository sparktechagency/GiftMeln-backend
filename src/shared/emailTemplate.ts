import { ICreateAccount, IResetPassword } from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `
    <body style="font-family: Arial, sans-serif;">
      <div style="padding: 20px; background: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); max-width: 600px; margin: auto;">
        <h2 style="color: #f82ba9;">Hey ${values.name},</h2>
        <p>Your one-time OTP is:</p>
        <div style="background-color: #f82ba9; color: white; font-size: 24px; padding: 10px; width: 100px; text-align: center; border-radius: 6px; margin: 10px auto;">
          ${values.otp}
        </div>
        <p>This code is valid for 3 minutes.</p>
      </div>
    </body>
    `,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://res.cloudinary.com/dabd4udau/image/upload/v1746179780/vrc0rxtoso7ysmypfyzd.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #f82ba9; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                <p style="color: #b9b4b4; font-size: 16px; line-height: 1.5; margin-bottom: 20px;text-align:left">If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const loginOTP = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Login Verification Code',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://res.cloudinary.com/dabd4udau/image/upload/v1746179780/vrc0rxtoso7ysmypfyzd.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your one-time login code is:</p>
            <div style="background-color: #f82ba9; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
            <p style="color: #b9b4b4; font-size: 16px; line-height: 1.5; margin-bottom: 20px;text-align:left">If you didn't try to log in, you can safely ignore this email.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};
const giftStatusUpdate = (values: {
  email: string;
  name: string;
  status: string;
}) => {
  return {
    to: values.email,
    subject: '🎁 Gift Collection Status Updated!',
    html: `
      <body style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
          <div style="background-color: #f82ba9; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Hello, ${values.name} 👋</h1>
            <p style="margin: 5px 0 0;">Your gift collection status has been updated!</p>
          </div>

          <div style="padding: 30px; text-align: center;">
            <p style="font-size: 16px; color: #555;">We wanted to let you know that the status of your gift collection has changed to:</p>
            <div style="margin: 20px auto; display: inline-block; background-color: #f82ba9; color: white; padding: 12px 24px; border-radius: 30px; font-size: 18px; font-weight: bold;">
              ${values.status.toUpperCase()}
            </div>

            <p style="margin-top: 20px; font-size: 15px; color: #777;">Thank you for being with us. If you have any questions, feel free to reply to this email.</p>
          </div>

          <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 13px; color: #999;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Giftmein | All rights reserved</p>
          </div>
        </div>
      </body>
    `,
  };
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  loginOTP,
  giftStatusUpdate,
};
