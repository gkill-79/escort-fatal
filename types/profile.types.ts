export interface Profile {
  id: string;
  userId: string;
  slug: string;
  name: string;
  age?: number | null;
  gender?: string;
  bio?: string | null;
  city?: { name: string } | null;
  department?: { name: string } | null;
  isOnline?: boolean;
  isVerified?: boolean;
  isTopGirl?: boolean;
  isExclusive?: boolean;
  viewCount?: number;
  followerCount?: number;
  ratingAvg?: number;
  ratingCount?: number;
  priceFrom?: number | null;
  priceTo?: number | null;
  lastOnlineAt?: Date | string | null;
  height?: number | null;
  nationality?: string | null;
  hairColor?: string | null;
  languages?: string[];
  photos?: unknown[];
  services?: unknown[];
  [key: string]: unknown;
}
