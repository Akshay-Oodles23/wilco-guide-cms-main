'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS } from '@/lib/site-config'

export function PrimaryNav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-[100] bg-white border-b border-border shadow-nav h-[56px] flex items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-[10px] no-underline">
          <div className="w-8 h-8 bg-blue rounded-lg flex items-center justify-center text-white font-bold text-sm">
            W
          </div>
          <div className="font-serif font-bold text-xl text-text-primary">
            WilCo <span className="text-blue">Guide</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 h-full">
          {NAV_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 h-full flex items-center text-sm font-medium no-underline relative transition-colors ${
                  isActive
                    ? 'text-blue font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-blue rounded-t-sm" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Desktop Subscribe Button */}
        <button className="hidden md:block bg-blue text-white border-none py-2 px-[18px] rounded-lg text-[13px] font-semibold cursor-pointer">
          Subscribe Free
        </button>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 text-text-secondary"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col md:hidden">
          <div className="flex items-center justify-between px-4 h-[56px] border-b border-border">
            <Link href="/news" className="flex items-center gap-[10px] no-underline" onClick={() => setMobileOpen(false)}>
              <div className="w-8 h-8 bg-blue rounded-lg flex items-center justify-center text-white font-bold text-sm">
                W
              </div>
              <div className="font-serif font-bold text-xl text-text-primary">
                WilCo <span className="text-blue">Guide</span>
              </div>
            </Link>
            <button
              className="p-2 text-text-secondary"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 flex flex-col py-4">
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-6 min-h-[48px] flex items-center text-base font-medium no-underline ${
                    isActive ? 'text-blue font-semibold bg-blue-light' : 'text-text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className="px-4 pb-6">
            <button className="w-full bg-blue text-white py-3 rounded-lg text-sm font-semibold">
              Subscribe Free
            </button>
          </div>
        </div>
      )}
    </>
  )
}
