const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Normalises free text before it is sent to the API:
 * trims, strips control characters, normalises newlines, collapses 3+ blank lines.
 * React Native <Text> never interprets markup, so no HTML escaping is needed on render.
 */
export function cleanText(input: string): string {
  return input
    .replace(/\r\n?/g, '\n')
    .replace(CONTROL_CHARS, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Single-line field: also collapses internal whitespace. */
export function cleanLine(input: string): string {
  return cleanText(input).replace(/\s+/g, ' ');
}
