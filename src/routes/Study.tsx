import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Brain, CheckCircle } from "lucide-react";
import FlipCard from "../components/FlipCard";
import { useDeckStore } from "../store/useDeckStore";
import type { Card } from "../types";
import { pickRandom, shuffle } from "../utils";
import { useCloudSync } from "../hooks/useCloudSync";

export default function Study() {
  const { deckId, mode } = useParams();
  const { syncNow } = useCloudSync();
  const deck = useDeckStore((state) =>
    deckId ? state.getDeckById(deckId) : undefined
  );

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

  const activeMode = mode ?? "flashcards";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="kuizlet-label text-xs uppercase text-slate-400">
            Study Mode
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              {deck.title}
            </h1>
            <Link
              to="/"
              onClick={() => void syncNow()}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Exit
            </Link>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2">
          <ModeTab
            to={`/study/${deck.id}/flashcards`}
            label="Flashcards"
            icon={BookOpen}
          />
          <ModeTab
            to={`/study/${deck.id}/learn`}
            label="Learn"
            icon={Brain}
          />
          <ModeTab
            to={`/study/${deck.id}/test`}
            label="Practice Test"
            icon={CheckCircle}
          />
        </nav>
      </header>

      {activeMode === "learn" ? (
        <LearnMode cards={deck.cards} />
      ) : activeMode === "test" ? (
        <PracticeTest cards={deck.cards} />
      ) : (
        <Flashcards cards={deck.cards} />
      )}
    </div>
  );
}

type ModeTabProps = {
  to: string;
  label: string;
  icon: typeof BookOpen;
};

function ModeTab({ to, label, icon: Icon }: ModeTabProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition",
          isActive
            ? "border-[color:var(--accent-soft)] bg-[color:var(--accent-soft)] text-[color:var(--accent-dark)]"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
        ].join(" ")
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}

function Flashcards({ cards }: { cards: Card[] }) {
  const { deckId } = useParams();
  const [showTermFirst, setShowTermFirst] = useState(true);
  const initFlashcardProgress = useDeckStore(
    (state) => state.initFlashcardProgress
  );
  const markFlashcard = useDeckStore((state) => state.markFlashcard);
  const continueFlashcards = useDeckStore((state) => state.continueFlashcards);
  const resetFlashcards = useDeckStore((state) => state.resetFlashcards);
  const progress = useDeckStore((state) =>
    deckId ? state.flashcardProgress[deckId] : undefined
  );
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (!deckId) return;
    const ids = cards.map((card) => card.id);
    initFlashcardProgress(deckId, shuffle(ids));
  }, [cards, deckId, initFlashcardProgress]);

  useEffect(() => {
    setIsFlipped(false);
  }, [progress?.remainingIds?.[0]]);

  if (cards.length === 0) {
    return (
      <EmptyState message="No cards in this deck yet. Add a few to begin studying." />
    );
  }

  if (!deckId || !progress) {
    return (
      <EmptyState message="Preparing your study session. Please wait a moment." />
    );
  }

  const remaining = progress.remainingIds;
  const againCount = progress.againIds.length;
  const gotCount = progress.gotIds.length;

  if (remaining.length === 0) {
    if (againCount > 0) {
      return (
        <motion.section
          className="rounded-2xl border border-slate-100 bg-white/90 p-8 text-center shadow-sm backdrop-blur"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-semibold text-slate-900">
            Great job!
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            You reviewed every card. Keep going with the ones marked "study
            again."
          </p>
          <button
            type="button"
            onClick={() => continueFlashcards(deckId)}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--accent)] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--accent-dark)]"
        >
          Continue Studying
        </button>
        </motion.section>
      );
    }

    return (
      <motion.section
        className="rounded-2xl border border-slate-100 bg-white/90 p-8 text-center shadow-sm backdrop-blur"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h2 className="text-2xl font-semibold text-slate-900">Congrats!</h2>
        <p className="mt-2 text-sm text-slate-500">
          You cleared every card in this deck.
        </p>
        <button
          type="button"
          onClick={() => resetFlashcards(deckId, shuffle(cards.map((c) => c.id)))}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          Reset Flashcard Progress
        </button>
      </motion.section>
    );
  }

  const currentId = remaining[0];
  const card = cards.find((item) => item.id === currentId);
  if (!card) {
    return (
      <EmptyState message="We couldn't find this card. Please refresh the page." />
    );
  }

  const totalSeen = againCount + gotCount;
  const totalCards = cards.length;

  return (
    <motion.section
      className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm backdrop-blur"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            {totalSeen + 1} of {totalCards}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Click to flip
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/80 px-3 py-2 text-xs text-slate-500">
          <span>
            Prompt side: {showTermFirst ? "Term" : "Definition"}
          </span>
          <button
            type="button"
            onClick={() => {
              const proceed = window.confirm(
                "Switching the prompt side will reset flashcard progress. Continue?"
              );
              if (!proceed) return;
              setShowTermFirst((prev) => !prev);
              resetFlashcards(deckId, shuffle(cards.map((c) => c.id)));
            }}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Switch Side
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-full bg-rose-100/60 px-3 py-2 text-xs font-semibold text-rose-600">
            Study again: {againCount}
          </div>
          <div className="rounded-full bg-emerald-100/70 px-3 py-2 text-xs font-semibold text-emerald-700 text-right">
            Got it: {gotCount}
          </div>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-3">
          <div className="h-2 overflow-hidden rounded-full bg-rose-100">
            <div
              className="h-full rounded-full bg-rose-400 transition-all"
              style={{
                width: `${(againCount / totalCards) * 100}%`,
              }}
            />
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{
                width: `${(gotCount / totalCards) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center">
        <FlipCard
          front={
            showTermFirst
              ? card.term || "Untitled term"
              : card.definition || "No definition yet"
          }
          back={
            showTermFirst
              ? card.definition || "No definition yet"
              : card.term || "Untitled term"
          }
          isFlipped={isFlipped}
          onToggle={() => setIsFlipped((prev) => !prev)}
        />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            markFlashcard(deckId, card.id, "again");
          }}
          className="inline-flex h-12 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
        >
          Study Again
        </button>
        <button
          type="button"
          onClick={() => {
            markFlashcard(deckId, card.id, "got");
          }}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-[color:var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]"
        >
          Got It
        </button>
      </div>
    </motion.section>
  );
}

function LearnMode({ cards }: { cards: Card[] }) {
  const { deckId } = useParams();
  const [showTermPrompt, setShowTermPrompt] = useState(false);
  const initLearnProgress = useDeckStore((state) => state.initLearnProgress);
  const markLearnCard = useDeckStore((state) => state.markLearnCard);
  const continueLearn = useDeckStore((state) => state.continueLearn);
  const resetLearn = useDeckStore((state) => state.resetLearn);
  const progress = useDeckStore((state) =>
    deckId ? state.learnProgress?.[deckId] : undefined
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!deckId) return;
    const ids = cards.map((card) => card.id);
    initLearnProgress(deckId, shuffle(ids));
  }, [cards, deckId, initLearnProgress]);

  useEffect(() => {
    setSelected(null);
    setIsCorrect(null);
  }, [progress?.remainingIds?.[0]]);

  if (cards.length === 0) {
    return (
      <EmptyState message="No cards to learn yet. Add cards in the deck editor first." />
    );
  }

  if (!deckId || !progress) {
    return (
      <EmptyState message="Preparing your learning session. Please wait a moment." />
    );
  }

  const remaining = progress.remainingIds;
  const againCount = progress.againIds.length;
  const gotCount = progress.gotIds.length;

  if (remaining.length === 0) {
    if (againCount > 0) {
      return (
        <motion.section
          className="rounded-2xl border border-slate-100 bg-white/90 p-8 text-center shadow-sm backdrop-blur"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-semibold text-slate-900">
            Great job!
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Keep going with the ones you missed.
          </p>
          <button
            type="button"
            onClick={() => continueLearn(deckId)}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--accent)] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--accent-dark)]"
          >
            Continue Learning
          </button>
        </motion.section>
      );
    }

    return (
      <motion.section
        className="rounded-2xl border border-slate-100 bg-white/90 p-8 text-center shadow-sm backdrop-blur"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h2 className="text-2xl font-semibold text-slate-900">Congrats!</h2>
        <p className="mt-2 text-sm text-slate-500">
          You cleared every card in Learn mode.
        </p>
        <button
          type="button"
          onClick={() => resetLearn(deckId, shuffle(cards.map((c) => c.id)))}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          Reset Learn Progress
        </button>
      </motion.section>
    );
  }

  const currentId = remaining[0];
  const current = cards.find((card) => card.id === currentId);
  if (!current) {
    return (
      <EmptyState message="We couldn't find this card. Please refresh the page." />
    );
  }

  const options = useMemo(() => {
    const distractors = cards.filter((card) => card.id !== current.id);
    const pickCount = Math.min(3, distractors.length);
    const picks = pickRandom(distractors, pickCount).map((card) =>
      showTermPrompt ? card.definition : card.term
    );
    return shuffle(
      [
        showTermPrompt ? current.definition : current.term,
        ...picks,
      ].filter(Boolean)
    );
  }, [cards, current, showTermPrompt]);

  const handleSelect = (option: string) => {
    if (selected) return;
    const correct = showTermPrompt
      ? option === current.definition
      : option === current.term;
    setSelected(option);
    setIsCorrect(correct);
    if (!correct) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
    }
  };

  const handleContinue = () => {
    if (!selected) return;
    if (isCorrect) {
      markLearnCard(deckId, current.id, "got");
      return;
    }
    markLearnCard(deckId, current.id, "again");
  };

  const totalSeen = againCount + gotCount;
  const totalCards = cards.length;

  return (
    <motion.section
      className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm backdrop-blur"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            {totalSeen + 1} of {totalCards}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Pick the correct {showTermPrompt ? "definition" : "term"}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/80 px-3 py-2 text-xs text-slate-500">
          <span>
            Prompt side: {showTermPrompt ? "Term" : "Definition"}
          </span>
          <button
            type="button"
            onClick={() => {
              const proceed = window.confirm(
                "Switching the prompt side will reset learn progress. Continue?"
              );
              if (!proceed) return;
              setShowTermPrompt((prev) => !prev);
              resetLearn(deckId, shuffle(cards.map((c) => c.id)));
            }}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Switch Side
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-full bg-rose-100/60 px-3 py-2 text-xs font-semibold text-rose-600">
            Study again: {againCount}
          </div>
          <div className="rounded-full bg-emerald-100/70 px-3 py-2 text-xs font-semibold text-emerald-700 text-right">
            Got it: {gotCount}
          </div>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-3">
          <div className="h-2 overflow-hidden rounded-full bg-rose-100">
            <div
              className="h-full rounded-full bg-rose-400 transition-all"
              style={{
                width: `${(againCount / totalCards) * 100}%`,
              }}
            />
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{
                width: `${(gotCount / totalCards) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <motion.div
        className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center text-xl font-semibold text-slate-900"
        animate={shake ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {showTermPrompt
          ? current.term || "Untitled term"
          : current.definition || "No definition yet"}
      </motion.div>
      <div className="mt-6 grid gap-3">
        {options.map((option) => {
          const isAnswer = selected === option;
          const isOptionCorrect = option === current.term;
          const showCorrect = selected && isOptionCorrect;
          const showIncorrect = isAnswer && !isOptionCorrect;
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={[
                "inline-flex min-h-[44px] items-center justify-center rounded-xl border px-4 text-sm font-semibold transition",
                showCorrect
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : showIncorrect
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900",
              ].join(" ")}
            >
              {option}
            </button>
          );
        })}
      </div>
      {selected ? (
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]"
          >
            {isCorrect ? "Next" : "Continue"}
          </button>
        </div>
      ) : null}
      {isCorrect === false ? (
        <p className="mt-3 text-sm text-rose-500">
          Not quite. We will revisit this one.
        </p>
      ) : null}
    </motion.section>
  );
}

type Question = {
  id: string;
  cardId: string;
  type: "mc" | "typed";
  prompt: string;
  answer: string;
  options?: string[];
};

function PracticeTest({ cards }: { cards: Card[] }) {
  const questions = useMemo<Question[]>(() => {
    if (cards.length === 0) return [];
    const shuffled = shuffle(cards);
    const half = Math.ceil(shuffled.length / 2);
    const mcCards = shuffled.slice(0, half);
    const typedCards = shuffled.slice(half);
    const mcQuestions = mcCards.map((card) => {
      const distractors = pickRandom(
        shuffled.filter((item) => item.id !== card.id),
        Math.min(3, shuffled.length - 1)
      ).map((item) => item.term);
      const options = shuffle([card.term, ...distractors].filter(Boolean));
      return {
        id: crypto.randomUUID(),
        cardId: card.id,
        type: "mc" as const,
        prompt: card.definition,
        answer: card.term,
        options,
      };
    });
    const typedQuestions = typedCards.map((card) => ({
      id: crypto.randomUUID(),
      cardId: card.id,
      type: "typed" as const,
      prompt: card.definition,
      answer: card.term,
    }));
    return shuffle([...mcQuestions, ...typedQuestions]);
  }, [cards]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setAnswers({});
    setSubmitted(false);
  }, [questions.length]);

  if (questions.length === 0) {
    return (
      <EmptyState message="No cards to test yet. Add cards in the deck editor first." />
    );
  }

  const current = questions[currentIndex];
  const total = questions.length;
  const correctCount = questions.reduce((count, question) => {
    const response = answers[question.id];
    if (!response) return count;
    if (
      response.trim().toLowerCase() === question.answer.trim().toLowerCase()
    ) {
      return count + 1;
    }
    return count;
  }, 0);

  if (submitted) {
    const percentage = Math.round((correctCount / total) * 100);
    return (
      <motion.section
        className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm backdrop-blur"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h2 className="text-2xl font-semibold text-slate-900">
          Score Report
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          You scored {correctCount} out of {total} ({percentage}%).
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setAnswers({});
            setCurrentIndex(0);
          }}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          Retake Test
        </button>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-sm backdrop-blur"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Question {currentIndex + 1} of {total}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Practice Test
        </span>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-lg font-semibold text-slate-900">
        {current.prompt || "No definition provided"}
      </div>
      {current.type === "mc" && current.options ? (
        <div className="mt-6 grid gap-3">
          {current.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() =>
                setAnswers((prev) => ({ ...prev, [current.id]: option }))
              }
              className={[
                "inline-flex min-h-[44px] items-center justify-center rounded-xl border px-4 text-sm font-semibold transition",
                answers[current.id] === option
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900",
              ].join(" ")}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <input
            type="text"
            value={answers[current.id] ?? ""}
            onChange={(event) =>
              setAnswers((prev) => ({ ...prev, [current.id]: event.target.value }))
            }
            placeholder="Type your answer"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]"
          />
        </div>
      )}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentIndex === 0}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>
        {currentIndex === total - 1 ? (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Submit Test
            <CheckCircle className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              setCurrentIndex((prev) => Math.min(prev + 1, total - 1))
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-slate-500 shadow-sm backdrop-blur">
      {message}
    </div>
  );
}
