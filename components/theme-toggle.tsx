"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch by only rendering icons on the client
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Basculer le thème">
        <div className="size-5 animate-pulse rounded-full bg-muted" />
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Basculer le thème"
      className="rounded-full transition-colors hover:bg-secondary"
    >
      {isDark ? (
        <Sun className="size-5 text-amber-500 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="size-5 text-primary transition-transform duration-300 hover:-rotate-12" />
      )}
    </Button>
  )
}
