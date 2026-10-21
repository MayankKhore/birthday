import type {
  MessageTemplate,
  MessageCategory,
  MessageTone,
  MessageLength,
  MessageVariable,
  GeneratedMessage,
} from '@/types';
import { MESSAGE_TEMPLATES } from './templates';

export { MESSAGE_TEMPLATES };
export type { MessageCategory, MessageTone };

export interface GenerationOptions {
  category?: MessageCategory;
  tone?: MessageTone;
  length?: MessageLength;
  recipientName?: string;
  senderName?: string;
  /** Optional personal memory or detail woven into templates that support it. */
  memory?: string;
  /** Deterministic selection seed. Defaults to Date.now(). */
  seed?: number;
  /** Template id to avoid (e.g. previous result when regenerating). */
  excludeId?: string;
}

export interface SelectOption<T extends string = string> {
  id: T;
  display: string;
}

const PLACEHOLDER_RE = /\{\{(\w+)\}\}/g;

/**
 * Replace {{placeholders}} safely:
 * - missing/empty values collapse without broken punctuation
 * - double spaces from removal are collapsed
 * - a leading orphan comma (name removed at sentence start) is dropped
 * - the result is re-capitalized so sentences stay complete
 * Unicode names pass through untouched.
 */
export function safeReplace(text: string, variables: Record<string, string>): string {
  const replaced = text.replace(PLACEHOLDER_RE, (_match, key: string) => {
    const value = variables[key];
    if (value === undefined || value === null) return '';
    return String(value).trim();
  });
  const collapsed = replaced
    .replace(/ {2,}/g, ' ')
    .replace(/ +([,.;:!?])/g, '$1')
    .replace(/^ *, */, '')
    .trim();
  return collapsed.replace(/^([a-z\u00C0-\u024F\u0400-\u04FF])/, (c) => c.toUpperCase());
}

/** Drop whole sentences that still contain an unfilled {{memory}} placeholder. */
function stripUnfilledMemorySentences(text: string): string {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !sentence.includes('{{memory}}'))
    .join(' ')
    .trim();
}

function hashSeed(seed: number): number {
  let h = Math.abs(seed) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
  return (h ^ (h >>> 16)) >>> 0;
}

export function generateMessage(options: GenerationOptions): GeneratedMessage {
  const {
    category,
    tone,
    length,
    recipientName = '',
    senderName = '',
    memory = '',
    seed = Date.now(),
    excludeId,
  } = options;

  let candidates = MESSAGE_TEMPLATES.filter(
    (t) =>
      (!category || t.category === category) &&
      (!tone || t.tone === tone) &&
      (!length || t.length === length)
  );

  // Memory handling: prefer templates that can weave a memory in when one is
  // provided; otherwise prefer templates that don't depend on one, so no name
  // or sentence ever gets stranded inside a dropped memory clause.
  const mem = memory.trim();
  if (mem) {
    const withMemory = candidates.filter((t) => t.variables.includes('memory'));
    if (withMemory.length > 0) candidates = withMemory;
  } else {
    const withoutMemory = candidates.filter((t) => !t.variables.includes('memory'));
    if (withoutMemory.length > 0) candidates = withoutMemory;
  }

  // Fallback to the full pool when filters match nothing.
  if (candidates.length === 0) {
    candidates = MESSAGE_TEMPLATES;
  }

  if (excludeId && candidates.length > 1) {
    const withoutExcluded = candidates.filter((t) => t.id !== excludeId);
    if (withoutExcluded.length > 0) candidates = withoutExcluded;
  }

  const index = hashSeed(seed) % candidates.length;
  const template: MessageTemplate = candidates[index] ?? MESSAGE_TEMPLATES[0]!;

  let text: string;
  if (template.variables.includes('memory') && mem) {
    text = safeReplace(template.text, { memory: mem, recipientName, senderName });
  } else if (template.variables.includes('memory') && !mem) {
    // No memory given: drop sentences that require it, then fill the rest.
    text = safeReplace(stripUnfilledMemorySentences(template.text), {
      recipientName,
      senderName,
    });
  } else {
    text = safeReplace(template.text, { recipientName, senderName });
  }

  const variables: Record<MessageVariable, string> = {
    recipientName: recipientName.trim(),
    senderName: senderName.trim(),
    memory: mem,
  };

  return {
    templateId: template.id,
    text,
    variables,
    category: template.category,
    tone: template.tone,
    length: template.length,
  };
}

export function getTemplateById(id: string): MessageTemplate | undefined {
  return MESSAGE_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: MessageCategory): MessageTemplate[] {
  return MESSAGE_TEMPLATES.filter((t) => t.category === category);
}

export const CATEGORY_OPTIONS: SelectOption<MessageCategory>[] = [
  { id: 'best-friend', display: 'Best friend' },
  { id: 'romantic-partner', display: 'Romantic partner' },
  { id: 'spouse', display: 'Husband or wife' },
  { id: 'sibling', display: 'Brother or sister' },
  { id: 'parent', display: 'Mother or father' },
  { id: 'child', display: 'Son or daughter' },
  { id: 'colleague', display: 'Colleague' },
  { id: 'funny', display: 'Funny and playful' },
  { id: 'short', display: 'Short and sweet' },
  { id: 'heartfelt', display: 'Heartfelt and emotional' },
  { id: 'long-distance', display: 'Long-distance birthday' },
  { id: 'inspirational', display: 'Inspirational' },
];

export const TONE_OPTIONS: SelectOption<MessageTone>[] = [
  { id: 'warm', display: 'Warm' },
  { id: 'humorous', display: 'Humorous' },
  { id: 'formal', display: 'Formal' },
  { id: 'casual', display: 'Casual' },
  { id: 'sentimental', display: 'Sentimental' },
];

export const LENGTH_OPTIONS: SelectOption<MessageLength>[] = [
  { id: 'short', display: 'Short' },
  { id: 'medium', display: 'Medium' },
  { id: 'long', display: 'Long' },
];