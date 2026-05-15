import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const bricolage = Bricolage_Grotesque({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
})

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080C18',
}

export const metadata: Metadata = {
  title: 'Somar.IA | Plataforma de Inteligência no WhatsApp',
  description: 'Tenha um atendente com IA no seu WhatsApp funcionando em minutos.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Somar.IA',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${bricolage.variable} ${inter.variable}`}>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
