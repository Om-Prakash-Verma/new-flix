'use client';

import Script from 'next/script';

// You can store your tracking ID in an environment variable
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export function AdScripts() {
  return (
    <>
      {/* 
        Add your ad provider's script tags here.
        You can use Next.js's <Script> component for optimized script loading.
        
        Example for Google AdSense:
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_CLIENT_ID"
          crossOrigin="anonymous"
          strategy="lazyOnload" 
        />
      */}
      
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