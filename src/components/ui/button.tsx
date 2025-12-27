import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-glow-primary hover:shadow-[0_0_30px_hsl(var(--primary)/0.6),0_0_60px_hsl(var(--primary)/0.3)] hover:scale-105 active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary/10 hover:shadow-glow-primary",
        secondary:
          "neu-flat text-secondary-foreground hover:shadow-neu-lg hover:scale-[1.02] active:shadow-neu-pressed active:scale-[0.98]",
        ghost:
          "hover:bg-secondary/50 hover:text-secondary-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        neu:
          "neu-convex text-foreground hover:shadow-neu-lg hover:scale-[1.02] active:neu-pressed active:scale-[0.98]",
        "neu-primary":
          "bg-primary text-primary-foreground shadow-glow-primary hover:animate-pulse-glow hover:scale-105 active:scale-95",
        hero:
          "bg-primary text-primary-foreground shadow-glow-primary text-base font-semibold px-8 py-4 hover:shadow-[0_0_40px_hsl(var(--primary)/0.6),0_0_80px_hsl(var(--primary)/0.3)] hover:scale-105 active:scale-95",
        "hero-outline":
          "border-2 border-primary/50 text-foreground bg-background/50 backdrop-blur-sm hover:border-primary hover:shadow-glow-primary hover:scale-105 active:scale-95",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8",
        xl: "h-14 rounded-2xl px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
