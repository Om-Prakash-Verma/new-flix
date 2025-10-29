export const siteConfig = {
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Flix',
    description: 'Watch your favorite movies and TV shows online for free in stunning 4K quality. No ads, no subscriptions. Just endless entertainment.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://flix.example.com',
    mainNav: [
      {
        title: 'Home',
        href: '/',
      },
      {
        title: 'Movies',
        href: '/movie',
      },
      {
        title: 'TV Shows',
        href: '/tv',
      },
    ],
    footerNav: [
      {
        title: 'Terms of Service',
        href: '/legal/terms-of-service',
      },
      {
        title: 'Privacy Policy',
        href: '/legal/privacy-policy',
      },
      {
        title: 'Cookie Policy',
        href: '/legal/cookie-policy',
      },
      {
        title: 'DMCA',
        href: '/legal/dmca',
      },
    ]
  };
  
  export type SiteConfig = typeof siteConfig;
  