import { useState } from "react";
import { useCloudSync } from "../hooks/useCloudSync";

export default function CloudSyncBar() {
  const { supabaseEnabled, session, statusLabel, signInWithMagicLink, signOut } =
    useCloudSync();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  if (!supabaseEnabled) return null;

  const handleSignIn = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    const { error } = await signInWithMagicLink(trimmed);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage("Check your email for the sign-in link.");
  };

  return (
    <div className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-900">Cloud Sync</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
            {statusLabel}
          </span>
        </div>
        {session?.user ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-500">
              Signed in as {session.user.email}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
              className="h-9 w-56 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button
              type="button"
              onClick={handleSignIn}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[color:var(--accent)] px-3 text-xs font-semibold text-white transition hover:bg-[color:var(--accent-dark)]"
            >
              Send Magic Link
            </button>
            {message ? (
              <span className="text-xs text-slate-500">{message}</span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
