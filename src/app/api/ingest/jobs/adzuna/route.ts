import { NextResponse } from 'next/server'
import { ingestAdzunaJobs } from '@/lib/ingest-adzuna-jobs'

/**
 * POST /api/ingest/jobs/adzuna
 * Triggers Adzuna job ingestion for Williamson County (WilCo).
 * Optional: pass JSON body { where?: string, maxPages?: number } to customize.
 *
 * Protection: set INGEST_SECRET in .env.local and send header:
 *   x-ingest-secret: <your-secret>
 * If INGEST_SECRET is not set, ingestion is only allowed in development.
 */
export async function POST(request: Request) {
  const ingestSecret = process.env.INGEST_SECRET
  const isDev = process.env.NODE_ENV === 'development'

  if (ingestSecret) {
    const headerSecret = request.headers.get('x-ingest-secret')
    if (headerSecret !== ingestSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else if (!isDev) {
    return NextResponse.json(
      { error: 'Set INGEST_SECRET in production to enable ingestion' },
      { status: 403 },
    )
  }

  let body: { where?: string; maxPages?: number } = {}
  try {
    const text = await request.text()
    if (text) body = JSON.parse(text)
  } catch {
    // ignore
  }

  try {
    const result = await ingestAdzunaJobs({
      where: body.where ?? 'round rock tx',
      maxPages: body.maxPages ?? 3,
    })
    return NextResponse.json({
      ok: true,
      created: result.created,
      updated: result.updated,
      skipped: result.skipped,
      errors: result.errors.length ? result.errors : undefined,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[ingest-adzuna]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
