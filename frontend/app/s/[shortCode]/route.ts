import { type NextRequest, NextResponse } from "next/server"

// Import the same in-memory database
const urlDatabase: Array<{
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  clickCount: number
  createdAt: string
}> = []

export async function GET(request: NextRequest, { params }: { params: { shortCode: string } }) {
  try {
    const { shortCode } = params

    if (!shortCode) {
      return NextResponse.json({ error: "Short code is required" }, { status: 400 })
    }

    // Find the URL by short code
    const urlEntry = urlDatabase.find((item) => item.shortCode === shortCode)

    if (!urlEntry) {
      return NextResponse.json({ error: "Short URL not found" }, { status: 404 })
    }

    // Increment click count
    urlEntry.clickCount += 1

    // Redirect to the original URL
    return NextResponse.redirect(urlEntry.originalUrl, 302)
  } catch (error) {
    console.error("Error redirecting:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
