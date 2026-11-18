import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JobTrack - Personal Job Application Tracker',
  description: 'A clean, minimal, personal job application tracker.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  )
}
