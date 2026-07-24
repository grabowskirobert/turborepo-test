'use client';
import { useState } from 'react';
import { createBrowserClient } from '../infrastructure/supabase/supabase-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ConfirmModal } from './confirm-modal';

export function Header() {
  const router = useRouter();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  async function signOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push('/sign-in');
  }

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-700 bg-zinc-900">
        <span className="font-semibold text-zinc-100">Notes</span>
        <div className="flex items-center gap-4">
          <Link
            href="/notes/archive"
            prefetch={false}
            onMouseEnter={() => router.prefetch('/notes/archive')}
            className="text-sm text-zinc-400 hover:text-zinc-200"
          >
            Archive
          </Link>
          <button
            onClick={() => setConfirmSignOut(true)}
            className="text-sm text-zinc-400 hover:text-zinc-200"
          >
            Sign out
          </button>
        </div>
      </header>

      {confirmSignOut && (
        <ConfirmModal
          message="Sign out of Notes?"
          confirmLabel="Sign out"
          onConfirm={signOut}
          onCancel={() => setConfirmSignOut(false)}
        />
      )}
    </>
  );
}
