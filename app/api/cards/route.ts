import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const cards = await prisma.card.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(cards)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, statementDay, dueDay } = body

    const card = await prisma.card.create({
      data: {
        name,
        statementDay,
        dueDay
      }
    })

    return NextResponse.json(card)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 })
    }

    // First delete all associated transactions
    await prisma.transaction.deleteMany({
      where: { cardId: id }
    })

    // Then delete the card
    const card = await prisma.card.delete({
      where: { id }
    })

    return NextResponse.json(card)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 })
  }
} 