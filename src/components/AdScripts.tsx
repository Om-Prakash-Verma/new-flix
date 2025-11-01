
'use client';

import Script from 'next/script';

// You can store your tracking ID in an environment variable
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export function AdScripts() {
  return (
    <>
      < script > (function(s) {
        s.dataset.zone = '9639504', s.src = 'https://bvtpk.com/tag.min.js'
      })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script'))) < /script>

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

      declare global {
        interface Window {
        _iezap ?: () => void;
    _mdjlol?: () => void;
  }
}

