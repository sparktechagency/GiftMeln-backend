import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  ip_address: process.env.IP_ADDRESS,
  database_url: process.env.DATABASE_URL,
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expire_in: process.env.JWT_EXPIRE_IN,
  },
  email: {
    from: process.env.EMAIL_FROM,
    user: process.env.EMAIL_USER,
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PASS,
  },
  super_admin: {
    email: process.env.SUPER_ADMIN,
    password: process.env.SUPER_ADMIN_PASSWORD,
  },
  // for stripe payment gateway
  stripe: {
    stripeSecretKey: process.env.STRIPE_API_SECRET,
    webhookSecret: process.env.WEBHOOK_SECRET,
    paymentSuccess: process.env.STRIPE_PAYMENT_SUCCESS_LINK,
  },
  shopify: {
    apiKey: process.env.SHOPIFY_API_KEY!,
    apiSecret: process.env.SHOPIFY_API_SECRET!,
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN!,
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
    apiVersion: '2024-04',
  },
  // towilo
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    serviceId: process.env.TWILIO_SERVICE_ID,
  },
  // sendgrid
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    email: process.env.SANDGRIDEMAIL,
  },
  // google login
  google: {
    clientID: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    callbackURL: process.env.CALLBACK_URL!,
  },
};
