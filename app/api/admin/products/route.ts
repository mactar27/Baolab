import { NextRequest, NextResponse } from "next/server"
import { addProduct } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, brand, category, platform, price, oldPrice, image, badge, specs } = body

    if (!id || !name || !brand || !category || !platform || price === undefined || !image || !specs || !Array.isArray(specs)) {
      return NextResponse.json(
        { error: "Missing required fields or invalid specs array." },
        { status: 400 }
      )
    }

    const newProduct = {
      id,
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

    const success = await addProduct(newProduct)
    if (!success) {
      return NextResponse.json({ error: "Failed to add product to database." }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: newProduct })
  } catch (error) {
    console.error("API error adding product:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
