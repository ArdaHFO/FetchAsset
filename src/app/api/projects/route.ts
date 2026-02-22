import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { assertCanCreateProject, PlanLimitError } from '@/lib/stripe/limits'
import type { RequestType } from '@/lib/supabase/types'

interface AssetRequestInput {
  title: string
  description?: string | null
  request_type: RequestType
  required: boolean
  sort_order: number
}

interface CreateProjectBody {
  title: string
  client_name: string
  client_email: string
  notes?: string | null
  assets?: AssetRequestInput[]
}

/**
 * POST /api/projects
 * Creates a new project after verifying the user has not hit their plan limit.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Enforce plan limits before inserting
    await assertCanCreateProject(user.id)

    const body = (await req.json()) as CreateProjectBody

    if (!body.title?.trim() || !body.client_name?.trim()) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Insert project
    const { data: project, error: projErr } = await (admin as any)
      .from('projects')
      .insert({
        owner_id: user.id,
        title: body.title.trim(),
        client_name: body.client_name.trim(),
        client_email: (body.client_email ?? '').trim(),
        notes: body.notes?.trim() || null,
        status: 'draft',
      })
      .select()
      .single()

    if (projErr || !project) {
      console.error('[api/projects] Insert error:', projErr?.message)
      return NextResponse.json({ error: 'Failed to create project.' }, { status: 500 })
    }

    // Insert asset requests
    const validAssets = (body.assets ?? []).filter((a) => a.title?.trim())
    if (validAssets.length > 0) {
      const requests = validAssets.map((a, i) => ({
        project_id: project.id,
        title: a.title.trim(),
        description: a.description?.trim() || null,
        request_type: a.request_type,
        required: a.required,
        sort_order: i,
      }))
      const { error: reqErr } = await (admin as any).from('asset_requests').insert(requests)
      if (reqErr) console.error('[api/projects] asset_requests insert:', reqErr.message)
    }

    return NextResponse.json({ project })
  } catch (err) {
    if (err instanceof PlanLimitError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 403 })
    }
    console.error('[api/projects] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
