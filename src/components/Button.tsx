import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-50",
  secondary:
    "border border-zinc-700 text-zinc-300 hover:border-zinc-500 disabled:opacity-50",
  danger:
    "border border-red-900 text-red-400 hover:bg-red-500/10 disabled:opacity-50",
  ghost: "text-zinc-400 hover:text-zinc-100 disabled:opacity-50",
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
