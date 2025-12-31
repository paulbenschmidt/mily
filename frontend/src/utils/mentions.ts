/**
 * Regex for matching mention tokens in the format {{mention:USER_ID|name:DISPLAY_NAME}}
 */
export const MENTION_TOKEN_REGEX = /\{\{mention:([^|]+)\|name:([^}]+)\}\}/g;

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
    // Even indices are text parts
    if (i % 3 === 0) {
      if (parts[i]) {
        result.push({ type: 'text', content: parts[i] });
      }
    } 
    // Odd indices are captures (userId at i, displayName at i+1)
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
