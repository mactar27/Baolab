"use client"

import { Printer } from "lucide-react"

export function PrintControls() {
  return (
    <div className="w-full max-w-2xl flex justify-between items-center mb-6 no-print">
      <a
        href="/admin"
        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
      >
        &larr; Retour à l'administration
      </a>
      <button
        onClick={() => typeof window !== "undefined" && window.print()}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 shadow-sm"
      >
        <Printer className="size-4" />
        Imprimer le reçu
      </button>
    </div>
  )
}
