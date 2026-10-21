/**
 * Core Type Definitions
 * Shared types used across the application
 */

export type UUID = string & { readonly __brand: unique symbol };

export function createUUID(): UUID {
  return crypto.randomUUID() as UUID;
}

export function isValidUUID(id: string): id is UUID {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export type ISODateString = string & { readonly __brand: unique symbol };

export function toISODateString(date: Date): ISODateString {
  return date.toISOString() as ISODateString;
}

export function nowISO(): ISODateString {
  return toISODateString(new Date());
}