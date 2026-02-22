import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { assertCanCreateProject, PlanLimitError } from '@/lib/stripe/limits'
import { PLANS } from '@/lib/stripe/plans'
import type { RequestType } from '@/lib/supabase/types'

interface AssetRequestInput {
  title: string
  description?: string | null
  request_type: RequestType
  required: boolean
  sort_order: number
  allowed_file_types?: string[] | null
  max_file_size_mb?: number | null
  custom_instructions?: string | null
  naming_rule?: boolean
}

interface CreateProjectBody {
  title: string
  client_name: string
  client_email?: string
  notes?: string | null
  due_date?: string | null        // internal deadline
  buffer_days?: number
  auto_reminder?: boolean
  contact_method?: 'email' | 'whatsapp' | null
  contact_value?: string | null
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

    // Enforce requests-per-project limit
    const { data: planRow } = await createAdminClient().from('profiles').select('plan').eq('id', user.id).single() as any
    const userPlan = (planRow?.plan ?? 'free') as import('@/lib/supabase/types').PlanTier
    const reqLimit = PLANS[userPlan].requestsPerProject
    const validAssetCount = (body.assets ?? []).filter((a) => a.title?.trim()).length
    if (reqLimit !== -1 && validAssetCount > reqLimit) {
      return NextResponse.json({
        error: `Your ${PLANS[userPlan].name} plan allows up to ${reqLimit} request${reqLimit !== 1 ? 's' : ''} per project. Upgrade to add more.`,
        code: 'request_limit',
      }, { status: 403 })
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
        due_date: body.due_date || null,
        buffer_days: body.buffer_days ?? 0,
        auto_reminder: body.auto_reminder ?? false,
        contact_method: body.contact_method ?? null,
        contact_value: body.contact_value?.trim() || null,
        contact_visible: true,
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
        allowed_file_types: a.allowed_file_types?.length ? a.allowed_file_types : null,
        max_file_size_mb: a.max_file_size_mb ?? null,
        custom_instructions: a.custom_instructions?.trim() || null,
        naming_rule: a.naming_rule ?? false,
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
