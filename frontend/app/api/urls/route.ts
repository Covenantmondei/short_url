import { NextResponse } from "next/server"

// Import the same in-memory database
// In production, this would be a proper database connection
const urlDatabase: Array<{
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  clickCount: number
  createdAt: string
}> = []

export async function GET() {
  try {
    // Sort by creation date (newest first)
    const sortedUrls = urlDatabase.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(sortedUrls)
  } catch (error) {
    console.error("Error fetching URLs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
