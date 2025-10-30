type NavItem = {
  title: string;
  href: string;
  icon?: string;
};

export const siteConfig = {
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Flix',
    description: 'Watch your favorite movies and TV shows online for free in stunning 4K quality. No ads, no subscriptions. Just endless entertainment.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://flix.example.com',
    mainNav: [
      {
        title: 'Explore',
        href: '/',
        icon: 'compass',
      },
      {
        title: 'Movies',
        href: '/movie',
        icon: 'clapperboard',
      },
      {
        title: 'TV Shows',
        href: '/tv',
        icon: 'tv',
      },
    ] satisfies NavItem[],
    footerNav: [
      {
        title: 'Terms of Service',
        href: '/legal/terms-of-service',
        icon: 'file',
      },
      {
        title: 'Privacy Policy',
        href: '/legal/privacy-policy',
        icon: 'file',
      },
      {
        title: 'Cookie Policy',
        href: '/legal/cookie-policy',
        icon: 'file',
      },
      {
        title: 'DMCA',
        href: '/legal/dmca',
        icon: 'file',
      },
    ] satisfies NavItem[],
  };
  
  export type SiteConfig = typeof siteConfig;
  