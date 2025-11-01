
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from './ui/forms';

type SearchInputProps = {
  initialQuery?: string;
};

export function SearchInput({ initialQuery = '' }: SearchInputProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="search"
        name="q"
        placeholder="Search for movies, TV shows, people..."
        className="pl-10"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search"
      />
    </form>
  );
}