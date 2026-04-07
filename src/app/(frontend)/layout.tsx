import type { Metadata } from 'next'
import { PrimaryNav } from '@/components/wilco/PrimaryNav'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/schema'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/site-config'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} | Williamson County News, Business & Community`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
  },
  robots: { index: true, follow: true },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = generateOrganizationSchema()
  const webSchema = generateWebSiteSchema()

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSchema) }}
        />

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}

        {/* Meta Pixel */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      </head>
      <body className="font-sans bg-bg text-text-primary antialiased">
        <PrimaryNav />
        <main>{children}</main>

        {/* Footer */}
        <footer className="border-t border-border mt-12 py-8 text-center">
          <p className="text-[13px] text-text-muted">
            © {new Date().getFullYear()} WilCo Guide ·{' '}
            <Link href="#" className="text-text-secondary no-underline font-medium hover:text-blue">About</Link> ·{' '}
            <Link href="#" className="text-text-secondary no-underline font-medium hover:text-blue">Advertise</Link> ·{' '}
            <Link href="#" className="text-text-secondary no-underline font-medium hover:text-blue">Contact</Link> ·{' '}
            <Link href="#" className="text-text-secondary no-underline font-medium hover:text-blue">Privacy</Link>
          </p>
        </footer>

        <SpeedInsights />
      </body>
    </html>
  )
}
