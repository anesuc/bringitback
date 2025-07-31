import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Create unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${uuidv4()}.${fileExtension}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Process and optimize image with Sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(1200, 675, { // 16:9 aspect ratio
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .toBuffer()

    // Create thumbnail
    const thumbnailBuffer = await sharp(buffer)
      .resize(400, 225, { // 16:9 aspect ratio thumbnail
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 80,
        progressive: true 
      })
      .toBuffer()

    // Convert to base64 for MongoDB storage
    const imageBase64 = optimizedBuffer.toString('base64')
    const thumbnailBase64 = thumbnailBuffer.toString('base64')

    // Save to MongoDB
    const savedImage = await prisma.image.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: 'image/jpeg', // We always convert to JPEG
        size: optimizedBuffer.length,
        data: imageBase64,
        thumbnailData: thumbnailBase64,
      }
    })

    // Return image ID and data URLs for immediate preview
    const imageUrl = `/api/images/${savedImage.id}`
    const thumbnailUrl = `/api/images/${savedImage.id}/thumbnail`

    return NextResponse.json({
      imageId: savedImage.id,
      imageUrl,
      thumbnailUrl,
      filename,
      size: optimizedBuffer.length
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}