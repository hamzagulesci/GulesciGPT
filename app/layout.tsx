import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HamzaGPT',
  description: 'Okul çapında kullanılacak ücretsiz AI chat uygulaması - 47 AI modeli',
  keywords: 'AI, chat, öğrenci, okul, yapay zeka, GPT',
  manifest: '/manifest.json?v=2',
  icons: {
    icon: '/icon-512.png',
    apple: '/icon-512.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HamzaGPT',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#1E90FF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3164898310826304"
             crossOrigin="anonymous"></script>
      </head>
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors closeButton />

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
