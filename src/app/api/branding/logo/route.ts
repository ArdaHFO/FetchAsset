import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/branding/logo
 * Uploads an agency logo to Supabase Storage and saves the URL to the profile.
 * Body: FormData with 'file' field.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })

  // Validate type + size
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Use PNG, JPG, SVG, or WEBP.' }, { status: 400 })
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Logo must be under 2 MB.' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const storagePath = `brand_assets/${user.id}/logo.${ext}`

  const admin = createAdminClient()
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Upsert (overwrite) logo in storage
  const { error: uploadErr } = await (admin as any)
    .storage
    .from('submissions')
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 })
  }

  // Get public URL
  const { data: urlData } = (admin as any)
    .storage
    .from('submissions')
    .getPublicUrl(storagePath)

  const logoUrl: string = urlData?.publicUrl ?? ''

  // Save to profile
  const { error: updateErr } = await (admin as any)
    .from('profiles')
    .update({ logo_url: logoUrl })
    .eq('id', user.id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({ url: logoUrl })
}
