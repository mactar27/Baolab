import { Headphones, Laptop, Monitor, Printer, Wrench } from "lucide-react"

const services = [
  {
    icon: Monitor,
    title: "Vente de matériels",
    description:
      "Ordinateurs, smartphones, tablettes et accessoires neufs, Apple comme Android.",
  },
  {
    icon: Printer,
    title: "Bureautique",
    description:
      "Équipement et fournitures pour votre bureau : impression, réseau et périphériques.",
  },
  {
    icon: Wrench,
    title: "Maintenance",
    description:
      "Diagnostic, réparation et entretien de vos équipements informatiques.",
  },
  {
    icon: Headphones,
    title: "Prestation de services",
    description:
      "Installation, configuration et accompagnement pour particuliers et entreprises.",
  },
  {
    icon: Laptop,
    title: "Location d'ordinateurs",
    description:
      "Location d'ordinateurs de bureau et portables pour vos séminaires et sessions de formation professionnelle.",
  },
]

export function Services() {
  return (
    <section id="services" className="scroll-mt-20 bg-secondary/40 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            Nos services
          </h2>
          <p className="mt-2 text-pretty text-muted-foreground">
            Au-delà de la vente, BAOLAB INFO vous accompagne à chaque étape.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 lg:gap-6">
          {services.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-6 text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
