
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TriangleAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-13rem)] text-center px-4 sm:px-8">
      <TriangleAlert className="w-16 h-16 text-primary mb-4" />
      <h1 className="text-6xl md:text-8xl font-black text-primary tracking-tighter">
        404
      </h1>
      <h2 className="text-2xl md:text-3xl font-bold mt-4 mb-2">
        Page Not Found
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Button asChild size="lg">
        <Link href="/" prefetch={false}>Go to Homepage</Link>
      </Button>
    </div>
  );
}
