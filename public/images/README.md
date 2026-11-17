# Photography

**This folder is empty in the repository as handed over.** The original five
HTML pages referenced 20 distinct `.jpg` files under `images/`, but none of
those files existed in the repo or anywhere in its Git history.

Every `<img>` in the app therefore has an explicit `onError` fallback (a warm
"Photo coming soon" placeholder) instead of a broken-image icon — but the site
will look unfinished until the real photos are dropped in here.

`docs/IMAGE_AUDIT.md` lists every expected filename, the product or section it
belongs to, the alt text in use, and which two cards currently have a
**mismatched** photo (the original site showed a matcha drink on the "Vanilla
Cloud" card, and a cinnamon roll on the "Burnt Honey Cake" card).

Drop files in with the exact names listed in that audit and they appear
immediately — no code changes needed.

Recommended: export at 2× the display size, `.jpg` (or add `.webp` siblings and
note it here so the audit can be updated), quality ~80, and keep each file under
250 KB.
