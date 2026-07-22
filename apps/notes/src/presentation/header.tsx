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
    <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
      <span className="font-semibold text-gray-800">Notes</span>
      <div className="flex items-center gap-4">
        <Link
          href="/notes/archive"
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          Archive
        </Link>
        <button
          onClick={signOut}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
