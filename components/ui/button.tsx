import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[3px] text-sm font-semibold tracking-tight ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F86531] focus-visible:ring-offset-2 focus-visible:ring-offset-[#091522] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary CTA: solid ember orange
        default:
          "bg-[#F86531] text-white hover:bg-[#ff7340] hover:shadow-[0_0_28px_rgba(248,101,49,0.45)]",

        // Focal CTA: signature gradient (use sparingly)
        cosmic:
          "bg-[linear-gradient(135deg,#F86531_0%,#C42F35_100%)] text-white hover:brightness-110 hover:shadow-[0_0_28px_rgba(248,101,49,0.4)]",
        gradient:
          "bg-[linear-gradient(135deg,#F86531_0%,#C42F35_100%)] text-white hover:brightness-110 hover:shadow-[0_0_28px_rgba(248,101,49,0.4)]",
        glow:
          "bg-[#F86531] text-white shadow-[0_0_28px_rgba(248,101,49,0.4)] hover:bg-[#ff7340] hover:shadow-[0_0_40px_rgba(248,101,49,0.6)]",

        // Hairline secondary
        outline:
          "border border-white/[0.16] bg-transparent text-[#F8FAFC] hover:border-[#F86531] hover:text-[#F86531] hover:bg-[#F86531]/[0.06]",

        ghost: "text-[#94A3B8] hover:bg-white/[0.05] hover:text-[#F8FAFC]",

        destructive:
          "bg-[#C42F35] text-white hover:bg-[#d93a40]",

        link: "text-[#F86531] underline-offset-4 hover:underline hover:text-[#ff7340]",
      },
      size: {
        default: "h-11 px-6 text-sm",
        sm: "h-9 rounded-[3px] px-4 text-sm",
        lg: "h-12 rounded-[3px] px-8 text-base",
        xl: "h-14 rounded-[3px] px-10 text-lg",
        icon: "h-10 w-10",
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
  (
    {
      className,
      variant,
      size,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
