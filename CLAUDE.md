# CLAUDE.md: nilesluther.dev

*Last updated: October 13, 2026 at 10:31 PM EDT*

Niles Luther's engineering portfolio. Spec and research live in the SWE Job Apps repo: `docs/superpowers/specs/2026-10-11-portfolio-site-design.md`, `docs/research/portfolio/`.

- Astro static site. Projects are `src/content/projects/*.md`; the home page and `/[slug]` render from them.
- `npm run check` builds and runs the copy check, the weight budget, and the Playwright suite. CI runs the same plus the link check.
- `npm run preview` passes `--ignore-lock` so the server stays in the foreground: Astro 7 otherwise detaches it when it detects a coding agent, and Playwright's web server then exits early.
- Copy facts come only from SWE Job Apps `profile/systems.md` and `resume/niles-luther.md`. No em dashes. Never the "not X, it's Y" template.
- Branch `dev`; squash to `main` only after Niles confirms a smoke test. Commit messages never mention AI assistance. Commits use the GitHub noreply address (`196493454+modernluther@users.noreply.github.com`); GitHub rejects pushes that expose the private address.
- Analytics: PostHog, sessionStorage persistence (no cookies), resume tag `?r=<cut>` registered as `resume_tag`. The small entry script strips the tag and stashes it in localStorage for 30 minutes after last use (so a project opened in a new tab keeps it), then imports `posthog-js` only when a key is set. Project 659433 "nilesluther.dev" in its own organization (the ACE // OPS organization's free plan allows one project), US region. `.env` (git-ignored) holds `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_UI_HOST`; `vercel.json` proxies `/ingest` to the US hosts. PostHog drops events when `navigator.webdriver` is true or `userAgentData` carries the HeadlessChrome brand (the CI headless shell), so `tests/analytics.spec.ts` hides both. CI reads the public project key from the repo Actions variables `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_UI_HOST`.
- Font: `src/assets/fonts/InterVariable-latin.woff2`, cut from Inter 4.1 (the build command is in `src/styles/site.css`). It keeps cv01 and ss03, which the fontsource subsets drop.
- Site URL: `SITE_URL` sets canonicals, share images, the share-card host, the sitemap, and llms.txt. It is `https://nilesluther.dev` in Vercel for Production and Preview.
- 92Y write-up: no Roundtable link or screenshot, so the disclosed vulnerability stays unattributed. Niles may reverse this by cutting the disclosure instead.
- Deploy: Vercel project `nilesluther-dev` (team modernluthers-projects, Node 22.x), production domain https://nilesluther.dev (bought through Vercel, Vercel DNS; `www` 308-redirects to the apex). Env vars for Production and Preview: `PUBLIC_POSTHOG_KEY`, `PUBLIC_POSTHOG_UI_HOST`, `SITE_URL`. `vercel deploy --prod --yes` from `dev` publishes before the smoke test without touching `main`. Git is connected (October 13): pushes to `dev` build previews and pushes to `main` deploy production. The CLI rejects `vercel env add <name> preview` without a branch here; add Preview vars through `vercel api /v10/projects/<id>/env` instead.
- PostHog insight "Visits by resume tag": https://us.posthog.com/project/659433/insights/PASfe09l.
