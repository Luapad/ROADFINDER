import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import LogoutButton from '../../components/LogoutButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '로드파인더',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-100 min-h-screen flex items-center justify-center`}>
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 relative">
    <div className="absolute top-2 right-2 z-50">
      <LogoutButton />
    </div>
    {children}
  </div>
</body>

    </html>
  );
}
