/**
 * Message/Wish Types
 *
 * Stage 5: template-based birthday message creation.
 * Templates are human-written — never labeled as AI-generated.
 */

export type MessageCategory =
  | 'best-friend'
  | 'romantic-partner'
  | 'spouse'
  | 'sibling'
  | 'parent'
  | 'child'
  | 'colleague'
  | 'funny'
  | 'short'
  | 'heartfelt'
  | 'long-distance'
  | 'inspirational';

export type MessageTone = 'warm' | 'humorous' | 'formal' | 'casual' | 'sentimental';
export type MessageLength = 'short' | 'medium' | 'long';

/** Placeholders usable inside template text: {{recipientName}}, {{senderName}}, {{memory}} */
export type MessageVariable = 'recipientName' | 'senderName' | 'memory';

export interface MessageTemplate {
  id: string;
  category: MessageCategory;
  text: string;
  variables: MessageVariable[];
  tone: MessageTone;
  length: MessageLength;
}

export interface GeneratedMessage {
  templateId: string;
  text: string;
  variables: Record<MessageVariable, string>;
  category: MessageCategory;
  tone: MessageTone;
  length: MessageLength;
}