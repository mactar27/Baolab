"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export function WhatsAppButton() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  // Ensure client-side only execution to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      setShowTooltip(true)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return null
  }

  // Hide the widget on admin dashboard routes
  if (pathname?.startsWith("/admin")) {
    return null
  }

  const phoneNumber = "221775102924"
  const message = "Bonjour BAOLAB INFO, je souhaiterais obtenir des informations sur vos produits."
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans no-print">
      {showTooltip && (
        <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl p-4 max-w-[270px] text-xs font-medium flex flex-col gap-2 relative">
            {/* Close button */}
            <button 
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Operator header */}
            <div className="flex items-center gap-2 pr-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Service Client BAOLAB</span>
            </div>
            
            <p className="text-foreground leading-relaxed">
              Bonjour ! Besoin d'aide pour choisir un produit ou pour une location ? Écrivez-nous !
            </p>
            
            {/* Action link */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowTooltip(false)}
              className="mt-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-semibold py-2 px-3 rounded-lg hover:opacity-90 transition-all text-[11px] uppercase tracking-wide text-center"
            >
              Discuter sur WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discuter avec BAOLAB INFO sur WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-primary/20 cursor-pointer"
      >
        <svg 
          viewBox="0 0 448 512" 
          className="w-6 h-6 fill-current text-primary-foreground"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
      </a>
    </div>
  )
}
