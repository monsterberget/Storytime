import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const baseStyles =
  "w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500";

export function Input({ className = "", ...props }: InputProps) {
  return <input {...props} className={`${baseStyles} ${className}`} />;
}

export function Textarea({ className = "", ...props }: TextareaProps) {
  return <textarea {...props} className={`${baseStyles} ${className}`} />;
}
