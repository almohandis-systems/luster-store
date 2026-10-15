# LUSTER — Initial Static Audit (2026-10-16)

## Scope and safety boundary

- Audited the current `main/index.html` and the existing draft order-alert change.
- Work is isolated on `work/full-luster-audit`, branched from the draft fix branch.
- This audit does **not** authorize or perform a merge into `main`, a Firebase deployment, or any production data/rules change.
- This is a static code review. Browser-based, multi-device, Firebase rules, and production end-to-end tests have not been run.

## Confirmed findings

### P0 — Firestore rules template is unsafe
The owner cloud-settings UI offers a rules template that grants public reads and writes to `luster_orders` and `luster_store`. If copied into Firebase, anyone with access to the project can read or modify records. Replace this with a fail-closed, authenticated rules design only after the actual authentication/role model and required document access are implemented and tested. Do not ask the owner to publish the current template.

### P0 — Owner PIN is client-side and has default/bypass values
The code reads the owner PIN from browser storage/state with a default value, and the change-PIN path accepts additional hard-coded values. A client-side PIN is not a server authorization boundary. The code initializes Firebase Auth with anonymous sign-in for clients, but the static review found no owner sign-in flow or server-assigned owner claim. Anonymous customer authentication alone does not prove owner identity. Sensitive owner actions and data writes must be protected by Firebase Authentication plus server-enforced authorization (for example, custom claims or a verified owner role). Avoid changing this in isolation in a way that locks the owner out; plan a migration and recovery path.

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
