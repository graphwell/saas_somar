import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold transition-base disabled:pointer-events-none disabled:opacity-50 active:scale-95 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-linear-to-br from-accent-green to-[#00B070] text-bg-base hover:brightness-110 hover:-translate-y-0.5 shadow-lg shadow-accent-green/20",
        destructive:
          "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
        outline:
          "border border-border-elevated bg-transparent text-text-secondary hover:text-text-primary hover:border-text-primary/20",
        secondary:
          "bg-bg-elevated text-text-primary hover:bg-bg-elevated/80 border border-border-sutil",
        ghost: "text-text-secondary hover:text-text-primary hover:bg-white/5",
        link: "text-accent-green underline-offset-4 hover:underline",
        premium: "bg-linear-to-r from-accent-green to-accent-purple text-bg-base hover:brightness-110 shadow-lg shadow-accent-purple/20",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 rounded-md text-xs",
        lg: "h-14 px-10 text-base rounded-xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
