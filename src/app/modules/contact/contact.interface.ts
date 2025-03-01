import { Model } from 'mongoose';

export type IContact = {
  name: string;
  email: string;
  // subject: string;
  phone: string;
  country: string;
  message: string;
};

export type ContactModel = Model<IContact>;
