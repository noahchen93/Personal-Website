import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-slate-700 text-white hover:bg-slate-600 active:bg-slate-800 shadow-lg shadow-slate-500/20 hover:shadow-slate-500/30 border border-slate-600/50 rounded-lg",
        destructive:
          "bg-red-700 text-white hover:bg-red-600 active:bg-red-800 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 border border-red-600/50 rounded-lg",
        outline:
          "border-2 border-blue-400/50 bg-slate-800/50 text-white hover:bg-slate-700/80 hover:border-blue-400/70 active:bg-slate-600/80 rounded-lg backdrop-blur-sm",
        secondary:
          "bg-slate-600 text-white hover:bg-slate-500 active:bg-slate-700 shadow-lg shadow-slate-500/20 hover:shadow-slate-500/30 border border-slate-500/50 rounded-lg",
        ghost:
          "text-white hover:bg-slate-700/50 hover:text-white active:bg-slate-600/50 rounded-lg",
        link: "text-blue-400 underline-offset-4 hover:underline hover:text-blue-300 rounded-lg",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 px-3 gap-1.5 has-[>svg]:px-2.5 text-xs rounded-md",
        lg: "h-11 px-6 has-[>svg]:px-4 text-base rounded-xl",
        icon: "size-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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
        className={cn(
          buttonVariants({ variant, size }),
          "font-terminal text-small rounded",
          className
        )}
        ref={ref}
        data-slot="button"
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };