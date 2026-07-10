"use client"

import Image from "next/image"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-context"
import { formatPrice, type Product } from "@/lib/products"

const platformLabels: Record<Product["platform"], string> = {
  apple: "Apple",
  android: "Android",
  windows: "Windows",
  universel: "Universel",
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <div className="relative aspect-square bg-secondary/50">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            {product.badge}
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {platformLabels[product.platform]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </p>
          <h3 className="text-pretty text-sm font-semibold leading-snug">{product.name}</h3>
        </div>

        <ul className="flex flex-col gap-1">
          {product.specs.slice(0, 3).map((spec) => (
            <li key={spec} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
              {spec}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            {product.oldPrice && (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </p>
            )}
            <p className="text-base font-bold text-primary">{formatPrice(product.price)}</p>
          </div>
          <Button
            size="sm"
            onClick={() => add(product)}
            className="gap-1"
            aria-label={`Ajouter ${product.name} au panier`}
          >
            <Plus className="size-4" />
            Ajouter
          </Button>
        </div>
      </div>
    </article>
  )
}
