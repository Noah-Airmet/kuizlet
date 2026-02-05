Project: Kuizlet (Quizlet Lite)
Role: You are a Senior Frontend Engineer and UI/UX Designer. Goal: Build a clean, modern, ad-free flashcard application for personal use. It must be mobile-responsive (PWA ready), visually polished, and run entirely client-side.

1. Tech Stack & Setup
Framework: React (Vite) + TypeScript.

Styling: Tailwind CSS (Use a clean, neutral color palette: Slate, Indigo, White).

Animation: framer-motion (CRITICAL for the card flip and smooth transitions).

Icons: lucide-react.

State Management: zustand (with persist middleware to save to localStorage).

Utilities: papaparse (for CSV importing), clsx/tailwind-merge (for styling).

2. Data Structure (TypeScript Interfaces)
The app relies on two core entities. Please ensure the state conforms to this:

TypeScript
type Card = {
  id: string;
  term: string;
  definition: string;
  // Simple Leitner system status
  status: 'new' | 'learning' | 'mastered';
  lastReviewed?: number; // timestamp
}

type Deck = {
  id: string;
  title: string;
  createdAt: number;
  cards: Card[];
}
3. Core Features & Requirements
A. Dashboard (Home)
Display a grid of existing decks.

Each deck card shows: Title, Card count, and a "Study" button.

A prominent "Create New Deck" button.

Vibe: Minimalist. Think "Apple Notes" but for flashcards.

B. Deck Creator / Editor (The CSV Feature)
Manual Entry: A form to add Term/Definition pairs one by one.

CSV Import (Priority Feature):

Add a "Import CSV" button.

Use papaparse to accept a raw text paste or file upload.

Expect format: Term, Definition (headerless or with headers, auto-detect if possible).

Logic: Parse the CSV, generate IDs for each row, and append them to the current deck state.

C. Study Mode 1: Flashcards (The Classic)
Center Stage: A large, centralized card.

Interaction: Clicking the card triggers a 3D flip animation (using framer-motion) to reveal the back.

Navigation: Large "Previous" and "Next" arrows (keyboard accessible: Left/Right arrows).

Progress: A simple progress bar at the top (e.g., "Card 5 of 20").

D. Study Mode 2: Learn (The Quizlet Clone)
Logic: Present the Definition.

Multiple Choice: Generate 4 buttons:

1 is the Correct Term.

3 are Random Distractors (taken from other cards in the same deck).

Feedback:

Correct click: Turn green, wait 500ms, move to next.

Incorrect click: Shake animation, turn red, highlight the correct answer.

E. Study Mode 3: Practice Test (Simple Generation)
Generate a test based on the current deck.

Mix 50% Multiple Choice and 50% "Type the Answer" (string matching should be case-insensitive and trim whitespace).

At the end, show a "Score Report" with a percentage.

4. UI/UX "Vibe" Guidelines
Rounded Corners: Use rounded-xl or rounded-2xl for cards and buttons.

Shadows: Soft, diffused shadows (shadow-lg on hover) to create depth.

Typography: Sans-serif, readable, high contrast (Dark gray text on white cards).

Mobile First: Ensure touch targets are 44px+. The app must look native on an iPhone web view.

5. Implementation Plan (Execute in this order)
Scaffold: Set up the project, install dependencies (framer-motion, zustand, papaparse, lucide-react).

Store: Create the Zustand store with persist to handle Decks and Cards.

Components: Build the FlipCard component first (make the animation smooth).

Features: Build the Dashboard -> Import Logic -> Study Modes.

Refinement: Add the "Practice Test" logic last.

Action: Please initialize the project structure and provide the code for the Zustand store and the main App component with the routing set up.