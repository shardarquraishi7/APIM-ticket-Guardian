'use client';

import Link from 'next/link';
import { Logo } from './icons/logo';

export function ChatHeader() {
  return (
    <header className="flex justify-between top-0 bg-background py-4 items-center px-3 sm:px-6 gap-2">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Logo className="h-14" />
        </Link>
      </div>
    </header>
  );
}
