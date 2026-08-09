import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthSessionProvider } from '@/components/auth-session-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'LOOP - AI Customer Feedback Intelligence Platform',
  description: 'Analyze customer feedback with AI-powered insights and themes. Understand what your customers really want.',
  generator: 'v0.app',
  icons: {
    icon: '/loop_logo.png',
    apple: '/loop_logo.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className="antialiased">
        <AuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthSessionProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
