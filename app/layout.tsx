import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { getContent } from '@/lib/content'
import './globals.css'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
})
const sans = Jost({ subsets: ['latin'], variable: '--font-sans' })

export async function generateMetadata(): Promise<Metadata> {
  const t = await getContent()
  const title = `${t.name} ${t.tagline} · Insumos para pestañas`
  return { title, description: t.heroLead, openGraph: { title, type: 'website' } }
}

export const viewport: Viewport = {
  themeColor: '#6f68e6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  )
}
