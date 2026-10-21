import type { MessageTemplate } from '@/types';

/**
 * Original, human-written birthday message templates.
 * Each template has a distinct idea, emotional arc, and sentence structure.
 * Placeholders: {{recipientName}}, {{senderName}}, {{memory}} (optional detail).
 * These are NOT AI-generated — they are prewritten and personalized locally.
 */

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  /* Best friend ----------------------------------------------------- */
  {
    id: 'bf-shared-history',
    category: 'best-friend',
    text: "Some friendships are built on a thousand tiny moments — the 2 a.m. phone calls, the terrible karaoke decisions, the way you always save me the last slice. {{recipientName}}, you have been my co-conspirator through all of it. Here's to whatever we get up to next. Happy birthday.",
    variables: ['recipientName'],
    tone: 'warm',
    length: 'medium',
  },
  {
    id: 'bf-unsentimental',
    category: 'best-friend',
    text: "I'd write you a sappy poem, but you'd only frame it and hang it where I'd have to look at it forever. So instead: happy birthday, {{recipientName}}. You're the best bad influence I've ever had.",
    variables: ['recipientName'],
    tone: 'humorous',
    length: 'short',
  },
  {
    id: 'bf-thanks-notice',
    category: 'best-friend',
    text: "{{recipientName}}, I don't say this enough: thank you for every time you showed up when it mattered — and every time you showed up when it didn't. The world is louder and brighter with you in it. Happy birthday. {{senderName}}",
    variables: ['recipientName', 'senderName'],
    tone: 'sentimental',
    length: 'medium',
  },

  /* Romantic partner ------------------------------------------------ */
  {
    id: 'rp-ordinary-magic',
    category: 'romantic-partner',
    text: "It's the ordinary Tuesdays I love most — coffee cooling while we talk, your hand finding mine without looking. Loving you doesn't feel like an event; it feels like breathing. Happy birthday, {{recipientName}}. {{senderName}}",
    variables: ['recipientName', 'senderName'],
    tone: 'sentimental',
    length: 'medium',
  },
  {
    id: 'rp-adventure-promise',
    category: 'romantic-partner',
    text: "{{recipientName}}, another year of you is another year of bad maps, good diners, and laughing until something hurts. Whatever this next trip around the sun brings, I'm calling shotgun. Happy birthday, love.",
    variables: ['recipientName'],
    tone: 'casual',
    length: 'short',
  },
  {
    id: 'rp-first-crush',
    category: 'romantic-partner',
    text: "I still remember the exact moment my stomach did that stupid flip the first time you smiled at me. It does the same thing now — {{recipientName}}, you haven't aged a day to my heart. Happy birthday to my favorite person. Yours always, {{senderName}}",
    variables: ['recipientName', 'senderName'],
    tone: 'warm',
    length: 'medium',
  },

  /* Husband or wife ------------------------------------------------- */
  {
    id: 'sw-vows-continued',
    category: 'spouse',
    text: "{{recipientName}}, the vows said 'in sickness and in health,' but nobody warns you about the in-between — the burnt dinners, the bad weather, the years that fly. I'd choose you in every single one. Happy birthday, my love.",
    variables: ['recipientName'],
    tone: 'sentimental',
    length: 'long',
  },
  {
    id: 'sw-partnership',
    category: 'spouse',
    text: "To my favorite co-parent, co-pilot, and co-conspirator: we make a ridiculous team, and I wouldn't trade it for anything. Happy birthday, {{recipientName}}. Dinner's on me tonight — and every night this week, if you're lucky.",
    variables: ['recipientName'],
    tone: 'humorous',
    length: 'short',
  },
  {
    id: 'sw-still-choice',
    category: 'spouse',
    text: "People say marriage is a promise. I think it's more like a daily decision — and {{recipientName}}, you are still the easiest decision I've ever made. Thank you for another year of building this life with me. Happy birthday.",
    variables: ['recipientName'],
    tone: 'warm',
    length: 'medium',
  },

  /* Brother or sister ------------------------------------------------ */
  {
    id: 'sib-shared-blame',
    category: 'sibling',
    text: "Growing up with you meant someone to blame for everything — and someone to laugh with about it later. {{recipientName}}, turns out my built-in best friend was the greatest gift our parents ever gave me. Happy birthday.",
    variables: ['recipientName'],
    tone: 'humorous',
    length: 'medium',
  },
  {
    id: 'sib-first-friend',
    category: 'sibling',
    text: "Before I had friends, I had you. Before I knew what loyalty meant, you were showing me. {{recipientName}}, no distance or time will ever undo that. Happy birthday to my first and forever friend.",
    variables: ['recipientName'],
    tone: 'sentimental',
    length: 'short',
  },

  /* Mother or father -------------------------------------------------- */
  {
    id: 'par-invisible-work',
    category: 'parent',
    text: "{{recipientName}}, I'm old enough now to see all the invisible work — the early mornings, the worried nights, the sacrifices you never called sacrifices. You built a whole childhood out of love and stubbornness, and I'm still living inside its warmth. Happy birthday.",
    variables: ['recipientName'],
    tone: 'sentimental',
    length: 'long',
  },
  {
    id: 'par-lessons-unspoken',
    category: 'parent',
    text: "You never gave me many lectures. You just let me watch you — how you kept your word, how you fixed what was broken, how you made hard days lighter for everyone else. I've been copying you my whole life, {{recipientName}}. Happy birthday.",
    variables: ['recipientName'],
    tone: 'warm',
    length: 'medium',
  },

  /* Son or daughter --------------------------------------------------- */
  {
    id: 'kid-wonder-teacher',
    category: 'child',
    text: "{{recipientName}}, you ask the questions that stop me mid-step — why the sky bothers, where lost socks go, whether clouds have feelings. Thank you for making the world strange and wonderful again. Happy birthday, my favorite explorer.",
    variables: ['recipientName'],
    tone: 'warm',
    length: 'medium',
  },
  {
    id: 'kid-proud-parent',
    category: 'child',
    text: "Every year you become more yourself — funnier, kinder, braver in your own particular way. {{recipientName}}, watching you grow up is the proudest thing I'll ever do. Happy birthday. So glad you're mine.",
    variables: ['recipientName'],
    tone: 'sentimental',
    length: 'short',
  },

  /* Colleague --------------------------------------------------------- */
  {
    id: 'col-work-brighter',
    category: 'colleague',
    text: "{{recipientName}}, you're the reason deadlines feel less terrifying and meetings feel slightly less pointless. Thanks for bringing actual joy to the workday. Hope your birthday is a proper break from all of it.",
    variables: ['recipientName'],
    tone: 'casual',
    length: 'short',
  },
  {
    id: 'col-respect',
    category: 'colleague',
    text: "It's rare to work with someone who is both genuinely excellent at what they do and genuinely decent to the people around them. {{recipientName}}, you're both. Wishing you a birthday that matches your standards — which is to say, an exceptional one.",
    variables: ['recipientName'],
    tone: 'formal',
    length: 'medium',
  },

  /* Funny and playful ------------------------------------------------ */
  {
    id: 'fun-age-denial',
    category: 'funny',
    text: "Happy birthday, {{recipientName}}! Another year older and no wiser — which is honestly the best possible strategy. Your knees may file a formal complaint, but your spirit is still illegally young.",
    variables: ['recipientName'],
    tone: 'humorous',
    length: 'short',
  },
  {
    id: 'fun-gift-pressure',
    category: 'funny',
    text: "{{recipientName}}, every year I promise myself I'll plan your gift months in advance. Every year I don't. And every year you pretend to like whatever I panic-buy at the last minute. That, right there, is true love. Happy birthday!",
    variables: ['recipientName'],
    tone: 'humorous',
    length: 'medium',
  },

  /* Short and sweet --------------------------------------------------- */
  {
    id: 'short-simple-wish',
    category: 'short',
    text: "Happy birthday, {{recipientName}}. May today be soft on you — good food, good people, zero alarms.",
    variables: ['recipientName'],
    tone: 'casual',
    length: 'short',
  },
  {
    id: 'short-one-liner',
    category: 'short',
    text: "{{recipientName}}, the world got a little better the day you showed up. Happy birthday.",
    variables: ['recipientName'],
    tone: 'warm',
    length: 'short',
  },

  /* Heartfelt and emotional ------------------------------------------- */
  {
    id: 'heart-gratitude',
    category: 'heartfelt',
    text: "{{recipientName}}, I've started this message four times because 'happy birthday' feels too small for what you mean to me. You've seen me at my worst and stayed. You've cheered loudest at my best and meant it. I hope this year gives you even half the joy you've given everyone around you.",
    variables: ['recipientName'],
    tone: 'sentimental',
    length: 'long',
  },
  {
    id: 'heart-hard-year',
    category: 'heartfelt',
    text: "{{recipientName}}, this past year wasn't kind to you, and I watched you carry it with more grace than you think you had. You're still here, still trying, still making other people's days lighter. That's not small. That's everything. Happy birthday — I'm so glad you were born.",
    variables: ['recipientName'],
    tone: 'sentimental',
    length: 'medium',
  },

  /* Long-distance birthday --------------------------------------------- */
  {
    id: 'ld-miles-apart',
    category: 'long-distance',
    text: "{{recipientName}}, being apart on your birthday stinks, but here's the thing about you — you make even distance feel temporary. I'm raising a slightly-too-early glass from here to you. Save me a slice of cake; I'm collecting next year.",
    variables: ['recipientName'],
    tone: 'casual',
    length: 'medium',
  },
  {
    id: 'ld-timezone',
    category: 'long-distance',
    text: "Somewhere between your timezone and mine, midnight is going to hit, and I'll be thinking of you. {{recipientName}}, miles are just geography — you're carved into my everyday regardless. Happy birthday across the map.",
    variables: ['recipientName'],
    tone: 'sentimental',
    length: 'short',
  },

  /* Inspirational ------------------------------------------------------ */
  {
    id: 'ins-new-chapter',
    category: 'inspirational',
    text: "{{recipientName}}, birthdays aren't just candles and cake — they're proof you've survived every hard day so far, which is a perfect record. This next chapter is yours to write. Make it wildly, unreasonably good.",
    variables: ['recipientName'],
    tone: 'warm',
    length: 'medium',
  },
  {
    id: 'ins-bet-on-you',
    category: 'inspirational',
    text: "I've watched you rebuild, restart, and keep going when quitting would have been reasonable. {{recipientName}}, I'm betting everything on who you're becoming. Happy birthday — the best is genuinely ahead of you.",
    variables: ['recipientName'],
    tone: 'formal',
    length: 'medium',
  },

  /* Optional-memory templates ({{memory}} woven in) -------------------- */
  {
    id: 'mem-adventure',
    category: 'best-friend',
    text: "I keep replaying {{memory}} — still one of my favorite days, and still completely your fault. {{recipientName}}, thanks for a year of moments worth hoarding. Happy birthday.",
    variables: ['recipientName', 'memory'],
    tone: 'humorous',
    length: 'short',
  },
  {
    id: 'mem-together-year',
    category: 'romantic-partner',
    text: "{{recipientName}}, when I think about this past year, I keep coming back to {{memory}}. That's the thing about you — you turn ordinary memories into the ones I'll keep forever. Happy birthday, my love.",
    variables: ['recipientName', 'memory'],
    tone: 'sentimental',
    length: 'medium',
  },
];