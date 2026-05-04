import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { isPremium?: boolean }
>(({ className, isPremium, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-border-sutil bg-bg-surface p-8 transition-base",
      isPremium && "premium-border",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

export { Card }
