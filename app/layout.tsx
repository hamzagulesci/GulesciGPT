import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GulesciGPT - Claude',
  description: 'Okul çapında kullanılacak ücretsiz AI chat uygulaması - 47 AI modeli',
  keywords: 'AI, chat, öğrenci, okul, yapay zeka, GPT',
  manifest: '/manifest.json',
  themeColor: '#1E90FF',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GulesciGPT',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  return (
    <html lang="tr">
      <head>
        {/* Google AdSense */}
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />

        {/* PWA Service Worker */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(reg => console.log('[PWA] Service Worker registered:', reg.scope))
                  .catch(err => console.error('[PWA] Service Worker registration failed:', err))
              })
            }
          `}
        </Script>
      </body>
    </html>
  )
}
