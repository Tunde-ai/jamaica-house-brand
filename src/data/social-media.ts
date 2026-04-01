export interface SocialPost {
  id: string
  platform: 'instagram' | 'tiktok' | 'youtube'
  embedUrl: string
  caption: string
  thumbnail?: string
}

// Social media profile URLs
export const socialProfiles = {
  instagram: 'https://instagram.com/jamaicahousebrand',
  tiktok: 'https://www.tiktok.com/@jamaicahousebrand',
  youtube: 'https://www.youtube.com/@JAMAICAHOUSEBRAND',
  facebook: 'https://www.facebook.com/p/Jamaica-House-Brand-61576084168596/',
}

// Featured social media posts to embed.
// To add a post: copy the embed URL from the platform's "Share > Embed" option.
//
// Instagram: https://www.instagram.com/p/{POST_ID}/embed
// TikTok: https://www.tiktok.com/embed/v2/{VIDEO_ID}
// YouTube: https://www.youtube.com/embed/{VIDEO_ID}
export const featuredPosts: SocialPost[] = [
  // ── YouTube Shorts (real videos from @JAMAICAHOUSEBRAND) ─────
  {
    id: 'yt-1',
    platform: 'youtube',
    embedUrl: 'https://www.youtube.com/embed/X8bDPDYhYZ0',
    caption: 'Ready For Some Real Jerk Chicken?',
  },
  {
    id: 'yt-2',
    platform: 'youtube',
    embedUrl: 'https://www.youtube.com/embed/7vg4mVqnfJI',
    caption: 'Libby Loves Our Sauce',
  },
  {
    id: 'yt-3',
    platform: 'youtube',
    embedUrl: 'https://www.youtube.com/embed/uvr3f1kTa6A',
    caption: 'Alicia Echevarria Cooking With Jerk Sauce',
  },
  {
    id: 'yt-4',
    platform: 'youtube',
    embedUrl: 'https://www.youtube.com/embed/R49cqTiZEZk',
    caption: 'Gulsah Basaran With Jerk Sauce',
  },
  {
    id: 'yt-5',
    platform: 'youtube',
    embedUrl: 'https://www.youtube.com/embed/XajFAKvE-Jc',
    caption: 'Sausages & Jerk Sauce',
  },
  {
    id: 'yt-6',
    platform: 'youtube',
    embedUrl: 'https://www.youtube.com/embed/ynxkIVcDoCM',
    caption: 'Adding Sauce To Ramen!?',
  },
  // ── Instagram Posts ──────────────────────────────────────────
  {
    id: 'ig-1',
    platform: 'instagram',
    embedUrl: 'https://www.instagram.com/p/PLACEHOLDER_1/embed',
    caption: 'Our Original Jerk Sauce — 30 years of flavor in every bottle',
  },
  {
    id: 'ig-2',
    platform: 'instagram',
    embedUrl: 'https://www.instagram.com/p/PLACEHOLDER_2/embed',
    caption: 'Behind the scenes at Jamaica House Restaurant',
  },
  // ── TikTok Videos ────────────────────────────────────────────
  {
    id: 'tt-1',
    platform: 'tiktok',
    embedUrl: 'https://www.tiktok.com/embed/v2/PLACEHOLDER_1',
    caption: 'How we make our jerk sauce',
  },
  {
    id: 'tt-2',
    platform: 'tiktok',
    embedUrl: 'https://www.tiktok.com/embed/v2/PLACEHOLDER_2',
    caption: 'Taste test reaction',
  },
]
