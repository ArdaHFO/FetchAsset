/**
 * TrustBadges — Security & Trust Infrastructure section.
 * Static, no interactivity. 4-column grid with hard-shadow cards.
 */

const BADGES = [
  {
    icon: '🔐',
    heading: 'AES-256 Bit Encryption',
    sub: 'Your assets are encrypted at rest and in transit using TLS 1.3 protocols.',
  },
  {
    icon: '💳',
    heading: 'PCI-DSS Level 1 Secure',
    sub: "Payments processed via Stripe's certified infrastructure. We never store card data.",
  },
  {
    icon: '🇪🇺',
    heading: 'GDPR & Data Sovereignty',
    sub: 'Full EU data protection compliance. Hosted on SOC 2 Type II certified infrastructure.',
  },
  {
    icon: '🔑',
    heading: 'Passwordless JWT Auth',
    sub: 'Magic Links eliminate brute-force risks using short-lived cryptographic tokens.',
  },
]

export default function TrustBadges() {
  return (
    <section className="section-container border-t-[3px] border-dashed border-muted">
      {/* "Safety zone" wrapper with wobbly border */}
      <div
        className="border-[3px] border-ink/30 bg-[#f9f9f9] px-6 py-10 md:px-12 md:py-14"
        style={{
          borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px',
          boxShadow: '5px 5px 0 0 rgba(45,45,45,0.12)',
        }}
      >
        <div className="text-center mb-10">
          <span className="tag-label">Security-first</span>
          <h2 className="section-title mt-4">Your data is locked down tight</h2>
          <p className="font-body text-base text-ink/55 max-w-md mx-auto mt-3">
            Enterprise-grade protection built in from day one — no add-ons required.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BADGES.map((b, i) => (
            <div
              key={b.heading}
              className="flex flex-col gap-3 bg-paper border-2 border-ink/25 px-5 py-5"
              style={{
                borderRadius: i % 2 === 0
                  ? '220px 30px 240px 20px / 25px 230px 20px 215px'
                  : '180px 45px 200px 35px / 40px 190px 30px 170px',
                boxShadow: '4px 4px 0 0 #2d2d2d',
                transform: i % 2 === 0 ? 'rotate(-0.4deg)' : 'rotate(0.4deg)',
              }}
            >
              <span className="text-3xl leading-none">{b.icon}</span>
              <div>
                <p className="font-heading text-base text-ink leading-tight">{b.heading}</p>
                <p className="font-body text-xs text-ink/55 mt-1.5 leading-relaxed">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
