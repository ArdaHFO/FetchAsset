'use client'

/**
 * WobblyCard — FetchAsset Hand-Drawn Design System
 *
 * A versatile container that embodies the hand-drawn aesthetic:
 *  • Irregular wobbly border-radius (never geometric)
 *  • Hard offset shadow (no blur)
 *  • Optional "tape" decoration (gray tape strip at top)
 *  • Optional "tack" decoration (red thumbtack pin at top)
 *  • Optional rotation (casual, de-aligned feel)
 *  • Hover: card lifts (shadow grows, slight scale)
 *
 * Compound API (similar to Shadcn):
 *   <WobblyCard>
 *     <WobblyCardHeader>...</WobblyCardHeader>
 *     <WobblyCardContent>...</WobblyCardContent>
 *     <WobblyCardFooter>...</WobblyCardFooter>
 *   </WobblyCard>
 *
 * Or a simple single-root version:
 *   <WobblyCard decoration="tape" flavor="postit">...</WobblyCard>
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

// ── Variant Definitions ───────────────────────────────────────────────
const cardVariants = cva(
  // Base
  [
    'relative',
    'border-[3px] border-ink',
    'bg-white',
    'transition-all duration-150 ease-in-out',
    'overflow-visible', // needed so tape/tack can overflow parent
  ],
  {
    variants: {
      // ── Color flavors ─────────────────────────────────────────────
      flavor: {
        /** Default: clean white paper */
        default: 'bg-white',
        /** Post-it note yellow */
        postit:  'bg-postit',
        /** Old paper / muted parchment */
        muted:   'bg-muted',
        /** Accent red — use sparingly for alerts / callouts */
        accent:  'bg-accent text-white border-accent',
        /** Blueprint blue */
        blue:    'bg-blue text-white border-blue',
      },

      // ── Shadow weight ─────────────────────────────────────────────
      shadow: {
        none:    'shadow-none',
        sm:      'shadow-[2px_2px_0px_0px_#2d2d2d]',
        DEFAULT: 'shadow-[4px_4px_0px_0px_#2d2d2d]',
        lg:      'shadow-[8px_8px_0px_0px_#2d2d2d]',
        xl:      'shadow-[12px_12px_0px_0px_#2d2d2d]',
        card:    'shadow-[3px_3px_0px_0px_rgba(45,45,45,0.15)]',
      },

      // ── Size / padding preset ─────────────────────────────────────
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8 md:p-10',
      },

      // ── Radius preset ─────────────────────────────────────────────
      radius: {
        sm: 'rounded-wobbly',
        md: 'rounded-wobbly-md',
        lg: 'rounded-wobbly-lg',
      },

      // ── Hover lift effect ─────────────────────────────────────────
      hoverable: {
        true: [
          'cursor-pointer',
          'hover:shadow-[8px_8px_0px_0px_#2d2d2d]',
          'hover:-translate-y-1',
          'hover:rotate-[0.5deg]',
        ],
        false: '',
      },

      // ── Rotation (casual de-alignment) ────────────────────────────
      rotate: {
        none:    'rotate-0',
        '1':     'rotate-[1deg]',
        '-1':    'rotate-[-1deg]',
        '2':     'rotate-[2deg]',
        '-2':    'rotate-[-2deg]',
        '-0.5':  'rotate-[-0.5deg]',
        '0.5':   'rotate-[0.5deg]',
      },
    },

    defaultVariants: {
      flavor:    'default',
      shadow:    'DEFAULT',
      size:      'md',
      radius:    'md',
      hoverable: false,
      rotate:    'none',
    },
  }
)

// ── Decoration element radii (wobbly) ─────────────────────────────────
const RADIUS_PRESETS = {
  sm: '245px 18px 200px 20px / 22px 210px 14px 240px',
  md: '220px 30px 240px 20px / 25px 230px 20px 215px',
  lg: '180px 45px 200px 35px / 40px 190px 30px 170px',
} as const

// ── Props ─────────────────────────────────────────────────────────────
export interface WobblyCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Decorative element rendered outside/on-top of the card.
   * - 'tape': translucent gray tape strip at top center
   * - 'tack': red thumbtack pin at top center
   * - 'none': no decoration (default)
   */
  decoration?: 'tape' | 'tack' | 'none'
}

// ── WobblyCard (root) ─────────────────────────────────────────────────
const WobblyCard = React.forwardRef<HTMLDivElement, WobblyCardProps>(
  (
    {
      className,
      flavor,
      shadow,
      size,
      radius = 'md',
      hoverable,
      rotate,
      decoration = 'none',
      style,
      children,
      ...props
    },
    ref
  ) => {
    const radiusValue = RADIUS_PRESETS[radius ?? 'md']

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ flavor, shadow, size, radius, hoverable, rotate }), className)}
        style={{ borderRadius: radiusValue, ...style }}
        {...props}
      >
        {/* Tape decoration */}
        {decoration === 'tape' && (
          <div
            aria-hidden="true"
            className="absolute -top-3 left-1/2 -translate-x-1/2 -rotate-1 z-10 pointer-events-none"
            style={{
              width: '64px',
              height: '22px',
              background: 'rgba(200,200,200,0.55)',
              borderRadius: '2px',
              border: '1px solid rgba(150,150,150,0.4)',
            }}
          />
        )}

        {/* Thumbtack decoration */}
        {decoration === 'tack' && (
          <div
            aria-hidden="true"
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
            style={{
              width: '16px',
              height: '16px',
              background: '#ff4d4d',
              borderRadius: '50%',
              border: '2px solid #2d2d2d',
              boxShadow: '1px 1px 0px #2d2d2d',
            }}
          />
        )}

        {children}
      </div>
    )
  }
)
WobblyCard.displayName = 'WobblyCard'

// ── WobblyCardHeader ──────────────────────────────────────────────────
const WobblyCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5 pb-4 border-b-2 border-dashed border-muted mb-4', className)}
    {...props}
  />
))
WobblyCardHeader.displayName = 'WobblyCardHeader'

// ── WobblyCardTitle ───────────────────────────────────────────────────
const WobblyCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-heading text-xl text-ink leading-tight', className)}
    {...props}
  />
))
WobblyCardTitle.displayName = 'WobblyCardTitle'

// ── WobblyCardDescription ─────────────────────────────────────────────
const WobblyCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('font-body text-sm text-ink/70', className)}
    {...props}
  />
))
WobblyCardDescription.displayName = 'WobblyCardDescription'

// ── WobblyCardContent ─────────────────────────────────────────────────
const WobblyCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('font-body text-ink', className)}
    {...props}
  />
))
WobblyCardContent.displayName = 'WobblyCardContent'

// ── WobblyCardFooter ──────────────────────────────────────────────────
const WobblyCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center gap-3 pt-4 mt-4 border-t-2 border-dashed border-muted',
      className
    )}
    {...props}
  />
))
WobblyCardFooter.displayName = 'WobblyCardFooter'

// ── Exports ───────────────────────────────────────────────────────────
export {
  WobblyCard,
  WobblyCardHeader,
  WobblyCardTitle,
  WobblyCardDescription,
  WobblyCardContent,
  WobblyCardFooter,
  cardVariants,
}
