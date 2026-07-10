import { MapPin, Navigation, Phone } from "lucide-react"

export function LocationMap() {
  const coords = "14.671543,-17.427706"
  const embedSrc = `https://www.google.com/maps?q=${coords}&hl=fr&z=16&output=embed`
  const directions = `https://google.com/maps?daddr=${coords}`

  return (
    <section id="localisation" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Nous trouver
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Passez nous voir en boutique pour découvrir nos produits, profiter de nos
            conseils et de notre service de maintenance.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="overflow-hidden rounded-xl border border-border shadow-sm lg:col-span-2">
            <iframe
              title="Localisation de BAOLAB INFO"
              src={embedSrc}
              className="h-80 w-full lg:h-full"
              style={{ border: 0, minHeight: "20rem" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-secondary/30 p-6">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">Adresse</p>
                <p className="text-sm text-muted-foreground">
                  BAOLAB INFO, Dakar, Sénégal
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">Téléphone</p>
                <a
                  href="tel:+221775102924"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  +221 77 510 29 24
                </a>
              </div>
            </div>

            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Navigation className="size-4" />
              Obtenir l'itinéraire
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
