export interface IPackage {
  name: string;
  description: string;
  price?: number | undefined;
  duration: '7 days' | '1 month' | '1 year';
  paymentType: 'Free' | 'Monthly' | 'Yearly';
  trialEndsAt: Date
  productId?: string;
  priceId?: string;
  features: string[];
  paymentLink?: string;
  hasTrial?: boolean;
  stripePriceId?: string;
  stripeSubscriptionId?: string;
  category: 'Free Trial' | 'Budget Friendly' | 'Premium Plan' | 'Spoiling Myself';
}