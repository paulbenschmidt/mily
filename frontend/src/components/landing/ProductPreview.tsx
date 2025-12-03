export function ProductPreview() {
  return (
    <div className="relative origin-top-left lg:origin-top">
      {/* Subtle glow effect */}
      <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />

      {/* Card frame */}
      <div className="relative bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-border" />
            <div className="w-3 h-3 rounded-full bg-border" />
            <div className="w-3 h-3 rounded-full bg-border" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-background rounded-md px-3 py-1 text-xs text-muted-foreground">mily.bio/timeline</div>
          </div>
        </div>

        {/* Product screenshot placeholder - showing actual app UI */}
        <div className="p-4 bg-background">
          {/* Timeline header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-foreground">My Timeline</span>
            <div className="flex gap-2">
              <span className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground">Filter</span>
              <span className="text-xs bg-primary px-2 py-1 rounded text-primary-foreground">+ Add Event</span>
            </div>
          </div>

          {/* Timeline bar */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs text-muted-foreground">1990</span>
            <div className="flex-1 h-1 bg-muted rounded-full relative">
              <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/40" />
              <div className="absolute left-[25%] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/30" />
              <div className="absolute left-[40%] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary/50" />
              <div className="absolute left-[55%] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/30" />
              <div className="absolute left-[70%] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary/60" />
              <div className="absolute left-[85%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/40" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary" />
            </div>
            <span className="text-xs text-muted-foreground">2025</span>
          </div>

          {/* Event cards */}
          <div className="space-y-3">
            {/* Event 1 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <div className="w-px h-full bg-border" />
              </div>
              <div className="flex-1 bg-card border border-border rounded-lg p-3 shadow-sm">
                <span className="text-[10px] text-primary font-medium">2025 SEP 29</span>
                <h4 className="text-sm font-medium text-foreground mt-0.5">Became a parent</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  Emma arrived at 3:42am. Nothing could have prepared me for the love...
                </p>
              </div>
            </div>

            {/* Event 2 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-primary/60" />
                <div className="w-px h-full bg-border" />
              </div>
              <div className="flex-1 bg-card border border-border rounded-lg p-3 shadow-sm">
                <span className="text-[10px] text-primary font-medium">2016 MAR 22</span>
                <h4 className="text-sm font-medium text-foreground mt-0.5">Moved to New York</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  From the small town to the big city, we were ready for a new adventure...
                </p>
              </div>
            </div>

            {/* Event 3 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <div className="w-px h-full bg-border" />
              </div>
              <div className="flex-1 bg-card border border-border rounded-lg p-3 shadow-sm">
                <span className="text-[10px] text-primary font-medium">2012 JUL 14</span>
                <h4 className="text-sm font-medium text-foreground mt-0.5">Got married</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  Married my best friend in a small ceremony surrounded by loved ones...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
