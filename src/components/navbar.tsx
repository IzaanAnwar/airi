'use client'

import Image from 'next/image'
import { useAuthState } from 'react-firebase-hooks/auth'
import { Button } from './ui/button'
import { auth } from '@/lib/firebase'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export function Navbar() {
  const logoutMut = useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      await auth.signOut()
    },
    onError: (err) => {
      console.error({ err })
      toast.error((err as Error).message ?? 'Something went wrong')
    },
  })
  const [user, loading, error] = useAuthState(auth)
  return (
    <nav className=" fixed top-0 left-0 right-0 z-50 backdrop-blur-sm shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Image
                className="h-8 w-8"
                src="/next.svg"
                alt="Your Company"
                width={40}
                height={40}
              />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a
                  href="#"
                  className="text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Team
                </a>
                <a
                  href="#"
                  className="text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Projects
                </a>
              </div>
            </div>
          </div>
          <div>
            <Button
              isPending={loading || logoutMut.isPending}
              isDisabled={loading || logoutMut.isPending}
              onClick={() => {
                logoutMut.mutate()
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
