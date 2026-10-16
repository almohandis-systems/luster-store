# LUSTER — تقرير التعديلات والمراجعة (2026-10-16)

## نطاق العمل المعتمد
وافق مالك المشروع على تنفيذ الإصلاحات والإضافات المقترحة، مع الحفاظ على سلوك رموز دخول المالك والمطور كما هو، وعرض التعديلات والتقرير للمراجعة قبل أي نشر حي.

## تغييرات منفذة في هذا الفرع
- إضافة شريط بحث للمنتجات؛ يبحث في العنوان العربي والإنجليزي والوصف والقسم وخيارات المنتج، ويحافظ على فلتر القسم الحالي.
- إضافة زر مشاركة بجوار كل بطاقة منتج، مع رابط مباشر للمنتج، واستخدام قائمة المشاركة الأصلية إن توفرت، وإلا فتح مشاركة واتساب.
- تحويل خيارات المنتج الظاهرة إلى أزرار قابلة للاختيار وتمرير الاختيار المحدد إلى عنصر السلة.
- تعطيل إضافة المنتج للسلة إذا كانت كمية المخزون المسجلة صفرًا، وإضافة فحوصات مخزون عند الإضافة وعند زيادة كمية السلة.
- إعادة فحص المخزون وقت إرسال الطلب، وتحديث رصيد العرض بعد نجاح API فقط. هذا تحديث أفضل جهد وليس معاملة مخزون ذرية؛ الطلبات المتزامنة من أجهزة متعددة تحتاج معاملة موثوقة على الخادم.
- إزالة السلوك الذي كان ينشئ طلبًا محليًا وهميًا ويعرض رسالة نجاح عادية عند فشل API. عند تعذر تسجيل الطلب، تبقى السلة ويُخبر العميل أن الطلب لم يتأكد.

## الفحوصات المنفذة
- تحليل صياغة JavaScript المضمن: اجتازت جميع الكتل الثماني الفحص دون أخطاء نحوية.
- تأكيد وجود شريط البحث، وزر المشاركة، واختيار الخيارات، وفحوصات المخزون، ورسالة فشل تسجيل الطلب عبر فحص ثابت للكود.
- لم يُنفذ اختبار متصفح شامل أو اختبار متعدد الأجهزة أو قواعد Firestore أو الدفع أو اختبار تحميل.

## العيوب والمخاطر المتبقية
1. **خصوصية الطلبات:** مركز طلبات العميل يدمج الطلبات المحلية مع قائمة الطلبات في جسر السحابة واستجابة غير مفلترة من مسار `/api/orders` قبل عرض النتائج. هذه مشكلة خصوصية حقيقية؛ فلترة واجهة المستخدم وحدها لا تحمي البيانات الأصلية.
2. **المصادقة والصلاحيات:** لم يُعثر على ملفات إعداد Firebase وقواعد Firestore أو خدمة Cloud Functions موثوقة في المسارات القياسية التي فُحصت. يلزم إعداد مصادقة وصلاحيات من جهة الخادم قبل اعتبار الطلبات خاصة وآمنة.
3. **المخزون المتزامن:** التحديث من الواجهة لا يمنع سباق عمليتي شراء متزامنتين من هاتفين. يلزم حجز/خصم ذري من جهة الخادم.
4. **الإحالات:** توجد مسارات لحالة الإحالة وتسجيل النقرة داخل كود العميل، لكن العدادات تعتمد على تخزين وحالة يتحكم بهما العميل؛ لا تثبت أن رسالة وصلت إلى شخص حقيقي أو أن المشاركة اكتملت.
5. **الإيصالات والفواتير:** توجد بيانات وإرشادات دفع ورقم مرجعي، لكن رفع صورة إيصال آمن وتخزينها وعرضها للمالك يحتاج خدمة تخزين وصلاحيات. لا يُعد رقم المرجع إثباتًا للدفع.
6. **الإضافات غير المنجزة في هذا المرور:** إدارة باقات التوفير العائلية متعددة الصور والفيديو، وشريط العروض الخاطفة والعد التنازلي، وإدارة القصص متعددة الوسائط، والأصوات العامة مع كتم اختياري، والثيمات الفاتحة والتباين التلقائي الشامل، والتحكم في أهداف ومكافآت الإحالات، وفواتير وبوالص الشحن ذات الشعار، وإدارة روابط التواصل الاجتماعي، واستيراد المنيو بالذكاء الاصطناعي مع موافقة المالك، والمزامنة اللحظية الآمنة بين الأجهزة.
7. **رموز الدخول:** لم تُغيّر رموز الدخول في هذا الفرع عن النسخة الأساسية. مع ذلك، وجود رمز داخل JavaScript العميل لا يشكل حدًا أمنيًا حقيقيًا؛ يجب ألا يُعتمد على ذلك وحده لحماية بيانات العملاء.

## قرار النشر
لم يتم دمج الفرع إلى main ولم يتم النشر إلى Firebase Hosting. هذا الفرع للمراجعة فقط. لا يُوصف التطبيق بأنه جاهز تجاريًا قبل تأمين الخصوصية والمصادقة، واختبار مزامنة الطلبات والمخزون والدفع، وإتمام اختبارات الأجهزة والتحميل.


## Additional UI interaction pass
- Added a user-controlled sound toggle (off by default) and short Web Audio feedback for selected cart, checkout, coupon, quick-view, share, quantity, remove, and bottom-dock interactions. A distinct short success tone is requested after the order API confirms success. This needs real-device listening tests; browser autoplay/audio support varies.
- Added targeted light-theme contrast overrides for product titles, descriptions, prices, option pills, dock labels, and drawer titles. This is not a global audit/fix of every inline white text color; remaining contrast cases still need visual review across all owner-selected palettes.
- The sound toggle is a storefront-level preference saved in the current browser, not a cross-device owner setting. Owner-controlled sound policy and synchronized theme settings remain separate backlog items.


## Release gate hardening (2026-10-16)
- Updated `scripts/check-luster-review.cjs` so the review workflow exits with a blocking status when it detects the broad customer-order fetch, browser-side owner PIN storage, or missing root Firebase/rules configuration.
- This is an intentional fail-closed release safeguard, not a claim that the underlying privacy/authentication defects have been fixed. The storefront must not be deployed as production-ready until the blockers are actually resolved and verified.
- Commit: `7f73138772c8d4ec06b903605de576dc7a45b008`.


## Commerce calculation fixes
- Corrected the `FREESHIP`/shipping-coupon calculation so a shipping coupon waives delivery charges rather than subtracting its configured value from the merchandise subtotal.
- Implemented a cart points-redemption action using the current local points balance and configured point value, capped at 20% of merchandise subtotal. The chosen points discount is included in the order payload and redeemed points are consumed only after the order API confirms success.
- These calculations still require runtime tests with real coupon/zone/points configurations. Customer points are currently browser-local and are not a secure shared loyalty ledger across devices; cross-device balances need authenticated server-side storage.


## Referral counter correction (2026-10-16)
- Hardened referral status query parsing: malformed percent-encoding and empty/overlong/control-character codes now return a clear 400-style error instead of throwing through the request handler.
- Corrected the customer-facing label to describe the value as recorded referral-link visits, not confirmed friends who joined. Client-side click counters cannot prove a WhatsApp message was sent, a distinct real person joined, or a qualifying purchase completed.
- Validation after this edit: all 8 inline JavaScript blocks parse with zero syntax errors; referral endpoint, validation, and truthful label markers are present; owner/developer code-path markers remain present.
- Still not complete: trusted server-side referral attribution, abuse prevention, and reward issuance tied to a verified qualifying event.
- Commit: `2eef58a615ea47dfc409473120d93987c22afc84`.


## Follow-up validation after commerce fixes
- Wired both the Wallet and Points screens' points-use buttons to the same redemption method; the action now prepares a real cart discount instead of only opening the cart.
- Pending point redemption is cleared when the cart is emptied, and the app again parses all 8 inline JavaScript blocks without syntax errors.
- The review workflow intentionally remains blocked for production because the underlying order privacy/authentication/Firebase configuration issues remain unresolved.


## Coupon input and free-shipping correction (2026-10-16)
- Coupon application now safely rejects missing/overlong input, malformed local coupon entries, unsupported coupon types, and negative/non-numeric values instead of assuming every stored entry is well-formed.
- Percentage/fixed merchandise discounts are capped at the cart subtotal; percentage values are capped at 100%. Shipping coupons now show a clear free-shipping confirmation and remain excluded from merchandise subtotal reduction.
- This is client-side validation only. Coupon eligibility, final pricing, usage limits, and order totals still require trusted server-side validation before commercial use.
- Commit: `3c9e60fa49e10eb9d05210580efd7747d5701410`.


## Customer order-history privacy containment (2026-10-16)
- Removed the customer order-history view's merge of the global in-memory cloud order list and its background request to the unscoped `GET /api/orders` endpoint. This prevents that screen from automatically importing other customers' records into its local display.
- The view now displays only order records already saved in that browser. This is a containment measure, not the final multi-device solution: cross-device history remains unavailable until an authenticated server endpoint returns only orders authorized for the current customer.
- The legacy API and other owner-side endpoints still need server-side authorization; this change does not secure them globally and does not make the app production-ready.
- Commit: `cdcec919131a632412c8124b45df56a05ff013ff`.
