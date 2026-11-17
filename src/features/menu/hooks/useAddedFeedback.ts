import { useEffect, useState } from "react";

/**
 * Tracks whether a product has been added to the basket recently, for the
 * short "Added ✓" confirmation on the card itself.
 *
 * A toast alone is not enough feedback for a control the user's pointer is
 * still resting on; the card also confirms inline. The flag clears on a timer
 * so rapid repeated adds each re-trigger the visual state.
 */
export function useAddedFeedback(productId: string, resetMs = 1400) {
  const [added, setAdded] = useState(false);
  const [trackedId, setTrackedId] = useState(productId);

  // If the component is reused for a different product (e.g. list re-order),
  // reset the flag so one card never shows another card's confirmation.
  if (trackedId !== productId) {
    setTrackedId(productId);
    setAdded(false);
  }

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), resetMs);
    return () => window.clearTimeout(timer);
  }, [added, resetMs]);

  return { added, confirm: () => setAdded(true) };
}
