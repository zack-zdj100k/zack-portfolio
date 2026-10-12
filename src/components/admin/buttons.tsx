"use client";

import { useFormStatus } from "react-dom";

const styles = {
  primary: "bg-mist text-ink hover:bg-white",
  secondary: "border border-line text-mist hover:border-ice/60",
  danger: "border border-danger/50 text-danger hover:bg-danger/10",
};

/** Submit button that shows a pending state while its server action runs. */
export function SubmitButton({
  children,
  variant = "primary",
  name,
  value,
  formAction,
  confirm,
  className = "",
  ariaLabel,
  pendingText = "Saving...",
}: {
  children: React.ReactNode;
  variant?: keyof typeof styles;
  name?: string;
  value?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  /** Asks for confirmation first (used for destructive actions). */
  confirm?: string;
  className?: string;
  /** For icon-only buttons. */
  ariaLabel?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      formAction={formAction}
      aria-label={ariaLabel}
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors disabled:cursor-wait disabled:opacity-60 ${styles[variant]} ${className}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
