export interface IPackage {
  name: string;
  description: string;
  price?: number;
  duration: '7 days' | '1 month' | '1 year';
  paymentType: 'Free' | 'Monthly' | 'Yearly';
  productId?: string;
  features?: string[];
  paymentLink?: string;
}