'use client';

import Script from 'next/script';

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
        
        Or a simple script tag for other providers:
        <script async src="..."></script>
      */}
    </>
  );
}
