import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique name
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `${Date.now()}_${cleanFilename}`

    try {
      // Attempt to save to public folder on disk
      const uploadDir = path.join(process.cwd(), "public/products")
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const filePath = path.join(uploadDir, filename)
      fs.writeFileSync(filePath, buffer)

      return NextResponse.json({
        success: true,
        path: `/products/${filename}`,
        name: file.name,
      })
    } catch (fsError) {
      console.warn("Write to filesystem failed (likely serverless/read-only environment like Vercel). Falling back to Base64.", fsError)
      
      // Convert buffer to Base64 data URL
      const mimeType = file.type || "image/jpeg"
      const base64String = buffer.toString("base64")
      const dataUri = `data:${mimeType};base64,${base64String}`
      
      return NextResponse.json({
        success: true,
        path: dataUri,
        name: file.name,
      })
    }
  } catch (error) {
    console.error("API error uploading file:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
