/**
 * Validates if a URL is a direct GIF link
 * @param url The URL to validate
 * @returns Object with valid flag and optional error message
 */
export function validateGifUrl(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  // Check if it's a valid URL
  try {
    new URL(trimmedUrl);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Check if URL ends with .gif (case-insensitive)
  if (!trimmedUrl.toLowerCase().endsWith('.gif')) {
    return { valid: false, error: 'URL must end with .gif' };
  }

  return { valid: true };
}

/**
 * Extracts a GIF URL from text if present
 * @param text The text to search for GIF URLs
 * @returns The first valid GIF URL found, or null
 */
export function extractGifUrl(text: string): string | null {
  if (!text) return null;

  // Match URLs in the text
  const urlRegex = /(https?:\/\/[^\s]+\.gif)/gi;
  const matches = text.match(urlRegex);

  if (!matches || matches.length === 0) return null;

  // Return the first match
  return matches[0];
}
