import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'submissions'

/**
 * GET /api/projects/[id]/download-all
 * Generates a list of signed download URLs for all approved submissions in a project.
 * The client can then download them individually or we can stream a response.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify ownership
    const { data: project } = await (supabase as any)
      .from('projects')
      .select('id, owner_id, title')
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .single()

    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Fetch all submissions with files
    const admin = createAdminClient()
    const { data: submissions, error } = await (admin as any)
      .from('submissions')
      .select('id, file_name, file_path, status, asset_request_id')
      .eq('project_id', params.id)
      .not('file_path', 'is', null)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (!submissions || submissions.length === 0) {
      return NextResponse.json({ error: 'No files to download' }, { status: 404 })
    }

    // Generate signed URLs for each file
    const files = await Promise.all(
      submissions.map(async (sub: { id: string; file_name: string; file_path: string; status: string }) => {
        const { data: signed } = await admin.storage
          .from(BUCKET)
          .createSignedUrl(sub.file_path, 300, { download: sub.file_name ?? true })

        return {
          id: sub.id,
          fileName: sub.file_name,
          status: sub.status,
          url: signed?.signedUrl ?? null,
        }
      })
    )

    const validFiles = files.filter(f => f.url)

    return NextResponse.json({
      projectTitle: project.title,
      files: validFiles,
      totalCount: validFiles.length,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
