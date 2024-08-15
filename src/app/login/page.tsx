'use client';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { SignupData } from '@/types/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;
  const router = useRouter();
  useEffect(() => {
    console.log({ user });

    if (user) {
      router.push('/dashboard');
    }
  }, [router, user]);

  const loginMutation = useMutation({
    mutationKey: ['signup'],
    mutationFn: async (data: SignupData) => {
      const response = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      const userCreds = response.user;
      if (userCreds) {
        localStorage.setItem('userId', JSON.stringify(userCreds.uid));
        return { userCreds };
      }
    },
    onError: (err) => {
      console.error({ err });
      toast.error((err as Error).message ?? 'Something went wrong');
    },
  });

  return (
    <div className="w-full lg:grid lg:min-h-[100dvh] lg:grid-cols-2 ">
      <div className="flex items-center justify-center py-20">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              onClick={() => {
                if (!email || !password) {
                  toast.error('Please fill all fields');
                  return;
                }
                loginMutation.mutate({ email, password });
              }}
              isPending={loginMutation.isPending}
              isDisabled={loginMutation.isPending}
            >
              Login
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
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
