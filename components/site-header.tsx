"use client"

import { useState } from "react"
import Image from "next/image"
import { Menu, ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-context"
import { ThemeToggle } from "@/components/theme-toggle"

const navLinks = [
  { href: "#smartphones", label: "Smartphones" },
  { href: "#ordinateurs", label: "Ordinateurs" },
  { href: "#tablettes", label: "Tablettes" },
  { href: "#accessoires", label: "Accessoires" },
  { href: "#services", label: "Services" },
]

export function SiteHeader() {
  const { count, setOpen } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-2" aria-label="Accueil BAOLAB INFO">
          <Image
            src="/baolab-logo.jpeg"
            alt="Logo BAOLAB INFO"
            width={380}
            height={116}
            className="h-24 md:h-32 w-auto object-contain dark:bg-white/95 dark:p-2 dark:rounded-lg"
            priority
          />
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="default"
            onClick={() => setOpen(true)}
            className="relative gap-2"
            aria-label={`Ouvrir le panier, ${count} article${count > 1 ? "s" : ""}`}
          >
            <ShoppingCart className="size-4" />
            <span className="hidden sm:inline">Panier</span>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Ouvrir le menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-border bg-background md:hidden"
          aria-label="Navigation mobile"
        >
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
