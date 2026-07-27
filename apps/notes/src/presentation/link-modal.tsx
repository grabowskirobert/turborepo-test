'use client';
import { useEffect, useRef, useState } from 'react';

interface LinkModalProps {
  /** Pre-filled when editing an existing link */
  defaultText?: string;
  defaultUrl?: string;
  /** When true, the text field is hidden (selection already provides the text) */
  hideText?: boolean;
  onConfirm: (text: string, url: string) => void;
  onCancel: () => void;
}

export function LinkModal({
  defaultText = '',
  defaultUrl = '',
  hideText = false,
  onConfirm,
  onCancel,
}: LinkModalProps) {
  const [text, setText] = useState(defaultText);
  const [url, setUrl] = useState(defaultUrl);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
    firstRef.current?.select();
  }, []);

  const canConfirm = url.trim() && (hideText || text.trim());

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (canConfirm) onConfirm(text.trim(), url.trim());
    } else if (e.key === 'Escape') {
      onCancel();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onCancel}
    >
      <div
        className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl p-6 w-80 flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2 className="text-sm font-medium text-zinc-200">Insert link</h2>

        {!hideText && (
          <input
            ref={firstRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Display text"
            className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
          />
        )}

        <input
          ref={hideText ? firstRef : undefined}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full bg-zinc-900 border border-zinc-600 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
        />

        <div className="flex justify-end gap-2 mt-1">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => canConfirm && onConfirm(text.trim(), url.trim())}
            disabled={!canConfirm}
            className="px-3 py-1.5 text-xs bg-emerald-700 text-white rounded hover:bg-emerald-600 disabled:opacity-40"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
