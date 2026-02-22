'use client'

/**
 * WobblyButton — FetchAsset Hand-Drawn Design System
 *
 * Implements the "no straight lines" philosophy:
 *  • Irregular border-radius (custom CSS value)
 *  • Hard offset box-shadow (no blur)
 *  • Press-flat active state (shadow disappears)
 *  • Hover: fills accent color, shadow shrinks, translates
 *  • Font: Patrick Hand (body font) — feels human
 *
 * Usage:
 *   <WobblyButton>Submit</WobblyButton>
 *   <WobblyButton variant="secondary" size="lg">Learn More</WobblyButton>
 *   <WobblyButton variant="ghost">Cancel</WobblyButton>
 *   <WobblyButton asChild><a href="/signup">Get Started</a></WobblyButton>
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ── Variant Definitions ───────────────────────────────────────────────
const buttonVariants = cva(
  // ── Base styles (applied to ALL variants) ──────────────────────────
  [
    'inline-flex items-center justify-center gap-2',
    'font-body font-bold',
    'border-[3px] border-ink',
    'cursor-pointer select-none',
    'transition-all duration-100 ease-in-out',
    'relative',
    // Remove default browser button styles
    'appearance-none',
    // Disabled state
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  ],
  {
    variants: {
      // ── Color variants ───────────────────────────────────────────
      variant: {
        /**
         * PRIMARY — White bg, red hover fill, hard black shadow
         * This is the main CTA button.
         */
        primary: [
          'bg-white text-ink',
          'shadow-[4px_4px_0px_0px_#2d2d2d]',
          // Hover: red fill, white text, shadow shrinks, translates
          'hover:bg-accent hover:text-white',
          'hover:shadow-[2px_2px_0px_0px_#2d2d2d]',
          'hover:translate-x-[2px] hover:translate-y-[2px]',
          // Active: flat (shadow gone), further translate
          'active:shadow-none active:translate-x-[4px] active:translate-y-[4px]',
        ],

        /**
         * SECONDARY — Muted paper bg, blue hover fill
         * Use for less-prominent actions.
         */
        secondary: [
          'bg-muted text-ink',
          'shadow-[4px_4px_0px_0px_#2d2d2d]',
          'hover:bg-blue hover:text-white',
          'hover:shadow-[2px_2px_0px_0px_#2d2d2d]',
          'hover:translate-x-[2px] hover:translate-y-[2px]',
          'active:shadow-none active:translate-x-[4px] active:translate-y-[4px]',
        ],

        /**
         * DANGER — White bg, stays accent-red-ish on hover
         * Use for destructive actions.
         */
        danger: [
          'bg-white text-accent border-accent',
          'shadow-[4px_4px_0px_0px_#ff4d4d]',
          'hover:bg-accent hover:text-white',
          'hover:shadow-[2px_2px_0px_0px_#ff4d4d]',
          'hover:translate-x-[2px] hover:translate-y-[2px]',
          'active:shadow-none active:translate-x-[4px] active:translate-y-[4px]',
        ],

        /**
         * GHOST — No background, no shadow, minimal feel
         * Use inside menus or where space is tight.
         */
        ghost: [
          'bg-transparent text-ink border-transparent shadow-none',
          'hover:bg-muted hover:border-ink',
          'active:bg-muted/70',
        ],

        /**
         * POSTIT — Post-it yellow, fun tertiary action
         */
        postit: [
          'bg-postit text-ink',
          'shadow-[4px_4px_0px_0px_#2d2d2d]',
          'hover:bg-postit/70',
          'hover:shadow-[2px_2px_0px_0px_#2d2d2d]',
          'hover:translate-x-[2px] hover:translate-y-[2px]',
          'active:shadow-none active:translate-x-[4px] active:translate-y-[4px]',
        ],
      },

      // ── Size variants ─────────────────────────────────────────────
      size: {
        sm:  'h-9 px-4 text-sm',
        md:  'h-11 px-5 text-base',
        lg:  'h-13 px-7 text-lg',
        xl:  'h-16 px-9 text-xl',
        // Icon-only button
        icon: 'h-10 w-10 p-0',
      },
    },

    // ── Default variants ──────────────────────────────────────────────
    defaultVariants: {
      variant: 'primary',
      size:    'md',
    },
  }
)

// ── Props ─────────────────────────────────────────────────────────────
export interface WobblyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * When true, renders the child element as the button instead of a <button>.
   * Useful for wrapping <a> tags or Next.js <Link> components.
   */
  asChild?: boolean
  /**
   * Override which wobbly radius preset to use.
   * - 'btn': tight wobbly oval (default for buttons)
   * - 'sm':  slightly larger wobbly
   */
  radiusPreset?: 'btn' | 'sm'
  /**
   * Optional loading state — disables button and shows spinner.
   */
  loading?: boolean
}

// ── Component ─────────────────────────────────────────────────────────
const WobblyButton = React.forwardRef<HTMLButtonElement, WobblyButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      radiusPreset = 'btn',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    // Wobbly radius presets — the core "no straight lines" rule
    const radiusMap: Record<string, string> = {
      btn: '255px 15px 225px 15px / 15px 225px 15px 255px',
      sm:  '245px 18px 200px 20px / 22px 210px 14px 240px',
    }

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        style={{ borderRadius: radiusMap[radiusPreset] }}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            {/* Hand-drawn style loading spinner */}
            <svg
              className="animate-spin h-4 w-4 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)

WobblyButton.displayName = 'WobblyButton'

export { WobblyButton, buttonVariants }
