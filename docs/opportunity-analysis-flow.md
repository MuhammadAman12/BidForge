# Opportunity analysis flow

`/analyze` now loads the authenticated account's profile, skills, projects,
certifications and portfolio links. The rule-based analyzer returns requirements,
matched skills, evidence gaps, projects, scope concerns, questions and proposal
positioning. Editing the brief invalidates the previous result.

Save and continue inserts an `analyzed` opportunity with its analysis JSON, then
opens `/opportunity/{id}`. The existing Build Proposal action opens the proposal
workspace. `/analyze?opportunity={id}` redirects to the existing detail route.

## Architecture

- `components/features/analyzer`: presentation and form controls.
- `hooks/use-opportunity-analysis.ts`: loading, analysis, saving and navigation.
- `services/opportunity-analysis.ts`: Supabase queries and persistence.
- `lib/analyzer.ts`: local rules; no paid AI provider is required.
- `components/ui`: shadcn-style button and Skeleton primitives for this flow.

Existing custom primitives elsewhere have not all been migrated to shadcn/ui.

## Local setup and verification

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in
`.env.local`. Use the existing Supabase project and tables. No schema or policy
changes are included. Run `npm ci`, `npm run test`, `npm run lint`, `npm run build`
and `npm run dev`.

Manual checks with the configured project:

1. Sign in and save a React skill plus a React dashboard project in the Knowledge Base.
2. Open Analyze and paste a brief requesting React and PostgreSQL, $1,500 and 3 weeks.
3. Check that React matches, PostgreSQL lacks evidence, the project is listed and budget/timeline are extracted.
4. Edit the brief; the previous results and Save action must disappear until reanalysis.
5. Save, reopen the opportunity, and use Build Proposal. Confirm questions appear and the draft makes no unsupported similar-project claims.
6. Refresh the opportunity and verify persistence. Repeat as another account to verify row-level isolation.
7. Check an empty Knowledge Base, a missing profile, a save failure and desktop/mobile layouts.

Automated build checks may use placeholder environment values; this does not
verify the live schema, authentication or row-level security policies.

## Service regression coverage

The suite now contains 11 tests: five analyzer tests and six mocked service tests.
Service checks cover signed-out loading, authenticated profile filters, query
errors, saved payloads, invalid input and failed/missing save responses. These
are contract checks, not proof that the live database enforces row-level security.
Optional session storage failures no longer prevent analysis or make a successful
save appear to have failed.
