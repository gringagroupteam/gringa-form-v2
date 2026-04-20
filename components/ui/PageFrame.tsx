import { useFormContext } from "@/lib/state/FormContext";
import { AnimatePresence, motion } from "framer-motion";

export function PageFrame({ number }: { number: string }) {
  const { state } = useFormContext();

  return (
    <>
      <div className="fixed top-6 left-6 font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-ink-muted flex items-center gap-3">
        <span>({number})</span>
        <AnimatePresence>
          {state.isSyncing && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-sans italic lowercase text-[10px] tracking-normal normal-case opacity-40"
            >
              Saving...
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="fixed top-6 right-6 font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-ink-muted">
        GRINGA GROUP™
      </div>
    </>
  );
}
