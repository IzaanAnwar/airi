'use client';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SignupData } from '@/types/auth';
import { addDoc, collection } from 'firebase/firestore';
import { useMutation } from '@tanstack/react-query';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Singup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  const signupMutation = useMutation({
    mutationKey: ['signup'],
    mutationFn: async (data: SignupData) => {
      const response = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      const userCreds = response.user;
      if (userCreds) {
        const userRef = collection(db, 'users');
        await addDoc(userRef, {
          id: userCreds.uid,
          email: userCreds.email,
          name: name,
          has_uploaded: false,
        });
        localStorage.setItem('userId', JSON.stringify(userCreds.uid));
        return { userCreds };
      }
    },
    onError: (err) => {
      console.error({ err });
      toast.error((err as Error).message ?? 'Something went wrong');
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <Loader2 className="animate-spin" />{' '}
      </div>
    );
  }

  if (user) {
    router.push('/dashboard');
  }

  return (
    <div className="w-full lg:grid lg:min-h-[100dvh] lg:grid-cols-2 ">
      <div className="flex items-center justify-center py-20">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Signup</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">User Name</Label>
              <Input
                id="name"
                type="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="johndoe"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>

              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                type="password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              onClick={() => {
                if (!email || !password || !name) {
                  toast.error('Please fill all fields');
                  return;
                }
                signupMutation.mutate({ email, password });
              }}
              isPending={signupMutation.isPending}
              isDisabled={signupMutation.isPending}
            >
              Signup
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Have an account?{' '}
            <Link href="login" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
