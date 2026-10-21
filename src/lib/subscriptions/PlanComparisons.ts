import type { PlanComparison } from './interfaces';

export const PLAN_COMPARISONS: PlanComparison[] = [
  {
    tier: 'free',
    name: 'Free',
    price: '$0',
    priceNote: 'Forever free',
    features: [
      { text: 'Up to 3 birthday projects', included: true },
      { text: 'Up to 5 photos per project', included: true },
      { text: 'All free themes', included: true },
      { text: 'Shareable links', included: true },
      { text: 'Premium themes', included: false },
      { text: 'Remove branding', included: false },
      { text: 'HD export', included: false },
      { text: 'Scheduled delivery', included: false },
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    tier: 'premium',
    name: 'Premium',
    price: '$4.99',
    priceNote: 'per month',
    features: [
      { text: 'Unlimited projects', included: true },
      { text: 'Up to 50 photos per project', included: true },
      { text: 'All themes including premium', included: true },
      { text: 'Remove branding', included: true },
      { text: 'HD export', included: true },
      { text: 'Scheduled delivery', included: true },
      { text: 'Priority support', included: true },
      { text: 'Video messages (60s)', included: true },
    ],
    cta: 'Upgrade to Premium',
    highlight: true,
  },
];