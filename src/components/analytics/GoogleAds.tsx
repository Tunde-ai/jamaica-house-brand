'use client'

import Script from 'next/script'

export default function GoogleAds() {
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID

  if (!googleAdsId) return null

  return (
    <>
      {/* Google Ads Global Site Tag */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-ads"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAdsId}');
          `,
        }}
      />
    </>
  )
}