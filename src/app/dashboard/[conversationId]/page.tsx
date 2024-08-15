'use client'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { auth } from '@/lib/firebase'
import { getConversationById } from '@/lib/queries'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import moment from 'moment' // Import Moment.js if needed
import { useAuthState } from 'react-firebase-hooks/auth'

export default function ChatPage({
  params,
}: {
  params: { conversationId: string }
}) {
  const [user, loading, error] = useAuthState(auth)
  const getConversationQuery = useQuery({
    queryKey: ['getConversation', params.conversationId],
    queryFn: async () => {
      if (!params.conversationId) {
        throw new Error('Conversation id not found')
      }
      const conversation = await getConversationById(
        params.conversationId,
        user?.uid!,
      )
      console.log({ conversation })

      return conversation
    },
  })

  if (getConversationQuery.isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  if (!getConversationQuery.data) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Conversation not found</h1>
          <p className="text-lg">
            The conversation you are looking for does not exist.
          </p>
        </div>
      </div>
    )
  }

  const { messages } = getConversationQuery.data

  return (
    <div className="flex flex-col h-screen py-20  w-full">
      <div className="flex-1 overflow-auto p-6 grid gap-4 px-4 md:px-16 lg:px-32 ">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-4 ${message.author_role === 'user' ? 'justify-end' : ''}`}
          >
            {message.author_role === 'user' ? (
              <>
                <Avatar className="w-8 h-8 border">
                  <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="bg-primary text-primary-foreground rounded-lg p-4 max-w-[75%]">
                  <p>{message.content}</p>
                  {/* Optionally format the timestamp */}
                  <p className="text-sm text-zinc-200 text-right ">
                    {moment(message.timestamp * 1000).fromNow()}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-muted rounded-lg p-4 max-w-[75%]">
                  <p>{message.content}</p>
                  {/* Optionally format the timestamp */}
                  <p className="text-sm text-muted">
                    {moment(message.timestamp * 1000).format(
                      'YYYY-MM-DD HH:mm:ss',
                    )}
                  </p>
                </div>
                <Avatar className="w-8 h-8 border">
                  <AvatarImage src="/placeholder-user.jpg" alt="Bot Avatar" />
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
              </>
            )}
          </div>
        ))}
      </div>
      {/* Optional input section */}
      {/* <div className="bg-muted/50 p-4 flex items-center">
        <Textarea
          placeholder="Type your message..."
          className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <Button variant="ghost" size="icon" className="ml-2">
          <SendIcon className="w-5 h-5" />
          <span className="sr-only">Send</span>
        </Button>
      </div> */}
    </div>
  )
}
