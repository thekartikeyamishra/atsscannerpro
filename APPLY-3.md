# Phase 3 — what changed

Apply after phases 1 and 2. Six files changed, three are new.

```
src/components/ATSScanner.tsx    ← "Powered by" line removed
src/components/ResultsPanel.tsx  ← real tab widget (was 5 unlabelled buttons)
src/components/FileUpload.tsx    ← the file input is now reachable by keyboard
src/components/Footer.tsx        ← links /security
src/app/sitemap.ts               ← adds /security  (supersedes phase 2)
src/app/security/page.tsx        ← NEW
scripts/seo-check.mjs            ← NEW — automated quality gate
package.json                     ← adds seo:check and verify scripts
```

---

## The "Powered by" line

Removed from `ATSScanner.tsx`. It read *"Powered by Google Gemini · Results in ~10–20 seconds"* — I kept the timing half, because telling someone a wait is coming before a 10–20 second wait is real UX, and dropped the vendor attribution. If you want the whole line gone, delete the `<p>`; there's a comment marking it.

Worth removing on the merits, not just because you asked: it was wrong for months (it said GPT-4o Mini while the code called Gemini), it advertises that the product is a wrapper around someone else's model, and it becomes a lie the moment you switch providers.

**There is probably another one I can't reach.** Your external audit found *"Powered by Google Gemini 1.5 Flash"* on the homepage — a third different model name. That's in `app/page.tsx`, which I still don't have. Find it with:

```bash
grep -rn "Powered by\|GPT-4o\|Gemini 1.5\|OpenAI" src/app/
```

The `seo:check` script below will also flag it, since it scans rendered HTML.

---

## Accessibility

Two components had defects that make the tool unusable rather than merely awkward.

**`FileUpload`** — the `<input type="file">` carried `aria-hidden="true"` and `className="hidden"`. Between them, the only real control was removed from both the accessibility tree and the tab order, so a keyboard or screen-reader user had **no way to upload a resume at all**. The wrapper also had `role="button"` while containing the Remove button — nested interactive elements inside a button role, which makes the inner control unreachable. And its key handler took Enter but not Space, which a button role must support.

Now: the wrapper is a plain drop target plus a click convenience, and the input is `sr-only` — invisible, still focusable, properly labelled. Errors and warnings got `role="alert"` / `role="status"` so they're announced instead of silently appearing.

Also replaced `JSX.Element` with `React.ReactElement` in that file — `JSX` is not a global namespace under the React 19 types, so that annotation would fail `tsc`.

**`ResultsPanel`** — five plain buttons in a div. No `tablist`, no `aria-selected`, no `tabpanel` association, and five separate tab stops. A screen reader announced five unrelated buttons with no indication which panel was showing. Now a proper ARIA tab widget with roving tabindex: one Tab stop for the set, arrow keys to move, Home/End to jump.

---

## `/security`

Pairs with `/methodology`. That page explains how the score is produced; this one explains what happens to the file.

Every control it describes is implemented — in-memory parsing, magic-byte validation, PII stripping, per-request prompt delimiters, hashed cache keys, shared rate limiting, closed database rules, server-side secrets. It's written specifically enough that you can be held to it, which is the only kind of security page worth publishing.

It has a **"What we don't claim"** section: no SOC 2, no ISO 27001, no "GDPR compliant" badge, and an explicit statement that automated redaction is imperfect. Do not add those claims later without the attestation to back them. A certification you don't hold is a legal exposure, and on a page whose entire purpose is trust it's the worst possible place to overstate.

---

## `scripts/seo-check.mjs`

Your brief asked for automated checks against missing/duplicate titles, missing canonicals, noindex pages in the sitemap, broken internal links, and placeholder text. This is that gate. No dependencies, plain Node 18+.

```bash
npm run build && npm start     # terminal 1
npm run seo:check              # terminal 2
npm run seo:check -- https://atsscannerpro.com
```

It reads your sitemap, crawls every URL, and reports per page. Exits 1 on any error, so you can gate a deploy with `"predeploy": "next build && node scripts/seo-check.mjs"`.

**Errors** (block): non-200 or redirecting sitemap URLs, missing title/description/canonical/h1, noindex pages listed in the sitemap, duplicate titles or descriptions across pages, broken internal links, placeholder text (`TODO`, `YOUR_*`, `[GOVERNING LAW]`, `Lorem ipsum`, stray `undefined`), pages under 250 words, and **the four unsourced statistics we removed** — so if one gets pasted back in, the build tells you.

**Warnings**: over-length titles, short descriptions, multiple h1s, missing og:image, missing alt text, orphan pages.

Two things to expect on the first run: `/terms` will error on `[GOVERNING LAW]` until you fill those in — that's the script working as intended — and thin role pages will show up under the 250-word rule, which is the AdSense low-value-content question stated as a number.

---

## Verify

```bash
npm run verify        # typecheck + lint + build
npm start
npm run seo:check
```

Then by hand:

- [ ] Tab through the scanner without a mouse. You must be able to reach and operate the file input.
- [ ] With a result showing, Tab once into the tab strip, then use arrow keys.
- [ ] `grep -rn "Powered by" src/` → nothing.
- [ ] `/security` and `/methodology` render dark, appear in `/sitemap.xml`, and are linked from the footer.

---

## Where the platform actually stands

Three phases in, the picture is: **the things that were broken or risky are fixed; the product build-out has barely started.**

Done — build integrity, security, and honesty:
Tailwind compiling · Firestore locked · fabricated ratings gone · icons 13 MB → 190 KB · rate limiting real · one PII stripper · one cache · prompt injection hardened · JD stripped · progress honest · unsourced stats gone · keyboard access restored · `/methodology`, `/security`, `/terms` published · automated SEO gate.

Not started — the revenue engine:
Razorpay and any paid tier · scan history and accounts (the entire reason anyone would return) · the content clusters and guides · role-page differentiation · the homepage itself.

**Still blocked on the same two files.** `app/page.tsx` and `app/role/[slug]/page.tsx` never made it through — they're the largest surface area on the site, they hold the remaining unsourced claims and the third wrong model name, and the role template is where the AdSense low-value-content decision gets made. Every phase has ended here. Send those two and that becomes the next chunk of real work.
