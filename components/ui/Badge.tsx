import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-accent-green focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent-green/10 text-accent-green",
        secondary:
          "border-transparent bg-accent-purple/10 text-accent-purple",
        destructive:
          "border-transparent bg-red-500/10 text-red-500",
        outline: "text-text-secondary border-border-sutil",
        green: "border-accent-green/20 bg-accent-green/10 text-accent-green",
        purple: "border-accent-purple/20 bg-accent-purple/10 text-accent-purple",
        gray: "border-border-sutil bg-white/5 text-text-secondary",
        amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
        red: "border-red-500/20 bg-red-500/10 text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
