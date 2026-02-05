export type Card = {
  id: string;
  term: string;
  definition: string;
  status: "new" | "learning" | "mastered";
  lastReviewed?: number;
};

export type Deck = {
  id: string;
  title: string;
  createdAt: number;
  cards: Card[];
};
