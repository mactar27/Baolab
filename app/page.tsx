import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { CategoryGrid } from "@/components/category-grid"
import { CatalogSection } from "@/components/catalog-section"
import { Services } from "@/components/services"
import { LocationMap } from "@/components/location-map"
import { SiteFooter } from "@/components/site-footer"
import { getProductsFromDb, getSetting } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const products = await getProductsFromDb()
  const heroImage = await getSetting("hero_image") || "/products/hero-devices.png"

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero image={heroImage} />
        <CategoryGrid />

        <CatalogSection
          id="smartphones"
          title="Smartphones"
          subtitle="iPhone et smartphones Android des plus grandes marques."
          filters={["all", "apple", "android"]}
          products={products}
        />

        <div className="bg-secondary/30">
          <CatalogSection
            id="ordinateurs"
            title="Ordinateurs"
            subtitle="Ordinateurs portables Mac et Windows pour le travail et la création."
            filters={["all", "apple", "windows"]}
            products={products}
          />
        </div>

        <CatalogSection
          id="tablettes"
          title="Tablettes"
          subtitle="Tablettes Apple et Android pour la productivité et le divertissement."
          filters={["all", "apple", "android"]}
          products={products}
        />

        <div className="bg-secondary/30">
          <CatalogSection
            id="accessoires"
            title="Accessoires"
            subtitle="Audio, claviers, souris, chargeurs et objets connectés."
            products={products}
          />
        </div>

        <CatalogSection
          id="location"
          title="Location d'ordinateurs"
          subtitle="Ordinateurs de bureau et portables disponibles pour vos séminaires et sessions de formation."
          products={products}
        />

        <Services />

        <div className="bg-secondary/30">
          <LocationMap />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
