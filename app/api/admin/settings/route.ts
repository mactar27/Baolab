import { NextRequest, NextResponse } from "next/server"
import { getSetting, setSetting } from "@/lib/db"

export async function GET() {
  try {
    const heroImage = await getSetting("hero_image") || "/products/hero-devices.png"
    return NextResponse.json({ success: true, settings: { hero_image: heroImage } })
  } catch (error) {
    console.error("API error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings." }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body

    if (!key || value === undefined || typeof value !== "string") {
      return NextResponse.json(
        { error: "Missing 'key' or 'value' fields, or 'value' is not a string." },
        { status: 400 }
      )
    }

    const success = await setSetting(key, value)
    if (!success) {
      return NextResponse.json({ error: "Failed to save setting to database." }, { status: 500 })
    }

    return NextResponse.json({ success: true, key, value })
  } catch (error) {
    console.error("API error saving setting:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
