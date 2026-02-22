'use client'

/**
 * WobblyInput — FetchAsset Hand-Drawn Design System
 *
 * Form input components that match the hand-drawn aesthetic:
 *  • Full wobbly border box (not just underline)
 *  • Patrick Hand font for authentic handwritten feel
 *  • Focus: blue border + soft ring (no standard outline)
 *  • Error state: red accent border + error message
 *  • Supports all standard HTML input types
 *
 * Also exports:
 *   WobblyTextarea  — multiline text input
 *   WobblyLabel     — styled form label
 *   WobblySelect    — styled dropdown
 *   WobblyFormField — label + input + error wrapped together
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

// ── Shared wobbly radius for inputs ───────────────────────────────────
const INPUT_RADIUS = '245px 18px 200px 20px / 22px 210px 14px 240px'

// ── Base input styles ─────────────────────────────────────────────────
const inputVariants = cva(
  [
    // Layout
    'w-full flex',
    // Typography
    'font-body text-ink placeholder:text-ink/40',
    // Border
    'border-[3px] border-ink',
    // Background
    'bg-white',
    // Transition
    'transition-all duration-150 ease-in-out',
    // Remove default browser styles
    'appearance-none outline-none',
    // Disabled
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted',
  ],
  {
    variants: {
      // Size
      size: {
        sm:  'h-9  px-3 text-sm',
        md:  'h-11 px-4 text-base',
        lg:  'h-13 px-5 text-lg',
      },
      // State
      state: {
        default: [
          // Focus: blue border + subtle ring
          'focus:border-blue focus:ring-2 focus:ring-blue/20',
        ],
        error: [
          'border-accent',
          'focus:border-accent focus:ring-2 focus:ring-accent/20',
        ],
        success: [
          'border-green-600',
          'focus:border-green-600 focus:ring-2 focus:ring-green-600/20',
        ],
      },
    },
    defaultVariants: {
      size:  'md',
      state: 'default',
    },
  }
)

// ── WobblyInput ───────────────────────────────────────────────────────
export interface WobblyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Shows a red error border */
  error?: boolean
  /** Shows a green success border */
  success?: boolean
  /** Optional left icon (renders inside border, left side) */
  leftIcon?: React.ReactNode
  /** Optional right icon (renders inside border, right side) */
  rightIcon?: React.ReactNode
}

const WobblyInput = React.forwardRef<HTMLInputElement, WobblyInputProps>(
  (
    {
      className,
      size,
      error,
      success,
      leftIcon,
      rightIcon,
      style,
      ...props
    },
    ref
  ) => {
    const stateVariant = error ? 'error' : success ? 'success' : 'default'

    // If there are icons, wrap in a relative container
    if (leftIcon || rightIcon) {
      return (
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50 pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              inputVariants({ size, state: stateVariant }),
              leftIcon  && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            style={{ borderRadius: INPUT_RADIUS, ...style }}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/50 pointer-events-none flex items-center">
              {rightIcon}
            </span>
          )}
        </div>
      )
    }

    return (
      <input
        ref={ref}
        className={cn(inputVariants({ size, state: stateVariant }), className)}
        style={{ borderRadius: INPUT_RADIUS, ...style }}
        {...props}
      />
    )
  }
)
WobblyInput.displayName = 'WobblyInput'

// ── WobblyTextarea ────────────────────────────────────────────────────
export interface WobblyTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  success?: boolean
}

const WobblyTextarea = React.forwardRef<
  HTMLTextAreaElement,
  WobblyTextareaProps
>(({ className, error, success, style, ...props }, ref) => {
  const stateVariant = error ? 'error' : success ? 'success' : 'default'

  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full font-body text-ink placeholder:text-ink/40',
        'border-[3px] border-ink bg-white',
        'px-4 py-3 min-h-[120px] resize-y',
        'transition-all duration-150 ease-in-out',
        'appearance-none outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted',
        // State styles
        stateVariant === 'default' && 'focus:border-blue focus:ring-2 focus:ring-blue/20',
        stateVariant === 'error'   && 'border-accent focus:border-accent focus:ring-2 focus:ring-accent/20',
        stateVariant === 'success' && 'border-green-600 focus:border-green-600 focus:ring-2 focus:ring-green-600/20',
        className
      )}
      style={{
        // Use medium wobbly radius for textarea
        borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px',
        ...style,
      }}
      {...props}
    />
  )
})
WobblyTextarea.displayName = 'WobblyTextarea'

// ── WobblyLabel ───────────────────────────────────────────────────────
export interface WobblyLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

const WobblyLabel = React.forwardRef<HTMLLabelElement, WobblyLabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('inline-block font-body font-bold text-ink text-sm mb-1.5', className)}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-accent" aria-label="required">
          *
        </span>
      )}
    </label>
  )
)
WobblyLabel.displayName = 'WobblyLabel'

// ── WobblySelect ──────────────────────────────────────────────────────
export interface WobblySelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

const WobblySelect = React.forwardRef<HTMLSelectElement, WobblySelectProps>(
  ({ className, error, style, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full h-11 px-4 font-body text-ink',
        'border-[3px] border-ink bg-white',
        'transition-all duration-150 ease-in-out',
        'appearance-none outline-none cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error
          ? 'border-accent focus:border-accent focus:ring-2 focus:ring-accent/20'
          : 'focus:border-blue focus:ring-2 focus:ring-blue/20',
        className
      )}
      style={{ borderRadius: INPUT_RADIUS, ...style }}
      {...props}
    />
  )
)
WobblySelect.displayName = 'WobblySelect'

// ── WobblyFormField ───────────────────────────────────────────────────
/**
 * Convenience wrapper: label + input + optional error message.
 *
 * Usage:
 *   <WobblyFormField label="Client Name" required errorMessage="Name is required">
 *     <WobblyInput placeholder="e.g. Acme Corp" error />
 *   </WobblyFormField>
 */
export interface WobblyFormFieldProps {
  label?: string
  htmlFor?: string
  required?: boolean
  errorMessage?: string
  helperText?: string
  className?: string
  children: React.ReactNode
}

const WobblyFormField: React.FC<WobblyFormFieldProps> = ({
  label,
  htmlFor,
  required,
  errorMessage,
  helperText,
  className,
  children,
}) => (
  <div className={cn('flex flex-col gap-1', className)}>
    {label && (
      <WobblyLabel htmlFor={htmlFor} required={required}>
        {label}
      </WobblyLabel>
    )}
    {children}
    {errorMessage && (
      <p className="font-body text-sm text-accent mt-0.5 flex items-center gap-1">
        <span aria-hidden>✗</span> {errorMessage}
      </p>
    )}
    {helperText && !errorMessage && (
      <p className="font-body text-sm text-ink/50 mt-0.5">{helperText}</p>
    )}
  </div>
)
WobblyFormField.displayName = 'WobblyFormField'

// ── Exports ───────────────────────────────────────────────────────────
export {
  WobblyInput,
  WobblyTextarea,
  WobblyLabel,
  WobblySelect,
  WobblyFormField,
  inputVariants,
}
