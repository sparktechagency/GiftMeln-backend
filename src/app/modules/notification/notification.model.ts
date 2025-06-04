import { Schema, model } from 'mongoose';
import { INotification } from './notification.interface';

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: false },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  },
);

export const Notification = model<INotification>(
  'Notification',
  notificationSchema,
);
