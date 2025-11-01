"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from './ui/forms';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function SearchInput({ className }: { className?: string }) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      toast({
        title: "Search is empty",
        description: "Please enter a search term to find movies or TV shows.",
        variant: "destructive"
      })
    }
  };

  return (
    <form onSubmit={handleSearch} action="/search" method="GET" className={cn("relative w-full group", className)}>
      <Input
        type="text"
        name="q"
        placeholder="Search movies, TV, actors..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-12 text-base pr-12 bg-secondary border-2 border-transparent focus-visible:ring-primary focus-visible:ring-2 focus-visible:border-primary focus-visible:ring-offset-0 transition-colors"
      />
      <button type="submit" aria-label="Search" className="absolute inset-y-0 right-0 flex items-center pr-4">
        <Search className="h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
      </button>
    </form>
  );
}
