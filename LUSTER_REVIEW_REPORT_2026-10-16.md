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
