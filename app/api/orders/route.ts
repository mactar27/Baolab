import { NextRequest, NextResponse } from "next/server"
import { createOrder } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_name, customer_phone, customer_address, total_price, items } = body

    if (!customer_name || !customer_phone || !customer_address || !total_price || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Missing required fields or invalid items array." },
        { status: 400 }
      )
    }

    // Generate a unique order ID
    const randomDigits = Math.floor(10000 + Math.random() * 90000)
    const orderId = `CMD-${randomDigits}`

    const orderData = {
      id: orderId,
      customer_name,
      customer_phone,
      customer_address,
      total_price: Number(total_price),
      status: "En attente",
    }

    const formattedItems = items.map((item: any) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: Number(item.quantity),
      price: Number(item.price),
    }))

    const success = await createOrder(orderData, formattedItems)

    if (!success) {
      return NextResponse.json({ error: "Failed to save order." }, { status: 500 })
    }

    return NextResponse.json({ success: true, orderId, order: { ...orderData, items: formattedItems } })
  } catch (error) {
    console.error("API error creating order:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
