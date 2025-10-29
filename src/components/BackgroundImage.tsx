
'use client';

import { cn } from '@/lib/utils';

type BackgroundImageProps = {
  posterUrl: string;
  backdropUrl: string;
};

// This component now uses CSS to handle responsiveness, which is more efficient and avoids re-render loops.
export function BackgroundImage({ posterUrl, backdropUrl }: BackgroundImageProps) {

  const backgroundStyles: React.CSSProperties = {
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
    filter: 'blur(4px)',
  };

  return (
    <>
      {/* Mobile Background (Poster) */}
      <div
        className='fixed inset-0 z-[-1] bg-background md:hidden'
        style={{
          backgroundImage: `url(${posterUrl})`,
          ...backgroundStyles,
        }}
      />
      {/* Desktop Background (Backdrop) */}
      <div
        className='fixed inset-0 z-[-1] bg-background hidden md:block'
        style={{
          backgroundImage: `url(${backdropUrl})`,
          ...backgroundStyles,
        }}
      />
    </>
  );
}
