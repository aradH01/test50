"use client";

import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@lib/utils";

export type InputVariant = "default" | "error" | "success" | "ghost";
export type InputSize = "default" | "sm" | "lg";

const getVariantClasses = (variant: InputVariant): string => {
  const variants = {
    default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
    error:
      "border-red-500 focus:border-red-500 focus:ring-red-500 text-red-900 placeholder-red-300",
    success:
      "border-green-500 focus:border-green-500 focus:ring-green-500 text-green-900",
    ghost:
      "border-transparent focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-gray-100",
  };
  return variants[variant];
};

const getSizeClasses = (size: InputSize): string => {
  const sizes = {
    default: "h-10 px-3 py-2 text-sm",
    sm: "h-8 px-2 py-1 text-xs",
    lg: "h-12 px-4 py-3 text-base",
  };
  return sizes[size];
};

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: string;
  success?: string;
  helpText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      label,
      error,
      success,
      helpText,
      leftIcon,
      rightIcon,
      disabled,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const hasError = error || variant === "error";
    const hasSuccess = success || variant === "success";

    // Override variant if error or success props are provided
    const finalVariant = hasError ? "error" : hasSuccess ? "success" : variant;

    const baseClasses =
      "block w-full rounded-md border bg-white shadow-sm transition-colors focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

    const inputContent = (
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            baseClasses,
            getVariantClasses(finalVariant),
            getSizeClasses(size),
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className,
          )}
          disabled={disabled}
          aria-describedby={
            error
              ? `${inputId}-error`
              : success
                ? `${inputId}-success`
                : helpText
                  ? `${inputId}-help`
                  : undefined
          }
          aria-invalid={hasError ? "true" : "false"}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
    );

    if (label || error || success || helpText) {
      return (
        <div className="space-y-1">
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "block text-sm font-medium",
                hasError
                  ? "text-red-700"
                  : hasSuccess
                    ? "text-green-700"
                    : "text-gray-700",
                disabled && "text-gray-400",
              )}
            >
              {label}
            </label>
          )}
          {inputContent}
          {error && (
            <p id={`${inputId}-error`} className="text-sm text-red-600">
              {error}
            </p>
          )}
          {success && !error && (
            <p id={`${inputId}-success`} className="text-sm text-green-600">
              {success}
            </p>
          )}
          {helpText && !error && !success && (
            <p id={`${inputId}-help`} className="text-sm text-gray-500">
              {helpText}
            </p>
          )}
        </div>
      );
    }

    return inputContent;
  },
);

Input.displayName = "Input";
