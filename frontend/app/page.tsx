"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Copy, ExternalLink, Link2, Loader2, BarChart3, Trash2, Menu, X } from "lucide-react"
import { apiClient, type ShortenedUrl } from "@/lib/api"

export default function URLShortener() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [shortenedUrl, setShortenedUrl] = useState<ShortenedUrl | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState<"shorten" | "dashboard">("shorten")
  const [myLinks, setMyLinks] = useState<ShortenedUrl[]>([])
  const [isLoadingLinks, setIsLoadingLinks] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (activeTab === "dashboard") {
      loadMyLinks()
    }
  }, [activeTab])

  const loadMyLinks = async () => {
    setIsLoadingLinks(true)
    setError("")

    const result = await apiClient.getUrls()

    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setMyLinks(result.data)
    }

    setIsLoadingLinks(false)
  }

  const handleShorten = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL")
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      setError("Please enter a valid URL (include http:// or https://)")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    const result = await apiClient.shortenUrl(url)

    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setShortenedUrl(result.data)
      setSuccess("URL shortened successfully!")
      setUrl("")

      // Refresh links if on dashboard
      if (activeTab === "dashboard") {
        loadMyLinks()
      }
    }

    setIsLoading(false)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setSuccess("Copied to clipboard!")
      setTimeout(() => setSuccess(""), 2000)
    } catch (err) {
      setError("Failed to copy to clipboard")
      setTimeout(() => setError(""), 2000)
    }
  }

  const openUrl = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const deleteLink = async (id: string) => {
    setError("")

    const result = await apiClient.deleteUrl(id)

    if (result.error) {
      setError(result.error)
    } else {
      setMyLinks(myLinks.filter((link) => link.id !== id))
      setSuccess("Link deleted successfully!")
      setTimeout(() => setSuccess(""), 2000)
    }
  }

  const truncateUrl = (url: string, maxLength = 50) => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + "..."
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleTabChange = (tab: "shorten" | "dashboard") => {
    setActiveTab(tab)
    setError("")
    setSuccess("")
    setMobileMenuOpen(false)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-semibold text-foreground">LinkShort</h1>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => handleTabChange("shorten")}
                  className={`relative text-sm font-medium transition-all duration-200 hover:text-primary ${
                    activeTab === "shorten" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Home
                  {activeTab === "shorten" && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full animate-in slide-in-from-left-1/2 duration-200" />
                  )}
                </button>
                <button
                  onClick={() => handleTabChange("dashboard")}
                  className={`relative text-sm font-medium transition-all duration-200 hover:text-primary ${
                    activeTab === "dashboard" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  My Links
                  {activeTab === "dashboard" && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full animate-in slide-in-from-left-1/2 duration-200" />
                  )}
                </button>
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 animate-in slide-in-from-top-2 duration-200">
                <nav className="flex flex-col gap-3">
                  <button
                    onClick={() => handleTabChange("shorten")}
                    className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "shorten"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => handleTabChange("dashboard")}
                    className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "dashboard"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    My Links
                  </button>
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-6 md:py-12">
          <div className="animate-in fade-in-0 duration-300">
            {activeTab === "shorten" && (
              <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-3 md:space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">Shorten Your URLs</h2>
                  <p className="text-base md:text-lg text-muted-foreground text-pretty px-4 md:px-0">
                    Transform long, complex URLs into short, shareable links in seconds. Track clicks and manage all
                    your links in one place.
                  </p>
                </div>

                {/* URL Shortening Card */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 animate-in slide-in-from-bottom-6 duration-700">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-lg md:text-xl">Create Short Link</CardTitle>
                    <CardDescription>Paste your long URL below to get started</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3">
                      <Input
                        type="url"
                        placeholder="https://example.com/very-long-url..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        onKeyDown={(e) => e.key === "Enter" && handleShorten()}
                      />
                      <Button
                        onClick={handleShorten}
                        disabled={isLoading}
                        className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Shortening...
                          </>
                        ) : (
                          "Shorten URL"
                        )}
                      </Button>
                    </div>

                    {/* Messages */}
                    {error && (
                      <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200 animate-in slide-in-from-top-2 duration-300">
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    {/* Shortened URL Result */}
                    {shortenedUrl && (
                      <Card className="bg-muted/50 animate-in slide-in-from-bottom-4 duration-500">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Short URL</label>
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
                                <Input
                                  value={shortenedUrl.shortUrl}
                                  readOnly
                                  className="flex-1 bg-background font-mono text-sm"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(shortenedUrl.shortUrl)}
                                    className="flex-1 sm:flex-none hover:bg-primary hover:text-primary-foreground transition-colors"
                                  >
                                    <Copy className="h-4 w-4 mr-1 sm:mr-0" />
                                    <span className="sm:hidden">Copy</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openUrl(shortenedUrl.shortUrl)}
                                    className="flex-1 sm:flex-none hover:bg-primary hover:text-primary-foreground transition-colors"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1 sm:mr-0" />
                                    <span className="sm:hidden">Open</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Original URL</label>
                              <p className="text-sm text-foreground mt-1 break-all bg-background p-2 rounded border">
                                {shortenedUrl.originalUrl}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 md:mt-16">
                  {[
                    {
                      icon: Link2,
                      title: "Fast & Reliable",
                      description: "Generate short links instantly with 99.9% uptime guarantee",
                    },
                    {
                      icon: Copy,
                      title: "Easy Sharing",
                      description: "Copy and share your links across all platforms with one click",
                    },
                    {
                      icon: ExternalLink,
                      title: "Click Tracking",
                      description: "Monitor your link performance with detailed analytics",
                    },
                  ].map((feature, index) => (
                    <div
                      key={feature.title}
                      className="text-center space-y-3 p-4 rounded-lg hover:bg-muted/50 transition-all duration-300 animate-in slide-in-from-bottom-8"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "dashboard" && (
              <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">My Links</h2>
                    <p className="text-muted-foreground mt-1">Manage and track all your shortened URLs</p>
                  </div>
                  <Button
                    onClick={loadMyLinks}
                    variant="outline"
                    size="sm"
                    disabled={isLoadingLinks}
                    className="hover:bg-primary hover:text-primary-foreground transition-colors w-full sm:w-auto bg-transparent"
                  >
                    {isLoadingLinks ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <BarChart3 className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>

                {/* Messages for dashboard */}
                {error && (
                  <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200 animate-in slide-in-from-top-2 duration-300">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Links Table */}
                <Card className="animate-in slide-in-from-bottom-6 duration-700">
                  <CardHeader>
                    <CardTitle>Your Shortened Links</CardTitle>
                    <CardDescription>
                      {myLinks.length} link{myLinks.length !== 1 ? "s" : ""} created
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingLinks ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-3">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                          <p className="text-muted-foreground">Loading your links...</p>
                        </div>
                      </div>
                    ) : myLinks.length === 0 ? (
                      <div className="text-center py-12 animate-in fade-in-0 duration-500">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <Link2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">No links yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                          Create your first short link to get started and track your link performance
                        </p>
                        <Button
                          onClick={() => handleTabChange("shorten")}
                          variant="outline"
                          className="hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          Create Link
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Original URL</TableHead>
                                <TableHead>Short Link</TableHead>
                                <TableHead className="text-center">Clicks</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {myLinks.map((link, index) => (
                                <TableRow
                                  key={link.id}
                                  className="hover:bg-muted/50 transition-colors animate-in slide-in-from-left-4 duration-300"
                                  style={{ animationDelay: `${index * 50}ms` }}
                                >
                                  <TableCell className="max-w-xs">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="cursor-help text-sm hover:text-primary transition-colors">
                                          {truncateUrl(link.originalUrl, 40)}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-sm break-all">{link.originalUrl}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell>
                                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono hover:bg-primary/10 transition-colors">
                                      {link.shortCode}
                                    </code>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant="secondary"
                                      className="font-mono hover:bg-primary hover:text-primary-foreground transition-colors"
                                    >
                                      {link.clickCount}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {formatDate(link.createdAt)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(link.shortUrl)}
                                            className="hover:bg-primary hover:text-primary-foreground transition-colors"
                                          >
                                            <Copy className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Copy link</TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openUrl(link.shortUrl)}
                                            className="hover:bg-primary hover:text-primary-foreground transition-colors"
                                          >
                                            <ExternalLink className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Open link</TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteLink(link.id)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Delete link</TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4">
                          {myLinks.map((link, index) => (
                            <Card
                              key={link.id}
                              className="hover:shadow-md transition-shadow animate-in slide-in-from-bottom-4 duration-300"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <CardContent className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {truncateUrl(link.originalUrl, 30)}
                                    </p>
                                    <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">
                                      {link.shortCode}
                                    </code>
                                  </div>
                                  <Badge variant="secondary" className="font-mono shrink-0">
                                    {link.clickCount}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-muted-foreground">{formatDate(link.createdAt)}</p>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(link.shortUrl)}
                                      className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openUrl(link.shortUrl)}
                                      className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteLink(link.id)}
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                {myLinks.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {[
                      {
                        label: "Total Links",
                        value: myLinks.length,
                        icon: Link2,
                      },
                      {
                        label: "Total Clicks",
                        value: myLinks.reduce((sum, link) => sum + link.clickCount, 0),
                        icon: BarChart3,
                      },
                      {
                        label: "Avg. Clicks",
                        value:
                          myLinks.length > 0
                            ? Math.round(myLinks.reduce((sum, link) => sum + link.clickCount, 0) / myLinks.length)
                            : 0,
                        icon: ExternalLink,
                      },
                    ].map((stat, index) => (
                      <Card
                        key={stat.label}
                        className="hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-bottom-8"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            </div>
                            <stat.icon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
