import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const GET = async (req: NextRequest) => {
  try {
    // fetch the conversation from the firestore
    const conversationId = z
      .string()
      .parse(req.nextUrl.searchParams.get('conversationId'))
    const userId = z.string().parse(req.nextUrl.searchParams.get('userId'))

    console.log({ conversationId })

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: 'Invalid conversation ID or user ID' },
        { status: 400 },
      )
    }

    const conversationRef = doc(
      db,
      `conversations/${userId}/userConversations`,
      conversationId,
    )
    const conversationSnap = await getDoc(conversationRef)

    if (!conversationSnap.exists()) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 },
      )
    }
    console.log({ conversationSnap: conversationSnap.data() })

    return NextResponse.json(conversationSnap.data())
  } catch (error: any) {
    console.error('something went wrong', error)
    return NextResponse.json(
      { error: error?.message ?? 'Something went wrong' },
      { status: 500 },
    )
  }
}
