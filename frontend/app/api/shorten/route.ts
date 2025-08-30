import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo purposes
// In production, you'd use a database
const urlDatabase: Array<{
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  clickCount: number
  createdAt: string
}> = []

function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    // Validate the URL
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required and must be a string" }, { status: 400 })
    }

    if (!isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Check if URL already exists
    const existingUrl = urlDatabase.find((item) => item.originalUrl === url)
    if (existingUrl) {
      return NextResponse.json(existingUrl)
    }

    // Generate unique short code
    let shortCode: string
    do {
      shortCode = generateShortCode()
    } while (urlDatabase.some((item) => item.shortCode === shortCode))

    // Create new shortened URL entry
    const newUrl = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      originalUrl: url,
      shortCode,
      shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/s/${shortCode}`,
      clickCount: 0,
      createdAt: new Date().toISOString(),
    }

    urlDatabase.push(newUrl)

    return NextResponse.json(newUrl, { status: 201 })
  } catch (error) {
    console.error("Error shortening URL:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
