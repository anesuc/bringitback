import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get image from MongoDB
    const image = await prisma.image.findUnique({
      where: { id },
      select: {
        data: true,
        mimeType: true,
        filename: true,
      }
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Convert base64 back to buffer
    const imageBuffer = Buffer.from(image.data, 'base64')

    // Return image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': image.mimeType,
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Content-Disposition': `inline; filename="${image.filename}"`,
      },
    })

  } catch (error) {
    console.error('Error serving image:', error)
    return NextResponse.json({ error: 'Failed to serve image' }, { status: 500 })
  }
}