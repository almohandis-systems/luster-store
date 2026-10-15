# LUSTER — Initial Static Audit (2026-10-16)

## Scope and safety boundary

- Audited the current `main/index.html` and the existing draft order-alert change.
- Work is isolated on `work/full-luster-audit`, branched from the draft fix branch.
- This audit does **not** authorize or perform a merge into `main`, a Firebase deployment, or any production data/rules change.
- This is a static code review. Browser-based, multi-device, Firebase rules, and production end-to-end tests have not been run.

## Confirmed findings

### P0 — Firestore rules template is unsafe
The owner cloud-settings UI offers a rules template that grants public reads and writes to `luster_orders` and `luster_store`. If copied into Firebase, anyone with access to the project can read or modify records. Replace this with a fail-closed, authenticated rules design only after the actual authentication/role model and required document access are implemented and tested. Do not ask the owner to publish the current template.

### P0 — Owner PIN is client-side and the login modal still contains bypasses
The code reads the owner PIN from browser storage/state with a default value of `2222`. The owner login modal also accepts `2222` and `0846` unconditionally, regardless of the configured PIN. The PIN-change path's extra comparisons were removed in an earlier isolated mitigation, but the login modal bypass remains in the current branch file. A client-side PIN is not a server authorization boundary. The code initializes Firebase Auth with anonymous sign-in for clients, but the static review found no owner sign-in flow or server-assigned owner claim. Anonymous customer authentication alone does not prove owner identity. Do not treat the earlier PIN-change mitigation as complete. Sensitive owner actions and data writes must be protected by Firebase Authentication plus server-enforced authorization (for example, custom claims or a verified owner role). Plan a migration and recovery path before replacing the login flow so the legitimate owner is not locked out.

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
- Removed the two alternate hard-coded PIN bypass comparisons from the owner PIN-change flow; the entered PIN must now match the configured current PIN. A later check found the owner login modal still accepts hard-coded `2222` and `0846`, so this mitigation is incomplete and the login bypass remains a P0 blocker.
- Removed the success toast that printed the new owner PIN back onto the screen.
- Removed the UI action that copied the permissive public Firestore rules and replaced it with an explicit security warning.
- Re-ran JavaScript syntax parsing after these changes: all eight inline script blocks parsed successfully.

These mitigations do **not** make the owner PIN secure against browser inspection or local storage manipulation. Server-enforced owner authorization remains a release blocker.


## Deployment readiness check

- The isolated branch currently contains only `index.html` and this audit report; no `firebase.json`, `firestore.rules`, or GitHub Actions Firebase Hosting workflow was found in the repository tree.
- Therefore, this branch does not define a reproducible deployment configuration, and no Firebase deployment was performed from this environment.
- Before production deployment, configure and verify the intended Hosting public directory, Firebase project target, protected deployment credentials, and a rollback path. Do not commit service-account keys or deployment tokens to the repository.
- The fetched source was sufficient to validate the inline scripts present in the returned content, but the API response was shorter than the Git blob's declared byte size; treat this as partial source retrieval and require a complete checkout/build before release.
