/**
 * ChaosTable — "The Old Way vs. The FetchAsset Way" comparison.
 * Static server component — no interactivity needed.
 */
import { X, Check } from 'lucide-react'

const ROWS = [
  {
    bad:  '50+ back-and-forth emails',
    good: 'One Magic Link',
  },
  {
    bad:  'Manual file checking',
    good: 'AI-Powered Auto-Audit (Llama 3.3)',
  },
  {
    bad:  'Files lost in Drive / Slack',
    good: 'Organized Dashboard',
  },
  {
    bad:  'Manual reminders',
    good: 'Automated smart follow-ups',
  },
]

export default function ChaosTable() {
  return (
    <section className="section-container border-t-[3px] border-dashed border-muted">
      <div className="text-center mb-12">
        <span className="tag-label">Why switch?</span>
        <h2 className="section-title mt-4">The old way vs. the FetchAsset way</h2>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Column headers */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3">
          <div
            className="text-center py-2 font-heading text-[10px] sm:text-base text-ink/50 bg-muted border-2 border-ink/20"
            style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
          >
            ✉️ <span className="hidden xs:inline">The Old Way</span><span className="xs:hidden">Old Way</span> (Email Chaos)
          </div>
          <div
            className="text-center py-2 font-heading text-[10px] sm:text-base text-ink bg-ink text-paper border-2 border-ink"
            style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px', boxShadow: '4px 4px 0 0 #2d2d2d' }}
          >
            ✦ FetchAsset Way
          </div>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-3">
          {ROWS.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-2 gap-2 sm:gap-4"
              style={{ transform: i % 2 === 0 ? 'rotate(-0.2deg)' : 'rotate(0.2deg)' }}
            >
              {/* Bad side */}
              <div
                className="flex items-start gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-2 sm:py-3 bg-[#f5f0ea] border-2 border-ink/20"
                style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center mt-0.5">
                  <X size={8} strokeWidth={3} className="text-red-500" />
                </div>
                <span className="font-body text-[11px] sm:text-sm text-ink/55 line-through">{row.bad}</span>
              </div>

              {/* Good side */}
              <div
                className="flex items-start gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-2 sm:py-3 bg-[#f0fdf4] border-2 border-green-300"
                style={{
                  borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px',
                  boxShadow: '3px 3px 0 0 #2d2d2d',
                }}
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center mt-0.5">
                  <Check size={8} strokeWidth={3} className="text-green-600" />
                </div>
                <span className="font-body text-[11px] sm:text-sm text-ink font-bold">{row.good}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
