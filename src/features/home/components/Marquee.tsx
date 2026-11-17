/**
 * Dark marquee strip. The original duplicated the phrase list twice inside one
 * track and animated `translateX(-50%)`.
 *
 * Fixes: the duplicated copy is `aria-hidden` so screen readers don't hear the
 * slogans twice, and under prefers-reduced-motion the strip becomes a single
 * static, wrapping row (see globals.css) instead of a frozen off-screen line.
 */
const PHRASES = ["slow mornings", "good coffee", "fresh from the kitchen"] as const;

function PhraseGroup({ hidden }: { hidden?: boolean }) {
  return (
    <div className="marquee-group" aria-hidden={hidden ? "true" : undefined}>
      {PHRASES.map((phrase) => (
        <span key={phrase} className="flex items-center gap-[44px]">
          <span className="font-display text-[17px] font-medium italic">{phrase}</span>
          <b aria-hidden="true" className="text-[14px] text-gold">
            ✦
          </b>
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="overflow-hidden bg-espresso py-[15px] text-cream">
      <div className="marquee-track">
        <PhraseGroup />
        <PhraseGroup hidden />
      </div>
    </div>
  );
}
