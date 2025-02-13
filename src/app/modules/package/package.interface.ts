export interface IPackage {
  name: string;
  description: string;
  price?: number;
  duration: '7 days' | '1 month' | '1 year';
  paymentType: 'Free' | 'Monthly' | 'Yearly';
  trialEndsAt: Date
  productId?: string;
  features: string[];
  paymentLink?: string;
  hasTrial?: boolean;
  category: 'Free Trial' | 'Budget Friendly' | 'Premium Plan' | 'Spoiling Myself';
}