import { Link, useNavigate } from "react-router-dom";
import { useDeckStore } from "../store/useDeckStore";
import { useCloudSync } from "../hooks/useCloudSync";

export default function Dashboard() {
  const decks = useDeckStore((state) => state.decks);
  const createDeck = useDeckStore((state) => state.createDeck);
  const navigate = useNavigate();
  const { supabaseEnabled, session, signInWithMagicLink, signOut } =
    useCloudSync();

  const handleLogin = async () => {
    const email = window.prompt("Enter your email to sign in");
    if (!email) return;
    await signInWithMagicLink(email);
    window.alert("Check your email for the sign-in link.");
  };

  const handleCreateDeck = () => {
    const deck = createDeck("New Deck");
    navigate(`/deck/${deck.id}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="kuizlet-label text-xs uppercase text-slate-400">
            Kuizlet
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Your decks
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {supabaseEnabled ? (
            session?.user ? (
              <button
                type="button"
                onClick={signOut}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                Log in
              </button>
            )
          ) : null}
          <Link
            to="/deck/new"
            onClick={(event) => {
              event.preventDefault();
              handleCreateDeck();
            }}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--accent-dark)]"
          >
            Create New Deck
          </Link>
        </div>
      </header>

      {decks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-slate-500 shadow-sm backdrop-blur">
          No decks yet. Create your first deck to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg backdrop-blur"
            >
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {deck.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {deck.cards.length} cards
                </p>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Link
                  to={`/deck/${deck.id}`}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Edit
                </Link>
                <Link
                  to={`/study/${deck.id}/flashcards`}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-[color:var(--accent)] text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]"
                >
                  Study
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
