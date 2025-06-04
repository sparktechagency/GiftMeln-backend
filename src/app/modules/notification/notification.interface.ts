export type INotification = {
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: Date;
};
