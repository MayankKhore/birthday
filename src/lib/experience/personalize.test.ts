import { describe, it, expect } from 'vitest';
import {
  displayName,
  agePhrase,
  buildLetterText,
  buildStoryChapters,
  buildQuizQuestions,
  buildCreateScenes,
  DEFAULT_SCENE_CHOICES,
} from './personalize';
import { computeTargetSize } from '@/lib/media/imageProcessing';

describe('displayName', () => {
  it('trims and falls back to Someone Special', () => {
    expect(displayName({ recipientName: '  Maya  ' })).toBe('Maya');
    expect(displayName({ recipientName: '   ' })).toBe('Someone Special');
  });
});

describe('agePhrase', () => {
  it('phrases valid ages and falls back otherwise', () => {
    expect(agePhrase(30)).toBe('turning 30');
    expect(agePhrase(undefined)).toBe('another wonderful year');
    expect(agePhrase(0)).toBe('another wonderful year');
  });
});

describe('buildLetterText', () => {
  it('weaves name, relationship, message, detail and sender', () => {
    const text = buildLetterText(
      { recipientName: 'Maya', recipientAge: 30, relationship: 'sister', detail: 'the road trip', senderName: 'Alex' },
      'Have the best day!',
    );
    expect(text).toContain('Dear Maya');
    expect(text).toContain('turning 30');
    expect(text).toContain('sister');
    expect(text).toContain('Have the best day!');
    expect(text).toContain('the road trip');
    expect(text).toContain('Alex');
  });
});

describe('buildStoryChapters', () => {
  it('creates three personalized chapters', () => {
    const chapters = buildStoryChapters({ recipientName: 'Theo', recipientAge: 7 });
    expect(chapters).toHaveLength(3);
    expect(chapters[0]?.text).toContain('Theo');
    expect(chapters[2]?.text).toContain('turning 7');
  });
});

describe('buildQuizQuestions', () => {
  it('builds a consistent, answerable quiz', () => {
    const qs = buildQuizQuestions({ recipientName: 'Noor', recipientAge: 25 });
    expect(qs.length).toBeGreaterThanOrEqual(2);
    for (const q of qs) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswerIndex).toBeLessThan(q.options.length);
    }
    expect(qs[0]?.question).toContain('Noor');
    const first = qs[0];
    expect(first?.options).toContain('25');
    expect(first?.options[first?.correctAnswerIndex ?? -1]).toBe('25');
  });
});

describe('buildCreateScenes', () => {
  it('orders envelope → … → celebration with one scene per game', () => {
    const scenes = buildCreateScenes(DEFAULT_SCENE_CHOICES, 3);
    const types = scenes.map((s) => s.type);
    expect(types[0]).toBe('envelope');
    expect(types[types.length - 1]).toBe('celebration');
    expect(types.filter((t) => t === 'mini-game')).toHaveLength(3);
    expect(scenes.filter((s) => s.type === 'photo-gallery')).toHaveLength(1);
    const orders = scenes.map((s) => s.sortOrder);
    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
  });

  it('skips the gallery when there are no photos', () => {
    const scenes = buildCreateScenes(DEFAULT_SCENE_CHOICES, 0);
    expect(scenes.some((s) => s.type === 'photo-gallery')).toBe(false);
    expect(scenes.some((s) => s.type === 'celebration')).toBe(true);
  });

  it('omits disabled scenes', () => {
    const scenes = buildCreateScenes({ ...DEFAULT_SCENE_CHOICES, includeCake: false, games: [] }, 2);
    expect(scenes.some((s) => s.type === 'cake')).toBe(false);
    expect(scenes.some((s) => s.type === 'mini-game')).toBe(false);
  });
});

describe('computeTargetSize', () => {
  it('keeps small images and downscales large ones', () => {
    expect(computeTargetSize(800, 600)).toEqual({ width: 800, height: 600 });
    expect(computeTargetSize(4000, 3000)).toEqual({ width: 1280, height: 960 });
    expect(computeTargetSize(3000, 4000)).toEqual({ width: 960, height: 1280 });
    expect(computeTargetSize(0, 0)).toEqual({ width: 0, height: 0 });
  });
});
