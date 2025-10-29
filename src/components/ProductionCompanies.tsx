
import type { ProductionCompany } from '@/lib/tmdb-schemas';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { slugify } from '@/lib/utils';
import { cn } from '@/lib/utils';

type ProductionCompaniesProps = {
  companies: ProductionCompany[];
};

export function ProductionCompanies({ companies }: ProductionCompaniesProps) {
  const companiesWithLogos = companies.filter(c => c.logo_path);

  if (companiesWithLogos.length === 0) {
    return null;
  }

  return (
    <div className="md:absolute md:top-8 md:right-8 md:z-20 flex flex-col md:items-end gap-4">
      <h2 className="text-sm font-bold text-white text-shadow uppercase tracking-wider">Production</h2>
      <div className="flex flex-row flex-wrap md:flex-col items-center md:items-end gap-4">
        {companiesWithLogos.slice(0, 4).map(company => (
          <Link key={company.id} href={`/company/${slugify(company.name)}-${company.id}`} className="group">
            <Card className="bg-green-400/80 backdrop-blur-md border-white/10 p-2 h-14 w-28 flex items-center justify-center transition-colors group-hover:bg-green-300/80 rounded-lg overflow-hidden">
              <div className="relative w-full h-full">
                <Image
                  src={`https://image.tmdb.org/t/p/w300${company.logo_path}`}
                  alt={`Logo for ${company.name}`}
                  title={`Logo for ${company.name}`}
                  fill
                  loading="lazy"
                  className="object-contain rounded-lg"
                  sizes="112px"
                  data-ai-hint="company logo"
                />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
