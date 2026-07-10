import Image from "next/image"
import { ShieldCheck, Truck, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"

const highlights = [
  { icon: ShieldCheck, label: "Produits garantis" },
  { icon: Truck, label: "Livraison rapide" },
  { icon: Wrench, label: "Maintenance & SAV" },
]

export function Hero({ image }: { image?: string }) {
  return (
    <section id="top" className="border-b border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Vente de matériels & accessoires informatiques
          </span>
          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            La technologie qu&apos;il vous faut, <span className="text-primary">Apple</span> ou{" "}
            <span className="text-primary">Android</span>
          </h1>
          <p className="max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
            Smartphones, ordinateurs portables, tablettes et accessoires de qualité chez BAOLAB
            INFO. Bureautique, maintenance et prestation de services pour particuliers et
            entreprises.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" nativeButton={false} render={<a href="#smartphones" />}>
              Découvrir la boutique
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<a href="#services" />}>
              Nos services
            </Button>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm font-medium">
                <Icon className="size-5 text-primary" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <Image
              src={image || "/products/hero-devices.png"}
              alt="Sélection d'appareils : ordinateur portable, smartphone, écouteurs et montre connectée"
              width={900}
              height={700}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
