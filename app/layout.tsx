import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Anjelie AI - Sustainable Fashion Design',
  description: 'AI-powered sustainable fashion design tool for Shopify merchants',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}