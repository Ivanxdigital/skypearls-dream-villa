import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const buttonRef = React.useRef<HTMLButtonElement>(null)

    // Ripple effect handler
    const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = buttonRef.current
      if (!button) return
      const circle = document.createElement("span")
      const diameter = Math.max(button.clientWidth, button.clientHeight)
      circle.style.width = circle.style.height = `${diameter}px`
      circle.className = "absolute pointer-events-none rounded-full bg-skypearl opacity-30 animate-ripple"
      circle.style.left = `${e.clientX - button.getBoundingClientRect().left - diameter / 2}px`
      circle.style.top = `${e.clientY - button.getBoundingClientRect().top - diameter / 2}px`
      circle.setAttribute("data-testid", "ripple")
      button.appendChild(circle)
      circle.addEventListener("animationend", () => circle.remove())
    }

    return (
      <Comp
        ref={(node) => {
          if (!asChild) buttonRef.current = node as HTMLButtonElement
          if (typeof ref === "function") ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node as HTMLButtonElement
        }}
        className={cn(
          buttonVariants({ variant, size, className }),
          "relative overflow-hidden transition-all duration-300 ease-in-out"
        )}
        onClick={(e: any) => {
          if (!asChild) handleRipple(e)
          if (props.onClick) props.onClick(e)
        }}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
