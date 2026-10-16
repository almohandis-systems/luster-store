# LUSTER — Initial Static Audit (2026-10-16)

## Scope and safety boundary

- Audited the current `main/index.html` and the existing draft order-alert change.
- Work is isolated on `work/full-luster-audit`, branched from the draft fix branch.
- This audit does **not** authorize or perform a merge into `main`, a Firebase deployment, or any production data/rules change.
- This is a static code review. Browser-based, multi-device, Firebase rules, and production end-to-end tests have not been run.

## Confirmed findings

### P0 — Firestore rules template is unsafe
The owner cloud-settings UI offers a rules template that grants public reads and writes to `luster_orders` and `luster_store`. If copied into Firebase, anyone with access to the project can read or modify records. Replace this with a fail-closed, authenticated rules design only after the actual authentication/role model and required document access are implemented and tested. Do not ask the owner to publish the current template.

### P0 — Owner authorization is still client-side and default PIN remains
The login modal's unconditional `2222` and `0846` bypass checks have now been removed on this isolated branch; login compares the entered PIN only with the configured PIN. However, the configured PIN still falls back to the public default `2222`, and the PIN itself is stored client-side. This remains unsafe for commercial use. The code initializes Firebase Auth with anonymous sign-in for clients, but the static review found no owner sign-in flow or server-assigned owner claim. Anonymous customer authentication alone does not prove owner identity. Sensitive owner actions and data writes must be protected by Firebase Authentication plus server-enforced authorization (for example, custom claims or a verified owner role). Plan a migration and recovery path before replacing the login flow so the legitimate owner is not locked out.

### P1 — Order synchronization has multiple sources of truth
Order state can come from localStorage, the local API shim, ntfy messages, KVDB, and Firestore. This can create stale/conflicting status and cross-device discrepancies. The existing draft change merges API and local order lists and acknowledges cached orders, but this is not proof of reliable cross-device delivery. Establish one authoritative persistent source, stable order IDs, server-side status transitions, and idempotent acknowledgment. Test customer and owner sessions in separate browsers/devices, including offline/reconnect and simultaneous orders.

### P1 — Referral counting is client-controlled
The referral click endpoint in the local API shim uses browser storage/fingerprint-like values and increments client-side state. This can be reset or manipulated and should not be used as proof of qualified referrals or as the basis for rewards. Move counting and eligibility to a trusted backend with deduplication, abuse limits, and a clearly defined qualifying event.

### P1 — External shared synchronization services need a security review
The current frontend includes a shared KVDB endpoint identifier and public ntfy topic names. Treat these as public, not secrets. Do not store private customer/order data in a publicly readable/writable channel. Confirm service access controls and rotate/migrate the synchronization mechanism if sensitive data is exposed.

### P2 — Feature completeness gaps found in static search
- No clear complete AI menu-import workflow or Gemini integration was found in the current HTML.
- No general button/cart/checkout sound system was found in static search; wheel audio code does exist.
- These are static-search findings only, not proof that no related UI or partial implementation exists.

## Safety patch applied on the isolated work branch

- Disabled the UI action that copied the known-public Firestore rules template. It now warns the owner not to publish those rules before verified authentication/authorization and restrictive rules are implemented.
- This is a guardrail, not a complete Firebase security implementation; existing deployed rules are unchanged, and the application still requires a proper owner authorization model.

## Validation performed

- Retrieved `main/index.html` (about 1.50 MB) and the existing draft branch file.
- Compared `main` with `fix/order-alert-sync`: the draft is one commit ahead and is not merged.
- Compiled the eight inline script blocks from the draft file with JavaScript's `Function` parser. All parsed successfully. This is syntax validation only, not runtime testing.
- No browser automation, live Firebase test, load test, or real multi-device test was available in this audit.

## Required implementation sequence

1. Protect customer/order data and define the real owner authorization model before recommending any Firebase rules.
2. Map the order lifecycle and select one authoritative backend; verify create, receive, update, cancel, delivered, and simultaneous-order behavior.
3. Verify inventory, payment evidence/review, shipping zones, discounts/coupons, points, and invoices against real persisted state.
4. Implement server-verifiable referrals and prevent client-side reward inflation.
5. Add AI menu import as a draft-only flow: upload/parse -> validate fields -> owner reviews/edits -> explicit publish; never auto-publish extracted prices or products.
6. Add opt-in, accessible sound effects for cart, checkout, discounts, and wheel; respect browser audio-gesture restrictions and reduced-motion/accessibility settings.
7. Test every visible control, mobile layout, error/offline states, and separate customer/owner sessions; record results before considering a release.

## Release gate

Do not merge or deploy until P0 authorization/rules risks are resolved, order and privacy tests pass, and a separate explicit production-release approval is obtained.

### Additional mitigations committed to the isolated branch
- Removed the two alternate hard-coded PIN bypass comparisons from the owner PIN-change flow.
- Removed unconditional `2222`/`0846` acceptance from the owner login modal; it now compares only with the configured PIN. The default PIN fallback and client-side authorization remain P0 blockers.
- Removed the success toast that printed the new owner PIN back onto the screen.
- Removed the UI action that copied the permissive public Firestore rules and replaced it with an explicit security warning.
- Re-ran JavaScript syntax parsing after the latest owner-login change: all eight inline script blocks parsed successfully. This does not test runtime authorization or customer/owner flows.

These mitigations do **not** make the owner PIN secure against browser inspection or local storage manipulation. Server-enforced owner authorization remains a release blocker.


## Deployment readiness check

- The isolated branch currently contains only `index.html` and this audit report; no `firebase.json`, `firestore.rules`, or GitHub Actions Firebase Hosting workflow was found in the repository tree.
- Therefore, this branch does not define a reproducible deployment configuration, and no Firebase deployment was performed from this environment.
- Before production deployment, configure and verify the intended Hosting public directory, Firebase project target, protected deployment credentials, and a rollback path. Do not commit service-account keys or deployment tokens to the repository.
- The fetched source was sufficient to validate the inline scripts present in the returned content, but the API response was shorter than the Git blob's declared byte size; treat this as partial source retrieval and require a complete checkout/build before release.

## Follow-up changes and checks (2026-10-16)

- Updated the owner-dashboard Firestore-rules action in the isolated branch so it no longer offers the prior publicly readable/writable rules. It now shows a security warning and refuses to present a production ruleset until owner authorization is server-verifiable. This is a protective UI change, not a replacement for actually configuring Firebase Security Rules.
- Re-fetched the current branch `index.html` blob and parsed all eight inline JavaScript blocks with the JavaScript parser. All eight passed syntax parsing; this is not browser/runtime verification.
- Rechecked the current source: the old public Firestore rules template is absent; the owner PIN still has a client-side default fallback (`2222`). Static search did not find a Gemini integration. The AI menu-import workflow therefore remains unimplemented in the inspected HTML.
- The current single-file app still needs a real owner authentication/authorization migration. Do not treat the UI warning alone as a security fix for Firestore itself.
- No Firebase deployment, production Firestore rules change, browser test, cross-device order test, payment verification, or load test was performed. The application is not certified for commercial launch.


## Follow-up hardening update

- Removed the unconditional hard-coded owner-PIN bypass checks for `2222` and `0846`.
- Removed the owner PIN value from the success toast to avoid echoing the secret on screen.
- Replaced the dangerous copyable Firestore rules template with an explicit warning; this does not itself configure or secure Firebase.
- Added GitHub Actions static checks. Latest run parsed all 8 inline JavaScript blocks with zero syntax errors, then correctly failed the release gate because the owner PIN still falls back to the hard-coded client-side default `2222`.
- The remaining owner authentication blocker requires a real owner identity and server-enforced authorization. Removing the default PIN alone would risk locking the owner out and would not fix the underlying security model.
- AI menu import and general cart/checkout sound effects remain unimplemented in the audited HTML; no Gemini integration was found by static search.
- No browser E2E tests, Firebase rules tests, load tests, or Firebase Hosting deployment have been performed.


## CI result observed on 2026-10-16

- GitHub Actions run [38825869546](https://github.com/almohandis-systems/luster-store/actions/runs/38825869546) parsed all eight inline JavaScript blocks with zero syntax errors.
- The job correctly failed its release gate because the owner PIN still has a hard-coded default in client-side code. This is an intentional safety blocker, not a syntax failure.
- Do not bypass this check to force a release. Resolve owner authentication on a trusted backend, test Firestore rules, and rerun the suite.


## Follow-up update — 2026-10-16 (after the latest security pass)

- Removed the remaining `'2222'` fallback from the duplicate owner-PIN getter as well as the first occurrence. When no owner PIN is configured in that browser/state, login now fails closed and displays a configuration warning instead of accepting a known default.
- Re-parsed the latest `index.html`: all 8 inline JavaScript blocks passed syntax parsing with zero parser errors. This is static syntax validation only.
- Strengthened the release checker so it explicitly blocks release while the owner PIN is read from/written to browser-controlled `localStorage`. The latest CI run failed for this expected reason: browser storage is not trusted server-side owner authentication.
- Checked the audit branch for `firebase.json`, `.firebaserc`, `firestore.rules`, `functions/package.json`, and Cloud Functions entry points; these files are not present at those standard paths. The repository currently contains a single-file client app and does not provide a deployable trusted backend in the inspected paths.
- Therefore, the owner authentication blocker cannot be safely resolved by merely changing the front-end PIN check. A trusted backend/Firebase Auth owner identity, server-enforced authorization and tested rules must be added and configured before production deployment.
- Production `main` and Firebase Hosting were not changed. Do not merge or deploy until backend authentication and cross-device order tests pass.


## Approved execution scope — owner confirmation (2026-10-16)

The owner approved the full repair and feature scope, with a mandatory review-before-release policy. This approval authorizes work on the isolated review branch only; it does not authorize merging to `main`, changing live Firebase settings/data, or deploying to Hosting.

### Login behavior must be preserved
- Preserve the owner entry codes `2222` and `0846`, and the developer entry code `0846`, exactly as requested.
- The audit branch commit `77880fd8756c6f49b3361fdaef6b0f37c5ff88e6` restores the existing `2222` fallback behavior in both PIN getter locations after an earlier change altered it.
- Do not change these values or their intended entry behavior without a new explicit approval. This preservation requirement does not remove the separate technical finding that browser-side PIN checks/storage are not server-enforced authorization; the application must not be described as commercially secure until that architecture is addressed without locking out the owner.

### Execution status and release gate
- Work remains on `work/full-luster-audit`; draft PR #2 is open and unmerged. PR #1 (order-alert fallback/acknowledgment) is also a draft and unmerged.
- Latest static CI run for commit `77880fd8756c6f49b3361fdaef6b0f37c5ff88e6` (run `38826852662`) failed at the release-check step. The JavaScript syntax check previously parsed all eight inline blocks with zero syntax errors, but this does not establish browser/runtime correctness. The release check is currently blocked by client-side PIN storage, which needs an approved, tested backend migration that preserves the required entry codes.
- No changes have been merged or deployed. Do not publish until the owner reviews the full diff/report and explicitly approves a later release.
- The requested commercial features remain tracked as implementation work, not completed claims. Prioritize order integrity/privacy, stock and checkout correctness, then promotions/shipping/payments/invoices, referrals, media/AI import, themes/sounds, and complete cross-device/mobile tests.
- For every feature, record one of: `implemented and tested`, `implemented but not runtime-tested`, `blocked by missing backend/service/configuration`, or `not implemented`. Do not mark a feature complete from static search alone.
