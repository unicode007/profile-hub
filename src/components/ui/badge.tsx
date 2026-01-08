import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-xl border px-3 py-1 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25",
        outline: "text-foreground border-border",
        admin: "border-transparent bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30",
        master: "border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30",
        user: "border-transparent bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30",
        language: "border-transparent bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30",
        success: "border-transparent bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
