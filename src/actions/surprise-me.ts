'use server';

import { getRandomMedia } from '@/lib/tmdb';
import { slugify } from '@/lib/utils';
import { redirect } from 'next/navigation';

export async function surpriseMeAction() {
  const type = Math.random() > 0.5 ? 'movie' : 'tv';
  const media = await getRandomMedia(type);

  if (media) {
    const title = 'title' in media ? media.title : media.name;
    const slug = slugify(title);
    redirect(`/${type}/${slug}-${media.id}`);
  } else {
    // Fallback redirect if no media is found
    redirect('/');
  }
}
