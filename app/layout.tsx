import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { CalendarProvider } from '@/lib/calendar-context'
import { AnnouncementsProvider } from '@/lib/announcements-context'
import { EmployeesProvider } from '@/lib/employees-context'
import { PresenceProvider } from '@/lib/presence-context'
import './globals.css'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: 'RRHH IA - Sistema de Recursos Humanos',
  description: 'Sistema inteligente de gestión de recursos humanos y nómina',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-[#060e1e]">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <EmployeesProvider>
            <PresenceProvider>
              <CalendarProvider>
                <AnnouncementsProvider>
                  {children}
                </AnnouncementsProvider>
              </CalendarProvider>
            </PresenceProvider>
          </EmployeesProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
