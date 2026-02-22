import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const BUCKET = 'submissions'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const path = req.nextUrl.searchParams.get('path')
    if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

    // Verify user owns the project that this submission belongs to
    const { data: sub } = await (supabase as any)
      .from('submissions')
      .select('id, file_name, asset_requests(project_id, projects(owner_id))')
      .eq('file_path', path)
      .single()

    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const ownerId = sub.asset_requests?.projects?.owner_id
    if (ownerId && ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate a signed URL (60-second expiry)
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: signed, error } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(path, 60)

    if (error || !signed?.signedUrl) {
      return NextResponse.json({ error: 'Could not generate download link' }, { status: 500 })
    }

    // Redirect to the signed URL
    return NextResponse.redirect(signed.signedUrl)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
