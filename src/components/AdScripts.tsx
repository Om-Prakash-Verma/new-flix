'use client';

import Script from 'next/script';
import { AdNetwork } from './ads/AdNetwork';

// You can store your tracking ID in an environment variable
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export function AdScripts() {
  return (
    <>
      <AdNetwork />
      
      {/* Google Analytics */}
      {GA_TRACKING_ID && (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}');
                `}
            </Script>
        </>
      )}
    </>
  );
}
