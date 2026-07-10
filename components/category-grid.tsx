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
            className="group flex flex-col sm:flex-row items-center gap-3 sm:gap-4 rounded-xl border border-border bg-card p-3 sm:p-4 transition-all hover:shadow-md text-center sm:text-left last:col-span-2 sm:last:col-span-1"
          >
            <div className="flex size-14 sm:size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
              <Image
                src={cat.image || "/placeholder.svg"}
                alt={cat.label}
                width={64}
                height={64}
                className="size-full object-contain p-1.5 transition-transform group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <h3 className="font-semibold text-sm sm:text-base leading-tight text-foreground">{cat.label}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{cat.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
