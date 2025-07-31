import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get thumbnail from MongoDB
    const image = await prisma.image.findUnique({
      where: { id },
      select: {
        thumbnailData: true,
        mimeType: true,
        filename: true,
      }
    })

    if (!image || !image.thumbnailData) {
      return NextResponse.json({ error: 'Thumbnail not found' }, { status: 404 })
    }

    // Convert base64 back to buffer
    const thumbnailBuffer = Buffer.from(image.thumbnailData, 'base64')

    // Return thumbnail with appropriate headers
    return new NextResponse(thumbnailBuffer, {
      headers: {
        'Content-Type': image.mimeType,
        'Content-Length': thumbnailBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Content-Disposition': `inline; filename="thumb_${image.filename}"`,
      },
    })

  } catch (error) {
    console.error('Error serving thumbnail:', error)
    return NextResponse.json({ error: 'Failed to serve thumbnail' }, { status: 500 })
  }
}