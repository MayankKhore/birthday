/**
 * Centralized Route Constants
 */

export const ROUTES = {
  HOME: '/',
  CREATE: '/create',
  WISHES: '/wishes',
  DASHBOARD: '/dashboard',
  TEMPLATES: '/templates',
  PRICING: '/pricing',
  HOW_IT_WORKS: '/how-it-works',
  FAQ: '/faq',
  LOGIN: '/login',
  REGISTER: '/register',
  SETTINGS: '/settings',
  DESIGN_SYSTEM: '/design-system',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  PREVIEW: '/preview',
  SHARE: '/share',
  ACCESS: '/access',
  NOT_FOUND: '/404'
} as const;

export function shareUrl(slug: string, baseUrl?: string): string {
  const base = baseUrl ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/share/${slug}`;
}

export function previewUrl(id: string, baseUrl?: string): string {
  const base = baseUrl ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/preview/${id}`;
}

export const NAVIGATION = [
  { label: 'Explore', href: '/#showcase' },
  { label: 'Birthday Wishes', href: ROUTES.WISHES },
  { label: 'Create a Birthday Page', href: ROUTES.CREATE }
] as const;

export const FOOTER_LINKS = [
  { label: 'About', href: ROUTES.ABOUT },
  { label: 'Contact', href: ROUTES.CONTACT },
  { label: 'Privacy', href: ROUTES.PRIVACY },
  { label: 'Terms', href: ROUTES.TERMS }
] as const;

export const FOOTER_PRODUCT = [
  { label: 'Create a Page', href: ROUTES.CREATE },
  { label: 'Birthday Wishes', href: ROUTES.WISHES },
  { label: 'Templates', href: ROUTES.TEMPLATES },
  { label: 'Pricing', href: ROUTES.PRICING },
  { label: 'How It Works', href: ROUTES.HOW_IT_WORKS },
  { label: 'FAQ', href: ROUTES.FAQ }
] as const;

export type RouteKey = keyof typeof ROUTES;
export type Route = (typeof ROUTES)[RouteKey];