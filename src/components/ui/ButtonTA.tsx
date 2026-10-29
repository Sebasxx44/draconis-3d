import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// ─── Variants ─────────────────────────────────────────────────────────────────
const buttonVariants = cva("button-ta", {
  variants: {
    variant: {
      primary: "button-primary",
      outline: "button-outline",
      text: "button-text",
    },
  },
  defaultVariants: { variant: "primary" },
});

// ─── Types ────────────────────────────────────────────────────────────────────
type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

// ─── Component ────────────────────────────────────────────────────────────────
export const ButtonTA = ({
  className,
  variant,
  asChild = false,
  ...props
}: ButtonProps) => {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  );
};
