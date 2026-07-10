import { NextRequest, NextResponse } from "next/server"
import { updateProduct, deleteProduct } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, brand, category, platform, price, oldPrice, image, badge, specs } = body

    if (!name || !brand || !category || !platform || price === undefined || !image || !specs || !Array.isArray(specs)) {
      return NextResponse.json(
        { error: "Missing required fields or invalid specs array." },
        { status: 400 }
      )
    }

    const updatedProduct = {
      name,
      brand,
      category,
      platform,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      image,
      badge: badge || undefined,
      specs,
    }

    const success = await updateProduct(id, updatedProduct)
    if (!success) {
      return NextResponse.json({ error: "Failed to update product." }, { status: 500 })
    }

    return NextResponse.json({ success: true, id, product: updatedProduct })
  } catch (error) {
    console.error("API error updating product:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = await deleteProduct(id)
    if (!success) {
      return NextResponse.json({ error: "Failed to delete product." }, { status: 500 })
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("API error deleting product:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
