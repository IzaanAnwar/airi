'use client'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db, storage } from '@/lib/firebase'
import {
  addDoc,
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { toast } from 'sonner'
import { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Conversation, IUser, Message } from '@/types'
import { extractChatData } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { getSummary, getTitleAndConversationId, tagData } from '@/lib/queries'

const MOCK_FILE_IDETIFIER = 'conversations.json_wO11ZJVshPbdCGobWqRhvBWiq5W2'
export default function Dashboard() {
  let total = 0
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const [file, setFile] = useState<File | null | undefined>(null)
  const [user, loading, error] = useAuthState(auth)

  async function updateDb(fileURL: string) {
    const fileRef = collection(db, 'files')
    await addDoc(fileRef, {
      id: crypto.randomUUID(),
      url: fileURL,
    })
  }

  const getUserQuery = useQuery({
    queryKey: ['getUser', user?.uid],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not found')
      }
      const userRef = collection(db, 'users')
      const querySnapshot = await getDocs(userRef)
      console.log({ querySnapshot: querySnapshot.docs })

      const userSnapshot = querySnapshot.docs.find(
        (doc) => doc.data().id === user?.uid,
      )

      const userdb = userSnapshot?.data()
      if (!userdb) {
        throw new Error('User not found')
      }
      return userdb
    },
  })

  const processFileMutation = useMutation({
    mutationKey: ['processFile'],
    mutationFn: async () => {
      if (!file) {
        throw new Error('No file selected')
      }
      const data = await extractChatData(file)
      total = data.length
      await saveConversationsToFirestore(data)
      console.log('Conversations saved to Firestore', { total })
    },
    onError: (err: any) => {
      console.error({ err })
      toast.error((err as Error).message ?? 'Something went wrong')
    },
    onSuccess: (data: any) => {
      toast.success('File uploaded successfully')
    },
  })

  // Define the maximum number of documents per batch
  const BATCH_SIZE = 10
  async function saveConversationsToFirestore(
    conversations: Conversation[],
  ): Promise<void> {
    let batch = writeBatch(db)
    let batchCounter = 0
    let totalBatches = 0

    for (const conversation of conversations) {
      // calc

      // calculate total progress based on total and total batches
      const pro = Math.round(
        ((totalBatches * BATCH_SIZE + batchCounter) / total) * 100,
      )
      console.log({ pro, totalBatches, total })

      setProgress(pro)

      const conversationRef = doc(
        db,
        `conversations/${user?.uid}/userConversations`,
        conversation.conversation_id,
      )

      const tagRes = await tagData([
        JSON.stringify({
          title: conversation.title,
          conversation_id: conversation.conversation_id,
        }),
      ])

      const labelConversation = {
        ...conversation,
        label: tagRes.classifications.at(0)?.prediction,
      }
      batch.set(conversationRef, labelConversation)
      batchCounter++
      console.log('Batch counter:', batchCounter)

      // If the batch size limit is reached, commit the batch and start a new one
      if (batchCounter === BATCH_SIZE) {
        console.log('Committing batch...')
        await batch.commit()
        totalBatches++
        console.log(
          `Batch ${totalBatches} committed with ${batchCounter} conversations.`,
        )
        batch = writeBatch(db) // Start a new batch
        batchCounter = 0
      }
    }

    // Commit any remaining conversations that didn't fill up a full batch
    if (batchCounter > 0) {
      await batch.commit()
      totalBatches++
      console.log(
        `Final batch ${totalBatches} committed with ${batchCounter} conversations.`,
      )
    }
    setProgress(100)
    console.log(
      `Finished saving ${conversations.length} conversations in ${totalBatches} batches.`,
    )
  }

  const getSummaryMutation = useMutation({
    mutationKey: ['getSummary'],
    mutationFn: async () => {
      const { data, error } = await getSummary({
        conversationId: '00d7fec6-81af-4c20-8863-48a1392ba073',
        userId: user?.uid!,
      })
      if (error) {
        throw new Error(error)
      }
      return data
    },
    onError: (err: any) => {
      console.error({ err })
      toast.error((err as Error).message ?? 'Something went wrong')
    },
  })

  const uploadFileMutation = useMutation({
    mutationKey: ['uploadFile'],
    mutationFn: async (file: File) => {
      const storageRef = ref(storage, `chats/${file.name}_${user?.uid}`)
      try {
        const snapshot = await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)
        console.log('Uploaded file and got download URL:', downloadURL)
        await updateDb(downloadURL)
        return downloadURL
      } catch (error: any) {
        console.error('Error uploading file:', error)
        toast.error(error?.message ?? 'Something went wrong')
      }
    },
    onError: (err: any) => {
      console.error({ err })
      toast.error((err as Error).message ?? 'Something went wrong')
    },
    onSuccess: (data: any) => {
      toast.success('File uploaded successfully')
    },
  })

  if (loading || getUserQuery.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <Loader2 className="animate-spin" />{' '}
      </div>
    )
  }

  if (!user || error) {
    router.push('/login')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background py-20">
      {getUserQuery.data?.has_uploaded === false && (
        <Card className="w-full max-w-md p-6 space-y-4">
          <CardHeader>
            <CardTitle>Upload Your ChatGPT Conversation</CardTitle>
            <CardDescription>
              Share your conversation to get more insights of your chats.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <Label htmlFor="file">Upload Conversation</Label>
                <Input
                  type="file"
                  id="file"
                  name="file"
                  accept=".txt, .json"
                  className="w-full"
                  onChange={(e) => setFile(e.target.files?.[0])}
                />
              </div>

              <Button
                className="w-full"
                type="button"
                isPending={processFileMutation.isPending}
                isDisabled={processFileMutation.isPending}
                onClick={() => {
                  processFileMutation.mutate()
                }}
              >
                Process File
              </Button>
            </form>
          </CardContent>
          <CardFooter className="border-t pt-4 space-y-2 flex-col w-full ">
            <div className="spacey-y-4 w-full flex flex-col justify-center ">
              <div className="w-full  py-2 min-h-2 ">
                {progress != 0 && (
                  <Progress value={progress} className="w-full" />
                )}
              </div>
              <Button
                onClick={() => {
                  if (!user) {
                    toast.error('Please login to upload a file')
                    return
                  }
                  if (!file) {
                    toast.error('Please select a file to upload')
                    return
                  }
                  uploadFileMutation.mutate(file)
                }}
                className="w-full"
                type="button"
                variant={'outline'}
                isPending={uploadFileMutation.isPending}
                isDisabled={uploadFileMutation.isPending}
              >
                Upload File
              </Button>

              {/* <Button
                isPending={getSummaryMutation.isPending}
                isDisabled={getSummaryMutation.isPending}
                onClick={() => {
                  getSummaryMutation.mutate()
                }}
              >
                Get Summary
              </Button> */}
            </div>
          </CardFooter>
        </Card>
      )}
      <main className="flex flex-1 flex-col gap-8 p-4 sm:p-8 md:p-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Link href="#" className="group" prefetch={false}>
            <Card className="h-full w-full overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg focus:scale-[1.02] focus:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <CardHeader className="bg-muted/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Team Meeting
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">2:39pm</div>
                </div>
              </CardHeader>
              <CardContent className="px-6 py-4">
                <p>
                  Discussing our quarterly goals and planning for the next few
                  months.
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="#" className="group" prefetch={false}>
            <Card className="h-full w-full overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg focus:scale-[1.02] focus:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <CardHeader className="bg-muted/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Design Review
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">3:15pm</div>
                </div>
              </CardHeader>
              <CardContent className="px-6 py-4">
                <p>
                  Reviewing the new website design and getting feedback from the
                  team.
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="#" className="group" prefetch={false}>
            <Card className="h-full w-full overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg focus:scale-[1.02] focus:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <CardHeader className="bg-muted/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Sales Update
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">4:30pm</div>
                </div>
              </CardHeader>
              <CardContent className="px-6 py-4">
                <p>
                  Discussing our latest sales numbers and strategies for the
                  upcoming quarter.
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="#" className="group" prefetch={false}>
            <Card className="h-full w-full overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg focus:scale-[1.02] focus:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <CardHeader className="bg-muted/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Product Roadmap
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">5:00pm</div>
                </div>
              </CardHeader>
              <CardContent className="px-6 py-4">
                <p>
                  Discussing our product roadmap and upcoming feature releases.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
