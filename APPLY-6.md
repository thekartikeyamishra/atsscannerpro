# Phase 6 — the two missing pages

```
src/app/page.tsx                 ← NEW (replacement, written blind)
src/app/role/[slug]/page.tsx     ← NEW (replacement, written blind)
src/components/ATSScanner.tsx    ← adds initialRole prop (supersedes phase 3)
```

## Read this before you copy anything

**I have never seen your homepage or your role template.** They didn't come through in six phases of uploads, so I wrote replacements from the data model, the components, and the design system.

**Do not deploy these over yours blind.** Your existing pages have accumulated real signals — rankings, backlinks, crawl history. A headline that ranks is worth more than a headline I think reads better, and I have no way to know which of your sections are earning traffic.

Diff them:

```bash
cp src/app/page.tsx src/app/page.tsx.mine
# then diff against the version in this pack
```

Take the specific changes below. Keep your own copy where it is working.

---

## What actually needs to change on the homepage

These four are the reason this file exists. Everything else is presentation you can take or leave.

**1. Delete the unsourced statistics.** Your audit found "75% of resumes are rejected", "3.5× more interviews", and "95% of Fortune 500" live on the homepage. None trace to primary research; the 75% figure appears to be an unsourced claim that got copied until it looked established. They are the single biggest E-E-A-T liability on the site, and `npm run seo:check` now fails the build if any of them reappear.

What replaces them is a description of what the tool does. That is weaker marketing and stronger positioning, because it is defensible.

**2. Delete the "Powered by" line.** You asked for this in phase 3 and I removed the one in `ATSScanner.tsx`. Your audit found a second on the homepage saying "Google Gemini 1.5 Flash" — a third different model name across the site, all of them wrong.

**3. Mount `ScanHistory` and the rescan delta.** Built in phase 5 with nowhere to go. The delta — *"72, up 14 from your last scan of this job"* — is the highest-value line in the product. A bare score tells a user almost nothing; a delta tells them their edit worked, which is what makes rescanning worth doing.

**4. Check ad placement.** In this version there is one `InContentAd`, far below the scanner, after real content. If your current homepage has a banner above the fold plus an anchor unit on a single-tool page, that is the ad-density shape that draws AdSense attention.

---

## The role template, and the problem it can't fully solve

Your external audit's central worry was that role pages are one template with the nouns swapped — scaled content abuse to Google, low-value content to AdSense. **That worry is legitimate and this rewrite does not eliminate it.** It is still a template. I want to be straight about that rather than imply a rewrite fixed a content problem.

What it does change:

- **The per-role data is genuinely deep.** Fifteen keywords each carrying an importance weight, critical vs soft skills, certifications, tools, and written FAQs. That is real differentiation, not synonym swapping.
- **Sections are conditional.** No certifications means no certifications heading — rather than an empty section padded to look full.
- **The market-data block** surfaces what postings for *this* role actually asked for, from your own telemetry. That content cannot be copied or generated. It renders only above the sample threshold, so today it shows nothing.

That last one is the real answer to the thin-content question, and it is the reason phase 4 built `marketIntel.ts`. **A role page carrying live data from 400 scans is not a template page any more.** Until then, these pages are good reference material and nothing more.

### Two fields I deliberately stopped displaying

`rolesData.ts` contains statistics presented as measurements that are not:

- `demandGrowth: "+28% YoY"` — no source, no methodology, no date. Every role has one.
- `avgAtsScore: 55` — implies a measured average across real scans. You now have the pipeline to measure this for real. Until the sample is large enough, a hardcoded number is invented data.

Salary ranges are still shown, but labelled as indicative ranges compiled from public postings rather than survey data — which is what they are.

**Fix the data file too.** These fields are in `rolesData.ts` for every role and will resurface wherever else they are rendered. `/api/roles/route.ts` currently returns `demandGrowth` and `avgAtsScore` in its public payload.

---

## Wiring

The role CTA now points at `/?role=<slug>#scanner`, and `ATSScanner` accepts `initialRole` so the dropdown arrives preselected. The homepage validates the slug against `rolesData` before passing it — that value reaches a form field that ends up in the AI prompt, so an unvalidated pass-through would be a free injection vector.

Add the rescan delta yourself in `ATSScanner.tsx` (phase 5, `APPLY-5.md` §1) — I've left it out here because it depends on where you render results, which I can't see.

---

## Verify

```bash
npm run verify && npm start
npm run seo:check
```

- [ ] `seo:check` reports no unsourced statistics
- [ ] Every role page has a unique title and description (the script fails on duplicates)
- [ ] `/role/senior-software-engineer` → CTA → scanner with the role preselected
- [ ] Role pages prerender at build (`generateStaticParams`)
- [ ] FAQ schema appears only on pages with visible FAQs

Expect `seo:check` to flag role pages on the 250-word rule if any role has sparse data. That is the thin-content question stated as a number, and it is worth reading as a to-do list rather than a nuisance.

---

## Where the platform stands

Six phases. Honestly:

**Done.** Build integrity (Tailwind compiling, imports resolving), security (Firestore locked, rate limiting real, injection hardened, PII stripping consolidated and applied to both documents), honesty (fabricated ratings gone, unsourced statistics gone, model named correctly, methodology and security published), performance (icons 13 MB → 190 KB, fonts self-hosted), accessibility (keyboard access restored to the upload and the results tabs), the moat foundations, and the return loop.

**Not done.** Real accounts and cross-device history. Razorpay and any paid tier. Content clusters and guides beyond role pages. Per-role editorial depth.

**The honest bottom line:** the platform is not complete, and I don't think "complete" is the right target for it. What has changed over six phases is that it now works, doesn't leak, doesn't claim things that aren't true, and has a loop that gives someone a reason to come back.

The next thing that would move the business is not more code from me — it is **volume through the existing loop.** Moats 2 and 3 are built and empty. They fill only with real users doing real scans and coming back to report outcomes. A hundred outcome reports would let you publish something on `/insights` that no competitor can match; a thousand scans per role would turn every role page from a template into a data page and settle the AdSense question outright.

That is a distribution problem now, not an engineering one.
