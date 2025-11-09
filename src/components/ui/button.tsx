import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border-2 active:scale-[0.97] touch-target select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 shadow-sm hover:shadow-md active:shadow-sm",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 border-red-400 dark:border-red-600 hover:border-red-500 dark:hover:border-red-500 shadow-sm hover:shadow-md active:shadow-sm",
        outline:
          "border-slate-300 dark:border-slate-600 bg-background text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80 dark:bg-input/30 hover:border-slate-400 dark:hover:border-slate-500",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent/80 dark:hover:bg-accent/50 border-transparent hover:border-slate-300 dark:hover:border-slate-600",
        link: "text-primary underline-offset-4 hover:underline border-transparent active:opacity-80",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3 sm:h-10",
        sm: "h-10 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 sm:h-9",
        lg: "h-12 rounded-md px-6 has-[>svg]:px-4 sm:h-11",
        icon: "size-11 rounded-md sm:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };