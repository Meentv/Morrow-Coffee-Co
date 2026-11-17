import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import type { FaqEntry } from "@/data/faq";
import { cn } from "@/lib/utils";

/**
 * Accessible FAQ accordion.
 *
 * Original behaviour: any number of items could be open; the panel was a <div>
 * with `max-height: 240px` (so a long answer was clipped) and the trigger was a
 * <button> with no `aria-expanded`/`aria-controls`, no `id` on the panel, and no
 * relationship between the two. The "+" glyph carried the entire open state.
 *
 * Now: one item open at a time (matching the original's visual model of a tidy
 * list), each trigger exposes `aria-expanded` + `aria-controls`, panels are
 * labelled by their trigger, height animates from measured content rather than
 * a magic max-height, and the +/- glyph is decorative.
 */
export function FaqAccordion({ entries }: { entries: readonly FaqEntry[] }) {
  const [openId, setOpenId] = useState<string | null>(entries[0]?.id ?? null);
  const baseId = useId();

  return (
    <div className="max-w-[820px]">
      {entries.map((entry) => {
        const isOpen = openId === entry.id;
        const triggerId = `${baseId}-${entry.id}-trigger`;
        const panelId = `${baseId}-${entry.id}-panel`;

        return (
          <div key={entry.id} className="border-b border-line">
            <h3 className="m-0">
              <button
                type="button"
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : entry.id)}
                className="flex w-full items-center justify-between gap-[18px] py-[21px] text-left text-[16.5px] font-semibold tracking-[-0.03em] text-espresso"
              >
                <span>{entry.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex-none text-[22px] leading-none font-normal text-gold transition-transform duration-300 ease-brand",
                    isOpen && "rotate-45",
                  )}
                >
                  +
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <p className="pr-10 pb-[22px] text-sm leading-[1.75] text-muted-strong">
                    {entry.answer}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
