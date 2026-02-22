import Link from 'next/link'
import { WobblyButton, WobblyCard, WobblyCardContent } from '@/components/ui'

export default function PortalNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <WobblyCard
        flavor="postit"
        shadow="lg"
        radius="lg"
        rotate="-0.5"
        decoration="tape"
        className="max-w-sm w-full"
      >
        <WobblyCardContent className="p-8 text-center flex flex-col gap-4">
          <p className="font-heading text-5xl text-ink/20">🔗</p>
          <h1 className="font-heading text-2xl text-ink">
            Link not found
          </h1>
          <p className="font-body text-sm text-ink/65">
            This portal link has expired or doesn&apos;t exist.
            Ask your agency for a new one.
          </p>
          <WobblyButton variant="secondary" size="sm" asChild>
            <Link href="/login">Back to FetchAsset</Link>
          </WobblyButton>
        </WobblyCardContent>
      </WobblyCard>
    </div>
  )
}
