import { motion } from "framer-motion";

type FlipCardProps = {
  front: string;
  back: string;
  isFlipped: boolean;
  onToggle: () => void;
};

export default function FlipCard({
  front,
  back,
  isFlipped,
  onToggle,
}: FlipCardProps) {
  return (
    <div className="w-full max-w-xl [perspective:1200px]">
      <button
        type="button"
        onClick={onToggle}
        className="group relative h-72 w-full rounded-2xl bg-transparent"
        aria-pressed={isFlipped}
      >
        <motion.div
          className="relative h-full w-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-slate-100 bg-white p-6 text-center text-2xl font-semibold text-slate-900 shadow-lg [backface-visibility:hidden]">
            {front}
          </div>
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-slate-100 bg-slate-900 p-6 text-center text-2xl font-semibold text-white shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
            {back}
          </div>
        </motion.div>
      </button>
    </div>
  );
}
