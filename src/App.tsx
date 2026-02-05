import { Navigate, Route, Routes } from "react-router-dom";
import CloudSyncBar from "./components/CloudSyncBar";
import Dashboard from "./routes/Dashboard";
import DeckEditor from "./routes/DeckEditor";
import Study from "./routes/Study";

export default function App() {
  return (
    <div className="min-h-full bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <CloudSyncBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/deck/:deckId" element={<DeckEditor />} />
        <Route path="/study/:deckId/:mode" element={<Study />} />
        <Route path="/study/:deckId" element={<Navigate to="flashcards" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
