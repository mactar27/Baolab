import { NextRequest, NextResponse } from "next/server"
import { updateOrderStatus, getOrders, deleteAllOrders } from "@/lib/db"

export async function GET() {
  try {
    const orders = await getOrders()
    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error("API error fetching orders:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: id or status." },
        { status: 400 }
      )
    }

    const success = await updateOrderStatus(id, status)
    if (!success) {
      return NextResponse.json({ error: "Failed to update order status." }, { status: 500 })
    }

    return NextResponse.json({ success: true, id, status })
  } catch (error) {
    console.error("API error updating order status:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const success = await deleteAllOrders()
    if (!success) {
      return NextResponse.json({ error: "Failed to delete all orders." }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error deleting all orders:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
