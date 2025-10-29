
import { PlaceHolderImages } from './placeholder-images';

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
