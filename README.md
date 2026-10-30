# ATS Scanner Pro

Free ATS resume checker at **https://atsscannerpro.com**. Paste a job description, add a resume (PDF, DOCX, TXT or pasted text), and get a published-formula score, required vs nice-to-have keywords, measured formatting problems, and a prioritised fix list.

**The whole analysis runs in the visitor's browser.** No resume is uploaded, no AI API is called, so scans are unlimited and cost nothing to serve.

## Stack

Next.js 16 (App Router, all pages static) · React 19 · Tailwind CSS v4 · pdf.js + mammoth (client-side parsing) · Firebase Admin (invite list only) · Vercel.

## Run locally

```bash
npm install          # also copies the pdf.js worker into public/vendor
npm run dev
npm run verify       # typecheck → tests → production build
npm start & node scripts/seo-check.mjs http://localhost:3000   # SEO/content gate
```

## Environment variables (Vercel → Settings → Environment Variables)

| Variable | Needed for | Notes |
|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Invite list | The **new** service-account JSON (or base64 of it). Without it, signups return a clear error instead of pretending to succeed. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console | Only if you verify with the HTML-tag method. DNS verification needs nothing here. |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Bing Webmaster Tools | Optional. |
| `NEXT_PUBLIC_AD_SLOT_IN_ARTICLE` | AdSense | Slot ID of an **In-article** unit. |
| `NEXT_PUBLIC_AD_SLOT_END_OF_ARTICLE` | AdSense | Slot ID of a **Display (responsive)** unit. |
| `NEXT_PUBLIC_AD_SLOT_HOME` | AdSense | Slot ID of a **Display (responsive)** unit. |
| `NEXT_PUBLIC_PLAY_STORE_URL` | App button | Leave empty until the listing is live. |
| `NEXT_PUBLIC_APP_STORE_URL` | App button | Leave empty until the listing is live. |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Rate limiting | Optional; falls back to in-memory. |

Ad slots render nothing until their ID is set, so there are never empty boxes.

## ⚠️ Security: rotate the Firebase key

A Firebase Admin private key (`atsoptimizerme-firebase-adminsdk-fbsvc-c295bb0cc8.json`) was committed to this public repository. It has been removed from the working tree and `.gitignore` now blocks such files, **but it is still in git history and must be treated as compromised**:

1. Google Cloud Console → IAM & Admin → Service accounts → `firebase-adminsdk-fbsvc@atsoptimizerme…` → Keys → delete key `c295bb0c…`.
2. Create a new key and put it only in Vercel as `FIREBASE_SERVICE_ACCOUNT_KEY`.
3. Optionally purge history with `git filter-repo --path atsoptimizerme-firebase-adminsdk-fbsvc-c295bb0cc8.json --invert-paths` and force-push — but revoking the key is what actually protects you.

## Go-live checklist

**Domain and HTTPS** (Vercel → Domains)
- [ ] `atsscannerpro.com` is the primary domain; `www` redirects to it (308).
- [ ] HTTPS is automatic on Vercel; the site also sends HSTS.

**Google Search Console**
- [ ] Add a *Domain* property for `atsscannerpro.com` (DNS TXT record) — or URL-prefix with the HTML tag via `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
- [ ] Submit `https://atsscannerpro.com/sitemap.xml`.
- [ ] URL Inspection → request indexing for `/`, `/guides`, `/roles` and two or three guides.
- [ ] Also add the site to Bing Webmaster Tools (import from Search Console) — Bing feeds ChatGPT search and Copilot.

**AdSense**
- [ ] The site already includes the AdSense script, the `google-adsense-account` meta tag and `/ads.txt`.
- [ ] AdSense → Sites → atsscannerpro.com → **Request review** only after the site has been live and indexed for a couple of weeks, with the content in this repo published.
- [ ] Privacy & messaging → create the **European regulations** message (Google-certified CMP — required for EEA/UK/Swiss visitors) and the **US state regulations** message. No code needed.
- [ ] After approval: create the three ad units above and add their IDs to Vercel. Leave **Auto ads off** (or on with *Anchor* and *Vignette* disabled) so ads never cover the scanner.
- [ ] Ads → Settings → turn on **Optimization → auto-optimize** and use **Experiments** — this is Google's own learning system for RPM.

**Monthly revenue loop**: pull pageviews and page RPM by country from AdSense and run
`node scripts/revenue-plan.mjs us=PV:RPM uk=PV:RPM in=PV:RPM other=PV:RPM` — it reports the gap to $3,500/month and the cheapest lever to close it.

## Ad placement rules (AdSense policy)

- Ads appear only on content pages: home (below the explanatory sections), guides (in-article + end), role guides (mid + end).
- Never on the privacy, terms, contact, app/invite or 404 pages, and never next to the scanner's buttons or the app-store buttons (accidental-click policy).
- Every unit is labelled "Advertisement". Never click your own ads or ask anyone to.

## Content rules

- No invented statistics, ratings, reviews or user counts — in copy or in structured data.
- Example bullets are labelled as illustrative.
- Every guide shows author and updated date; update `updated` when content changes.
- `scripts/seo-check.mjs` fails the check if a known unsourced statistic, placeholder text, duplicate title or noindex-in-sitemap appears.

## Backlink and reach plan

Earn links; never buy them (paid links can trigger a manual action that also affects AdSense).

1. **Directories and launches**: Product Hunt, AlternativeTo (as an alternative to paid ATS checkers), SaaSHub, There's An AI For That is *not* a fit — the tool isn't AI. Listing honesty matters.
2. **University career centres**: email career-services teams with the free, private, no-signup angle — `.edu`/`.ac.uk`/`.ac.in` resource pages are the highest-value links in this niche.
3. **Communities**: answer questions in r/resumes, r/jobs, r/cscareerquestions, r/developersIndia and LinkedIn with a genuinely useful answer first and a link only where it helps. Follow each community's self-promotion rules.
4. **Linkable assets**: the role guides and the "ATS score explained" guide are designed to be cited. Pitch them to career newsletters and bootcamps.
5. **Open source**: publishing the keyword list (`src/lib/scan/lexicon.ts`) as a small open dataset is a natural link magnet.

## AI assistants and answer engines

- `robots.txt` explicitly allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended and others.
- `/llms.txt` gives assistants a plain-text summary with links to every guide.
- Pages are server-rendered HTML with clear headings, FAQ sections and `Article`, `WebApplication`, `FAQPage`, `BreadcrumbList`, `Organization` and `Person` structured data.

## Mobile app buttons

`src/config/site.ts` → `APP_LINKS`, or the two `NEXT_PUBLIC_*_STORE_URL` variables. While empty, buttons read "Coming soon" and jump to the invite form. When a listing goes live, set the URL and redeploy; replace the plain buttons with the official Google Play / App Store badges at that point (their brand rules only allow badges that link to a live listing).

## Project layout

```
src/lib/scan/        the scanner: lexicon, JD extraction, matching, parse checks, file reading
src/content/         guides (Markdown in TS) and role guides
src/components/      UI; scanner/ holds the tool and report
src/app/             routes, sitemap, robots, llms.txt, OG images, /api/waitlist
scripts/             seo-check, revenue-plan, pdf worker copy
tests/               engine tests (vitest)
```
