// Description length limits per tier
export const TIER_DESCRIPTION_LIMITS = {
  essentials: 100,
  enhanced: 500,
  premium: -1, // Unlimited
  elite: -1 // Unlimited
};

export function truncateDescription(description: string, tier: string): string {
  const limit = TIER_DESCRIPTION_LIMITS[tier as keyof typeof TIER_DESCRIPTION_LIMITS] || 100;
  
  if (limit === -1 || description.length <= limit) {
    return description;
  }

  // Find the last space before the limit to avoid cutting words
  const lastSpace = description.substring(0, limit).lastIndexOf(' ');
  const truncateAt = lastSpace > 0 ? lastSpace : limit;
  
  return `${description.substring(0, truncateAt)}...`;
}