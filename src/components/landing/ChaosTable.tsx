/**
 * ChaosTable — "The Old Way vs. The FetchAsset Way" comparison.
 * Static server component — no interactivity needed.
 */
import { X, Check } from 'lucide-react'

const ROWS: { bad: string; good: string; tag: string }[] = [
  {
    bad:  '50+ emails just to collect files',
    good: 'One magic link — client uploads in seconds',
    tag:  '🔗 Magic Links',
  },
  {
    bad:  'Clients sending wrong formats, wrong sizes',
    good: 'AI flags every issue the moment files arrive',
    tag:  '🤖 AI Audit',
  },
  {
    bad:  'Chasing clients manually every few days',
    good: 'Smart follow-up emails sent automatically',
    tag:  '⏰ Nudger',
  },
  {
    bad:  'Generic links that look unprofessional',
    good: 'Branded portal that looks like your agency',
    tag:  '🎨 Portal Branding',
  },
]

export default function ChaosTable() {
  return (
    <section className="section-container border-t-[3px] border-dashed border-muted">
      <div className="text-center mb-8">
        <span className="tag-label">Why switch?</span>
        <h2 className="section-title mt-4">The old way vs. the FetchAsset way</h2>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Column headers */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
          <div
            className="text-center py-2.5 font-heading text-xs sm:text-base text-ink/50 bg-muted border-2 border-ink/20"
            style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
          >
            ✉️ The Old Way
          </div>
          <div
            className="text-center py-2.5 font-heading text-xs sm:text-base text-paper bg-ink border-2 border-ink"
            style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px', boxShadow: '4px 4px 0 0 #2d2d2d' }}
          >
            ✦ The FetchAsset Way
          </div>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-2.5">
          {ROWS.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-2 gap-2 sm:gap-4"
              style={{ transform: i % 2 === 0 ? 'rotate(-0.15deg)' : 'rotate(0.15deg)' }}
            >
              {/* Bad side */}
              <div
                className="flex items-start gap-2 sm:gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#f5f0ea] border-2 border-ink/15"
                style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center mt-0.5">
                  <X size={8} strokeWidth={3} className="text-red-500" />
                </div>
                <span className="font-body text-[11px] sm:text-sm text-ink/50 line-through leading-snug">{row.bad}</span>
              </div>

              {/* Good side */}
              <div
                className="flex items-start gap-2 sm:gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#f0fdf4] border-2 border-green-300"
                style={{
                  borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px',
                  boxShadow: '3px 3px 0 0 #2d2d2d',
                }}
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center mt-0.5">
                  <Check size={8} strokeWidth={3} className="text-green-600" />
                </div>
                <div className="min-w-0">
                  <span className="font-body text-[11px] sm:text-sm text-ink font-bold leading-snug block">{row.good}</span>
                  <span
                    className="font-body text-[9px] sm:text-[10px] text-green-700/70 mt-0.5 inline-block px-1.5 py-0.5 bg-green-100 border border-green-200"
                    style={{ borderRadius: '20px' }}
                  >
                    {row.tag}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
