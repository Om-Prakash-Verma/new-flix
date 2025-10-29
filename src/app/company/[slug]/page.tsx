
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getCompanyDetails, discoverMoviesByCompany, discoverTVByCompany } from '@/lib/tmdb';
import { getProfileImage } from '@/lib/tmdb-images';
import { extractIdFromSlug } from '@/lib/utils';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { CompanyFilmography } from '@/components/CompanyFilmography';

type CompanyPageProps = {
  params: {
    slug: string;
  };
};

export const runtime = 'edge';

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const companyId = extractIdFromSlug(params.slug);
  if (!companyId) {
    return { title: 'Company not found' };
  }
  const company = await getCompanyDetails(companyId);

  if (!company) {
    return {
      title: 'Company not found',
    };
  }

  const title = `${company.name} | ${siteConfig.name}`;
  const description = `Browse movies and TV shows from ${company.name}.`;
  const canonicalUrl = `/company/${params.slug}`;

  return {
    title,
    description,
    alternates: {
        canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
    },
  };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const companyId = extractIdFromSlug(params.slug);
  if (!companyId) {
    notFound();
  }

  const company = await getCompanyDetails(companyId);

  if (!company) {
    notFound();
  }

  return (
    <div className="py-12 px-4 sm:px-8">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12">
        {company.logo_path && (
          <div className="w-full md:w-1/4 flex justify-center">
            <div className="relative w-48 h-24 rounded-lg overflow-hidden">
              <Image
                src={getProfileImage(company.logo_path, 'original')}
                alt={`Logo for ${company.name}`}
                title={`Logo for ${company.name}`}
                fill
                className="object-contain rounded-lg"
                priority
                sizes="48w"
                data-ai-hint="company logo"
              />
            </div>
          </div>
        )}
        <div className="w-full md:w-3/4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">{company.name}</h1>
          {(company.headquarters || company.origin_country) && (
              <p className="text-muted-foreground mb-6">
                {company.headquarters} {company.headquarters && company.origin_country && '•'} {company.origin_country}
              </p>
          )}
          
          {company.description && (
            <>
              <h2 className="text-xl font-bold border-b pb-2 mb-4">About</h2>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {company.description}
              </p>
            </>
          )}

        </div>
      </div>

      <CompanyFilmography companyId={company.id} />
    </div>
  );
}
