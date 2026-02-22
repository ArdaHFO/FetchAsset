import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility for merging Tailwind CSS class names.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate an inline border-radius style object for wobbly shapes.
 * Pass one of the design system presets or a custom CSS value.
 */
export function wobblyRadius(
  preset: 'btn' | 'sm' | 'md' | 'lg' = 'sm'
): React.CSSProperties {
  const map = {
    btn: '255px 15px 225px 15px / 15px 225px 15px 255px',
    sm:  '245px 18px 200px 20px / 22px 210px 14px 240px',
    md:  '220px 30px 240px 20px / 25px 230px 20px 215px',
    lg:  '180px 45px 200px 35px / 40px 190px 30px 170px',
  }
  return { borderRadius: map[preset] }
}
