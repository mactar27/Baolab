"use client"
 
import { useMemo, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { type Product, type CategoryId, type Platform } from "@/lib/products"
 
type Filter = "all" | Platform
 
const filterLabels: Record<Filter, string> = {
  all: "Tous",
  apple: "Apple",
  android: "Android",
  windows: "Windows",
  universel: "Universel",
}
 
export function CatalogSection({
  id,
  title,
  subtitle,
  filters,
  products,
}: {
  id: CategoryId
  title: string
  subtitle: string
  filters?: Filter[]
  products: Product[]
}) {
  const [active, setActive] = useState<Filter>("all")
 
  const items = useMemo(
    () => products.filter((p) => p.category === id),
    [products, id],
  )
 
  const filtered = useMemo(
    () => (active === "all" ? items : items.filter((p) => p.platform === active)),
    [items, active],
  )

  const availableFilters: Filter[] =
    filters ?? ["all", ...Array.from(new Set(items.map((p) => p.platform)))]

  return (
    <section id={id} className="scroll-mt-20 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {availableFilters.length > 1 && (
            <div className="flex flex-wrap gap-2" role="tablist" aria-label={`Filtrer ${title}`}>
              {availableFilters.map((f) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={active === f}
                  onClick={() => setActive(f)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    active === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {filterLabels[f]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
