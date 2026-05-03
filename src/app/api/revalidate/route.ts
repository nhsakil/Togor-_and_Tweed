import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { path, tag } = body as { path?: string; tag?: string }

  // SR: fixed — Next.js 16 removed revalidateTag(string) overload; use revalidatePath instead
  if (tag) {
    revalidatePath('/', 'layout')
    return NextResponse.json({ revalidated: true, tag })
  }

  if (path) {
    revalidatePath(path, 'page')
    return NextResponse.json({ revalidated: true, path })
  }

  return NextResponse.json({ message: 'Provide path or tag' }, { status: 400 })
}
