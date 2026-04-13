'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <h1 className="text-6xl font-bold text-blue-600">404</h1>
      <p className="text-xl mt-4 text-gray-600">哎呀，这张照片好像"失焦"了（页面没找到）</p>
      <Link href="/" className="mt-6 text-blue-500 hover:underline">返回理工光影首页</Link>
    </div>
  );
}
