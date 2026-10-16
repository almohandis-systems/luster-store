# LUSTER-STORE — Initial Security & Readiness Audit

Date: 2026-10-16
Repository: https://github.com/almohandis-systems/luster-store
Scope: Static inspection of the current `main` branch's `index.html` (about 1.5 MB). No live Firebase project settings, browser runtime, or real checkout was tested.

## Status
**Do not declare production-ready yet.** This is a static-code audit, not a full functional test. No production code was changed in this branch; this report is isolated on `audit/luster-store-security-and-readiness`.

## Confirmed high-priority findings

### 1. Insecure Firestore rules are offered by the admin UI
The handler for `#btn-copy-firestore-rules` copies rules that allow unrestricted read/create/update/delete on `luster_orders` and unrestricted read/write on `luster_store`. If pasted into the active Firebase project, any visitor could potentially read, create, modify, or delete order/catalog data.

**Required action:** Do not use these rules in Firebase. Replace this setup flow with a secure rules design and server-side owner authorization before production. The existing client architecture must be reconciled with the rules before deployment; simply requiring anonymous authentication is not sufficient to protect owner operations.

### 2. Owner/developer authorization relies on client-side passcodes
The HTML/JavaScript contains the developer passcode check in the browser, and the simulated `/api/reset` handler accepts hardcoded passcodes. Anything shipped to every browser can be inspected or bypassed; a client-side prompt is not an authorization boundary.

**Required action:** Preserve the current codes as requested for compatibility during development, but do not treat them as secure production credentials. Move privileged operations to a trusted backend with Firebase Authentication and server-enforced owner/developer roles. Do not publish a privileged reset endpoint without server-side authorization.

### 3. Full customer order data is sent to a public ntfy.sh topic
The order-notification payload includes customer name, phone, address, items, total, payment method, and serialized order data. The topic name is embedded in the public client code. Anyone who knows or discovers the topic may be able to subscribe to messages.

**Required action:** Stop sending personal/customer data to a public topic. Use an authenticated private notification channel, send only a non-sensitive order ID, or route notifications through a trusted backend. Review whether previously sent notifications require incident response.

## Other observations requiring tests

- Firebase configuration is embedded in the client. Firebase web config is normally public; actual protection must come from Security Rules, Authentication, and appropriately restricted API services—not hiding the config.
- The client creates anonymous Firebase Auth sessions, but the visible code does not establish a separate, server-verified owner role before privileged writes.
- The order listener uses `onSnapshot` and the code attempts Firestore writes, but this does not prove real-time order delivery works in production. Test with the actual Firebase project and two separate devices.
- The code has local-storage and fallback synchronization paths. A local save or toast must not be presented as proof that a cloud write or payment succeeded.
- Checkout accepts a transaction reference, but a reference entered by a customer is not proof of payment. Require manual reconciliation or verified payment-provider confirmation before marking paid.
- Delivery-zone UI and configuration exist in the source; verify create/edit/disable/delete, customer checkout totals, and cross-device persistence in a test environment.
- Audio alarms and notification events exist in the code; they still need browser/device tests, especially mobile autoplay restrictions and owner-only visibility.

## Test plan before production

1. Create/confirm a separate Firebase staging project and use only staging credentials during testing.
2. Implement and review Firestore rules that separate public catalog reads, customer order creation, and owner-only order reads/updates. Define how a customer can access only their own order. Do not enable unrestricted writes.
3. Implement server-enforced owner/developer authorization; test unauthorized and anonymous attempts against every privileged operation.
4. Remove personal order details from public notifications and verify access control on the replacement channel.
5. Run functional tests for checkout, order persistence, status updates, inventory consistency, delivery prices, payment reconciliation, owner alarms, audio, offline recovery, and duplicate submissions.
6. Test on Android Chrome and desktop, inspect console/network errors, and verify Firebase records directly.
7. Review changes in a pull request and deploy only after the owner approves the tested release.

## Limits of this audit
This report does not claim the live Firebase rules currently match the insecure template. That requires inspecting Firebase Console rules. No live order, payment, or production deployment was performed.
