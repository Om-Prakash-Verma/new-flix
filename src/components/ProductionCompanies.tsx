
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { slugify } from '@/lib/utils';
import { getPosterImage } from '@/lib/tmdb-images';
import type { ProductionCompany } from '@/lib/tmdb-schemas';

type ProductionCompaniesProps = {
  companies: ProductionCompany[];
};

export function ProductionCompanies({ companies }: ProductionCompaniesProps) {
  const companiesWithLogos = companies.filter(c => c.logo_path);

  if (companiesWithLogos.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center md:items-end gap-4">
        <h2 className="text-sm font-bold text-white text-shadow uppercase tracking-wider">Production</h2>
        <div className="flex flex-row md:flex-col flex-wrap items-center justify-center md:items-end gap-4">
          {companiesWithLogos.slice(0, 3).map(company => ( // Limit to max 3 companies
            <Link 
              key={company.id} 
              href={`/company/${slugify(company.name)}-${company.id}`}
              className="group"
              prefetch={false}
            >
              <div className="bg-white p-2 h-14 w-28 flex items-center justify-center transition-colors group-hover:bg-gray-200 rounded-lg overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src={getPosterImage(company.logo_path, 'w185')}
                    alt={`Logo for ${company.name}`}
                    title={`Logo for ${company.name}`}
                    fill
                    className="object-contain"
                    sizes="112px"
                    data-ai-hint="company logo"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
    </div>
  );
}
