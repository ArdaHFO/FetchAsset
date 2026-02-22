import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar, MobileSidebar } from '@/components/dashboard/sidebar'
import type { PlanTier } from '@/lib/supabase/types'

// Dashboard pages are private — block all indexing
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profileResult = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = ((profileResult.data as any)?.plan as PlanTier) ?? 'free'

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar userEmail={user.email} plan={plan} />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b-2 border-ink/15 bg-paper">
          <MobileSidebar userEmail={user.email} plan={plan} />
          <span className="font-heading text-xl text-ink">
            Fetch<span className="text-accent">Asset</span>
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
