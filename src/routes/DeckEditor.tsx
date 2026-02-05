import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import Papa from "papaparse";
import { useDeckStore } from "../store/useDeckStore";
import type { Card } from "../types";
import { useCloudSync } from "../hooks/useCloudSync";

export default function DeckEditor() {
  const { deckId } = useParams();
  const deck = useDeckStore((state) =>
    deckId ? state.getDeckById(deckId) : undefined
  );
  const updateDeckTitle = useDeckStore((state) => state.updateDeckTitle);
  const addCard = useDeckStore((state) => state.addCard);
  const addCards = useDeckStore((state) => state.addCards);
  const updateCard = useDeckStore((state) => state.updateCard);
  const removeCard = useDeckStore((state) => state.removeCard);
  const { syncNow } = useCloudSync();
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [csvText, setCsvText] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const cardCount = deck?.cards.length ?? 0;

  const parseCsvText = (text: string): Card[] => {
    const cleaned = text.trim();
    if (!cleaned) return [];

    const headerParse = Papa.parse(cleaned, {
      header: true,
      skipEmptyLines: true,
    });

    const headerFields = headerParse.meta.fields?.map((field: string) =>
      field?.toLowerCase()
    );

    const hasHeader =
      headerFields?.includes("term") &&
      (headerFields.includes("definition") || headerFields.includes("meaning"));

    if (hasHeader) {
      return (headerParse.data as Record<string, string | undefined>[])
        .map((row: Record<string, string | undefined>) => {
          const termValue = row.term ?? row.Term ?? "";
          const definitionValue =
            row.definition ?? row.Definition ?? row.meaning ?? "";
          return {
            id: crypto.randomUUID(),
            term: termValue.trim(),
            definition: definitionValue.trim(),
            status: "new" as const,
          };
        })
        .filter((card: Card) => card.term || card.definition);
    }

    const noHeaderParse = Papa.parse<string[]>(cleaned, {
      header: false,
      skipEmptyLines: true,
    });

    return (noHeaderParse.data || [])
      .map((row) => {
        const [termValue, definitionValue] = row;
        return {
          id: crypto.randomUUID(),
          term: (termValue ?? "").trim(),
          definition: (definitionValue ?? "").trim(),
          status: "new" as const,
        };
      })
      .filter((card) => card.term || card.definition);
  };

  const handleAddCard = () => {
    if (!deckId) return;
    const newTerm = term.trim();
    const newDefinition = definition.trim();
    if (!newTerm && !newDefinition) return;
    addCard(deckId, {
      id: crypto.randomUUID(),
      term: newTerm,
      definition: newDefinition,
      status: "new",
    });
    setTerm("");
    setDefinition("");
  };

  const handleImport = (text: string) => {
    if (!deckId) return;
    const cards = parseCsvText(text);
    if (cards.length === 0) {
      setImportStatus("No valid rows found.");
      return;
    }
    addCards(deckId, cards);
    setCsvText("");
    setImportStatus(`Imported ${cards.length} cards.`);
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleImport(String(reader.result ?? ""));
    };
    reader.readAsText(file);
  };

  const cardsPreview = useMemo(() => deck?.cards ?? [], [deck?.cards]);

  if (!deckId || !deck) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Deck not found
        </h1>
        <Link
          to="/"
          className="inline-flex h-10 w-fit items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="kuizlet-label text-xs uppercase text-slate-400">
            Deck Editor
          </p>
          <input
            value={deck.title}
            onChange={(event) =>
              updateDeckTitle(deck.id, event.target.value)
            }
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-3xl font-extrabold tracking-tight text-slate-900 shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)] sm:min-w-[320px]"
          />
          <p className="mt-1 text-sm text-slate-500">
            {cardCount} cards
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Main Menu
          </Link>
          <button
            type="button"
            onClick={async () => {
              await syncNow();
              setSaveMessage("Deck saved.");
              setIsEditorCollapsed(true);
              window.setTimeout(() => setSaveMessage(null), 2000);
            }}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--accent-dark)]"
          >
            Save Deck
          </button>
          <Link
            to={`/study/${deck.id}/flashcards`}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Start Studying
          </Link>
        </div>
      </header>

      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Deck Setup</h2>
          <p className="text-xs text-slate-500">
            Add cards manually or import CSV.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditorCollapsed((prev) => !prev)}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          {isEditorCollapsed ? "Edit Deck" : "Collapse"}
        </button>
      </div>

      {!isEditorCollapsed ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900">
              Add cards manually
            </h2>
            <div className="mt-4 grid gap-3">
              <input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Term"
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]"
              />
              <textarea
                value={definition}
                onChange={(event) => setDefinition(event.target.value)}
                placeholder="Definition"
                rows={3}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]"
              />
              <button
                type="button"
                onClick={handleAddCard}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--accent-dark)]"
              >
                Add Card
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900">
              Import CSV
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Accepts `Term,Definition` rows with or without headers.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={onFileChange}
                className="text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
              />
              <textarea
                value={csvText}
                onChange={(event) => setCsvText(event.target.value)}
                placeholder="Paste CSV text here"
                rows={6}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]"
              />
              <button
                type="button"
                onClick={() => handleImport(csvText)}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                Import From Text
              </button>
              {importStatus ? (
                <p className="text-sm text-slate-500">{importStatus}</p>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {saveMessage ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm">
          {saveMessage}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <h2 className="text-lg font-semibold text-slate-900">
          Current cards
        </h2>
        {cardsPreview.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No cards yet. Add your first card above.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {cardsPreview.map((card, index) => (
              <div
                key={card.id}
                className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Card {index + 1}
                </div>
                <div className="mt-3 grid gap-3">
                  <input
                    value={card.term}
                    onChange={(event) =>
                      updateCard(deck.id, card.id, {
                        term: event.target.value,
                      })
                    }
                    placeholder="Term"
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 shadow-sm focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                  />
                  <textarea
                    value={card.definition}
                    onChange={(event) =>
                      updateCard(deck.id, card.id, {
                        definition: event.target.value,
                      })
                    }
                    placeholder="Definition"
                    rows={2}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeCard(deck.id, card.id)}
                      className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-500 transition hover:border-rose-200 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
