const fs = require('node:fs');

const path = 'index.html';
if (!fs.existsSync(path)) {
  console.error('FAIL: index.html is missing.');
  process.exit(1);
}
const html = fs.readFileSync(path, 'utf8');
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
let parsed = 0;
const errors = [];
for (let i = 0; i < scripts.length; i++) {
  const attrs = scripts[i][1] || '';
  const code = scripts[i][2] || '';
  if (/type\s*=\s*["']application\/(?:ld\+json|json)["']/i.test(attrs)) continue;
  try {
    new Function(code);
    parsed++;
  } catch (error) {
    errors.push('Inline script ' + (i + 1) + ': ' + error.message);
  }
}
const required = [
  ['product search UI', 'id="luster-product-search-input"'],
  ['product search filtering', 'haystack.includes(searchQuery)'],
  ['product share control', 'class="btn-share-product"'],
  ['cart stock guard', 'stockTracked && availableStock <= 0'],
  ['checkout stock revalidation', 'const latestProducts = this.store.getState()?.products || [];'],
  ['stock update after order confirmation', 'Decrement visible stock only after the order API confirms creation.'],
  ['points redemption logic', 'applyPointsToCart() {'],
  ['points redemption consumed after confirmed order', 'consumePointsRedemption('],
  ['shipping coupon only affects delivery', 'Shipping coupons waive delivery fees; they must never discount merchandise.'],
  ['coupon input validation', "const normalizedCode = typeof code === 'string' ? code.trim() : ''"],
  ['free shipping confirmation', 'تم تطبيق كوبون الشحن المجاني بنجاح!'],
  ['referral code validation', "error: 'invalid_referral_code'"],
  ['customer order history privacy containment', 'SECURITY: Never merge the global in-memory cloud order list'],
  ['no fake offline order success', 'processing local standalone fallback order']
];
const missing = required.filter(([label, marker]) => {
  if (label === 'no fake offline order success') return html.includes(marker);
  return !html.includes(marker);
});
if (errors.length || missing.length) {
  console.error('FAIL: LUSTER review checks');
  errors.forEach(e => console.error('- ' + e));
  missing.forEach(([label]) => console.error('- Missing/failed: ' + label));
  process.exit(1);
}
console.log('PASS: ' + parsed + ' inline JavaScript blocks parsed; approved search/share/options/stock checks found.');
const knownRisks = [];
const customerOrdersStart = html.indexOf('async renderOrdersCenter(containerEl)');
const customerOrdersEnd = html.indexOf('_renderOrdersCenterDOM(containerEl', customerOrdersStart);
const customerOrdersView = customerOrdersStart >= 0 && customerOrdersEnd > customerOrdersStart
  ? html.slice(customerOrdersStart, customerOrdersEnd)
  : '';
if (!customerOrdersView || customerOrdersView.includes("window.lusterApi('/api/orders'") || customerOrdersView.includes('window.lusterCloudBridge.orders')) {
  knownRisks.push('Customer order view still reads an unscoped global order list; privacy needs a server-authorized customer endpoint.');
}
if (html.includes('getOwnerPin()') && html.includes("localStorage.getItem('luster_owner_pin')")) {
  knownRisks.push('Owner PIN remains client-side; it is not a server-enforced authorization boundary.');
}
if (!fs.existsSync('firebase.json') || !fs.existsSync('firestore.rules')) {
  knownRisks.push('Firebase Hosting/Firestore rules files are absent at repository root; deployment and data rules require separate configuration.');
}
if (knownRisks.length) {
  console.error('BLOCKED: LUSTER is not eligible for production release until the following security/configuration risks are resolved:');
  knownRisks.forEach(r => console.error('- ' + r));
  console.error('This gate intentionally fails closed. Do not bypass it or deploy the storefront as commercially ready.');
  process.exit(2);
}
