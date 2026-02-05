import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Card, Deck } from "../types";

type DeckState = {
  decks: Deck[];
  flashcardProgress: Record<
    string,
    {
      remainingIds: string[];
      againIds: string[];
      gotIds: string[];
    }
  >;
  learnProgress: Record<
    string,
    {
      remainingIds: string[];
      againIds: string[];
      gotIds: string[];
    }
  >;
  updatedAt: number;
  createDeck: (title: string) => Deck;
  updateDeckTitle: (deckId: string, title: string) => void;
  removeDeck: (deckId: string) => void;
  addCard: (deckId: string, card: Card) => void;
  addCards: (deckId: string, cards: Card[]) => void;
  updateCard: (
    deckId: string,
    cardId: string,
    updates: Partial<Omit<Card, "id">>
  ) => void;
  removeCard: (deckId: string, cardId: string) => void;
  initFlashcardProgress: (deckId: string, cardIds: string[]) => void;
  markFlashcard: (
    deckId: string,
    cardId: string,
    result: "again" | "got"
  ) => void;
  continueFlashcards: (deckId: string) => void;
  resetFlashcards: (deckId: string, cardIds: string[]) => void;
  initLearnProgress: (deckId: string, cardIds: string[]) => void;
  markLearnCard: (
    deckId: string,
    cardId: string,
    result: "again" | "got"
  ) => void;
  continueLearn: (deckId: string) => void;
  resetLearn: (deckId: string, cardIds: string[]) => void;
  setFromCloud: (payload: {
    decks: Deck[];
    flashcardProgress: DeckState["flashcardProgress"];
    learnProgress: DeckState["learnProgress"];
    updatedAt: number;
  }) => void;
  getDeckById: (deckId: string) => Deck | undefined;
};

const createId = () => crypto.randomUUID();

export const useDeckStore = create<DeckState>()(
  persist(
    (set, get) => ({
      decks: [],
      flashcardProgress: {},
      learnProgress: {},
      updatedAt: Date.now(),
      createDeck: (title) => {
        const deck: Deck = {
          id: createId(),
          title: title.trim() || "Untitled Deck",
          createdAt: Date.now(),
          cards: [],
        };
        set((state) => ({
          decks: [deck, ...state.decks],
          updatedAt: Date.now(),
        }));
        return deck;
      },
      updateDeckTitle: (deckId, title) => {
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? { ...deck, title }
              : deck
          ),
          updatedAt: Date.now(),
        }));
      },
      removeDeck: (deckId) => {
        set((state) => ({
          decks: state.decks.filter((deck) => deck.id !== deckId),
          flashcardProgress: Object.fromEntries(
            Object.entries(state.flashcardProgress).filter(
              ([key]) => key !== deckId
            )
          ),
          learnProgress: Object.fromEntries(
            Object.entries(state.learnProgress).filter(([key]) => key !== deckId)
          ),
          updatedAt: Date.now(),
        }));
      },
      addCard: (deckId, card) => {
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? { ...deck, cards: [...deck.cards, card] }
              : deck
          ),
          updatedAt: Date.now(),
        }));
      },
      addCards: (deckId, cards) => {
        if (cards.length === 0) return;
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? { ...deck, cards: [...deck.cards, ...cards] }
              : deck
          ),
          updatedAt: Date.now(),
        }));
      },
      updateCard: (deckId, cardId, updates) => {
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  cards: deck.cards.map((card) =>
                    card.id === cardId ? { ...card, ...updates } : card
                  ),
                }
              : deck
          ),
          updatedAt: Date.now(),
        }));
      },
      removeCard: (deckId, cardId) => {
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  cards: deck.cards.filter((card) => card.id !== cardId),
                }
              : deck
          ),
          flashcardProgress: {
            ...state.flashcardProgress,
            [deckId]: state.flashcardProgress[deckId]
              ? {
                  remainingIds: state.flashcardProgress[
                    deckId
                  ].remainingIds.filter((id) => id !== cardId),
                  againIds: state.flashcardProgress[deckId].againIds.filter(
                    (id) => id !== cardId
                  ),
                  gotIds: state.flashcardProgress[deckId].gotIds.filter(
                    (id) => id !== cardId
                  ),
                }
              : state.flashcardProgress[deckId],
          },
          learnProgress: {
            ...state.learnProgress,
            [deckId]: state.learnProgress[deckId]
              ? {
                  remainingIds: state.learnProgress[deckId].remainingIds.filter(
                    (id) => id !== cardId
                  ),
                  againIds: state.learnProgress[deckId].againIds.filter(
                    (id) => id !== cardId
                  ),
                  gotIds: state.learnProgress[deckId].gotIds.filter(
                    (id) => id !== cardId
                  ),
                }
              : state.learnProgress[deckId],
          },
          updatedAt: Date.now(),
        }));
      },
      initFlashcardProgress: (deckId, cardIds) => {
        const existing = get().flashcardProgress[deckId];
        if (existing && existing.remainingIds.length > 0) return;
        set((state) => ({
          flashcardProgress: {
            ...state.flashcardProgress,
            [deckId]: {
              remainingIds: [...cardIds],
              againIds: [],
              gotIds: [],
            },
          },
          updatedAt: Date.now(),
        }));
      },
      markFlashcard: (deckId, cardId, result) => {
        set((state) => {
          const progress = state.flashcardProgress[deckId];
          if (!progress) return state;
          if (!progress.remainingIds.includes(cardId)) return state;
          return {
            flashcardProgress: {
              ...state.flashcardProgress,
              [deckId]: {
                remainingIds: progress.remainingIds.filter(
                  (id) => id !== cardId
                ),
                againIds:
                  result === "again"
                    ? [...progress.againIds, cardId]
                    : progress.againIds,
                gotIds:
                  result === "got"
                    ? [...progress.gotIds, cardId]
                    : progress.gotIds,
              },
            },
            updatedAt: Date.now(),
          };
        });
      },
      continueFlashcards: (deckId) => {
        set((state) => {
          const progress = state.flashcardProgress[deckId];
          if (!progress) return state;
          if (progress.againIds.length === 0) return state;
          return {
            flashcardProgress: {
              ...state.flashcardProgress,
              [deckId]: {
                remainingIds: [...progress.againIds],
                againIds: [],
                gotIds: [],
              },
            },
            updatedAt: Date.now(),
          };
        });
      },
      resetFlashcards: (deckId, cardIds) => {
        set((state) => ({
          flashcardProgress: {
            ...state.flashcardProgress,
            [deckId]: {
              remainingIds: [...cardIds],
              againIds: [],
              gotIds: [],
            },
          },
          updatedAt: Date.now(),
        }));
      },
      initLearnProgress: (deckId, cardIds) => {
        const existing = get().learnProgress[deckId];
        if (existing && existing.remainingIds.length > 0) return;
        set((state) => ({
          learnProgress: {
            ...state.learnProgress,
            [deckId]: {
              remainingIds: [...cardIds],
              againIds: [],
              gotIds: [],
            },
          },
          updatedAt: Date.now(),
        }));
      },
      markLearnCard: (deckId, cardId, result) => {
        set((state) => {
          const progress = state.learnProgress[deckId];
          if (!progress) return state;
          if (!progress.remainingIds.includes(cardId)) return state;
          return {
            learnProgress: {
              ...state.learnProgress,
              [deckId]: {
                remainingIds: progress.remainingIds.filter((id) => id !== cardId),
                againIds:
                  result === "again"
                    ? [...progress.againIds, cardId]
                    : progress.againIds,
                gotIds:
                  result === "got"
                    ? [...progress.gotIds, cardId]
                    : progress.gotIds,
              },
            },
            updatedAt: Date.now(),
          };
        });
      },
      continueLearn: (deckId) => {
        set((state) => {
          const progress = state.learnProgress[deckId];
          if (!progress) return state;
          if (progress.againIds.length === 0) return state;
          return {
            learnProgress: {
              ...state.learnProgress,
              [deckId]: {
                remainingIds: [...progress.againIds],
                againIds: [],
                gotIds: [],
              },
            },
            updatedAt: Date.now(),
          };
        });
      },
      resetLearn: (deckId, cardIds) => {
        set((state) => ({
          learnProgress: {
            ...state.learnProgress,
            [deckId]: {
              remainingIds: [...cardIds],
              againIds: [],
              gotIds: [],
            },
          },
          updatedAt: Date.now(),
        }));
      },
      setFromCloud: (payload) => {
        set(() => ({
          decks: payload.decks ?? [],
          flashcardProgress: payload.flashcardProgress ?? {},
          learnProgress: payload.learnProgress ?? {},
          updatedAt: payload.updatedAt ?? Date.now(),
        }));
      },
      getDeckById: (deckId) => get().decks.find((deck) => deck.id === deckId),
    }),
    {
      name: "kuizlet-store",
      version: 1,
    }
  )
);

export const createEmptyCard = (): Card => ({
  id: createId(),
  term: "",
  definition: "",
  status: "new",
});
