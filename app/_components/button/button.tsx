"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@lib/utils";

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

const getVariantClasses = (variant: ButtonVariant): string => {
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
    destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800",
    ghost: "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
    link: "text-blue-600 underline-offset-4 hover:underline active:text-blue-800",
  };
  return variants[variant];
};

const getSizeClasses = (size: ButtonSize): string => {
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3 text-xs",
    lg: "h-11 rounded-md px-8 text-base",
    icon: "h-10 w-10",
  };
  return sizes[size];
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({
  className,
  variant = "default",
  size = "default",
  children,
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  return (
    <button
      className={cn(
        baseClasses,
        getVariantClasses(variant),
        getSizeClasses(size),
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
