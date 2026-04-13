import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '理工光影 - 武汉理工大学校园摄影平台',
  description: '武汉理工大学校园摄影展示平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>
        <div className="flex flex-col min-h-screen font-sans bg-slate-50 selection:bg-blue-100">
          <Navbar />
          <main className="flex-grow w-full">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
