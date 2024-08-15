'use client';

import Image from 'next/image';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Button } from './ui/button';
import { auth } from '@/lib/firebase';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const router = useRouter();
  const logoutMut = useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      await auth.signOut();
    },
    onError: (err) => {
      console.error({ err });
      toast.error((err as Error).message ?? 'Something went wrong');
    },
    onSuccess: () => {
      router.push('/');
    },
  });
  const [user, loading, error] = useAuthState(auth);
  return (
    <nav className=" fixed top-0 left-0 right-0 z-50 backdrop-blur-sm shadow-sm">
      <div className="mx-auto px-4 md:px-16 lg:px-32 w-full">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <Image
                className="h-8 w-8"
                src="/next.svg"
                alt="Your Company"
                width={40}
                height={40}
              />
            </div>
            <h3 className="font-bold hover:text-primary duration-200">airi</h3>

            <div className="">
              <div className="ml-10 flex items-baseline space-x-4">
                <a
                  href="/dashboard"
                  className="text-sm font-medium text-gray-900 hover:text-primary duration-200"
                >
                  Dashboard
                </a>
              </div>
            </div>
          </div>
          <div>
            {user?.uid ? (
              <Button
                isPending={loading || logoutMut.isPending}
                isDisabled={loading || logoutMut.isPending}
                onClick={() => {
                  logoutMut.mutate();
                }}
              >
                Logout
              </Button>
            ) : (
              <Button isPending={loading} isDisabled={loading}>
                <Link href="/login" className="w-full h-full">
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
