import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-brand text-brand-dark hover:bg-brand-hover disabled:opacity-50",
  secondary:
    "border border-edge-strong text-ink-secondary hover:border-ink-muted disabled:opacity-50",
  danger:
    "border border-danger-bg text-danger hover:bg-danger/10 disabled:opacity-50",
  ghost: "text-ink-muted hover:text-ink-primary disabled:opacity-50",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-6 py-3 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-xl font-semibold transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
}
