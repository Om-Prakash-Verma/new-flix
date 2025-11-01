
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import data from './placeholder-images.json';
import { Thing, WithContext } from 'schema-dts';

//================================================================//
// UTILS from src/lib/utils.ts
//================================================================//

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export function extractIdFromSlug(slug: string = '') {
    const parts = slug.split('-');
    const id = parts[parts.length - 1];
    // A simple check to see if the extracted part is a number.
    if (!/^\d+$/.test(id)) {
        console.warn(`Could not extract a numeric ID from the end of the slug: "${slug}". Found "${id}" instead.`);
        return '';
    }
    return id;
}

export function formatCurrency(amount: number) {
    if (!amount || amount === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
}
  
export function formatRuntime(minutes: number | null) {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

export function jsonLd<T extends Thing>(data: WithContext<T>) {
  return {
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      ...data,
    }),
  };
}

//================================================================//
// PLACEHOLDER IMAGES from src/lib/placeholder-images.ts
//================================================================//

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;


//================================================================//
// TMDB IMAGES from src/lib/tmdb-images.ts
//================================================================//

const posterPlaceholder = PlaceHolderImages.find(p => p.id === 'poster')!.imageUrl;
const backdropPlaceholder = PlaceHolderImages.find(p => p.id === 'backdrop')!.imageUrl;
const profilePlaceholder = PlaceHolderImages.find(p => p.id === 'profile')!.imageUrl;

export type ImageSize = 'w185' | 'w342' | 'w500' | 'w780' | 'original';

export const getPosterImage = (path: string | null, size: ImageSize = 'w500') => {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : posterPlaceholder;
};

export const getBackdropImage = (path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') => {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : backdropPlaceholder;
};

export const getProfileImage = (path: string | null, size: 'w185' | 'h632' | 'original' = 'w185') => {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : profilePlaceholder;
};
