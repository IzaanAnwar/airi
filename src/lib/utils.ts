import { Conversation, Message } from '@/types'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { db } from './firebase'
import { doc, writeBatch } from 'firebase/firestore'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function extractChatData(file: File): Promise<Conversation[]> {
  console.log('Extracting chat data from file...')
  const fileContent = await file.text()
  const jsonData = JSON.parse(fileContent)

  const extractedData: Conversation[] = jsonData.map((conversation: any) => {
    const { title, create_time, update_time, conversation_id, mapping } =
      conversation

    // Extract messages from mapping
    const messages: Message[] = Object.values(mapping)
      .map((node: any) => {
        console.log('Processing message...')
        if (node.message) {
          const { id, author, content, create_time, parent, children } =
            node.message
          // Safely handle the content.parts array
          const contentParts = Array.isArray(content?.parts)
            ? content.parts
            : []
          return {
            id,
            author_role: author.role,
            content: contentParts.join(' '), // Combine the content parts into a single string
            timestamp: create_time || 0,
            parent_id: node.parent || undefined,
            children_ids: node.children || [],
          } as Message
        }
        return null
      })
      .filter((msg: Message | null) => msg !== null) as Message[]
    console.log('Processing conversation...')

    return {
      title,
      create_time,
      update_time,
      conversation_id,
      messages,
    } as Conversation
  })

  return extractedData
}
