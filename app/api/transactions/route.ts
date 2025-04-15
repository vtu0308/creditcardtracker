import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        card: true,
        category: true
      },
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { description, amount, vndAmount, date, cardId, categoryId } = body

    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount,
        vndAmount,
        date: new Date(date),
        cardId,
        categoryId
      },
      include: {
        card: true,
        category: true
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 })
    }

    const transaction = await prisma.transaction.delete({
      where: { id }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
} 