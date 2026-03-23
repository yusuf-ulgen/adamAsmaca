import './styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Adam Asmaca',
  description: 'Gelişmiş Adam Asmaca Oyunu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
