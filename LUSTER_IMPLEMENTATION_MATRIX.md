# LUSTER implementation and verification matrix
Date: 2026-10-16
Branch: work/full-luster-audit
Status: working plan and evidence log; not a release certification.

## Hard constraints
- Preserve owner codes 2222 and 0846 and developer code 0846 exactly; do not change intended login entry behavior without fresh explicit approval.
- Do not merge to main or deploy to Firebase Hosting before the owner reviews the diff and report and gives separate release approval.
- Never claim a feature is working until its relevant behavior has been exercised and recorded.

## Evidence categories
- NOT TESTED: no runtime evidence yet.
- STATIC REVIEW: source inspection only.
- BLOCKED: needs missing backend/configuration, external credentials, or a separate test environment.
- PASS: only after the stated test has actually been run and evidence captured.

## P0 — must resolve before commercial launch
| Area | Required behavior | Verification / acceptance |
|---|---|---|
| Customer privacy | A customer cannot read another customer's order, address, phone, or payment proof. | Separate customer sessions attempt direct reads/writes; all unauthorized operations denied by server rules. |
| Owner authorization | Owner-only data and actions are enforced by a trusted server, while required owner/developer codes remain unchanged. | Verify owner and customer identities separately; direct API/Firestore calls without owner authorization must be denied. Test recovery and prevent owner lockout. |
| Order source of truth | Customer orders persist and reach owner dashboard across separate devices; statuses remain consistent. | Customer browser/device A places orders; owner browser/device B receives each unique order once; test simultaneous orders and offline/reconnect. |
| Owner alarm | New-order alarm starts; stop/acknowledge works and does not falsely claim cloud success; new order can trigger it again. | Exercise new, acknowledge, API-empty, API-error, refresh, and next-order cases. |
| Inventory | Stock decrements once for a successful order and not for failed/duplicate checkout; out-of-stock cannot be purchased. | Concurrent purchase, failed payment/checkout, duplicate click/retry, zero stock and refresh tests. |
| Release configuration | Hosting target, backend functions, database rules, secrets, and rollback are explicitly configured. | Clean checkout/build and deployment preview with no secrets in source; verify rollback. |

## P1 — commercial flows
| Area | Required behavior | Verification / acceptance |
|---|---|---|
| Product search/options | Search returns correct products; selected size/options and price reach cart and order. | Search terms, no-results, Arabic text, each option and price calculation. |
| Shipping | Owner-configured governorate/area prices are applied consistently. | Each zone, unknown zone, edited price, subtotal/total and order persistence. |
| Coupons/points | FREESHIP and points reduce the final payable amount exactly once and obey eligibility. | Valid/invalid/expired coupon, minimum order, repeated apply, points boundary and totals. |
| Payment evidence | Vodafone Cash/InstaPay receipt can be uploaded and reviewed; upload is not treated as proof of settlement. | Upload type/size/permissions, owner review, rejected/approved states and audit trail. |
| Invoice/dispatch | Branded invoice/label prints and shares without exposing unnecessary customer data. | Print preview, WhatsApp share, mobile layout and minimum-data check. |
| Referrals | Reward counts only qualified, deduplicated events; share-sheet launch is not called a sent message. | Unique referral, duplicate/self-referral, abuse checks and reward ledger. |
| Sales reporting | Reports reconcile with persisted paid/completed orders and inventory movements. | Compare dashboard totals against independently queried test orders. |

## P2 — requested additions
| Feature | Required behavior | Verification / acceptance |
|---|---|---|
| AI menu/product import | Images/text create editable drafts; uncertain fields are flagged; never auto-publish guessed products/prices. | Arabic/English menu samples, options/prices, low-quality image, owner edits and explicit publish. Requires configured AI backend/credentials. |
| Family savings bundles | Multiple images/video, description, price, grouped presentation, stock and direct share link. | Create/edit/delete, responsive layout, cart/order price and stock. |
| Flash sale | Owner controls text, discount, start/end and countdown; expired offer stops applying. | Time-zone, expiry, refresh, price consistency and invalid dates. |
| Stories/media | Multiple images/videos with size/type limits and safe playback. | Upload failures, mobile network, loading, removal and storage access rules. |
| Sounds | Optional sounds for cart, checkout, order confirmation, wheel, coupon and navigation; mute preference persists. | First-gesture browser policy, muted mode, keyboard access and no sound loops. |
| Theme/contrast | Coordinated owner-selectable palettes with readable contrast; no fixed text colors that become invisible. | Contrast check and screenshot review for every theme/modal/button/error state. |
| Floating chat | Draggable and avoids blocking price, purchase controls and important text. | Small screens, zoom, keyboard, cart/modal overlays and repositioning. |
| Social/product share | Owner-managed social links; each product/bundle shares a correct direct link. | WhatsApp/Messenger fallback, copy link, unavailable apps and link destination. |

## Work status from the current review
- Static JavaScript parsing: 8 inline script blocks parsed with zero syntax errors on the prior run. This is not runtime verification.
- Order-alert fallback/acknowledgment change: present in draft PR #1 and the audit branch lineage; browser and separate-device behavior remain NOT TESTED.
- Unsafe copyable public Firestore-rules template: UI action replaced with a warning on the review branch. This does not change deployed Firebase rules.
- Owner PIN: required codes/behavior preserved; source-side PIN storage remains a release blocker for server-enforced authorization. Do not bypass the release check; implement a migration that preserves the owner's required codes and test it.
- AI menu import and general cart/checkout sound effects: not implemented in the inspected source.
- Hosting config, trusted backend, restrictive live rules, payment verification, load test and deployment smoke test: not verified; do not infer they exist.
- Production merge/deploy: NOT AUTHORIZED by this plan; owner explicitly requires reviewing the changes/report first.

## Required final review package
1. Exact file-by-file diff and commit IDs.
2. Automated test output, including failures (no suppressed release blockers).
3. Manual test table with device/browser, scenario, expected result, actual result and evidence.
4. List of features implemented, partial, blocked and not implemented.
5. Security/data migration notes, backup and rollback plan.
6. No deployment until owner has reviewed the package and separately approves release.
