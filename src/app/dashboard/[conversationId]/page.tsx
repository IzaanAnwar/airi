'use client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/firebase';
import { getConversationById, getSummary } from '@/lib/queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, SendIcon } from 'lucide-react';
import moment from 'moment'; // Import Moment.js if needed
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'sonner';

export default function ChatPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const [user, loading, error] = useAuthState(auth);
  const [summary, setSummary] = useState<string | undefined>('');
  const router = useRouter();
  const getConversationQuery = useQuery({
    queryKey: ['getConversation', params.conversationId],
    queryFn: async () => {
      if (!params.conversationId) {
        throw new Error('Conversation id not found');
      }
      const conversation = await getConversationById(
        params.conversationId,
        user?.uid!,
      );
      console.log({ conversation });

      return conversation;
    },
  });

  const getSummaryMutation = useMutation({
    mutationKey: ['getSummary'],
    mutationFn: async () => {
      const { data, error } = await getSummary({
        conversationId: params.conversationId,
        userId: user?.uid!,
      });
      if (error) {
        throw new Error(error);
      }
      setSummary(data?.summary);
      return data?.summary;
    },
    onError: (err: any) => {
      console.error({ err });
      toast.error((err as Error).message ?? 'Something went wrong');
    },
    onSuccess: (y) => {
      toast.success('Summary fetched successfully');
    },
  });

  if (getConversationQuery.isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user || error) {
    router.push('/login');
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
    );
  }

  const { messages } = getConversationQuery.data;

  return (
    <>
      <div className="flex flex-col h-screen   w-full ">
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-20 grid gap-4 px-4 md:px-16 lg:px-32  ">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-4 ${message.author_role === 'user' ? 'justify-end' : ''}`}
            >
              {message.author_role === 'user' ? (
                <>
                  <div className="bg-primary text-primary-foreground rounded-lg p-4 max-w-[75vw] ">
                    <p>{message.content}</p>
                    {/* Optionally format the timestamp */}
                    <p className="text-sm font-semibold text-zinc-200 text-right ">
                      {moment(message.timestamp * 1000).fromNow()}
                    </p>
                  </div>
                  <UserFullViewIcon className="w-8 h-8 p-1 flex justify-center items-center text-center  border-primary border rounded-full" />
                </>
              ) : (
                <>
                  <ChatBotIcon className="text-primary w-8 h-8 p-1 flex justify-center items-center text-center  border-primary border rounded-full" />
                  <div className="bg-muted rounded-lg p-4 max-w-[75vw] ">
                    <p>{message.content}</p>
                    {/* Optionally format the timestamp */}
                    <p className="text-sm zinc-700 font-semibold text-right">
                      {moment(message.timestamp * 1000).fromNow()}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="py-4 px-4 w-full border-t md:px-16 lg:px-32 space-y-4  bg-primary/30">
          {summary && (
            <Card className="w-full p-4 animate-fade-up">{summary}</Card>
          )}
          {getSummaryMutation.isPending && (
            <Skeleton className="w-full h-64 animate-fade-up" />
          )}
          <div className="flex justify-between w-full space-x-4">
            <Button
              isPending={getSummaryMutation.isPending}
              isDisabled={getSummaryMutation.isPending}
              onClick={() => {
                getSummaryMutation.mutate();
              }}
            >
              Get Summary
            </Button>
            <Button>
              <Link
                href={`https://chatgpt.com/c/${params.conversationId}`}
                target="_blank"
                className="w-full h-full"
              >
                Go To Chat
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

const UserFullViewIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={24}
    height={24}
    fill={'none'}
    {...props}
  >
    <path
      d="M15 5C15 6.65685 13.2418 8.5 12 8.5C10.7582 8.5 9 6.65685 9 5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M16.0415 9C17.5645 10.3353 18.5514 12.5969 17.6652 14.7052C17.4742 15.1594 17.0361 15.4539 16.5514 15.4539C16.0585 15.4539 15.249 15.296 15.0917 15.9374L13.9945 20.4123C13.7657 21.3454 12.9434 22 12.0001 22C11.0567 22 10.2344 21.3454 10.0056 20.4123L8.90839 15.9374C8.7511 15.296 7.94155 15.4539 7.44868 15.4539C6.96396 15.4539 6.52588 15.1594 6.33494 14.7052C5.44873 12.5969 6.43564 10.3353 7.95863 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const ChatBotIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={24}
    height={24}
    fill={'none'}
    {...props}
  >
    <path
      d="M11 8H13C15.8284 8 17.2426 8 18.1213 8.87868C19 9.75736 19 11.1716 19 14C19 16.8284 19 18.2426 18.1213 19.1213C17.2426 20 15.8284 20 13 20H12C12 20 11.5 22 8 22C8 22 9 20.9913 9 19.9827C7.44655 19.9359 6.51998 19.7626 5.87868 19.1213C5 18.2426 5 16.8284 5 14C5 11.1716 5 9.75736 5.87868 8.87868C6.75736 8 8.17157 8 11 8Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M19 11.5H19.5C20.4346 11.5 20.9019 11.5 21.25 11.701C21.478 11.8326 21.6674 12.022 21.799 12.25C22 12.5981 22 13.0654 22 14C22 14.9346 22 15.4019 21.799 15.75C21.6674 15.978 21.478 16.1674 21.25 16.299C20.9019 16.5 20.4346 16.5 19.5 16.5H19"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M5 11.5H4.5C3.56538 11.5 3.09808 11.5 2.75 11.701C2.52197 11.8326 2.33261 12.022 2.20096 12.25C2 12.5981 2 13.0654 2 14C2 14.9346 2 15.4019 2.20096 15.75C2.33261 15.978 2.52197 16.1674 2.75 16.299C3.09808 16.5 3.56538 16.5 4.5 16.5H5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M13.5 3.5C13.5 4.32843 12.8284 5 12 5C11.1716 5 10.5 4.32843 10.5 3.5C10.5 2.67157 11.1716 2 12 2C12.8284 2 13.5 2.67157 13.5 3.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M12 5V8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 12V13M15 12V13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 16.5C10 16.5 10.6667 17 12 17C13.3333 17 14 16.5 14 16.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
