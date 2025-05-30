import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export type IUser = {
  _id?: Types.ObjectId;
  name: string;
  role: USER_ROLES;
  // contact: string;
  phone: string;
  email: string;
  password?: string;
  // location: string;
  googleId?: string;
  isGoogleAccount?: boolean;
  image?: string;
  status: 'active' | 'delete';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: string;
  trialEndsAt?: Date;
  verified: boolean;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  provider: string;
  subscription: {
    id: string;
    user: { type: Types.ObjectId | undefined; ref: 'User' };
    status: string;
    start_date: Date;
    current_period_end: Date;
  };
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
