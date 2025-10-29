
'use client';

import { useState } from 'react';
import type { Video } from '@/lib/tmdb-schemas';
import Image from 'next/image';
import { PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';

type TrailersCarouselProps = {
  videos: Video[];
};

export function TrailersCarousel({ videos }: TrailersCarouselProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const officialTrailers = videos.filter(v => v.site === 'YouTube' && v.official && v.type === 'Trailer');
  const otherVideos = videos.filter(v => v.site === 'YouTube' && !officialTrailers.includes(v));

  // Prioritize official trailers, then fall back to other videos
  const displayVideos = [...officialTrailers, ...otherVideos].slice(0, 10);

  if (displayVideos.length === 0) {
    return null;
  }

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };
  
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Trailers & Videos</h2>
      <Carousel
        opts={{
          align: 'start',
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4 px-4 sm:px-8 items-start">
          {displayVideos.map(video => (
            <CarouselItem key={video.id} className="pl-4 basis-full sm:basis-1/2 md:basis-auto md:w-[320px]">
              <div
                className="group relative cursor-pointer rounded-poster overflow-hidden shadow-lg"
                onClick={() => handleVideoClick(video)}
              >
                <Image
                  src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                  alt={`Thumbnail for video: ${video.name}`}
                  title={`Thumbnail for video: ${video.name}`}
                  width={320}
                  height={180}
                  loading="lazy"
                  className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-poster"
                  sizes="(max-width: 640px) 100vw, 320px"
                  data-ai-hint="video trailer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-white/80 drop-shadow-lg opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                </div>
                <div className="absolute bottom-0 left-0 p-3 w-full">
                  <p className="text-white text-sm font-bold line-clamp-1 text-shadow">
                    {video.name}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/50 backdrop-blur-sm hover:bg-background/80 border-2 border-primary/50 text-primary hover:border-primary transition-all duration-300 disabled:opacity-0 disabled:scale-90" >
          <ChevronLeft className="h-6 w-6" />
        </CarouselPrevious>
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/50 backdrop-blur-sm hover:bg-background/80 border-2 border-primary/50 text-primary hover:border-primary transition-all duration-300 disabled:opacity-0 disabled:scale-90" >
          <ChevronRight className="h-6 w-6" />
        </CarouselNext>
      </Carousel>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedVideo && (
          <DialogContent className="bg-black/80 border-neutral-800 p-0 max-w-screen-lg w-full flex flex-col gap-0 rounded-lg overflow-hidden backdrop-blur-xl">
             <DialogHeader className="p-4 flex-row justify-between items-center border-b border-neutral-700/80 space-y-0">
                <DialogTitle className="text-lg line-clamp-1">{selectedVideo.name}</DialogTitle>
             </DialogHeader>
             <AspectRatio ratio={16 / 9} className="bg-black w-full">
                <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=1&rel=0`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                ></iframe>
            </AspectRatio>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
