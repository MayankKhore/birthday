import { describe, it, expect } from 'vitest';
import {
  generateMessage,
  safeReplace,
  getTemplateById,
  getTemplatesByCategory,
  MESSAGE_TEMPLATES,
  CATEGORY_OPTIONS,
  TONE_OPTIONS,
  LENGTH_OPTIONS,
} from './generator';
import type { MessageCategory } from '@/types';

describe('safeReplace — placeholder replacement', () => {
  it('replaces {{recipientName}} and {{senderName}}', () => {
    const out = safeReplace('Happy birthday, {{recipientName}}! From {{senderName}}.', {
      recipientName: 'Maya',
      senderName: 'Alex',
    });
    expect(out).toBe('Happy birthday, Maya! From Alex.');
  });

  it('replaces {{memory}} when provided', () => {
    const out = safeReplace('I keep replaying {{memory}}, {{recipientName}}.', {
      memory: 'that road trip',
      recipientName: 'Sam',
    });
    expect(out).toBe('I keep replaying that road trip, Sam.');
  });

  it('never leaves broken braces behind', () => {
    const out = safeReplace('Hi {{recipientName}} {{unknownThing}} bye', {
      recipientName: 'Maya',
    });
    expect(out).not.toContain('{{');
    expect(out).not.toContain('}}');
  });

  it('preserves punctuation and em dashes', () => {
    const out = safeReplace("{{recipientName}}, you're my co-conspirator — truly.", {
      recipientName: 'Jo',
    });
    expect(out).toBe("Jo, you're my co-conspirator — truly.");
  });
});

describe('safeReplace — missing names', () => {
  it('produces a complete sentence when recipientName is missing', () => {
    const out = safeReplace('{{recipientName}}, the world got a little better.', {});
    expect(out).toBe('The world got a little better.');
    expect(out.startsWith(',')).toBe(false);
  });

  it('drops the comma that followed a removed name', () => {
    const out = safeReplace('Hey {{recipientName}}, happy birthday!', {});
    expect(out).toBe('Hey, happy birthday!');
  });

  it('collapses doubled spaces from empty values', () => {
    const out = safeReplace('From {{senderName}}  with love', { senderName: '' });
    expect(out).toBe('From with love');
    expect(out).not.toContain('  ');
  });

  it('treats whitespace-only values as empty', () => {
    const out = safeReplace('{{recipientName}} rocks', { recipientName: '   ' });
    expect(out).toBe('Rocks');
  });
});

describe('safeReplace — special characters and Unicode', () => {
  it('supports accented names', () => {
    const out = safeReplace('Happy birthday, {{recipientName}}!', { recipientName: 'José Müller' });
    expect(out).toBe('Happy birthday, José Müller!');
  });

  it('supports CJK names', () => {
    const out = safeReplace('{{recipientName}},生日快乐!', { recipientName: '李雷' });
    expect(out).toBe('李雷,生日快乐!');
  });

  it('supports apostrophes and hyphens', () => {
    const out = safeReplace('Hi {{recipientName}}!', { recipientName: "O'Brien-Smith" });
    expect(out).toBe("Hi O'Brien-Smith!");
  });

  it('does not mangle emoji in values', () => {
    const out = safeReplace('Congrats {{recipientName}}!', { recipientName: 'Ana 🎉' });
    expect(out).toBe('Congrats Ana 🎉!');
  });
});

describe('generateMessage — template selection', () => {
  it('is deterministic: same seed returns the same template', () => {
    const a = generateMessage({ seed: 42, recipientName: 'Maya' });
    const b = generateMessage({ seed: 42, recipientName: 'Maya' });
    expect(a.templateId).toBe(b.templateId);
    expect(a.text).toBe(b.text);
  });

  it('varies across different seeds', () => {
    const ids = new Set(
      Array.from({ length: 20 }, (_, i) => generateMessage({ seed: i }).templateId)
    );
    expect(ids.size).toBeGreaterThan(1);
  });

  it('excludeId avoids the previous template when alternatives exist', () => {
    const first = generateMessage({ category: 'best-friend', seed: 7 });
    const second = generateMessage({ category: 'best-friend', seed: 7, excludeId: first.templateId });
    expect(second.templateId).not.toBe(first.templateId);
  });

  it('filters by category', () => {
    for (let i = 0; i < 10; i++) {
      const result = generateMessage({ category: 'spouse', seed: i });
      expect(result.category).toBe('spouse');
    }
  });

  it('filters by tone', () => {
    for (let i = 0; i < 10; i++) {
      const result = generateMessage({ tone: 'humorous', seed: i });
      expect(result.tone).toBe('humorous');
    }
  });

  it('filters by length', () => {
    for (let i = 0; i < 10; i++) {
      const result = generateMessage({ length: 'long', seed: i });
      expect(result.length).toBe('long');
    }
  });

  it('falls back to all templates when filters match nothing', () => {
    const result = generateMessage({
      category: 'funny',
      tone: 'formal',
      length: 'long',
      seed: 3,
    });
    expect(result.text.length).toBeGreaterThan(0);
  });

  it('returns grammatically complete text with names', () => {
    const result = generateMessage({
      recipientName: 'Maya',
      senderName: 'Alex',
      seed: 11,
    });
    expect(result.text).toContain('Maya');
    expect(result.text).not.toContain('{{');
    expect(result.text[0]).toBe(result.text[0]!.toUpperCase());
  });

  it('returns grammatically complete text without names', () => {
    const result = generateMessage({ seed: 5 });
    expect(result.text).not.toContain('{{');
    expect(result.text).not.toMatch(/^[,.]/);
    expect(result.text[0]).toBe(result.text[0]!.toUpperCase());
  });
});

describe('generateMessage — memory detail', () => {
  it('prefers memory-capable templates when memory is provided', () => {
    const result = generateMessage({
      category: 'best-friend',
      memory: 'that road trip',
      seed: 100,
    });
    expect(result.templateId).toBe('mem-adventure');
    expect(result.text).toContain('that road trip');
  });

  it('prefers non-memory templates when memory is empty', () => {
    for (let i = 0; i < 25; i++) {
      const result = generateMessage({ category: 'best-friend', seed: i });
      expect(result.templateId).not.toBe('mem-adventure');
      expect(result.text).not.toContain('{{');
      expect(result.text).not.toContain('  ');
    }
  });

  it('never emits an empty memory placeholder', () => {
    for (let i = 0; i < 25; i++) {
      const result = generateMessage({ seed: i * 3 + 1 });
      expect(result.text).not.toContain('{{memory}}');
      expect(result.text).not.toContain('  ');
    }
  });
});

describe('template coverage', () => {
  const ALL_CATEGORIES: MessageCategory[] = [
    'best-friend', 'romantic-partner', 'spouse', 'sibling', 'parent', 'child',
    'colleague', 'funny', 'short', 'heartfelt', 'long-distance', 'inspirational',
  ];

  it('has at least 15 templates', () => {
    expect(MESSAGE_TEMPLATES.length).toBeGreaterThanOrEqual(15);
  });

  it('has unique template ids', () => {
    const ids = MESSAGE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers all 12 requested categories', () => {
    for (const cat of ALL_CATEGORIES) {
      expect(getTemplatesByCategory(cat).length).toBeGreaterThan(0);
    }
  });

  it('declares only known placeholders in variables', () => {
    const allowed = new Set(['recipientName', 'senderName', 'memory']);
    for (const t of MESSAGE_TEMPLATES) {
      for (const v of t.variables) {
        expect(allowed.has(v)).toBe(true);
      }
    }
  });

  it('every template placeholder exists in its variables list', () => {
    for (const t of MESSAGE_TEMPLATES) {
      const found = t.text.match(/\{\{(\w+)\}\}/g) ?? [];
      for (const raw of found) {
        const key = raw.slice(2, -2);
        expect(t.variables).toContain(key);
      }
    }
  });

  it('getTemplateById returns the right template', () => {
    const t = getTemplateById('bf-shared-history');
    expect(t?.category).toBe('best-friend');
    expect(getTemplateById('nope-missing')).toBeUndefined();
  });
});

describe('select option lists', () => {
  it('exposes options for all 12 categories, 5 tones, 3 lengths', () => {
    expect(CATEGORY_OPTIONS.length).toBe(12);
    expect(TONE_OPTIONS.length).toBe(5);
    expect(LENGTH_OPTIONS.length).toBe(3);
  });

  it('has non-empty display labels', () => {
    for (const o of [...CATEGORY_OPTIONS, ...TONE_OPTIONS, ...LENGTH_OPTIONS]) {
      expect(o.display.length).toBeGreaterThan(0);
    }
  });
});
