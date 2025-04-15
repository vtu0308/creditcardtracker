import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name } = body

    const category = await prisma.category.create({
      data: { name }
    })

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    // First delete all associated transactions
    await prisma.transaction.deleteMany({
      where: { categoryId: id }
    })

    // Then delete the category
    const category = await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
} 