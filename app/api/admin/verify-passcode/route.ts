import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { passcode } = body

    const expectedPasscode = process.env.ADMIN_PASSCODE || "1234"

    if (passcode === expectedPasscode) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, error: "Code d'accès administrateur incorrect." },
      { status: 401 }
    )
  } catch (error) {
    console.error("API error verifying passcode:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
