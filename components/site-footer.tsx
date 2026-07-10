import Image from "next/image"
import { Mail, MapPin, Phone } from "lucide-react"

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="flex flex-col gap-4">
          <Image
            src="/baolab-logo.jpeg"
            alt="Logo BAOLAB INFO"
            width={240}
            height={75}
            className="h-20 w-auto object-contain"
          />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Vente de matériels & accessoires informatiques. Bureautique, maintenance et
            prestation de services.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/baolabmultimedia?igsh=MWY3ZDB3YWU5dHlteg=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram BAOLAB INFO"
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href="https://www.facebook.com/share/17psCQgC8c/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook BAOLAB INFO"
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              <FacebookIcon className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide">Catégories</h3>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            <li><a href="#smartphones" className="hover:text-primary">Smartphones</a></li>
            <li><a href="#ordinateurs" className="hover:text-primary">Ordinateurs</a></li>
            <li><a href="#tablettes" className="hover:text-primary">Tablettes</a></li>
            <li><a href="#accessoires" className="hover:text-primary">Accessoires</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide">Contact</h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
            <li>
              <a
                href="tel:+221775102924"
                className="flex items-center gap-2 hover:text-primary"
              >
                <Phone className="size-4 text-primary" /> +221 77 510 29 24
              </a>
            </li>
            <li>
              <a
                href="mailto:contact@baolabinfo.com"
                className="flex items-center gap-2 hover:text-primary"
              >
                <Mail className="size-4 text-primary" /> contact@baolabinfo.com
              </a>
            </li>
            <li>
              <a
                href="https://google.com/maps?daddr=14.671543,-17.427706"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary"
              >
                <MapPin className="size-4 text-primary" /> Voir notre localisation
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-1 px-4 py-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          <span>&copy; {new Date().getFullYear()} BAOLAB INFO. Tous droits réservés.</span>
          <span>
            Réalisé par{" "}
            <a
              href="https://www.wockytech.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              WockyTech
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
