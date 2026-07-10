"use client"

import Image from "next/image"
import { Minus, Plus, ShoppingCart, Trash2, X, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-context"
import { formatPrice } from "@/lib/products"
import { useState } from "react"

export function CartDrawer() {
  const { items, total, isOpen, setOpen, remove, setQty, clear } = useCart()

  // Checkout States
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null)

  async function handleConfirmCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (!customerName || !customerPhone || !customerAddress) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          total_price: total,
          items: items.map(({ product, quantity }) => ({
            product_id: product.id,
            product_name: product.name,
            quantity: quantity,
            price: product.price,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Une erreur est survenue lors de l'enregistrement.")
      }

      // Order successfully saved! Show success state
      setSuccessOrderId(data.orderId)
      clear()
      setCustomerName("")
      setCustomerPhone("")
      setCustomerAddress("")
      setIsCheckingOut(false)
    } catch (error: any) {
      console.error(error)
      setErrorMessage(error.message || "Impossible d'enregistrer la commande. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden={!isOpen}
        onClick={() => {
          if (!isSubmitting) {
            setOpen(false)
            setIsCheckingOut(false)
            setSuccessOrderId(null)
          }
        }}
        className={`fixed inset-0 z-50 bg-foreground/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Panier"
        aria-modal="true"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          {successOrderId ? (
            <h2 className="flex items-center gap-2 text-lg font-semibold text-emerald-600">
              <CheckCircle className="size-5" />
              Confirmation
            </h2>
          ) : isCheckingOut ? (
            <button
              onClick={() => setIsCheckingOut(false)}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              <ArrowLeft className="size-4" />
              Retour au panier
            </button>
          ) : (
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <ShoppingCart className="size-5 text-primary" />
              Votre panier
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setOpen(false)
              setIsCheckingOut(false)
              setSuccessOrderId(null)
            }}
            disabled={isSubmitting}
            aria-label="Fermer le panier"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Content */}
        {successOrderId ? (
          /* Success Screen */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Commande enregistrée !</h3>
            <p className="text-sm font-semibold text-primary">Référence : {successOrderId}</p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Merci pour votre confiance. Votre commande a été enregistrée avec succès.
              Notre équipe va vous contacter sous peu par téléphone pour convenir des modalités de livraison.
            </p>
            <Button
              onClick={() => {
                setSuccessOrderId(null)
                setOpen(false)
              }}
              className="mt-4 w-full max-w-[200px]"
            >
              Fermer
            </Button>
          </div>
        ) : items.length === 0 ? (
          /* Empty Cart */
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
              <ShoppingCart className="size-7 text-primary" />
            </div>
            <p className="font-medium">Votre panier est vide</p>
            <p className="text-sm text-muted-foreground">
              Parcourez notre catalogue et ajoutez vos appareils préférés.
            </p>
            <Button onClick={() => setOpen(false)} className="mt-2">
              Continuer mes achats
            </Button>
          </div>
        ) : isCheckingOut ? (
          /* Checkout Form */
          <form onSubmit={handleConfirmCheckout} className="flex flex-1 flex-col justify-between overflow-y-auto p-5">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">Détails de livraison</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Veuillez remplir ces informations pour enregistrer votre commande et valider la livraison.
                </p>
              </div>

              {errorMessage && (
                <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="customerName" className="text-xs font-semibold text-foreground">
                  Nom complet <span className="text-destructive">*</span>
                </label>
                <input
                  id="customerName"
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Amadou Diallo"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="customerPhone" className="text-xs font-semibold text-foreground">
                  Numéro de téléphone <span className="text-destructive">*</span>
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  required
                  disabled={isSubmitting}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ex: +221 77 123 45 67"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="customerAddress" className="text-xs font-semibold text-foreground">
                  Adresse de livraison complète <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="customerAddress"
                  required
                  disabled={isSubmitting}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Rue, Quartier, Ville (ex: Rue 10, Médina, Dakar)"
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none disabled:opacity-50"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-6">
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm text-muted-foreground font-medium">Total de la commande</span>
                <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
              </div>
              <Button type="submit" className="w-full gap-2" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Confirmer la commande"
                )}
              </Button>
            </div>
          </form>
        ) : (
          /* Cart Item List */
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-4 py-4">
                  <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="size-full object-contain p-1"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </div>
                      <button
                        onClick={() => remove(product.id)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label={`Retirer ${product.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-border">
                        <button
                          onClick={() => setQty(product.id, quantity - 1)}
                          className="flex size-7 items-center justify-center text-muted-foreground hover:text-primary"
                          aria-label="Diminuer la quantité"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                        <button
                          onClick={() => setQty(product.id, quantity + 1)}
                          className="flex size-7 items-center justify-center text-muted-foreground hover:text-primary"
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        {formatPrice(product.price * quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-5 py-4">
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <Button className="w-full" size="lg" onClick={() => setIsCheckingOut(true)}>
                  Passer la commande
                </Button>
                <button
                  onClick={clear}
                  className="text-center text-xs text-muted-foreground hover:text-destructive"
                >
                  Vider le panier
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
