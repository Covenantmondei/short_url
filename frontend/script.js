// Configuration - Update these URLs to match your backend
const API_CONFIG = {
  BASE_URL: "http://127.0.0.1:8000/shorturl/", // Change this to your backend URL
  ENDPOINTS: {
    SHORTEN: "short",
    URLS: "/urls",
    DELETE: "/urls/", // Will append ID
    REDIRECT: "/s/", // Will append short code
  },
}

// Application State
let currentTab = "shorten"
let myLinks = []
let isLoading = false

// DOM Elements
const elements = {
  // Navigation
  navButtons: document.querySelectorAll(".nav-btn"),
  mobileNavButtons: document.querySelectorAll(".nav-mobile-btn"),
  mobileMenuBtn: document.querySelector(".mobile-menu-btn"),
  mobileNav: document.querySelector(".nav-mobile"),
  menuIcon: document.querySelector(".menu-icon"),
  closeIcon: document.querySelector(".close-icon"),

  // Tabs
  shortenTab: document.getElementById("shorten-tab"),
  dashboardTab: document.getElementById("dashboard-tab"),

  // Shorten Form
  urlInput: document.getElementById("url-input"),
  shortenBtn: document.getElementById("shorten-btn"),
  messageContainer: document.getElementById("message-container"),
  resultCard: document.getElementById("result-card"),
  shortUrlDisplay: document.getElementById("short-url-display"),
  originalUrlDisplay: document.getElementById("original-url-display"),
  copyBtn: document.getElementById("copy-btn"),
  openBtn: document.getElementById("open-btn"),

  // Dashboard
  dashboardMessageContainer: document.getElementById("dashboard-message-container"),
  refreshBtn: document.getElementById("refresh-btn"),
  loadingState: document.getElementById("loading-state"),
  emptyState: document.getElementById("empty-state"),
  desktopTable: document.getElementById("desktop-table"),
  mobileCards: document.getElementById("mobile-cards"),
  linksTableBody: document.getElementById("links-table-body"),
  linksCount: document.getElementById("links-count"),
  createLinkBtn: document.getElementById("create-link-btn"),
  statsSection: document.getElementById("stats-section"),
  totalLinks: document.getElementById("total-links"),
  totalClicks: document.getElementById("total-clicks"),
  avgClicks: document.getElementById("avg-clicks"),
}

// API Client
class APIClient {
  async request(endpoint, options = {}) {
    try {
      const url = `${API_CONFIG.BASE_URL}${endpoint}`
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  async shortenUrl(url) {
    return this.request(API_CONFIG.ENDPOINTS.SHORTEN, {
      method: "POST",
      body: JSON.stringify({ original_url: url }),
    })
  }

  async getUrls() {
    return this.request(API_CONFIG.ENDPOINTS.URLS)
  }

  async deleteUrl(id) {
    return this.request(`${API_CONFIG.ENDPOINTS.DELETE}${id}/`, {
      method: "DELETE",
    })
  }

  getShortUrl(shortCode) {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REDIRECT}${shortCode}`
  }
}

const apiClient = new APIClient()

// Utility Functions
function showMessage(container, message, type = "error") {
  container.innerHTML = `<div class="message message-${type}">${message}</div>`
  setTimeout(
    () => {
      container.innerHTML = ""
    },
    type === "success" ? 2000 : 5000,
  )
}

function clearMessages() {
  elements.messageContainer.innerHTML = ""
  elements.dashboardMessageContainer.innerHTML = ""
}

function truncateUrl(url, maxLength = 50) {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength) + "..."
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    showMessage(elements.messageContainer, "Copied to clipboard!", "success")
  } catch (err) {
    console.error("Failed to copy:", err)
    showMessage(elements.messageContainer, "Failed to copy to clipboard", "error")
  }
}

function openUrl(url) {
  window.open(url, "_blank", "noopener,noreferrer")
}

// Navigation Functions
function switchTab(tabName) {
  currentTab = tabName
  clearMessages()

  // Update tab content
  elements.shortenTab.classList.toggle("active", tabName === "shorten")
  elements.dashboardTab.classList.toggle("active", tabName === "dashboard")

  // Update navigation buttons
  elements.navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName)
  })

  elements.mobileNavButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName)
  })

  // Close mobile menu
  closeMobileMenu()

  // Load dashboard data if switching to dashboard
  if (tabName === "dashboard") {
    loadMyLinks()
  }
}

function toggleMobileMenu() {
  const isOpen = !elements.mobileNav.classList.contains("hidden")

  if (isOpen) {
    closeMobileMenu()
  } else {
    openMobileMenu()
  }
}

function openMobileMenu() {
  elements.mobileNav.classList.remove("hidden")
  elements.menuIcon.classList.add("hidden")
  elements.closeIcon.classList.remove("hidden")
}

function closeMobileMenu() {
  elements.mobileNav.classList.add("hidden")
  elements.menuIcon.classList.remove("hidden")
  elements.closeIcon.classList.add("hidden")
}

// URL Shortening Functions
async function handleShorten() {
  const url = elements.urlInput.value.trim()

  if (!url) {
    showMessage(elements.messageContainer, "Please enter a valid URL", "error")
    return
  }

  // Basic URL validation
  try {
    new URL(url)
  } catch {
    showMessage(elements.messageContainer, "Please enter a valid URL (include http:// or https://)", "error")
    return
  }

  setLoading(true)
  clearMessages()
  elements.resultCard.classList.add("hidden")

  try {
    const result = await apiClient.shortenUrl(url)
    
    // Display result - updated property names to match backend
    elements.shortUrlDisplay.value = `${window.location.origin}/r/${result.short_code}`
    elements.originalUrlDisplay.textContent = result.original_url
    elements.resultCard.classList.remove("hidden")

    // Clear input and show success
    elements.urlInput.value = ""
    showMessage(elements.messageContainer, "URL shortened successfully!", "success")

    // Refresh dashboard if active
    if (currentTab === "dashboard") {
      loadMyLinks()
    }
  } catch (error) {
    showMessage(elements.messageContainer, error.message || "Failed to shorten URL", "error")
  } finally {
    setLoading(false)
  }
}

function setLoading(loading) {
  isLoading = loading
  elements.shortenBtn.disabled = loading

  const btnText = elements.shortenBtn.querySelector(".btn-text")
  const spinner = elements.shortenBtn.querySelector(".loading-spinner")

  if (loading) {
    btnText.textContent = "Shortening..."
    spinner.classList.remove("hidden")
  } else {
    btnText.textContent = "Shorten URL"
    spinner.classList.add("hidden")
  }
}

// Dashboard Functions
async function loadMyLinks() {
  setDashboardLoading(true)
  clearMessages()

  try {
    const result = await apiClient.getUrls()
    myLinks = Array.isArray(result) ? result : result.urls || []

    updateLinksDisplay()
    updateStats()
  } catch (error) {
    showMessage(elements.dashboardMessageContainer, error.message || "Failed to load links", "error")
    myLinks = []
    updateLinksDisplay()
  } finally {
    setDashboardLoading(false)
  }
}

function setDashboardLoading(loading) {
  elements.refreshBtn.disabled = loading

  const refreshIcon = elements.refreshBtn.querySelector(".refresh-icon")
  const spinner = elements.refreshBtn.querySelector(".loading-spinner")

  if (loading) {
    refreshIcon.classList.add("hidden")
    spinner.classList.remove("hidden")
    elements.loadingState.classList.remove("hidden")
  } else {
    refreshIcon.classList.remove("hidden")
    spinner.classList.add("hidden")
    elements.loadingState.classList.add("hidden")
  }
}

function updateLinksDisplay() {
  const hasLinks = myLinks.length > 0

  // Update count
  elements.linksCount.textContent = `${myLinks.length} link${myLinks.length !== 1 ? "s" : ""} created`

  // Show/hide sections
  elements.emptyState.classList.toggle("hidden", hasLinks)
  elements.desktopTable.classList.toggle("hidden", !hasLinks)
  elements.mobileCards.classList.toggle("hidden", !hasLinks)
  elements.statsSection.classList.toggle("hidden", !hasLinks)

  if (hasLinks) {
    renderDesktopTable()
    renderMobileCards()
  }
}

function renderDesktopTable() {
  elements.linksTableBody.innerHTML = myLinks
    .map(
      (link, index) => `
        <tr style="animation-delay: ${index * 50}ms">
            <td>
                <span class="table-url" title="${link.original_url}">
                    ${truncateUrl(link.original_url, 40)}
                </span>
            </td>
            <td>
                <code class="table-code">${link.short_code}</code>
            </td>
            <td class="text-center">
                <span class="table-badge">${link.clicks || 0}</span>
            </td>
            <td class="text-muted-foreground">
                ${formatDate(link.created_at)}
            </td>
            <td class="text-right">
                <div class="table-actions">
                    <button class="action-btn" onclick="copyLinkFromTable('${window.location.origin}/r/${link.short_code}')" title="Copy link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                            <path d="m4 16c-1.1 0-2-.9-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                        </svg>
                    </button>
                    <button class="action-btn" onclick="openUrl('${window.location.origin}/r/${link.short_code}')" title="Open link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15,3 21,3 21,9"/>
                            <line x1="10" x2="21" y1="14" y2="3"/>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="deleteLink('${link.id}')" title="Delete link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m3 6 3 0"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            <path d="m19 6-1 14c0 1-1 2-2 2H8c-1 0-2-1-2-2L5 6"/>
                            <line x1="10" x2="10" y1="11" y2="17"/>
                            <line x1="14" x2="14" y1="11" y2="17"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `
    )
    .join("")
}

function renderMobileCards() {
  elements.mobileCards.innerHTML = myLinks
    .map(
      (link, index) => `
        <div class="mobile-card" style="animation-delay: ${index * 100}ms">
            <div class="mobile-card-header">
                <div class="mobile-card-info">
                    <div class="mobile-card-url" title="${link.originalUrl}">
                        ${truncateUrl(link.originalUrl, 30)}
                    </div>
                    <code class="mobile-card-code">${link.shortCode}</code>
                </div>
                <span class="table-badge">${link.clickCount || 0}</span>
            </div>
            <div class="mobile-card-footer">
                <div class="mobile-card-date">${formatDate(link.createdAt)}</div>
                <div class="mobile-card-actions">
                    <button class="mobile-action-btn" onclick="copyLinkFromTable('${link.shortUrl || apiClient.getShortUrl(link.shortCode)}')" title="Copy link">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                            <path d="m4 16c-1.1 0-2-.9-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                        </svg>
                    </button>
                    <button class="mobile-action-btn" onclick="openUrl('${link.shortUrl || apiClient.getShortUrl(link.shortCode)}')" title="Open link">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15,3 21,3 21,9"/>
                            <line x1="10" x2="21" y1="14" y2="3"/>
                        </svg>
                    </button>
                    <button class="mobile-action-btn delete" onclick="deleteLink('${link.id}')" title="Delete link">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m3 6 3 0"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            <path d="m19 6-1 14c0 1-1 2-2 2H8c-1 0-2-1-2-2L5 6"/>
                            <line x1="10" x2="10" y1="11" y2="17"/>
                            <line x1="14" x2="14" y1="11" y2="17"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function updateStats() {
  const totalLinks = myLinks.length
  const totalClicks = myLinks.reduce((sum, link) => sum + (link.clickCount || 0), 0)
  const avgClicks = totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0

  elements.totalLinks.textContent = totalLinks
  elements.totalClicks.textContent = totalClicks
  elements.avgClicks.textContent = avgClicks
}

// Global functions for onclick handlers
window.copyLinkFromTable = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    showMessage(elements.dashboardMessageContainer, "Copied to clipboard!", "success")
  } catch (err) {
    showMessage(elements.dashboardMessageContainer, "Failed to copy to clipboard", "error")
  }
}

window.deleteLink = async (id) => {
  if (!confirm("Are you sure you want to delete this link?")) {
    return
  }

  try {
    await apiClient.deleteUrl(id)
    myLinks = myLinks.filter((link) => link.id !== id)
    updateLinksDisplay()
    updateStats()
    showMessage(elements.dashboardMessageContainer, "Link deleted successfully!", "success")
  } catch (error) {
    showMessage(elements.dashboardMessageContainer, error.message || "Failed to delete link", "error")
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Navigation events
  elements.navButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab))
  })

  elements.mobileNavButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab))
  })

  elements.mobileMenuBtn.addEventListener("click", toggleMobileMenu)

  // Shorten form events
  elements.shortenBtn.addEventListener("click", handleShorten)
  elements.urlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleShorten()
    }
  })

  // Result actions
  elements.copyBtn.addEventListener("click", () => {
    copyToClipboard(elements.shortUrlDisplay.value)
  })

  elements.openBtn.addEventListener("click", () => {
    openUrl(elements.shortUrlDisplay.value)
  })

  // Dashboard events
  elements.refreshBtn.addEventListener("click", loadMyLinks)
  elements.createLinkBtn.addEventListener("click", () => switchTab("shorten"))

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!elements.mobileMenuBtn.contains(e.target) && !elements.mobileNav.contains(e.target)) {
      closeMobileMenu()
    }
  })

  // Initialize app
  console.log("URL Shortener app initialized")
  console.log("API Base URL:", API_CONFIG.BASE_URL)
})
