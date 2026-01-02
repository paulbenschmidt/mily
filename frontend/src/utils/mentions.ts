/**
 * Regex for matching mention tokens in the format {{mention:USER_ID|name:DISPLAY_NAME}}
 */
export const MENTION_TOKEN_REGEX = /\{\{mention:([^|]+)\|name:([^}]+)\}\}/g;

/**
 * Shared styling for mention chips to ensure consistency between input and display
 */
export const MENTION_CHIP_STYLES = 'inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 bg-primary-100 text-primary-700 rounded-md text-sm font-medium';

/**
 * Creates a mention token string from user ID and display name
 */
export function createMentionToken(userId: string, displayName: string): string {
  return `{{mention:${userId}|name:${displayName}}}`;
}

export type MentionPart =
  | { type: 'text'; content: string }
  | { type: 'mention'; userId: string; displayName: string };

/**
 * Parses a text containing mention tokens into an array of parts
 */
export function parseMentions(text: string): MentionPart[] {
  // split() with capturing groups includes the captures in the output array
  // Format: [text, userId, displayName, text, userId, displayName, ...]
  const parts = text.split(MENTION_TOKEN_REGEX);
  const result: MentionPart[] = [];

  for (let i = 0; i < parts.length; i++) {
    // Indices 0, 3, 6... are always text parts (preceding/following text)
    if (i % 3 === 0) {
      // If text starts with a mention, split() produces an empty string at index 0.
      // We filter that out here so we don't render empty text nodes.
      if (parts[i]) {
        result.push({ type: 'text', content: parts[i] });
      }
    }
    // Indices 1, 4, 7... are the first capture group (userId)
    // Indices 2, 5, 8... are the second capture group (displayName)
    // We handle both captures when we hit the userId index
    else if (i % 3 === 1) {
      result.push({
        type: 'mention',
        userId: parts[i],
        displayName: parts[i + 1]
      });
      // Skip the next index since we just used it (displayName)
      i++;
    }
  }

  return result;
}
