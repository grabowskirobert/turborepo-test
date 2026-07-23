'use client';
import { createBrowserClient } from '../infrastructure/supabase/supabase-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function Header() {
  const router = useRouter();

  async function signOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push('/sign-in');
  }

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-700 bg-zinc-900">
      <span className="font-semibold text-zinc-100">Notes</span>
      <div className="flex items-center gap-4">
        <Link
          href="/notes/archive"
          className="text-sm text-zinc-400 hover:text-zinc-200"
        >
          Archive
        </Link>
        <button
          onClick={signOut}
          className="text-sm text-zinc-400 hover:text-zinc-200"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
