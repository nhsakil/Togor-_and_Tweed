import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'
import crypto from 'crypto'

export async function GET() {
  if (!await requireAdmin()) return unauthorized()

  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME

  if (!apiSecret || !apiKey || !cloudName) {
    return NextResponse.json(
      { error: 'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env.local file.' },
      { status: 503 }
    )
  }

  const timestamp = Math.round(Date.now() / 1000)
  const folder    = 'togor-tweed'
  const paramStr  = 'folder=' + folder + '&timestamp=' + timestamp
  const signature = crypto.createHash('sha1').update(paramStr + apiSecret).digest('hex')

  return NextResponse.json({ timestamp, signature, apiKey, cloudName, folder })
}
