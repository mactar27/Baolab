"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export function WhatsAppButton() {
  const pathname = usePathname()
  const [showTooltip, setShowTooltip] = useState(false)

  // Hide the widget on admin dashboard routes
  if (pathname?.startsWith("/admin")) {
    return null
  }

  const phoneNumber = "221775102924"
  const message = "Bonjour BAOLAB INFO, je souhaiterais obtenir des informations sur vos produits."
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  // Show the chat bubble tooltip 3 seconds after loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans no-print">
      {showTooltip && (
        <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl p-4 max-w-[270px] text-xs font-medium flex flex-col gap-2 relative">
            {/* Close button */}
            <button 
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
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
              className="mt-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-semibold py-2 px-3 rounded-lg hover:opacity-90 transition-all text-[11px] uppercase tracking-wide"
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
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-primary/20"
      >
        <svg 
          viewBox="0 0 24 24" 
          className="w-7 h-7 fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.503-5.729-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.37 9.862-9.743.001-2.602-1.01-5.05-2.846-6.89C16.65 2.13 14.214.995 11.617.995 6.183.995 1.76 5.364 1.757 10.74c-.001 1.674.437 3.313 1.27 4.721L2.035 21.8l6.612-1.737-.09-.053-.91-.556zm1.39-10.432c-.11-.24-.22-.24-.33-.24h-.56c-.19 0-.51.07-.78.37-.27.3-1.03.99-1.03 2.42s1.01 2.82 1.15 3c.14.18 1.97 3.01 4.78 4.22 2.81 1.21 2.81.81 3.32.76.51-.05 1.63-.67 1.86-1.32.23-.65.23-1.21.16-1.32-.07-.11-.26-.18-.56-.33-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.34.22-.64.07-.3-.15-1.27-.47-2.42-1.5-1-.89-1.67-1.99-1.87-2.33-.2-.33-.02-.51.13-.66.14-.13.3-.34.45-.51.15-.17.2-.29.3-.49.1-.2.05-.37-.02-.52-.08-.15-.69-1.67-.95-2.29z"/>
        </svg>
      </a>
    </div>
  )
}
