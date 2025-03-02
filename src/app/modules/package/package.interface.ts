export interface IPackage {
  name: string;
  description: string;
  price?: number;
  duration: "7 days" | "month" | "year";
  paymentType: "Free" | "Paid";
  trialEndsAt: Date;
  productId?: string;
  priceId?: string;
  features: string[];
  paymentLink?: string;
  hasTrial?: boolean;
  stripePriceId?: string;
  stripeSubscriptionId?: string;
  category: "Free Trial" | "Budget Friendly" | "Premium Plan" | "Spoiling Myself";
  isRecommended: string
}
