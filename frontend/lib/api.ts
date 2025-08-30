export interface ShortenedUrl {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  clickCount: number
  createdAt: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  async shortenUrl(url: string): Promise<ApiResponse<ShortenedUrl>> {
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { error: errorData.error || "Failed to shorten URL" }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: "Network error. Please try again." }
    }
  }

  async getUrls(): Promise<ApiResponse<ShortenedUrl[]>> {
    try {
      const response = await fetch("/api/urls", {
        cache: "no-store", // Always fetch fresh data
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { error: errorData.error || "Failed to fetch URLs" }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: "Network error. Please try again." }
    }
  }

  async deleteUrl(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`/api/urls/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { error: errorData.error || "Failed to delete URL" }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: "Network error. Please try again." }
    }
  }
}

export const apiClient = new ApiClient()
