"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Filter, Share2, Plus, User, LogOut } from "lucide-react"

type EventType = "Major" | "Minor" | "Other"

interface TimelineEvent {
  id: string
  date: string
  type: EventType
  title: string
  description?: string
  tags?: string
}

const mockEvents: TimelineEvent[] = [
  {
    id: "1",
    date: "Oct 14, 2025",
    type: "Major",
    title: "Hanging with Jackson",
    description: "Yay!!",
    tags: "fun times and learning",
  },
  {
    id: "2",
    date: "Oct 1, 2025",
    type: "Major",
    title: "test",
  },
  {
    id: "3",
    date: "Sep 10, 2025",
    type: "Minor",
    title: "minor",
  },
]

type ThemeVariant = "minimal" | "rounded" | "outlined" | "colorful"

const themeConfig = {
  minimal: {
    name: "Minimal",
    badgeClass: "rounded-sm border-border bg-muted text-muted-foreground",
    buttonClass: "rounded-sm",
    cardClass: "rounded-sm",
  },
  rounded: {
    name: "Rounded",
    badgeClass: "rounded-full border-border bg-secondary text-secondary-foreground",
    buttonClass: "rounded-full",
    cardClass: "rounded-2xl",
  },
  outlined: {
    name: "Outlined",
    badgeClass: "rounded-md border-2 border-foreground/20 bg-transparent text-foreground",
    buttonClass: "rounded-md border-2",
    cardClass: "rounded-lg border-2",
  },
  colorful: {
    name: "Colorful",
    badgeClass: "rounded-lg",
    buttonClass: "rounded-lg",
    cardClass: "rounded-xl",
  },
}

export default function TimelinePage() {
  const [theme, setTheme] = useState<ThemeVariant>("minimal")
  const config = themeConfig[theme]

  const getBadgeColor = (type: EventType) => {
    if (theme === "colorful") {
      switch (type) {
        case "Major":
          return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
        case "Minor":
          return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
        case "Other":
          return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
      }
    }
    return config.badgeClass
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Mily</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className={config.buttonClass}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" size="sm" className={config.buttonClass}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-medium text-foreground">My Timeline</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className={config.buttonClass}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className={config.buttonClass}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button size="sm" className={config.buttonClass}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="mb-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-3 text-muted-foreground">Theme Variations:</p>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(themeConfig) as ThemeVariant[]).map((variant) => (
              <Button
                key={variant}
                variant={theme === variant ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme(variant)}
                className={themeConfig[variant].buttonClass}
              >
                {themeConfig[variant].name}
              </Button>
            ))}
          </div>
        </div>

        {/* Horizontal Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-border" />

          {/* Timeline Events */}
          <div className="flex gap-8 overflow-x-auto pb-4">
            {mockEvents.map((event, index) => (
              <div key={event.id} className="flex-shrink-0 w-80 relative">
                {/* Timeline Dot */}
                <div className="absolute top-5 left-0 w-4 h-4 rounded-full bg-background border-2 border-foreground z-10" />

                {/* Date and Badge */}
                <div className="flex items-center gap-3 mb-4 pl-6">
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">{event.date}</span>
                  <Badge variant="outline" className={getBadgeColor(event.type)}>
                    {event.type}
                  </Badge>
                </div>

                {/* Event Card */}
                <Card className={`p-6 ml-6 ${config.cardClass}`}>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{event.title}</h3>
                  {event.description && <p className="text-base text-foreground mb-3">{event.description}</p>}
                  {event.tags && <p className="text-sm italic text-muted-foreground">{event.tags}</p>}
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Design Notes */}
        <div className="mt-12 p-6 bg-muted/30 rounded-lg border border-border">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Design Philosophy</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>
              <strong className="text-foreground">Minimal:</strong> Clean lines, subtle colors, sharp corners - focuses
              attention on content
            </li>
            <li>
              <strong className="text-foreground">Rounded:</strong> Softer, more approachable with rounded badges and
              cards
            </li>
            <li>
              <strong className="text-foreground">Outlined:</strong> Emphasizes structure with prominent borders
            </li>
            <li>
              <strong className="text-foreground">Colorful:</strong> Selective pops of color to differentiate event
              types
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
