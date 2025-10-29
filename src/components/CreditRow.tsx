
import Link from 'next/link';
import { slugify } from '@/lib/utils';
import type { PersonCombinedCreditsCast } from '@/lib/tmdb-schemas';

export function CreditRow({ item }: { item: PersonCombinedCreditsCast }) {
    const title = 'title' in item ? item.title : item.name;
    const releaseDate = 'release_date' in item ? item.release_date : item.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : '----';
    const href = `/${item.media_type}/${slugify(title)}-${item.id}`;

    return (
        <div className="flex items-center gap-4 text-sm hover:bg-muted/50 p-2 rounded-md -mx-2">
            <span className="font-bold w-12 text-center">{year}</span>
            <div className="flex-grow">
                <Link href={href} className="font-semibold hover:text-primary transition-colors" prefetch={false}>{title}</Link>
                {item.character && <p className="text-xs text-muted-foreground">as {item.character}</p>}
            </div>
        </div>
    );
}
