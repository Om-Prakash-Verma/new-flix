
import Link from 'next/link';
import { slugify } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ProductionCompany } from '@/lib/tmdb-schemas';

type ProductionCompaniesProps = {
  companies: ProductionCompany[];
};

export function ProductionCompanies({ companies }: ProductionCompaniesProps) {
  if (!companies || companies.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
      {companies.map(company => (
        <Link key={company.id} href={`/company/${slugify(company.name)}-${company.id}`} prefetch={false}>
          <Badge 
            variant="outline" 
            className="bg-black/20 backdrop-blur-sm border-white/20 text-white rounded-md hover:bg-white/30 transition-colors">
            {company.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
