import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ReactQueryProvider } from '@/providers/react-query';
import { Navbar } from '@/components/navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'airi',
  description: 'Manage Your ChatGPT Conversations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Toaster
        toastOptions={{
          duration: 2000,
          classNames: {
            success: 'bg-success-500 text-success-900',
            error: 'bg-red-500 text-white',
            warning: 'bg-warning-500 text-white',
          },
        }}
      />
      <body className={inter.className}>
        <ReactQueryProvider>
          <Navbar />
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
