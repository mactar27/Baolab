import Image from "next/image"
import { notFound } from "next/navigation"
import { getOrders } from "@/lib/db"
import { formatPrice } from "@/lib/products"
import { PrintControls } from "@/components/print-controls"

export const dynamic = "force-dynamic"

export default async function PrintReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const orders = await getOrders()
  const order = orders.find((o) => o.id === id)

  if (!order) {
    notFound()
  }

  // Generate QR Code data
  const qrDataText = [
    `BAOLAB INFO`,
    `Commande : ${order.id}`,
    `Client : ${order.customer_name}`,
    `Tel : ${order.customer_phone}`,
    `Adresse : ${order.customer_address}`,
    `Total : ${formatPrice(order.total_price)}`,
    `Statut : ${order.status}`,
  ].join("\n")

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
    qrDataText
  )}`

  return (
    <div className="min-h-screen bg-secondary/10 p-4 flex flex-col items-center print:bg-white print:p-0">
      {/* CSS Styling specifically to force thermal receipt page sizes and print formats */}
      <style dangerouslySetInnerHTML={{ __html: `
        .receipt-card {
          width: 100%;
          max-width: 80mm;
          background: white;
        }
        @media print {
          @page {
            size: auto;
            margin: 5mm;
          }
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .no-print {
            display: none !important;
          }
          .receipt-card {
            width: 80mm !important;
            margin: 10mm auto !important;
            box-shadow: none !important;
            border: 1px dashed #bbb !important;
            padding: 6mm !important;
            background: white !important;
          }
        }
      `}} />

      {/* Print Controls (Hidden when printing) */}
      <div className="w-full max-w-[80mm] mb-4 no-print">
        <PrintControls />
      </div>

      {/* Auchan-style Thermal Receipt Ticket */}
      <div className="receipt-card w-full bg-background border border-border p-5 rounded-xl shadow-md text-foreground font-mono text-xs leading-relaxed">
        
        {/* Header (Centered Logo & Company Info) */}
        <div className="flex flex-col items-center text-center gap-1.5 pb-4">
          <Image
            src="/baolab-logo.jpeg"
            alt="Logo BAOLAB INFO"
            width={120}
            height={38}
            className="h-10 w-auto object-contain"
            priority
          />
          <div className="flex flex-col gap-0.5 mt-1">
            <h1 className="font-bold text-sm text-foreground uppercase tracking-wider">BAOLAB INFO</h1>
            <p className="text-[10px] text-muted-foreground">Vente de matériel & accessoires</p>
            <p className="text-[10px] text-muted-foreground">Dakar, Sénégal</p>
            <p className="text-[10px] text-muted-foreground">Tel : +221 77 510 29 24</p>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-border/80 my-3" />

        {/* Order Details (Ticket Metadata) */}
        <div className="flex flex-col gap-1 text-[10px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">TICKET N° :</span>
            <span className="font-bold text-foreground">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">DATE :</span>
            <span className="font-semibold text-foreground">
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">STATUT :</span>
            <span className="font-semibold text-foreground">{order.status}</span>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-border/80 my-3" />

        {/* Customer Details */}
        <div className="flex flex-col gap-1 text-[10px] bg-secondary/20 p-2 rounded">
          <div>
            <span className="font-bold text-muted-foreground uppercase text-[9px] block mb-0.5">Destinataire :</span>
            <p className="font-bold text-foreground text-[11px]">{order.customer_name}</p>
            <p className="text-foreground mt-0.5">Tel : {order.customer_phone}</p>
          </div>
          <div className="mt-1.5">
            <span className="font-bold text-muted-foreground uppercase text-[9px] block mb-0.5">Adresse de livraison :</span>
            <p className="text-foreground leading-snug">{order.customer_address}</p>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-border/80 my-3" />

        {/* Items list (Double-row list matching ticket roll style) */}
        <div className="flex flex-col gap-3.5">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
            <span>Désignation / Qté</span>
            <span>Montant</span>
          </div>
          
          <ul className="flex flex-col gap-3">
            {order.items?.map((item, idx) => (
              <li key={idx} className="flex flex-col gap-0.5">
                {/* Row 1: Item Name */}
                <span className="font-bold text-foreground truncate max-w-full block">
                  {item.product_name}
                </span>
                {/* Row 2: Price computation & subtotal */}
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>
                    {item.quantity} x {formatPrice(item.price)}
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-border/80 my-3" />

        {/* Receipt Totals */}
        <div className="flex flex-col gap-2 font-mono">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-muted-foreground">Sous-total</span>
            <span className="font-semibold">{formatPrice(order.total_price)}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-muted-foreground">Livraison</span>
            <span className="font-semibold text-emerald-600">Gratuit</span>
          </div>
          <div className="border-t border-dotted border-border/60 my-1" />
          <div className="flex justify-between items-center text-sm font-bold pt-0.5">
            <span className="text-foreground">TOTAL NET</span>
            <span className="text-primary text-base">{formatPrice(order.total_price)}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-0.5">
            <span>Paiement</span>
            <span>À la livraison</span>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-border/80 my-4" />

        {/* QR Code section (Centered) */}
        <div className="flex flex-col items-center gap-2">
          <img
            src={qrImageUrl}
            alt="Code QR livraison"
            width={100}
            height={100}
            className="border border-white shadow-sm bg-white p-1"
          />
          <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider text-center max-w-[130px] leading-tight">
            Scanner pour valider
          </span>
        </div>

        {/* Footer info */}
        <div className="text-center text-[9px] text-muted-foreground mt-6 flex flex-col gap-0.5">
          <p>Merci pour votre achat chez BAOLAB INFO !</p>
          <p>La technologie qu'il vous faut.</p>
        </div>
      </div>
    </div>
  )
}
