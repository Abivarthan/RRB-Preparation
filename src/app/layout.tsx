import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'RRB Exam Prep - Master Your Railway Recruitment Board Exams',
  description: 'Comprehensive RRB exam preparation platform with topic quizzes, mock tests, timer system, streak tracking, and leaderboards. Prepare for RRB NTPC, Group D, and more.',
  keywords: ['RRB', 'Railway exam', 'NTPC', 'Group D', 'Quiz', 'Mock Test'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="gradient-bg">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1a1a3e',
                  color: '#f1f5f9',
                  border: '1px solid #2a2a5a',
                  borderRadius: '12px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#f1f5f9',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#f1f5f9',
                  },
                },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
