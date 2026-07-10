import Image from "next/image"
import { categories } from "@/lib/products"

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`#${cat.id}`}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
              <Image
                src={cat.image || "/placeholder.svg"}
                alt={cat.label}
                width={64}
                height={64}
                className="size-full object-contain p-1.5 transition-transform group-hover:scale-110"
              />
            </div>
            <div>
              <h3 className="font-semibold">{cat.label}</h3>
              <p className="text-xs text-muted-foreground">{cat.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
