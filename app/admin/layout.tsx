import { ReactNode } from 'react'
import Script from 'next/script'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  return (
    <>
      {/* Google AdSense - Admin paneli için de eklendi */}
      {adsenseId && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
      {children}
    </>
  )
}
