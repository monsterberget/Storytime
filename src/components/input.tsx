import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const baseStyles =
  "w-full rounded-xl border border-edge-strong bg-surface-raised px-4 py-3 text-sm text-ink-primary placeholder-ink-disabled focus:outline-none focus:ring-2 focus:ring-brand";

export function Input({ className = "", ...props }: InputProps) {
  return <input {...props} className={`${baseStyles} ${className}`} />;
}

export function Textarea({ className = "", ...props }: TextareaProps) {
  return <textarea {...props} className={`${baseStyles} ${className}`} />;
}
