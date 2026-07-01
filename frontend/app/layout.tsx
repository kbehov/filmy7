import AppSidebar from '@/components/app-sidebar'
import Footer from '@/components/footer'
import Header from '@/components/header'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { seoBase } from '@/seo/base'
import { getGenres } from '@/services/genres.service'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})
export const metadata = seoBase

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const genres = await getGenres('?limit=30')
  return (
    <html
      lang="pl-PL"
      suppressHydrationWarning
      className={cn('antialiased', fontMono.variable, 'font-sans', geist.variable)}
    >
      <body>
        <ThemeProvider>
          <SidebarProvider>
            <AppSidebar genres={genres} />
            <SidebarInset className="flex min-h-svh flex-col">
              <Header />
              <div className="flex-1">{children}</div>
              <Footer />
            </SidebarInset>
          </SidebarProvider>
          <GoogleAnalytics gaId={process.env.GA_PUBLIC_ID || 'G-RCJN3922NX'} />
        </ThemeProvider>
      </body>
    </html>
  )
}
