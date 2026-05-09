/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtube.com, youtu.be, youtube-nocookie.com, and bare IDs
 */
export function extractYouTubeID(urlOrId: string): string | null {
  if (!urlOrId) return null;

  // If it's already just an ID (11 characters, alphanumeric + - _)
  const bareIdMatch = urlOrId.match(/^[a-zA-Z0-9_-]{11}$/);
  if (bareIdMatch) return bareIdMatch[0];

  try {
    const url = new URL(urlOrId);

    // Handle youtu.be short links
    if (url.hostname === 'youtu.be') {
      const pathSegments = url.pathname.split('/').filter(Boolean);
      return pathSegments[0] || null;
    }

    // Handle youtube.com and youtube-nocookie.com
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtube-nocookie.com')) {
      // Check for /v/ or /embed/ or /shorts/
      const pathMatch = url.pathname.match(/\/(?:v|embed|shorts)\/([a-zA-Z0-9_-]{11})/);
      if (pathMatch) return pathMatch[1];

      // Check for ?v= query parameter
      const videoId = url.searchParams.get('v');
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return videoId;
      }
    }
  } catch {
    // Not a valid URL, might be a malformed string
  }

  // Last resort: try to find an 11-char ID anywhere in the string
  const fallbackMatch = urlOrId.match(/([a-zA-Z0-9_-]{11})/);
  return fallbackMatch ? fallbackMatch[1] : null;
}

/**
 * Validate that a string is a valid YouTube video ID
 */
export function isValidYouTubeID(id: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
}
