# Six moats for ATS Scanner Pro

## First, the premise

You asked for moats that **cannot be copied by any AI agent, model, or system, no matter how advanced.**

I can't give you that, and I'd be lying if I said otherwise. Anything I write here, a capable model can reimplement. Every algorithm, every page, every clever prompt — copyable. If a defence depends on a competitor not being able to *figure it out*, it has already failed, because figuring things out is precisely what these systems are getting better at.

But that framing points straight at the real answer.

**The durable advantages aren't made of information.** They're made of things where the bottleneck is not intelligence: elapsed time, real users doing real things, physical measurement of systems you don't control, and reputation that accrues only by being right in public repeatedly. A model with infinite capability still cannot tell you what a recruiter did last Tuesday with a resume it never saw. Not because it isn't smart enough — because that fact isn't in the world it has access to.

So the six below are chosen on one test: **could a competitor with unlimited AI capability replicate this next week?** If yes, it isn't a moat. Six that pass.

---

## Moat 1 — Measured parse behaviour, not generated opinion

**Why it holds:** A model asked "does this resume have formatting problems?" produces a plausible answer. It cannot tell you what a real parser actually did to a real file, because that requires running the parser on the file. That's measurement, not inference.

**Status: built.** `src/lib/atsParseChecks.ts` — eleven deterministic checks over extracted text and raw bytes. Column-layout detection from line-length distribution, encoding damage from decode artefacts, table detection from whitespace runs, image-heavy PDFs from the ratio of file size to recovered words. Every finding carries the evidence that triggered it and a confidence level (`measured` / `likely` / `heuristic`).

**Why it compounds:** it runs *before* the AI call, so it costs nothing per scan, returns instantly, shrinks the AI prompt, and still works when Gemini is down.

**Where it goes next:** the real version of this moat is a **parse harness** — a corpus of resumes run through actual open-source parsers, with recorded outputs. Then "this may not parse well" becomes "we ran this layout through 4 parsers; 2 dropped the skills section." Nobody can generate that. It has to be measured. That's the highest-value engineering project on this list.

---

## Moat 2 — Outcome data: whether the score means anything

**Why it holds:** Every ATS tool gives you a number. As far as I can tell, none publish whether that number relates to what happens next. That's not an oversight — validating it requires something no model can generate: what actually happened to the applicant. You can only get it by having users who come back and tell you.

**Status: built.** `POST /api/outcome`, `src/components/OutcomeFeedback.tsx`, and `getScoreCalibration()` in `src/lib/marketIntel.ts`. Four coarse buckets, no free text, no identifier linking an outcome to a person. Gated at 100 overall and 30 per band.

**The uncomfortable part, which is the point:** this might show your score doesn't predict callbacks. Publish it anyway. Being the only company in the category holding the evidence is the asset. A competitor cannot counter "we measured it and here's what we found" with a better-sounding claim.

**Why it can't be shortcut:** a well-funded competitor could build the endpoint in an afternoon. They cannot skip the twelve months of users needed to fill it.

---

## Moat 3 — A longitudinal record of what employers actually asked for

**Why it holds:** A model knows which skills are *generally* associated with a role, from training data frozen at a cutoff. It cannot know which terms appeared in job descriptions people pasted in last month, or that a term is rising. That needs an operating history.

**Status: built.** `getRoleInsight()` in `src/lib/marketIntel.ts`. Your telemetry was previously write-only — collected and never read, which is the same as not collecting it. It's now aggregated by role over a rolling window, gated at 100 scans and 10 occurrences per keyword.

**Why it compounds:** every scan makes it better. A competitor starting today starts at zero and stays a year behind indefinitely — the gap doesn't close, because you're accumulating at the same rate they are.

**Prerequisite:** the Firestore composite index in `APPLY-4.md`. Without it these queries fail closed and the page shows "unavailable."

---

## Moat 4 — Published, falsifiable methodology

**Why it holds:** This is the counterintuitive one. A competitor can copy your methodology page tomorrow — the *text* isn't the moat. What they cannot copy is the accumulated record of having published a number, been checked, and been right. Or wrong, and corrected it visibly.

Trust is a repeated game. There's no fast-forward.

**Status: built** — `/methodology` and `/security`, both stating limits explicitly. `/methodology` says what the score can't tell you; `/security` has a "what we don't claim" section (no SOC 2, no ISO 27001, no compliance badge).

**Why it's worth more than it looks:** it's what let you delete the unsourced statistics without losing credibility — you replaced borrowed authority with your own transparency. And it's the shape of content assistants cite: specific, sourced, limits stated, no marketing register.

**Rule that keeps it working:** never publish a figure you can't source, and correct errors visibly with a dated note. One fabricated statistic destroys this permanently.

---

## Moat 5 — Switching cost from a user's own history

**Why it holds:** Not the feature — anyone can build resume versioning. The moat is *your user's data in your product*: eleven scans, four resume versions, a record of which one got callbacks. Rebuilding that elsewhere means re-doing the applications.

**Status: not built.** This needs accounts, and accounts need the auth and data-retention work nothing in the current codebase supports. `firebase/auth` is already a dependency and unused.

**The tension, and it's real:** your entire trust position is "we never store your resume." Accounts partly contradict that. The resolution is **opt-in, explicit, and separate** — anonymous scanning stays the default and stays genuinely anonymous; storage is a thing users deliberately turn on, with deletion that works. If you blur that line you trade Moat 4 for Moat 5, which is a bad trade.

**Why it's next:** it's also the answer to "why would anyone return?", which is the honest weak point of the current product. Someone scans once, fixes their resume, and never comes back. That caps every revenue model you have.

---

## Moat 6 — Cost per scan

**Why it holds:** Least glamorous, most durable. If you serve a scan for a fraction of what a competitor pays, you can be free where they must charge — and no amount of model capability changes their bill.

**Status: substantially built.** Deterministic checks (Moat 1) handle formatting with zero tokens. The consolidated cache means identical scans never pay twice — previously three cache implementations disagreed and the Redis tier threw on every hit, so you were paying for a cache that returned nothing. Gemini 2.5 Flash with a Flash-Lite fallback is already near the floor for this workload.

**Where the remaining margin is:** deterministic keyword extraction before the model call. Exact-string matching between resume and JD doesn't need a language model — only *semantic* matching does. Send the model the ambiguous cases, not the whole document.

---

## What ties these together

Moats 1, 2, and 3 produce data. Moat 4 makes people believe it. Moat 5 makes them stay. Moat 6 funds it.

The honest read on sequencing: **Moat 5 is the bottleneck.** Moats 2 and 3 need users returning to fill them, and nothing in the product currently gives anyone a reason to return. Scan history isn't just a feature — it's the mechanism that makes the data moats fill at all.

---

## What this does not do

It doesn't make you uncopyable. A well-funded competitor can build the same product. What these change is the *shape* of the race: instead of competing on who has the better prompt — where the advantage lasts until the next model release — you compete on accumulated measurement, accumulated trust, and accumulated user history. Those move at the speed of calendar time, and calendar time is the one input nobody can buy.

That's a durable position. It is not an unassailable one, and you should be suspicious of anyone who offers you the latter.
