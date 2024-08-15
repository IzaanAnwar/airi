'use client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export default function Component() {
  async function uploadFile(file: File) {
    const storageRef = ref(
      storage,
      `chats/${file.name}_${crypto.randomUUID()}`,
    );
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Uploaded file and got download URL:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md p-6 space-y-4">
        <CardHeader>
          <CardTitle>Upload Your ChatGPT Conversation</CardTitle>
          <CardDescription>
            Share your conversation with us to help improve our AI assistant.
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
              />
            </div>
            <Button type="submit" className="w-full">
              Upload
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Link href="#" className="text-primary" prefetch={false}>
            View Dashboard
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
