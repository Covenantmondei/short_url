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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Find the URL to delete
    const urlIndex = urlDatabase.findIndex((item) => item.id === id)

    if (urlIndex === -1) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 })
    }

    // Remove the URL from the database
    const deletedUrl = urlDatabase.splice(urlIndex, 1)[0]

    return NextResponse.json({
      message: "URL deleted successfully",
      deletedUrl,
    })
  } catch (error) {
    console.error("Error deleting URL:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
