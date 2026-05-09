import DOMPurify from "dompurify";
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Sanitizes HTML input to prevent XSS attacks.
 *
 * By default, strips all HTML tags, returning only plain text.
 * For basic formatting support (bold, italic, line breaks), use the
 * `allowBasicFormatting` option.
 *
 * @param dirty - The raw user-generated string that may contain HTML/XSS
 * @param options - Optional configuration for allowed tags
 * @returns Sanitized safe string
 */
export function sanitizeHtml(dirty: string, options?: { allowBasicFormatting?: boolean }): string {
  const config: DOMPurify.Config = {
    ALLOWED_TAGS: options?.allowBasicFormatting ? ["b", "i", "strong", "em", "br"] : [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Strip tags but keep text content
  };

   return DOMPurify.sanitize(dirty, config as any).toString();
}

/**
 * Convenience wrapper for sanitizing with basic formatting enabled.
 * Use for fields where you want to allow bold/italic/line-breaks.
 */
export function sanitizeHtmlWithFormatting(dirty: string): string {
  return sanitizeHtml(dirty, { allowBasicFormatting: true });
}
