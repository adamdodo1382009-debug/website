import React, { useState, useEffect, useLayoutEffect, memo, useCallback, useRef } from 'react';

// ============================================================
// 1. العداد التنازلي - مربوط بتاريخ نهاية عرض حقيقي من الأدمن
// ============================================================
const CountdownTimer = memo(({ endDate, onExpire, t }) => {
  const [remainingMs, setRemainingMs] = useState(() => (endDate ? Math.max(0, new Date(endDate).getTime() - Date.now()) : 0));
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    if (!endDate) return;
    hasExpiredRef.current = false;

    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      setRemainingMs(Math.max(0, diff));
      if (diff <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpire && onExpire();
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  // لو مفيش تاريخ نهاية، أو العرض خلص فعلاً، العداد بيختفي تماماً من الهيدر
  // (مش بيسيب شريط "انتهى العرض" ثابت لحاله في كل صفحات الموقع للأبد).
  if (!endDate || remainingMs <= 0) return null;

  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="bg-gray-900 text-white text-center py-2 text-sm font-bold tracking-wide" dir="ltr">
      {t('استعجل! العرض ينتهي في: ', 'Hurry up! Sale ends in: ')}
      <span className="text-red-500">{days > 0 ? `${days}d ` : ''}{pad(hours)}:{pad(minutes)}:{pad(seconds)}</span>
    </div>
  );
});

// ============================================================
// 2. مكون Input محسن
// ============================================================
const InputField = memo(({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  id
}) => {
  const inputRef = useRef(null);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block font-semibold mb-1 text-sm">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all bg-white"
        autoComplete="off"
      />
    </div>
  );
});

// ============================================================
// 3. مكون Select محسن
// ============================================================
const SelectField = memo(({
  label,
  value,
  onChange,
  options,
  required = false,
  className = '',
  id
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block font-semibold mb-1 text-sm">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all bg-white"
      >
        {options.map((opt, index) => (
          <option key={index} value={opt.value || opt.name}>
            {opt.label || opt.name}
          </option>
        ))}
      </select>
    </div>
  );
});

// ============================================================
// 4. مكون Textarea محسن
// ============================================================
const TextareaField = memo(({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
  id
}) => {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block font-semibold mb-1 text-sm">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all bg-white"
      />
    </div>
  );
});

// ============================================================
// 4.5 مكون حقل سري (API Key / Pixel ID) بيعرض آخر 4 أرقام بس
//     ويسمح بحذف القيمة الحالية وربط قيمة جديدة بدل منها
// ============================================================
const MaskedKeyField = memo(({ label, value, onChange, onRemove, placeholder, id, platformIcon, t }) => {
  const [isEditing, setIsEditing] = useState(!value);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border space-y-2">
      <label htmlFor={id} className="block font-semibold mb-1 text-sm">
        {platformIcon} {label}
      </label>

      {!isEditing && value ? (
        <div className="flex items-center justify-between gap-3 bg-white border rounded-lg px-4 py-2">
          <span className="font-mono text-gray-700 tracking-widest" dir="ltr">
            **** **** **** {value.slice(-4)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-blue-600 text-xs font-bold hover:underline"
            >
              {t('ربط كود جديد', 'Link new key')}
            </button>
            <button
              type="button"
              onClick={() => { onRemove(); setIsEditing(true); }}
              className="text-red-600 text-xs font-bold hover:underline"
            >
              {t('حذف', 'Delete')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            id={id}
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all bg-white font-mono"
            autoComplete="off"
            dir="ltr"
          />
          {value && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap"
            >
              {t('حفظ', 'Save')}
            </button>
          )}
        </div>
      )}
    </div>
  );
});

// ============================================================
// 4.5 ثبات إعدادات عرض الترحيب عبر LocalStorage (Part 15-18)
// مفتاح واحد فقط مخصص لعرض الترحيب - لا تتفرق الإعدادات في مفاتيح متعددة.
// هذا ثبات مؤقت للواجهة الأمامية فقط، وسيُنقل لاحقاً لقاعدة البيانات عند بناء الباك إند.
// ============================================================
const WELCOME_OFFER_STORAGE_KEY = 'welcomeOffer';

function loadWelcomeOfferFromStorage(defaults) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return defaults;
    const raw = window.localStorage.getItem(WELCOME_OFFER_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return defaults;
    // دمج آمن مع الإعدادات الافتراضية عشان لو اتضافت حقول جديدة مستقبلاً متتفقدش
    return {
      ...defaults,
      ...parsed,
      title: { ...defaults.title, ...(parsed.title || {}) },
      description: { ...defaults.description, ...(parsed.description || {}) },
      offerText: { ...defaults.offerText, ...(parsed.offerText || {}) },
      buttonText: { ...defaults.buttonText, ...(parsed.buttonText || {}) },
    };
  } catch (e) {
    return defaults;
  }
}

function saveWelcomeOfferToStorage(welcomeOfferConfig) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(WELCOME_OFFER_STORAGE_KEY, JSON.stringify(welcomeOfferConfig));
  } catch (e) {
    // لو LocalStorage مش متاح (خاص/ممتلئ) - نتجاهل بهدوء من غير ما نكسر الموقع
  }
}

// ============================================================
// 5. المكون الأساسي للتطبيق
// ============================================================
export default function App() {
  // ===== كل الـ States =====
  const [currentPage, setCurrentPage] = useState('home');
  // عداد بيزيد مع كل عملية تنقل (حتى لو الصفحة الجديدة نفس اسم الصفحة القديمة)
  // عشان نضمن إن التمرير لأعلى بيحصل في كل مرة المستخدم يضغط على أي رابط تنقل،
  // مش بس لما تتغير قيمة currentPage فعلياً.
  const [navKey, setNavKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState('ar');

  // ===== الويشليست (المفضلة) =====
  const [wishlist, setWishlist] = useState([]);

  // ===== قائمة اقتراحات البحث المنسدلة =====
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // ===== الفلاتر المتقدمة في صفحة المتجر =====
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterSizes, setFilterSizes] = useState([]);
  const [filterColor, setFilterColor] = useState('');
  const [filterOnSaleOnly, setFilterOnSaleOnly] = useState(false);
  const [filterFeaturedOnly, setFilterFeaturedOnly] = useState(false);

  // ===== إعدادات الأدمن =====
  const adminSettings = useRef({
    storeName: { ar: 'LAVA', en: 'LAVA' },
    logoText: { ar: 'LAVA', en: 'LAVA' },
    phone: '01091900530',
    whatsapp: '',
    email: 'info@lava.com',
    adminEmail: 'adamahmed138@gmail.com',
    adminPassword: 'adam138',
    adminPhone: '01091900530',
    heroImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1920',
    heroTitle: { ar: 'اشعل ستايلك', en: 'Ignite Your Style' },
    heroSubtitle: { ar: 'اكتشف أحدث صيحات الموضة مع LAVA.', en: 'Discover the latest fashion trends with LAVA.' },
    aboutText: { ar: 'إحنا براند مصري بيهدف لتقديم أعلى جودة من الملابس بخامات ممتازة وتصميمات تناسب كل الأذواق. هدفنا نخليك دايماً في أحسن صورة.', en: 'We are an Egyptian brand aiming to deliver the highest quality clothing with excellent materials and designs that suit all tastes. Our goal is to always make you look your best.' },
    aboutImage: 'https://images.unsplash.com/photo-1558769132-cb1fac08c04b?w=500',
    footerLocation: { ar: 'القاهرة، مصر (متوفر فرع رئيسي وأونلاين)', en: 'Cairo, Egypt (Main branch & online available)' },
    socialFacebook: 'https://facebook.com',
    socialInstagram: 'https://instagram.com',
    socialTiktok: 'https://tiktok.com',
    socialYoutube: '',
    socialLinkedin: '',
    socialSnapchat: '',
    socialFacebookEnabled: true,
    socialInstagramEnabled: true,
    socialTiktokEnabled: true,
    socialYoutubeEnabled: false,
    socialLinkedinEnabled: false,
    socialSnapchatEnabled: false,
    showLocation: true,
    locationText: { ar: 'القاهرة، مصر (متوفر فرع رئيسي وأونلاين)', en: 'Cairo, Egypt (Main branch & online available)' },
    freeShippingThreshold: 1500,
    defaultShippingCost: 90,
    showCountdownBar: true,
    saleEndDate: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(),
    showZipCode: false,
    showCountry: true,
    requiredPhone2: false,
    showPhone2: true,
    showCheckoutNotes: false,
    tiktokApiKey: '',
    metaApiKey: '',
    snapchatApiKey: '',
    googleApiKey: '',
    metaPixelId: '',
    tiktokPixelId: '',
    googlePixelId: '',
    snapchatPixelId: '',
    metaCatalogEnabled: false,
    tiktokCatalogEnabled: false,
    googleCatalogEnabled: false,
    snapchatCatalogEnabled: false,
    showRecommendations: true,
    showBundleOffers: true,
    showReviews: true,
    showConfirmedExportForCallCenter: true,
    logoImage: '',
    useLogoImage: false,
    // ===== إدارة المخزون / التوفر =====
    displayOutOfStockProducts: true, // إظهار المنتجات الغير متوفرة (بشارة "غير متوفر") أو إخفاؤها تماماً
    defaultLowStockThreshold: 5,
    // ===== مركز العروض الترويجية (Promotions Hub) =====
    // مصدر الحقيقة الوحيد لكل إعدادات العروض الترويجية. لا تكرر هذه القيم في أي مكان آخر.
    promotions: {
      guestDiscount: {
        enabled: true,
        percentage: 5,
        title: { ar: 'خصم 5%', en: 'Get 5% OFF' },
        message: { ar: 'اعمل حساب وخد خصم 5% على أول طلب ليك', en: 'Create an account and get 5% OFF your first order.' },
        buttonText: { ar: 'تسجيل الدخول / إنشاء حساب', en: 'Login / Register' },
      },
      welcomeOffer: loadWelcomeOfferFromStorage({
        enabled: false,
        image: '',
        title: { ar: 'عرض خاص 🎁', en: 'Special Offer 🎁' },
        description: { ar: 'احصل على عرض حصري لفترة محدودة', en: 'Get an exclusive offer for a limited time' },
        offerText: { ar: '', en: '' },
        buttonText: { ar: 'تسوق الآن', en: 'Shop Now' },
        destinationType: 'shop', // 'product' | 'category' | 'shop'
        productId: null,
        categoryId: null,
        promotionId: null, // ربط عرض الترحيب بعرض ترويجي حقيقي من Campaigns (Part 16/29) - لا يُنشئ خصماً مستقلاً بنفسه
      }),
    },
  });

  // ===== الدول =====
  const [countries, setCountries] = useState([
    { id: 1, name: { ar: 'مصر', en: 'Egypt' }, code: 'EG' },
    { id: 2, name: { ar: 'السعودية', en: 'Saudi Arabia' }, code: 'SA' },
    { id: 3, name: { ar: 'الإمارات', en: 'UAE' }, code: 'AE' },
    { id: 4, name: { ar: 'الكويت', en: 'Kuwait' }, code: 'KW' },
  ]);

  // ===== أكواد الخصم =====
  const [discountCodes, setDiscountCodes] = useState([
    { id: 1, code: 'WELCOME10', discountPercent: 10, isActive: true },
    { id: 2, code: 'SUMMER20', discountPercent: 20, isActive: true },
  ]);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountInput, setDiscountInput] = useState('');

  // ===== إعادة رسم يدوية =====
  const [, forceSettingsUpdate] = useState(0);
  const bumpSettings = useCallback(() => forceSettingsUpdate(n => n + 1), []);

  // ===== هل عرض الخصم شغال؟ =====
  const isSaleActive = () => {
    return !!(adminSettings.current.showCountdownBar && adminSettings.current.saleEndDate &&
      new Date(adminSettings.current.saleEndDate).getTime() > Date.now());
  };
  const getEffectivePrice = (product) => {
    if (isSaleActive() && product.onSale && product.salePrice) return product.salePrice;
    return product.price;
  };
  const isReviewsEnabled = (product) => {
    if (!product) return false;
    const globalOn = adminSettings.current.showReviews !== false;
    const productOn = product.enableReviews !== undefined ? product.enableReviews : true;
    return globalOn && productOn;
  };

  // ============================================================
  // نظام الفاريانتس والمخزون (لون / مقاس / كمية)
  // ============================================================
  // كل منتج بيحتوي دايماً على product.variants = [{ id, color:{ar,en}|null, hex, images:[], sizeStock:{ size: {sku, stock} } }]
  // لو المنتج مالوش ألوان، بيبقى عنده Variant واحد بس بـ color=null.
  const NO_COLOR_ID = '__no_color__';

  const getVariants = (product) => (product && Array.isArray(product.variants) ? product.variants : []);

  const getVariantById = (product, variantId) => getVariants(product).find(v => v.id === variantId);

  const hasColors = (product) => getVariants(product).length > 1 || (getVariants(product)[0] && getVariants(product)[0].color);

  const getDefaultVariant = (product) => getVariants(product)[0] || null;

  const getSizeEntry = (product, variantId, size) => {
    const variant = getVariantById(product, variantId) || getDefaultVariant(product);
    if (!variant || !variant.sizeStock) return null;
    return variant.sizeStock[size] || null;
  };

  const getVariantStock = (product, variantId, size) => {
    const entry = getSizeEntry(product, variantId, size);
    return entry ? Math.max(0, Number(entry.stock) || 0) : 0;
  };

  const getVariantTotalStock = (variant) => {
    if (!variant || !variant.sizeStock) return 0;
    return Object.values(variant.sizeStock).reduce((sum, e) => sum + Math.max(0, Number(e.stock) || 0), 0);
  };

  const getProductTotalStock = (product) => getVariants(product).reduce((sum, v) => sum + getVariantTotalStock(v), 0);

  const getLowStockThreshold = (product) => {
    const own = product && product.lowStockThreshold;
    return (own !== undefined && own !== null && own !== '') ? Number(own) : adminSettings.current.defaultLowStockThreshold;
  };

  // 'out' | 'low' | 'in'
  const getProductStockStatus = (product) => {
    const total = getProductTotalStock(product);
    if (total <= 0) return 'out';
    if (total <= getLowStockThreshold(product)) return 'low';
    return 'in';
  };

  const isProductFullyOutOfStock = (product) => getProductTotalStock(product) <= 0;

  // منتج قابل للظهور للعميل: منشور + (متوفر أو "عرض الغير متوفر" مفعّل)
  const isProductVisibleToCustomer = (product) => {
    if (!product) return false;
    const visibility = product.visibility || 'published';
    if (visibility !== 'published') return false;
    if (isProductFullyOutOfStock(product) && adminSettings.current.displayOutOfStockProducts === false) return false;
    return true;
  };

  const getVariantImages = (product, variantId) => {
    if (!product) return [];
    // مهم: لو مفيش variantId (يعني العميل لسه ما اختارش لون)، ما نرجعش صور أول لون تلقائياً.
    // بنرجع صور المنتج العامة (غير المرتبطة بلون معين) لحد ما العميل يختار.
    const variant = getVariantById(product, variantId);
    if (variant && Array.isArray(variant.images) && variant.images.length > 0) return variant.images;
    return product.images || [];
  };

  const generateSKU = (product, colorLabel, size) => {
    const base = (product && (product.name?.en || product.name?.ar) || 'PRD').toString().trim().slice(0, 3).toUpperCase();
    const colorPart = colorLabel ? colorLabel.toString().trim().slice(0, 3).toUpperCase() : 'STD';
    const sizePart = size ? size.toString().trim().slice(0, 3).toUpperCase() : 'OS';
    return `${base}-${colorPart}-${sizePart}`;
  };


  const toDatetimeLocalValue = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // ===== رسائل التنبيه =====
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const showToast = useCallback((message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // ===== المستخدم =====
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [editAccountData, setEditAccountData] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    if (user) {
      setEditAccountData({ name: user.name, email: user.email, phone: user.phone });
    }
  }, [user]);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // ===== الخصم 5% =====
  const [firstOrderDiscountEligible, setFirstOrderDiscountEligible] = useState(false);
  const [firstOrderDiscountUsed, setFirstOrderDiscountUsed] = useState(false);

  // ===== رسالة خصم الزائر (Guest Discount) - إخفاء للجلسة الحالية عند الإغلاق =====
  const [guestDiscountDismissed, setGuestDiscountDismissed] = useState(false);
  // ===== إظهار/إخفاء بانر تذكير "خصم أول طلب" - هذه حالة واجهة فقط ولا تمس أهلية الخصم إطلاقاً =====
  const [firstOrderBannerDismissed, setFirstOrderBannerDismissed] = useState(false);

  // ===== بوب أب عرض الترحيب (Welcome Offer) =====
  const [welcomeOfferClosed, setWelcomeOfferClosed] = useState(false); // إغلاق للجلسة الحالية بس - حالة واجهة مستقلة تماماً
  const [welcomeOfferVisible, setWelcomeOfferVisible] = useState(false); // بيتحول true بعد تأخير بسيط لظهور أنيق
  const [welcomeOfferPreviewLang, setWelcomeOfferPreviewLang] = useState('ar');
  const [welcomeOfferProductSearch, setWelcomeOfferProductSearch] = useState('');
  // ===== لغة معاينة الأدمن لبطاقة خصم الزائر (لا تؤثر على الموقع الفعلي) =====
  const [promoPreviewLang, setPromoPreviewLang] = useState('ar');

  // ===== تابات مركز العروض الترويجية (Promotions Hub) - جزء 9 =====
  const [promotionsSubTab, setPromotionsSubTab] = useState('overview'); // overview | campaigns | welcome | guest

  // ===== محرك العروض الترويجية الحقيقي (Campaigns / Promotions Hub) =====
  const [campaignFormOpen, setCampaignFormOpen] = useState(false); // فورم إنشاء/تعديل عرض
  const [editingPromotionId, setEditingPromotionId] = useState(null); // null = عرض جديد
  const [newPromoName, setNewPromoName] = useState('');
  const [newPromoType, setNewPromoType] = useState('bxgy'); // bxgy | quantity_discount | percentage | fixed
  const [newPromoTarget, setNewPromoTarget] = useState('product'); // product | category | all
  const [newPromoProductId, setNewPromoProductId] = useState(null); // لا يوجد اختيار افتراضي أبداً
  const [newPromoCategoryId, setNewPromoCategoryId] = useState(null); // لا يوجد اختيار افتراضي أبداً
  const [newPromoBuyQty, setNewPromoBuyQty] = useState(2);
  const [newPromoFreeQty, setNewPromoFreeQty] = useState(1);
  const [newPromoMinQty, setNewPromoMinQty] = useState(2);
  const [newPromoDiscountPercent, setNewPromoDiscountPercent] = useState(10);
  const [newPromoPercentage, setNewPromoPercentage] = useState(10);
  const [newPromoFixedAmount, setNewPromoFixedAmount] = useState(50);
  const [newPromoStartDate, setNewPromoStartDate] = useState('');
  const [newPromoEndDate, setNewPromoEndDate] = useState('');
  const [campaignProductSearch, setCampaignProductSearch] = useState('');

  // ===== عروض المنتج المتعددة (Product Offers) - جزء 1-8 =====
  const [productOfferFormOpen, setProductOfferFormOpen] = useState(false); // فورم إضافة/تعديل عرض منتج
  const [editingProductOfferId, setEditingProductOfferId] = useState(null); // null = عرض جديد
  const [poName, setPoName] = useState('');
  const [poType, setPoType] = useState('quantity_discount'); // percentage | fixed | bxgy | quantity_discount
  const [poMinQty, setPoMinQty] = useState(2);
  const [poDiscountPercent, setPoDiscountPercent] = useState(10);
  const [poFixedAmount, setPoFixedAmount] = useState(50);
  const [poBuyQty, setPoBuyQty] = useState(2);
  const [poFreeQty, setPoFreeQty] = useState(1);
  const [poActive, setPoActive] = useState(true);

  // ===== المحافظات =====
  const [governorates, setGovernorates] = useState([
    { id: 1, name: { ar: 'القاهرة', en: 'Cairo' }, cost: 70 },
    { id: 2, name: { ar: 'الجيزة', en: 'Giza' }, cost: 70 },
    { id: 3, name: { ar: 'الإسكندرية', en: 'Alexandria' }, cost: 95 },
    { id: 4, name: { ar: 'المنصورة / الدقهلية', en: 'Mansoura / Dakahlia' }, cost: 100 },
    { id: 5, name: { ar: 'باقي المحافظات', en: 'Other Governorates' }, cost: 120 },
  ]);

  // ===== الأقسام والمنتجات =====
  const [categories, setCategories] = useState([
    { id: 1, name: { ar: 'بناطيل', en: 'Pants' }, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500' },
    { id: 2, name: { ar: 'تيشيرتات', en: 'T-Shirts' }, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500' },
    { id: 3, name: { ar: 'إكسسوارات', en: 'Accessories' }, image: 'https://images.unsplash.com/photo-1550614000-4b95d4ebf5eb?w=500' },
  ]);

  const [products, setProducts] = useState([
    {
      id: 1,
      name: { ar: 'تيشيرت لافا أسود كلاسيك', en: 'LAVA Classic Black T-Shirt' },
      price: 450,
      costPrice: 200,
      description: { ar: 'تيشيرت مصمم خصيصاً من أجود خامات القطن المصري، مريح جداً في اللبس.', en: 'T-shirt specially designed from the finest Egyptian cotton, very comfortable to wear.' },
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#000000', '#ffffff', '#d2b48c'],
      variants: [
        {
          id: 'blk', color: { ar: 'أسود', en: 'Black' }, hex: '#000000',
          images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
            'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'
          ],
          sizeStock: {
            S: { sku: 'TS-BLK-S', stock: 10 },
            M: { sku: 'TS-BLK-M', stock: 5 },
            L: { sku: 'TS-BLK-L', stock: 0 },
            XL: { sku: 'TS-BLK-XL', stock: 8 },
          }
        },
        {
          id: 'wht', color: { ar: 'أبيض', en: 'White' }, hex: '#ffffff',
          images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'
          ],
          sizeStock: {
            S: { sku: 'TS-WHT-S', stock: 3 },
            M: { sku: 'TS-WHT-M', stock: 0 },
            L: { sku: 'TS-WHT-L', stock: 7 },
            XL: { sku: 'TS-WHT-XL', stock: 2 },
          }
        },
        {
          id: 'beige', color: { ar: 'بيج', en: 'Beige' }, hex: '#d2b48c',
          images: [
            'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'
          ],
          sizeStock: {
            S: { sku: 'TS-BEI-S', stock: 0 },
            M: { sku: 'TS-BEI-M', stock: 0 },
            L: { sku: 'TS-BEI-L', stock: 0 },
            XL: { sku: 'TS-BEI-XL', stock: 0 },
          }
        },
      ],
      lowStockThreshold: 5,
      visibility: 'published',
      category: { ar: 'تيشيرتات', en: 'T-Shirts' },
      onSale: false,
      salePrice: null,
      isFeatured: true,
      recommendedIds: [],
      bundle: { productIds: [], discountPercent: 0 },
      enableRecommendations: true,
      enableBundle: true,
      enableReviews: true
    },
    {
      id: 2,
      name: { ar: 'طقم اكواب كورتادو من مبيرو (6 قطعة)', en: 'Mbero Cortado Cups Set (6 pieces)' },
      price: 975,
      costPrice: 500,
      description: { ar: 'طقم اكواب كورتادو فاخر من مبيرو، 6 قطع بتصميم أنيق.', en: 'Premium Mbero Cortado cups set, 6 pieces with an elegant design.' },
      images: [
        'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800',
        'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'
      ],
      sizes: ['واحد'],
      colors: [],
      variants: [
        {
          id: NO_COLOR_ID, color: null, hex: null, images: [],
          sizeStock: { 'واحد': { sku: 'MB-CORT-6', stock: 12 } }
        }
      ],
      lowStockThreshold: 5,
      visibility: 'published',
      category: { ar: 'إكسسوارات', en: 'Accessories' },
      onSale: false,
      salePrice: null,
      isFeatured: true,
      recommendedIds: [],
      bundle: { productIds: [], discountPercent: 0 },
      enableRecommendations: true,
      enableBundle: true,
      enableReviews: true
    }
  ]);

  // ===== العروض الترويجية الحقيقية (Campaigns) - المصدر المركزي الوحيد لحساب الخصومات =====
  // كل عرض: { id, name:{ar,en}, type: 'bxgy'|'quantity_discount'|'percentage'|'fixed', target: 'product'|'category'|'all',
  //           productId, categoryId, buyQty, freeQty, minQty, discountPercent, percentage, fixedAmount,
  //           active, startDate, endDate, createdAt }
  const [promotions, setPromotions] = useState([]);

  // ===== أقسام الصفحة الرئيسية =====
  const [homeSections, setHomeSections] = useState([
    { id: 1, type: 'image-text', title: { ar: 'تخفيضات الصيف', en: 'Summer Sale' }, description: { ar: 'خصم يصل إلى 50% على التشكيلة الجديدة', en: 'Up to 50% off on the new collection' }, image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800', buttonAction: 'shop', buttonText: { ar: 'تسوق الآن', en: 'Shop Now' } },
    { id: 2, type: 'image-only', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', buttonAction: 'shop', buttonText: { ar: 'تسوق الآن', en: 'Shop Now' } },
    { id: 3, type: 'text-only', title: { ar: 'توصيل مجاني', en: 'Free Shipping' }, description: { ar: 'لجميع الطلبات فوق 1500 جنيه', en: 'For all orders above 1500 EGP' } }
  ]);

  // ===== الصفحات المخصصة (بيضيفها الأدمن براحته وتظهر كزرار في الناف) =====
  const [customPages, setCustomPages] = useState([]);
  const [activeCustomPageId, setActiveCustomPageId] = useState(null);

  // ===== الأسئلة الشائعة =====
  const [faqs, setFaqs] = useState([
    { id: 1, q: { ar: 'إيه هي سياسة الاسترجاع؟', en: 'What is the return policy?' }, a: { ar: 'تقدر ترجع المنتج خلال 14 يوم من الاستلام، بشرط يكون بحالته الأصلية.', en: 'You can return the product within 14 days of receipt, provided it is in its original condition.' } },
    { id: 2, q: { ar: 'مدة التوصيل قد إيه؟', en: 'How long does delivery take?' }, a: { ar: 'التوصيل بياخد من 3 لـ 5 أيام عمل حسب محافظتك.', en: 'Delivery takes 3 to 5 business days depending on your governorate.' } }
  ]);

  // ===== سلة التسوق =====
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);
  const [selectedBundleIds, setSelectedBundleIds] = useState([]);

  // ===== تقييمات ومراجعات العملاء (محفوظة محلياً لكل منتج) =====
  const [productReviews, setProductReviews] = useState({});
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // ===== الطلبات والرسائل =====
  const [orders, setOrders] = useState([]);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [contactMessages, setContactMessages] = useState([]);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  // ===== الموظفين والمصاريف =====
  const [staffList, setStaffList] = useState([]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('call_center');

  const [expenses, setExpenses] = useState([
    { id: 1, title: 'إعلان تمويلى فيسبوك', amount: 500 }
  ]);
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // ===== إضافة منتج =====
  const [newProdNameAr, setNewProdNameAr] = useState('');
  const [newProdNameEn, setNewProdNameEn] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCost, setNewProdCost] = useState('');
  const [newProdCat, setNewProdCat] = useState('');
  const [newProdImgs, setNewProdImgs] = useState('');
  const [newProdImageFiles, setNewProdImageFiles] = useState([]); // [{ id, dataUrl, name }]
  const [draggedImageId, setDraggedImageId] = useState(null);
  const [newProdDescAr, setNewProdDescAr] = useState('');
  const [newProdDescEn, setNewProdDescEn] = useState('');
  const [newProdOnSale, setNewProdOnSale] = useState(false);
  const [newProdSalePrice, setNewProdSalePrice] = useState('');
  const [newProdIsFeatured, setNewProdIsFeatured] = useState(false);
  const [newProdEnableRec, setNewProdEnableRec] = useState(true);
  const [newProdEnableBundle, setNewProdEnableBundle] = useState(true);
  const [newProdEnableReviews, setNewProdEnableReviews] = useState(true);

  // ===== نظام الألوان / المقاسات / المخزون لمنتج جديد =====
  const [newProdVisibility, setNewProdVisibility] = useState('published'); // published | hidden | draft
  const [newProdLowStockThreshold, setNewProdLowStockThreshold] = useState('');
  const [newProdHasSizes, setNewProdHasSizes] = useState(true);
  const [newProdSelectedSizes, setNewProdSelectedSizes] = useState(['S', 'M', 'L', 'XL']);
  const [newProdCustomSize, setNewProdCustomSize] = useState('');
  const [newProdHasColors, setNewProdHasColors] = useState(false);
  const [newProdColors, setNewProdColors] = useState([]); // [{ id, nameAr, nameEn, hex }]
  const [newProdColorNameAr, setNewProdColorNameAr] = useState('');
  const [newProdColorNameEn, setNewProdColorNameEn] = useState('');
  const [newProdColorHex, setNewProdColorHex] = useState('#000000');
  const [newProdVariantsGenerated, setNewProdVariantsGenerated] = useState(null); // نتيجة "توليد الفاريانتس"
  const [newProdVariantStockInputs, setNewProdVariantStockInputs] = useState({}); // { "variantKey__size": { sku, stock } }
  const [newProdColorImages, setNewProdColorImages] = useState({}); // { colorId: [{ id, dataUrl, name }] }
  const [newProdSlug, setNewProdSlug] = useState('');
  const [newProdMetaTitleAr, setNewProdMetaTitleAr] = useState('');
  const [newProdMetaTitleEn, setNewProdMetaTitleEn] = useState('');
  const [newProdMetaDescAr, setNewProdMetaDescAr] = useState('');
  const [newProdMetaDescEn, setNewProdMetaDescEn] = useState('');

  const AVAILABLE_SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // ============================================================
  // إدارة المنتجات (الأدمن) — تحديد منتج / إضافة / تعديل
  // ============================================================
  const [selectedManagedProductId, setSelectedManagedProductId] = useState(null); // لا يوجد اختيار افتراضي أبداً
  const [productManagerMode, setProductManagerMode] = useState('closed'); // 'closed' | 'add' | 'edit'
  const [productEditorTab, setProductEditorTab] = useState('basic'); // basic | media | variants | inventory | visibility | marketing | seo
  const [adminProductSearch, setAdminProductSearch] = useState('');
  const [adminProductFilter, setAdminProductFilter] = useState('all');
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState(null);
  const [productEditorDirty, setProductEditorDirty] = useState(false);
  const [productEditorLoaded, setProductEditorLoaded] = useState(false);
  const [draggedColorImageKey, setDraggedColorImageKey] = useState(null);
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false); // درج القائمة الجانبية للأدمن على الموبايل

  // أي تغيير في حقول النموذج بعد التحميل الأول = فيه تعديلات غير محفوظة
  useEffect(() => {
    if (productManagerMode === 'closed') { setProductEditorLoaded(false); setProductEditorDirty(false); return; }
    if (!productEditorLoaded) { setProductEditorLoaded(true); return; }
    setProductEditorDirty(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    newProdNameAr, newProdNameEn, newProdPrice, newProdCost, newProdCat, newProdImgs, newProdImageFiles,
    newProdDescAr, newProdDescEn, newProdOnSale, newProdSalePrice, newProdIsFeatured, newProdEnableRec,
    newProdEnableBundle, newProdEnableReviews, newProdVisibility, newProdLowStockThreshold, newProdHasSizes,
    newProdSelectedSizes, newProdHasColors, newProdColors, newProdColorImages, newProdVariantsGenerated,
    newProdVariantStockInputs, newProdSlug, newProdMetaTitleAr, newProdMetaTitleEn, newProdMetaDescAr, newProdMetaDescEn
  ]);

  // ===== إضافة قسم =====
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatImg, setNewCatImg] = useState('');

  // ===== إضافة محافظة =====
  const [newGovNameAr, setNewGovNameAr] = useState('');
  const [newGovNameEn, setNewGovNameEn] = useState('');
  const [newGovCost, setNewGovCost] = useState('');

  // ===== بيانات الشحن =====
  const [selectedGov, setSelectedGov] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingPhone2, setShippingPhone2] = useState('');
  const [shippingZipCode, setShippingZipCode] = useState('');
  const [shippingFullName, setShippingFullName] = useState('');
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [saveShippingInfo, setSaveShippingInfo] = useState(false);
  const [hasSavedShipping, setHasSavedShipping] = useState(false);
  const [checkoutNotes, setCheckoutNotes] = useState('');

  // ===== بيانات المبيعات =====
  const [salesData, setSalesData] = useState([
    { day: { ar: 'السبت', en: 'Sat' }, amount: 1200 },
    { day: { ar: 'الأحد', en: 'Sun' }, amount: 800 },
    { day: { ar: 'الإثنين', en: 'Mon' }, amount: 1500 },
    { day: { ar: 'الثلاثاء', en: 'Tue' }, amount: 2000 },
    { day: { ar: 'الأربعاء', en: 'Wed' }, amount: 950 },
    { day: { ar: 'الخميس', en: 'Thu' }, amount: 3000 },
    { day: { ar: 'الجمعة', en: 'Fri' }, amount: 2500 },
  ]);

  const [adminTab, setAdminTab] = useState('stats');
  const [apiSubTab, setApiSubTab] = useState('keys');
  const [statsPeriod, setStatsPeriod] = useState('weekly');

  // ===== إدارة أقسام الصفحة الرئيسية =====
  const [newSectionType, setNewSectionType] = useState('image-text');
  const [newSectionTitleAr, setNewSectionTitleAr] = useState('');
  const [newSectionTitleEn, setNewSectionTitleEn] = useState('');
  const [newSectionDescAr, setNewSectionDescAr] = useState('');
  const [newSectionDescEn, setNewSectionDescEn] = useState('');
  const [newSectionImage, setNewSectionImage] = useState('');
  const [newSectionButtonAction, setNewSectionButtonAction] = useState('none');
  const [newSectionButtonTextAr, setNewSectionButtonTextAr] = useState('');
  const [newSectionButtonTextEn, setNewSectionButtonTextEn] = useState('');

  // ===== حقول فورم إضافة صفحة مخصصة وأقسامها =====
  const [newPageTitleAr, setNewPageTitleAr] = useState('');
  const [newPageTitleEn, setNewPageTitleEn] = useState('');
  const [selectedPageForSection, setSelectedPageForSection] = useState('');
  const [newPageSectionType, setNewPageSectionType] = useState('image-text');
  const [newPageSectionTitleAr, setNewPageSectionTitleAr] = useState('');
  const [newPageSectionTitleEn, setNewPageSectionTitleEn] = useState('');
  const [newPageSectionDescAr, setNewPageSectionDescAr] = useState('');
  const [newPageSectionDescEn, setNewPageSectionDescEn] = useState('');
  const [newPageSectionImage, setNewPageSectionImage] = useState('');
  const [newPageSectionButtonAction, setNewPageSectionButtonAction] = useState('none');
  const [newPageSectionButtonTextAr, setNewPageSectionButtonTextAr] = useState('');
  const [newPageSectionButtonTextEn, setNewPageSectionButtonTextEn] = useState('');

  // ===== إدارة توصيات المنتجات =====
  const [selectedProductForRec, setSelectedProductForRec] = useState(null);
  const [recProductIds, setRecProductIds] = useState([]);
  const [bundleProductIds, setBundleProductIds] = useState([]);
  const [bundleDiscountPercent, setBundleDiscountPercent] = useState(0);
  const [recEnableRec, setRecEnableRec] = useState(true);
  const [recEnableBundle, setRecEnableBundle] = useState(true);
  const [recSearchQuery, setRecSearchQuery] = useState('');

  // ===== دالة الترجمة =====
  const t = useCallback((ar, en) => language === 'ar' ? ar : en, [language]);

  // ===== دالة مساعدة لجلب النص المترجم من كائن =====
  const getLocalized = useCallback((obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object' && obj !== null) {
      return obj[language] || obj.ar || obj.en || '';
    }
    return String(obj);
  }, [language]);

  // ===== تحميل Font Awesome =====
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
    document.head.appendChild(link);
  }, []);

  // ===== تحميل مكتبة xlsx لتصدير Excel =====
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      // cleanup not needed
    };
  }, []);

  // ===== دالة التنقل الموحدة: كل تنقل بين الصفحات لازم يمر من هنا =====
  // ده بالظبط اللي بيخلي السلوك زي المواقع الكبيرة (React Router وغيره):
  // كل ضغطة على رابط/زرار تنقل بتزود navKey، فالـ useLayoutEffect تحت بيتنفذ
  // أكيد في كل مرة - حتى لو الصفحة الجديدة نفس اسم الصفحة القديمة (زي الضغط
  // على "المتجر" وأنت أصلاً في صفحة المتجر، أو اختيار قسم/فلتر تاني وانت
  // في نفس الصفحة). الاعتماد القديم على تغيّر قيمة currentPage/selectedProduct
  // بس كان بيخلي التمرير ميحصلش في الحالات دي لأن React مكنش بيعتبرها تغيير.
  const goTo = useCallback((page) => {
    setCurrentPage(page);
    setNavKey(k => k + 1);
  }, []);

  // ===== الأزرار الجاهزة اللي ممكن تتضاف لأي قسم (في الصفحة الرئيسية أو صفحة مخصصة) =====
  // مفيش زرار بيتخترع من الصفر: كل زرار هنا بيستخدم نفس وظيفة زرار موجود فعلاً في الموقع.
  const sectionButtonActions = [
    { key: 'none', label: t('بدون زرار', 'No button') },
    { key: 'shop', label: t('جميع المنتجات', 'All Products'), defaultText: { ar: 'تسوق الآن', en: 'Shop Now' } },
    { key: 'contact', label: t('تواصل معنا', 'Contact Us'), defaultText: { ar: 'تواصل معنا', en: 'Contact Us' } },
    { key: 'home', label: t('الرئيسية', 'Home'), defaultText: { ar: 'الرئيسية', en: 'Home' } },
  ];

  const handleSectionButtonClick = (action) => {
    if (action === 'shop') { setSelectedCategoryFilter('all'); goTo('shop'); }
    else if (action === 'contact') { goTo('contact'); }
    else if (action === 'home') { goTo('home'); }
  };

  // دالة مشتركة لعرض أقسام (صورة/نص/زرار) - تُستخدم في الصفحة الرئيسية وفي أي صفحة مخصصة
  const renderSectionsList = (sectionsList) => sectionsList.map((section) => (
    <div key={section.id} className="w-full">
      {section.type === 'image-text' && (
        <div className={`flex flex-col md:flex-row items-center gap-6 bg-white rounded-lg shadow-md overflow-hidden ${language === 'ar' ? 'md:flex-row-reverse' : ''}`}>
          {section.image && (
            <div className="md:w-1/2 h-64 md:h-auto">
              <img src={section.image} alt={getLocalized(section.title)} className="w-full h-full object-cover" />
            </div>
          )}
          <div className={`p-6 md:w-1/2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {section.title && <h3 className="text-2xl font-bold mb-2">{getLocalized(section.title)}</h3>}
            {section.description && <p className="text-gray-600 text-lg">{getLocalized(section.description)}</p>}
            {section.buttonAction && section.buttonAction !== 'none' && (
              <button onClick={() => handleSectionButtonClick(section.buttonAction)} className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">{getLocalized(section.buttonText) || t('تسوق الآن', 'Shop Now')}</button>
            )}
          </div>
        </div>
      )}
      {section.type === 'image-only' && (
        <div className="w-full rounded-lg overflow-hidden shadow-md">
          <img src={section.image} alt={getLocalized(section.title) || t('قسم', 'Section')} className="w-full h-auto object-cover" />
          {section.buttonAction && section.buttonAction !== 'none' && (
            <div className="text-center mt-2">
              <button onClick={() => handleSectionButtonClick(section.buttonAction)} className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">{getLocalized(section.buttonText) || t('تسوق الآن', 'Shop Now')}</button>
            </div>
          )}
        </div>
      )}
      {section.type === 'text-only' && (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          {section.title && <h3 className="text-2xl font-bold mb-2">{getLocalized(section.title)}</h3>}
          {section.description && <p className="text-gray-600 text-lg">{getLocalized(section.description)}</p>}
          {section.buttonAction && section.buttonAction !== 'none' && (
            <button onClick={() => handleSectionButtonClick(section.buttonAction)} className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">{getLocalized(section.buttonText) || t('تسوق الآن', 'Shop Now')}</button>
          )}
        </div>
      )}
    </div>
  ));

  // ===== إغلاق الموبايل مينو + التمرير لأعلى الصفحة عند أي تنقل =====
  // اكتشفت بالاختبار الفعلي إن window.scrollTo(0,0) لوحده مش كافي: لو الصفحة
  // عندها عنصر تاني (زي #root أو أي div) هو اللي بيعمل السكرول فعلياً (بسبب
  // CSS مثلاً overflow-y:auto مع ارتفاع ثابت)، فـ window.scrollTo ميعملش أي حاجة
  // خالص، والمتصفح بيكتفي إنه "يقصّ" وضع السكرول القديم على أقصى ارتفاع للصفحة
  // الجديدة - وده اللي بيوديك في آخر الصفحة بالظبط زي ما بيحصل معاك. فعشان كده
  // بنصفّر كل حاوية ممكن تكون هي اللي بتعمل سكرول، مش بس الـ window.
  useLayoutEffect(() => {
    setIsMobileMenuOpen(false);

    const resetAllScrollContainers = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
      // أي عنصر تاني في الصفحة عنده سكرول فعلي (زي حاوية رئيسية بـ overflow-y-auto)
      document.querySelectorAll('*').forEach((el) => {
        if (el.scrollTop > 0) el.scrollTop = 0;
      });
    };

    resetAllScrollContainers();
    // إعادة التأكيد بعد أول فريم رسم، عشان لو أي صورة استغرقت وقت تحمل
    // وغيّرت ارتفاع الصفحة بعد أول تصفير مباشرة.
    requestAnimationFrame(resetAllScrollContainers);
  }, [navKey]);

  // تأمين إضافي: تعطيل "scroll anchoring" في المتصفح، وهي خاصية بتخلي
  // المتصفح يحرّك مكان السكرول تلقائياً لما محتوى فوق منطقة الرؤية يتغيّر
  // حجمه (زي الصور اللي بتتحمل بعد التمرير لفوق)، وده كان ممكن يسحب المستخدم
  // لمكان تاني غير أول الصفحة حتى بعد ما إحنا نعمل scrollTo(0,0).
  useEffect(() => {
    document.documentElement.style.overflowAnchor = 'none';
    document.body.style.overflowAnchor = 'none';
  }, []);

  // ===== تأثير fade-in عند التمرير =====
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [currentPage]);

  // ===== إغلاق الموبايل مينو عند النقر في أي مكان آخر =====
  useEffect(() => {
    const handleClickOutside = (event) => {
      const nav = document.querySelector('nav');
      const menu = document.querySelector('.mobile-menu');
      if (isMobileMenuOpen && nav && !nav.contains(event.target) && menu && !menu.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // ===== إغلاق قائمة الحساب عند الضغط في أي مكان تاني بالصفحة =====
  useEffect(() => {
    const handleClickOutsideAccount = (event) => {
      const menu = document.querySelector('.account-menu');
      if (showAccountMenu && menu && !menu.contains(event.target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutsideAccount);
    return () => document.removeEventListener('click', handleClickOutsideAccount);
  }, [showAccountMenu]);

  // ===== إغلاق قائمة اقتراحات البحث عند النقر خارجها =====
  useEffect(() => {
    const handleClickOutsideSearch = (event) => {
      const searchBox = document.getElementById('searchQuery');
      if (showSearchDropdown && searchBox && !searchBox.parentElement.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutsideSearch);
    return () => document.removeEventListener('click', handleClickOutsideSearch);
  }, [showSearchDropdown]);

  // ===== التحكم في إظهار/إخفاء الهيدر بناءً على اتجاه السكرول =====
  const [isBarVisible, setIsBarVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const TOP_BUFFER = 60;
    const MIN_DELTA = 4;

    const updateHeader = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;

      if (currentScrollY <= TOP_BUFFER) {
        setIsBarVisible(true);
      } else if (delta > MIN_DELTA) {
        setIsBarVisible(false);
        setIsMobileMenuOpen(false);
      } else if (delta < -MIN_DELTA) {
        setIsBarVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
      tickingRef.current = false;
    };

    const handleScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        window.requestAnimationFrame(updateHeader);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ===== ظهور بوب أب عرض الترحيب مرة واحدة عند دخول الموقع (لو مفعّل من الأدمن) =====
  // ملحوظة: دي حالة عرض/إغلاق فقط، ومستقلة تماماً عن خصم أول طلب وأهليته.
  useEffect(() => {
    if (!adminSettings.current.promotions.welcomeOffer.enabled) return;
    const timer = setTimeout(() => setWelcomeOfferVisible(true), 900);
    return () => clearTimeout(timer);
  }, []);

  // ============================================================
  // دوال تسجيل الدخول والخروج
  // ============================================================
  const handleLogin = useCallback((e) => {
    e.preventDefault();
    if (loginEmail === adminSettings.current.adminEmail && 
        loginPassword === adminSettings.current.adminPassword && 
        loginPhone === adminSettings.current.adminPhone) {
      setUser({
        name: t('مدير المتجر (Admin)', 'Store Admin'),
        email: adminSettings.current.adminEmail,
        phone: adminSettings.current.adminPhone,
        role: 'admin',
        address: t('الإدارة العامة', 'General Management'),
        savedShipping: null
      });
      setShowLoginModal(false);
      goTo('admin');
      setLoginEmail('');
      setLoginPassword('');
      setLoginPhone('');
      showToast(t('مرحباً بك يا أدمن في لوحة التحكم الكاملة!', 'Welcome Admin to the full dashboard!'));
      return;
    }

    const foundStaff = staffList.find(s => s.email === loginEmail && s.password === loginPassword);
    if (foundStaff) {
      setUser({
        name: foundStaff.name,
        email: foundStaff.email,
        phone: foundStaff.phone || '01000000000',
        role: foundStaff.role,
        address: t('مقر العمل', 'Work Location'),
        savedShipping: foundStaff.savedShipping || null
      });
      setShowLoginModal(false);
      goTo('admin');
      setAdminTab('orders');
      setLoginEmail('');
      setLoginPassword('');
      setLoginPhone('');
      showToast(t(`مرحباً بك يا ${foundStaff.name}`, `Welcome ${foundStaff.name}`));
      return;
    }

    showToast(t('بيانات الدخول غير صحيحة، تأكد من الإيميل والباسورد.', 'Invalid login credentials.'));
  }, [loginEmail, loginPassword, loginPhone, staffList, t]);

  const handleRegister = useCallback((e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regPassword) {
      showToast(t('من فضلك املأ جميع بيانات التسجيل', 'Please fill in all registration fields'));
      return;
    }
    const newUser = {
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      role: 'customer',
      address: '',
      savedShipping: null
    };
    setUser(newUser);
    setShowLoginModal(false);
    setIsRegistering(false);
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');

    // ===== أهلية خصم "أول طلب" للعميل الجديد فقط =====
    // العميل يستحق خصم أول طلب فقط لو مفيش طلبات سابقة مسجلة بنفس الإيميل ده.
    // isLoggedIn لوحدها مش كافية أبداً لمنح الخصم - لازم يكون العميل "جديد فعلاً" (معندوش طلبات قبل كده).
    const hasPreviousOrders = orders.some(o => (o.customerEmail || '').toLowerCase() === regEmail.toLowerCase());

    if (!hasPreviousOrders) {
      setFirstOrderDiscountEligible(true);
      setFirstOrderDiscountUsed(false);
      setFirstOrderBannerDismissed(false);

      const regDiscountPercentage = adminSettings.current.promotions.guestDiscount.percentage;
      showToast(t(`مبروك! تم إنشاء الحساب بنجاح وأصبح لديك خصم ${regDiscountPercentage}% على أول طلب لك.`, `Congratulations! You have a ${regDiscountPercentage}% discount on your first order.`));
    } else {
      // عميل عنده طلبات سابقة بنفس الإيميل - مش هياخد خصم عميل جديد
      setFirstOrderDiscountEligible(false);
      setFirstOrderDiscountUsed(true);
      showToast(t('تم إنشاء الحساب وتسجيل الدخول بنجاح!', 'Account created and logged in successfully!'));
    }
  }, [regName, regEmail, regPhone, regPassword, orders, t]);

  const handleLogout = useCallback(() => {
    setUser(null);
    // ملحوظة: تسجيل الخروج مايلغيش أهلية خصم أول طلب - الأهلية والاستخدام حالتين مستقلتين عن حالة الدخول
    goTo('home');
    setLoginEmail('');
    setLoginPassword('');
    setLoginPhone('');
    showToast(t('تم تسجيل الخروج بنجاح.', 'Logged out successfully.'));
  }, [t]);

  // ============================================================
  // دوال المنتجات وسلة التسوق
  // ============================================================
  const openProductDetails = useCallback((product) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
    // العميل لازم يختار اللون والمقاس بنفسه - مفيش اختيار تلقائي أبداً.
    // الاستثناء الوحيد: منتج مالوش ألوان أصلاً (فاريانت واحد بدون لون) - مفيش اختيار حقيقي هنا فعملياً،
    // فبنربط الفاريانت الوحيد ده تلقائياً عشان نقدر نحسب المخزون، من غير ما نعتبره "اختيار لون" من العميل.
    const productHasColors = hasColors(product);
    setSelectedColor(productHasColors ? '' : (getDefaultVariant(product)?.id || ''));
    // مفيش اختيار مقاس تلقائي أبداً لو المنتج فيه مقاسات - العميل لازم يختار بنفسه.
    setSelectedSize('');
    setProductQuantity(1);
    setSelectedBundleIds([product.id, ...(product.bundle?.productIds || [])]);
    goTo('product-details');
  }, []);

  // ===== زرار الدعوة لاتخاذ إجراء (CTA) في بوب أب عرض الترحيب - يفتح المنتج/القسم/المتجر المحدد من الأدمن =====
  const handleWelcomeOfferCTA = useCallback(() => {
    const offer = adminSettings.current.promotions.welcomeOffer;
    setWelcomeOfferClosed(true);
    if (offer.destinationType === 'product' && offer.productId) {
      const prod = products.find(p => p.id === offer.productId);
      if (prod) { openProductDetails(prod); return; }
    }
    if (offer.destinationType === 'category' && offer.categoryId) {
      const cat = categories.find(c => c.id === offer.categoryId);
      if (cat) { setSelectedCategoryFilter(getLocalized(cat.name)); goTo('shop'); return; }
    }
    setSelectedCategoryFilter('all');
    goTo('shop');
  }, [products, categories, getLocalized, openProductDetails]);

  // ============================================================
  // دوال الويشليست (المفضلة)
  // ============================================================
  const isInWishlist = useCallback((productId) => {
    return wishlist.some(id => id === productId);
  }, [wishlist]);

  const toggleWishlist = useCallback((productId) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast(t('تم إزالة المنتج من المفضلة', 'Removed from wishlist'));
        return prev.filter(id => id !== productId);
      }
      showToast(t('تم إضافة المنتج إلى المفضلة ❤️', 'Added to wishlist ❤️'));
      return [...prev, productId];
    });
  }, [t]);

  // كمية نفس الفاريانت/المقاس الموجودة بالفعل في السلة
  const getCartQuantityForVariant = useCallback((productId, variantId, size) => {
    return cart.filter(item => item.id === productId && (item.variantId || NO_COLOR_ID) === (variantId || NO_COLOR_ID) && item.size === size).length;
  }, [cart]);

  // تحقق شامل قبل الإضافة للسلة / الشراء المباشر (نفس التحقق لازم يتكرر في السيرفر لاحقاً)
  const validateCartAddition = useCallback((product, variantId, size, quantity) => {
    if (!product) return { ok: false, reason: t('المنتج غير موجود', 'Product not found') };
    if ((product.visibility || 'published') !== 'published') {
      return { ok: false, reason: t('هذا المنتج غير متاح للشراء حالياً', 'This product is not available for purchase') };
    }
    if (hasColors(product) && !variantId) {
      return { ok: false, reason: t('من فضلك اختر اللون أولاً', 'Please select a color first') };
    }
    if (!size) {
      return { ok: false, reason: t('من فضلك اختر المقاس أولاً', 'Please select a size first') };
    }
    const stock = getVariantStock(product, variantId, size);
    if (stock <= 0) {
      return { ok: false, reason: t('هذا الخيار غير متوفر حالياً', 'This option is currently out of stock') };
    }
    const alreadyInCart = getCartQuantityForVariant(product.id, variantId, size);
    const availableToAdd = stock - alreadyInCart;
    if (availableToAdd <= 0) {
      return { ok: false, reason: t('لقد أضفت بالفعل كل الكمية المتاحة من هذا الخيار', "You've already added all available stock of this option") };
    }
    return { ok: true, maxQty: Math.min(quantity, availableToAdd) };
  }, [t, getCartQuantityForVariant]);

  const addToCart = useCallback((product, variantId, size, price, quantity = 1) => {
    const check = validateCartAddition(product, variantId, size, quantity);
    if (!check.ok) {
      showToast(check.reason);
      return false;
    }
    const variant = getVariantById(product, variantId) || getDefaultVariant(product);
    const sizeEntry = getSizeEntry(product, variantId, size);
    const unitPrice = price || getEffectivePrice(product);
    const qty = Math.max(1, check.maxQty);
    const newItems = Array.from({ length: qty }, (_, i) => ({
      ...product,
      price: unitPrice,
      size: size,
      variantId: variant ? variant.id : NO_COLOR_ID,
      colorLabel: variant && variant.color ? getLocalized(variant.color) : null,
      colorHex: variant ? variant.hex : null,
      sku: sizeEntry ? sizeEntry.sku : undefined,
      cartId: Date.now() + i + Math.random()
    }));
    setCart(prev => [...prev, ...newItems]);
    showToast(t('تم إضافة المنتج إلى عربة التسوق بنجاح!', 'Product added to cart!'));
    return true;
  }, [t, validateCartAddition, getLocalized]);

  const buyNow = useCallback((product, variantId, size, price, quantity = 1) => {
    const check = validateCartAddition(product, variantId, size, quantity);
    if (!check.ok) {
      showToast(check.reason);
      return;
    }
    const variant = getVariantById(product, variantId) || getDefaultVariant(product);
    const sizeEntry = getSizeEntry(product, variantId, size);
    const unitPrice = price || getEffectivePrice(product);
    const qty = Math.max(1, check.maxQty);
    const newItems = Array.from({ length: qty }, (_, i) => ({
      ...product,
      price: unitPrice,
      size: size,
      variantId: variant ? variant.id : NO_COLOR_ID,
      colorLabel: variant && variant.color ? getLocalized(variant.color) : null,
      colorHex: variant ? variant.hex : null,
      sku: sizeEntry ? sizeEntry.sku : undefined,
      cartId: Date.now() + i + Math.random()
    }));
    setCart(prev => [...prev, ...newItems]);
    goTo('checkout');
  }, [t, validateCartAddition, getLocalized]);

  const submitProductReview = useCallback((productId) => {
    if (!reviewName.trim() || !reviewComment.trim()) {
      showToast(t('من فضلك أكمل الاسم والتعليق', 'Please fill in your name and comment'));
      return;
    }
    setProductReviews(prev => {
      const existing = prev[productId] || [];
      return {
        ...prev,
        [productId]: [
          { id: Date.now(), name: reviewName.trim(), rating: reviewRating, comment: reviewComment.trim(), date: new Date().toISOString() },
          ...existing
        ]
      };
    });
    setReviewName('');
    setReviewRating(5);
    setReviewComment('');
    showToast(t('شكراً لك! تم إضافة تقييمك بنجاح', 'Thank you! Your review has been added'));
  }, [reviewName, reviewRating, reviewComment, t]);

  const addBundleToCart = useCallback((mainProduct, selectedBundleItems, discountPercent) => {
    if (!selectedSize) {
      showToast(t('من فضلك اختر المقاس أولاً', 'Please select a size first'));
      return;
    }

    const selectedProducts = [mainProduct, ...selectedBundleItems];
    // تحقق من توفر المخزون لكل منتج في العرض المشترك (المنتج الأساسي بلونه المختار، والباقي بأول فاريانت متاح)
    for (const p of selectedProducts) {
      const variantId = p.id === mainProduct.id ? selectedColor : getDefaultVariant(p)?.id;
      const stock = getVariantStock(p, variantId, selectedSize);
      if (stock <= 0) {
        showToast(t(`${getLocalized(p.name)} غير متوفر بالمقاس المختار`, `${getLocalized(p.name)} is out of stock in this size`));
        return;
      }
    }

    const totalOriginal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
    const discountAmount = totalOriginal * (discountPercent / 100);
    const totalAfterDiscount = totalOriginal - discountAmount;
    const discountedProducts = selectedProducts.map(p => {
      const share = p.price / totalOriginal;
      const itemDiscount = discountAmount * share;
      return {
        ...p,
        price: Math.round((p.price - itemDiscount) * 100) / 100
      };
    });

    const newCartItems = discountedProducts.map(p => {
      const variantId = p.id === mainProduct.id ? selectedColor : getDefaultVariant(p)?.id;
      const variant = getVariantById(p, variantId) || getDefaultVariant(p);
      const sizeEntry = getSizeEntry(p, variantId, selectedSize);
      return {
        ...p,
        size: selectedSize,
        variantId: variant ? variant.id : NO_COLOR_ID,
        colorLabel: variant && variant.color ? getLocalized(variant.color) : null,
        colorHex: variant ? variant.hex : null,
        sku: sizeEntry ? sizeEntry.sku : undefined,
        cartId: Date.now() + Math.random() * 1000,
        price: p.price
      };
    });
    setCart(prev => [...prev, ...newCartItems]);
    showToast(t('تم إضافة الباقة إلى السلة بنجاح!', 'Bundle added to cart!'));
  }, [selectedSize, selectedColor, t, getLocalized]);

  const toggleBundleItem = useCallback((id) => {
    setSelectedBundleIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const removeFromCart = useCallback((cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  }, []);

  const updateCartItemQuantity = useCallback((item, newQty) => {
    const sameLine = (c) => c.id === item.id && c.size === item.size && c.price === item.price && (c.variantId || NO_COLOR_ID) === (item.variantId || NO_COLOR_ID);
    const sameLineItems = cart.filter(sameLine);
    const currentQty = sameLineItems.length;
    if (newQty < 1 || newQty === currentQty) return;

    if (newQty > currentQty) {
      // ما نتجاوزش المخزون المتاح للفاريانت ده
      const productRef = products.find(p => p.id === item.id);
      const stock = productRef ? getVariantStock(productRef, item.variantId, item.size) : Infinity;
      if (newQty > stock) {
        showToast(t(`أقصى كمية متاحة هي ${stock}`, `Maximum available quantity is ${stock}`));
        return;
      }
      const toAdd = Array.from({ length: newQty - currentQty }, (_, i) => ({
        ...item,
        cartId: Date.now() + i + Math.random()
      }));
      setCart(prev => [...prev, ...toAdd]);
    } else {
      let toRemove = currentQty - newQty;
      setCart(prev => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0 && toRemove > 0; i--) {
          if (sameLine(next[i])) {
            next.splice(i, 1);
            toRemove--;
          }
        }
        return next;
      });
    }
  }, [cart, products, t]);

  // ============================================================
  // ================ محرك العروض الترويجية المركزي =================
  // مصدر واحد فقط لحساب أي خصم/قطعة مجانية على السلة بالكامل.
  // ممنوع تكرار هذا الحساب في أي مكان تاني (صفحة المنتج / الكارت / الشيكاوت / البوب أب) -
  // كل الأماكن الأخرى بتستخدم نفس الدوال دي.
  // ============================================================

  // هل العرض شغال دلوقتي (مفعّل + جوه فترة البداية/النهاية لو موجودة)؟
  const isPromotionCurrentlyActive = useCallback((promo) => {
    if (!promo || !promo.active) return false;
    const now = Date.now();
    if (promo.startDate && new Date(promo.startDate).getTime() > now) return false;
    if (promo.endDate && new Date(promo.endDate).getTime() < now) return false;
    return true;
  }, []);

  // إيجاد الـ ID بتاع قسم المنتج (عشان نطابقه مع عروض الأقسام)
  const getProductCategoryId = useCallback((product) => {
    if (!product) return null;
    const cat = categories.find(c =>
      (product.category && (c.name.ar === product.category.ar || c.name.en === product.category.en)) ||
      getLocalized(c.name) === getLocalized(product.category)
    );
    return cat ? cat.id : null;
  }, [categories, getLocalized]);

  // نص وصفي للعرض بالعربي والإنجليزي معاً - مولّد من الإعدادات الحقيقية، مش نص ثابت
  const getPromotionLabel = useCallback((promo) => {
    if (!promo) return { ar: '', en: '' };
    switch (promo.type) {
      case 'bxgy':
        return {
          ar: `اشترِ ${promo.buyQty} واحصل على ${promo.freeQty} مجاناً`,
          en: `Buy ${promo.buyQty} Get ${promo.freeQty} Free`
        };
      case 'quantity_discount':
        return {
          ar: `اشترِ ${promo.minQty} واحصل على خصم ${promo.discountPercent}%`,
          en: `Buy ${promo.minQty} Get ${promo.discountPercent}% OFF`
        };
      case 'percentage': {
        const pct = promo.percentage ?? promo.discountPercent;
        return { ar: `خصم ${pct}%`, en: `${pct}% OFF` };
      }
      case 'fixed':
        return { ar: `خصم ${promo.fixedAmount} ج.م`, en: `${promo.fixedAmount} EGP OFF` };
      default:
        return { ar: '', en: '' };
    }
  }, []);

  // عتبة الكمية اللي بيبدأ عندها العرض ينطبق (تستخدم في ترتيب التيرز - جزء 4/5)
  const getProductOfferThreshold = useCallback((offer) => {
    if (!offer) return Infinity;
    return offer.type === 'bxgy' ? (Math.max(0, Number(offer.buyQty) || 0)) : (Math.max(1, Number(offer.minQty) || 1));
  }, []);

  // كل عروض المنتج المفعّلة (Product Offers) مرتبة تصاعدياً حسب عتبة الكمية - تستخدم لعرضها كاملة في صفحة المنتج (جزء 21)
  const getActiveProductOffers = useCallback((product) => {
    if (!product || !Array.isArray(product.offers)) return [];
    return product.offers
      .filter(o => o.active)
      .slice()
      .sort((a, b) => getProductOfferThreshold(a) - getProductOfferThreshold(b));
  }, [getProductOfferThreshold]);

  // أعلى تير (Tier) من عروض المنتج المتعددة ينطبق فعلياً على كمية معينة - بدون أي تراكم (جزء 4/5/6)
  const getBestProductOfferForQty = useCallback((product, qty) => {
    const offers = getActiveProductOffers(product);
    if (offers.length === 0) return null;
    const applicable = offers.filter(o => qty >= getProductOfferThreshold(o));
    if (applicable.length === 0) return null;
    // أعلى عتبة منطبقة هي اللي بتفوز - مفيش تراكم بين التيرز
    return applicable.reduce((best, o) => (getProductOfferThreshold(o) > getProductOfferThreshold(best) ? o : best), applicable[0]);
  }, [getActiveProductOffers, getProductOfferThreshold]);

  // أعلى عرض ينطبق على منتج معيّن حسب الأولوية، لكمية معينة (افتراضياً 1):
  // 1) عرض خاص بالمنتج نفسه (أعلى تير منطبق من بين عروض المنتج المتعددة)
  // 2) عرض حملة مستهدف نفس المنتج بالتحديد
  // 3) عرض حملة مستهدف قسم المنتج
  // 4) عرض حملة مستهدف كل المنتجات
  // العرض الأعلى بيمنع اللي بعده تماماً - مفيش تراكم عروض على نفس المنتج أبداً.
  const resolveActivePromotionForProduct = useCallback((product, qty = 1) => {
    if (!product) return null;

    const bestOffer = getBestProductOfferForQty(product, qty);
    if (bestOffer) {
      return {
        id: `product-offer-${product.id}-${bestOffer.id}`,
        source: 'productOffer',
        target: 'product',
        productId: product.id,
        type: bestOffer.type,
        buyQty: bestOffer.buyQty,
        freeQty: bestOffer.freeQty,
        minQty: bestOffer.minQty,
        discountPercent: bestOffer.discountPercent,
        percentage: bestOffer.percentage,
        fixedAmount: bestOffer.fixedAmount,
      };
    }

    const activePromos = promotions.filter(isPromotionCurrentlyActive);
    if (activePromos.length === 0) return null;

    const productTargeted = activePromos.find(p => p.target === 'product' && p.productId === product.id);
    if (productTargeted) return { ...productTargeted, source: 'campaign' };

    const categoryId = getProductCategoryId(product);
    const categoryTargeted = categoryId ? activePromos.find(p => p.target === 'category' && p.categoryId === categoryId) : null;
    if (categoryTargeted) return { ...categoryTargeted, source: 'campaign' };

    const allTargeted = activePromos.find(p => p.target === 'all');
    if (allTargeted) return { ...allTargeted, source: 'campaign' };

    return null;
  }, [promotions, isPromotionCurrentlyActive, getProductCategoryId, getBestProductOfferForQty]);

  // حساب عدد القطع المجانية بشكل حتمي (deterministic) - اشترِ X احصل على Y مجاناً
  const computeBxGyFreeUnits = useCallback((qty, buyQty, freeQty) => {
    const b = Math.max(0, Number(buyQty) || 0);
    const f = Math.max(0, Number(freeQty) || 0);
    const groupSize = b + f;
    if (b <= 0 || f <= 0 || groupSize <= 0 || qty <= 0) return 0;
    const fullGroups = Math.floor(qty / groupSize);
    const remainder = qty % groupSize;
    const freeInRemainder = Math.max(0, remainder - b);
    return fullGroups * f + freeInRemainder;
  }, []);

  // تطبيق عرض معيّن على مجموعة قطع (وحدات) من نفس المنتج الموجودة فعلياً في السلة
  const computePromotionForLine = useCallback((promo, lineItems) => {
    if (!promo || !lineItems || lineItems.length === 0) {
      return { discountAmount: 0, freeCartIds: [], label: { ar: '', en: '' } };
    }
    const qty = lineItems.length;
    const label = getPromotionLabel(promo);

    if (promo.type === 'bxgy') {
      // القطع المجانية محدودة تلقائياً بعدد القطع الموجودة فعلاً بالسلة (اللي أصلاً محكوم بالمخزون المتاح)
      const freeCount = Math.min(computeBxGyFreeUnits(qty, promo.buyQty, promo.freeQty), qty);
      if (freeCount <= 0) return { discountAmount: 0, freeCartIds: [], label: { ar: '', en: '' } };
      // أرخص القطع هي اللي بتبقى مجاناً (الأكثر أماناً وعدلاً للعميل)
      const sorted = [...lineItems].sort((a, b) => a.price - b.price);
      const freeItems = sorted.slice(0, freeCount);
      const discountAmount = freeItems.reduce((s, it) => s + it.price, 0);
      return { discountAmount, freeCartIds: freeItems.map(it => it.cartId), label };
    }

    if (promo.type === 'quantity_discount') {
      if (qty < Math.max(1, Number(promo.minQty) || 0)) return { discountAmount: 0, freeCartIds: [], label: { ar: '', en: '' } };
      const lineSubtotal = lineItems.reduce((s, it) => s + it.price, 0);
      const discountAmount = lineSubtotal * (Math.max(0, Number(promo.discountPercent) || 0) / 100);
      return { discountAmount, freeCartIds: [], label };
    }

    if (promo.type === 'percentage') {
      const pct = Number(promo.percentage) || Number(promo.discountPercent) || 0;
      const lineSubtotal = lineItems.reduce((s, it) => s + it.price, 0);
      const discountAmount = lineSubtotal * (Math.max(0, pct) / 100);
      return { discountAmount, freeCartIds: [], label };
    }

    if (promo.type === 'fixed') {
      const lineSubtotal = lineItems.reduce((s, it) => s + it.price, 0);
      const discountAmount = Math.min(Math.max(0, Number(promo.fixedAmount) || 0), lineSubtotal);
      return { discountAmount, freeCartIds: [], label };
    }

    return { discountAmount: 0, freeCartIds: [], label: { ar: '', en: '' } };
  }, [getPromotionLabel, computeBxGyFreeUnits]);

  // نقطة الدخول الوحيدة لحساب كل عروض السلة دفعة واحدة - بتتجمع كل قطعة حسب المنتج،
  // وبتطبّق عليها أعلى عرض ينطبق (بدون أي تراكم عروض على نفس المنتج).
  const calculateCartPromotions = useCallback((cartItems) => {
    const byProduct = {};
    (cartItems || []).forEach(item => {
      const key = item.id;
      if (!byProduct[key]) byProduct[key] = [];
      byProduct[key].push(item);
    });

    let totalDiscount = 0;
    const freeCartIds = new Set();
    const appliedLines = [];

    Object.keys(byProduct).forEach(pid => {
      const lineItems = byProduct[pid];
      const product = products.find(p => String(p.id) === String(pid));
      if (!product) return;
      const promo = resolveActivePromotionForProduct(product, lineItems.length);
      if (!promo) return;
      const result = computePromotionForLine(promo, lineItems);
      if (result.discountAmount > 0) {
        totalDiscount += result.discountAmount;
        result.freeCartIds.forEach(id => freeCartIds.add(id));
        appliedLines.push({
          productId: product.id,
          productName: getLocalized(product.name),
          label: result.label,
          discountAmount: result.discountAmount
        });
      }
    });

    return { totalDiscount, freeCartIds, appliedLines };
  }, [products, resolveActivePromotionForProduct, computePromotionForLine, getLocalized]);

  // ============================================================
  // حساب إجمالي سلة التسوق
  // ============================================================
  const calculateCartTotals = useCallback(() => {
    const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
    let discount = 0;
    let discountType = '';
    let promoResult = { totalDiscount: 0, freeCartIds: new Set(), appliedLines: [] };

    if (user && firstOrderDiscountEligible && !firstOrderDiscountUsed) {
      // نفس السلوك القديم بالظبط - خصم أول طلب للعميل الجديد له الأولوية ولا يتراكم مع العروض الترويجية
      const firstOrderPercentage = adminSettings.current.promotions.guestDiscount.percentage;
      discount = subtotal * (firstOrderPercentage / 100);
      discountType = 'first_order';
    } else {
      // محرك العروض الترويجية الحقيقي (Buy X Get Y / خصم كمية / نسبة / مبلغ ثابت)
      promoResult = calculateCartPromotions(cart);
      if (promoResult.totalDiscount > 0) {
        discount = promoResult.totalDiscount;
        discountType = 'promotion';
      }
    }

    if (appliedDiscount) {
      const remainingAfterFirstDiscount = subtotal - discount;
      const codeDiscount = remainingAfterFirstDiscount * (appliedDiscount.discountPercent / 100);
      discount += codeDiscount;
      discountType = 'code';
    }

    const govObj = selectedGov
      ? governorates.find(g => g.name[language] === selectedGov || g.name.ar === selectedGov || g.name.en === selectedGov)
      : null;

    const qualifiesForFreeShipping = subtotal >= adminSettings.current.freeShippingThreshold;

    let shipping = 0;
    let shippingDetermined = false;

    if (qualifiesForFreeShipping) {
      shipping = 0;
      shippingDetermined = true;
    } else if (govObj) {
      shipping = govObj.cost;
      shippingDetermined = true;
    } else {
      shipping = 0;
      shippingDetermined = false;
    }

    const total = subtotal - discount + (shippingDetermined ? shipping : 0);
    return {
      subtotal, discount, shipping, shippingDetermined, total, discountType,
      promoFreeCartIds: promoResult.freeCartIds,
      promoAppliedLines: promoResult.appliedLines
    };
  }, [cart, user, firstOrderDiscountEligible, firstOrderDiscountUsed, appliedDiscount, governorates, selectedGov, language, calculateCartPromotions]);

  // ============================================================
  // إدارة العروض الترويجية (Admin → Promotions → Campaigns)
  // ============================================================
  const resetCampaignForm = useCallback(() => {
    setEditingPromotionId(null);
    setNewPromoName('');
    setNewPromoType('bxgy');
    setNewPromoTarget('product');
    setNewPromoProductId(null);
    setNewPromoCategoryId(null);
    setNewPromoBuyQty(2);
    setNewPromoFreeQty(1);
    setNewPromoMinQty(2);
    setNewPromoDiscountPercent(10);
    setNewPromoPercentage(10);
    setNewPromoFixedAmount(50);
    setNewPromoStartDate('');
    setNewPromoEndDate('');
    setCampaignProductSearch('');
    setCampaignFormOpen(false);
  }, []);

  const openNewCampaignForm = useCallback(() => {
    resetCampaignForm();
    setCampaignFormOpen(true);
  }, [resetCampaignForm]);

  const openEditCampaignForm = useCallback((promo) => {
    setEditingPromotionId(promo.id);
    setNewPromoName(promo.name?.ar || promo.name?.en || '');
    setNewPromoType(promo.type);
    setNewPromoTarget(promo.target);
    setNewPromoProductId(promo.productId ?? null);
    setNewPromoCategoryId(promo.categoryId ?? null);
    setNewPromoBuyQty(promo.buyQty ?? 2);
    setNewPromoFreeQty(promo.freeQty ?? 1);
    setNewPromoMinQty(promo.minQty ?? 2);
    setNewPromoDiscountPercent(promo.discountPercent ?? 10);
    setNewPromoPercentage(promo.percentage ?? 10);
    setNewPromoFixedAmount(promo.fixedAmount ?? 50);
    setNewPromoStartDate(promo.startDate ? toDatetimeLocalValue(promo.startDate) : '');
    setNewPromoEndDate(promo.endDate ? toDatetimeLocalValue(promo.endDate) : '');
    setCampaignProductSearch('');
    setCampaignFormOpen(true);
  }, []);

  const saveCampaignPromotion = useCallback(() => {
    if (!newPromoName.trim()) {
      showToast(t('من فضلك ادخل اسم العرض', 'Please enter a promotion name'));
      return;
    }
    if (newPromoTarget === 'product' && !newPromoProductId) {
      showToast(t('من فضلك اختر منتجاً للعرض', 'Please select a product for this promotion'));
      return;
    }
    if (newPromoTarget === 'category' && !newPromoCategoryId) {
      showToast(t('من فضلك اختر قسماً للعرض', 'Please select a category for this promotion'));
      return;
    }
    if (newPromoType === 'bxgy' && (Number(newPromoBuyQty) <= 0 || Number(newPromoFreeQty) <= 0)) {
      showToast(t('من فضلك ادخل كمية شراء وكمية مجانية صحيحة', 'Please enter valid buy/free quantities'));
      return;
    }
    if (newPromoType === 'quantity_discount' && (Number(newPromoMinQty) <= 0 || Number(newPromoDiscountPercent) <= 0)) {
      showToast(t('من فضلك ادخل الحد الأدنى للكمية ونسبة الخصم', 'Please enter minimum quantity and discount percentage'));
      return;
    }

    const payload = {
      id: editingPromotionId || Date.now(),
      name: { ar: newPromoName.trim(), en: newPromoName.trim() },
      type: newPromoType,
      target: newPromoTarget,
      productId: newPromoTarget === 'product' ? newPromoProductId : null,
      categoryId: newPromoTarget === 'category' ? newPromoCategoryId : null,
      buyQty: Number(newPromoBuyQty) || 0,
      freeQty: Number(newPromoFreeQty) || 0,
      minQty: Number(newPromoMinQty) || 0,
      discountPercent: Number(newPromoDiscountPercent) || 0,
      percentage: Number(newPromoPercentage) || 0,
      fixedAmount: Number(newPromoFixedAmount) || 0,
      startDate: newPromoStartDate ? new Date(newPromoStartDate).toISOString() : null,
      endDate: newPromoEndDate ? new Date(newPromoEndDate).toISOString() : null,
      active: editingPromotionId ? (promotions.find(p => p.id === editingPromotionId)?.active ?? true) : true,
      createdAt: editingPromotionId ? (promotions.find(p => p.id === editingPromotionId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };

    if (editingPromotionId) {
      setPromotions(prev => prev.map(p => p.id === editingPromotionId ? payload : p));
      showToast(t('تم تحديث العرض بنجاح!', 'Promotion updated successfully!'));
    } else {
      setPromotions(prev => [payload, ...prev]);
      showToast(t('تم إنشاء العرض بنجاح!', 'Promotion created successfully!'));
    }
    resetCampaignForm();
  }, [editingPromotionId, newPromoName, newPromoType, newPromoTarget, newPromoProductId, newPromoCategoryId, newPromoBuyQty, newPromoFreeQty, newPromoMinQty, newPromoDiscountPercent, newPromoPercentage, newPromoFixedAmount, newPromoStartDate, newPromoEndDate, promotions, resetCampaignForm, t]);

  const togglePromotionActive = useCallback((promoId) => {
    setPromotions(prev => prev.map(p => p.id === promoId ? { ...p, active: !p.active } : p));
  }, []);

  const deletePromotion = useCallback((promoId) => {
    setPromotions(prev => prev.filter(p => p.id !== promoId));
    // لو العرض ده كان مرتبط بعرض الترحيب، نفكّه عشان مايفضلش يشاور على عرض محذوف
    if (adminSettings.current.promotions.welcomeOffer.promotionId === promoId) {
      adminSettings.current.promotions.welcomeOffer.promotionId = null;
      bumpSettings();
    }
    showToast(t('تم حذف العرض', 'Promotion deleted'));
  }, [t, bumpSettings]);

  // ============================================================
  // دوال الخصم
  // ============================================================
  const applyDiscountCode = useCallback(() => {
    if (!discountInput.trim()) {
      showToast(t('من فضلك ادخل كود الخصم', 'Please enter a discount code'));
      return;
    }

    const foundCode = discountCodes.find(
      c => c.code.toUpperCase() === discountInput.toUpperCase() && c.isActive
    );

    if (foundCode) {
      setAppliedDiscount(foundCode);
      showToast(t(`تم تطبيق كود الخصم ${foundCode.code} بنسبة ${foundCode.discountPercent}%`, `Discount code ${foundCode.code} applied (${foundCode.discountPercent}%)`));
      setDiscountInput('');
    } else {
      showToast(t('كود الخصم غير صحيح أو غير مفعل', 'Invalid or inactive discount code'));
    }
  }, [discountInput, discountCodes, t]);

  const removeDiscountCode = useCallback(() => {
    setAppliedDiscount(null);
    showToast(t('تم إلغاء كود الخصم', 'Discount code removed'));
  }, [t]);

  // ============================================================
  // دوال الدفع
  // ============================================================
  const handleCheckoutSubmit = useCallback((e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast(t('عربة التسوق فارغة!', 'Cart is empty!'));
      return;
    }

    // ===== تحقق نهائي من المخزون قبل إتمام الطلب (تحقق الفرونت إند مش بديل عن تحقق السيرفر) =====
    {
      const neededQty = {};
      for (const item of cart) {
        const key = `${item.id}__${item.variantId || NO_COLOR_ID}__${item.size}`;
        neededQty[key] = (neededQty[key] || 0) + 1;
      }
      for (const key of Object.keys(neededQty)) {
        const [pid, variantId, size] = key.split('__');
        const productRef = products.find(p => String(p.id) === pid);
        if (!productRef || (productRef.visibility || 'published') !== 'published') {
          showToast(t('أحد المنتجات في سلتك لم يعد متاحاً، من فضلك راجع السلة', 'One of the items in your cart is no longer available, please review your cart'));
          return;
        }
        const stock = getVariantStock(productRef, variantId, size);
        if (neededQty[key] > stock) {
          showToast(t(`الكمية المطلوبة من "${getLocalized(productRef.name)}" غير متوفرة بالكامل حالياً`, `The requested quantity of "${getLocalized(productRef.name)}" is no longer fully available`));
          return;
        }
      }
    }

    let finalAddress, finalPhone, finalName;

    if (user && useExistingAddress && hasSavedShipping) {
      finalName = user.savedShipping.fullName;
      finalPhone = user.savedShipping.phone;
      finalAddress = user.savedShipping.address;
    } else {
      finalAddress = shippingAddress;
      finalPhone = shippingPhone;
      finalName = shippingFullName;
    }

    if (!finalAddress || !finalPhone || !finalName) {
      showToast(t('من فضلك أكمل تفاصيل وعنوان الشحن ورقم الهاتف', 'Please complete shipping details and phone number'));
      return;
    }

    if (!selectedGov) {
      showToast(t('من فضلك اختر مكان التوصيل لتحديد سعر الشحن وإتمام الطلب', 'Please select your delivery location to calculate shipping and complete the order'));
      return;
    }

    const totals = calculateCartTotals();

    if (!totals.shippingDetermined) {
      showToast(t('من فضلك اختر مكان توصيل صحيح لتحديد سعر الشحن', 'Please select a valid delivery location to calculate shipping'));
      return;
    }

    if (user && saveShippingInfo) {
      const updatedUser = {
        ...user,
        savedShipping: {
          fullName: finalName,
          phone: finalPhone,
          phone2: shippingPhone2,
          address: finalAddress,
          governorate: selectedGov,
          country: selectedCountry,
          zipCode: shippingZipCode
        }
      };
      setUser(updatedUser);
      setHasSavedShipping(true);
      showToast(t('تم حفظ بيانات الشحن لحسابك!', 'Shipping info saved to your account!'));
    }

    const newOrder = {
      id: Date.now(),
      customerName: finalName,
      customerPhone: finalPhone,
      customerPhone2: shippingPhone2,
      customerEmail: user ? user.email : 'guest@lava.com',
      items: cart.map(item => ({
        ...item,
        name: typeof item.name === 'object' ? item.name : { ar: item.name, en: item.name }
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      discountType: totals.discountType,
      discountCode: appliedDiscount ? appliedDiscount.code : null,
      promoLabel: (totals.promoAppliedLines && totals.promoAppliedLines.length > 0)
        ? totals.promoAppliedLines.map(l => `${getLocalized(l.label)} (${l.productName})`).join(' | ')
        : null,
      shippingCost: totals.shipping,
      totalAmount: totals.total,
      governorate: selectedGov,
      country: selectedCountry,
      address: finalAddress,
      zipCode: shippingZipCode,
      notes: checkoutNotes || '',
      status: t('جديد', 'New'),
      packerStatus: t('لم يتم التجهيز', 'Not prepared'),
      createdAt: new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')
    };

    setOrders(prev => [newOrder, ...prev]);

    // ===== خصم الكمية المباعة من مخزون الفاريانتس (مؤقتاً في الفرونت إند، لحد ما يتوصل بباك إند حقيقي) =====
    setProducts(prevProducts => {
      const soldQty = {};
      for (const item of cart) {
        const key = `${item.id}__${item.variantId || NO_COLOR_ID}__${item.size}`;
        soldQty[key] = (soldQty[key] || 0) + 1;
      }
      return prevProducts.map(p => {
        const relevantKeys = Object.keys(soldQty).filter(k => k.startsWith(`${p.id}__`));
        if (relevantKeys.length === 0) return p;
        const newVariants = getVariants(p).map(v => {
          const newSizeStock = { ...v.sizeStock };
          relevantKeys.forEach(key => {
            const [, variantId, size] = key.split('__');
            if (variantId === v.id && newSizeStock[size]) {
              newSizeStock[size] = { ...newSizeStock[size], stock: Math.max(0, newSizeStock[size].stock - soldQty[key]) };
            }
          });
          return { ...v, sizeStock: newSizeStock };
        });
        return { ...p, variants: newVariants };
      });
    });

    setAppliedDiscount(null);
    setLastOrderId(newOrder.id);
    
    if (user && firstOrderDiscountEligible) {
      setFirstOrderDiscountUsed(true);
      setFirstOrderDiscountEligible(false);
    }
    
    setCart([]);
    
    setShippingFullName('');
    setShippingPhone('');
    setShippingPhone2('');
    setShippingAddress('');
    setShippingZipCode('');
    setSaveShippingInfo(false);
    setCheckoutNotes('');
    
    goTo('order-confirmation');
    
    showToast(t('تم إرسال طلبك بنجاح! 🎉', 'Order placed successfully! 🎉'));
  }, [cart, user, useExistingAddress, hasSavedShipping, shippingAddress, shippingPhone, shippingFullName, shippingPhone2, selectedGov, selectedCountry, shippingZipCode, saveShippingInfo, checkoutNotes, calculateCartTotals, appliedDiscount, firstOrderDiscountEligible, t, language]);

  // ============================================================
  // دوال التواصل
  // ============================================================
  const handleContactSubmit = useCallback((e) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !contactMsg) {
      showToast(t('من فضلك املأ جميع الحقول', 'Please fill in all fields'));
      return;
    }
    const newMsg = {
      id: Date.now(),
      name: contactName,
      phone: contactPhone,
      message: contactMsg,
      date: new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')
    };
    setContactMessages(prev => [newMsg, ...prev]);
    setContactName('');
    setContactPhone('');
    setContactMsg('');
    showToast(t('تم إرسال رسالتك للإدارة بنجاح!', 'Your message has been sent to admin!'));
  }, [contactName, contactPhone, contactMsg, t, language]);

  // ============================================================
  // دوال رفع ومعاينة صور المنتج (Base64)
  // ============================================================
  const handleProductImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewProdImageFiles(prev => [...prev, { id: Date.now() + Math.random(), dataUrl: ev.target.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }, []);

  // ===== رفع صورة بوب أب عرض الترحيب (Base64) - صورة واحدة، اختيار/معاينة/استبدال/إزالة =====
  const handleWelcomeOfferImageUpload = useCallback((e) => {
    const file = (e.target.files || [])[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      adminSettings.current.promotions.welcomeOffer.image = ev.target.result;
      bumpSettings();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [bumpSettings]);

  const removeProductImage = useCallback((id) => {
    setNewProdImageFiles(prev => prev.filter(img => img.id !== id));
  }, []);

  const setProductImageAsPrimary = useCallback((id) => {
    setNewProdImageFiles(prev => {
      const target = prev.find(img => img.id === id);
      if (!target) return prev;
      return [target, ...prev.filter(img => img.id !== id)];
    });
  }, []);

  const handleImageDragStart = useCallback((id) => {
    setDraggedImageId(id);
  }, []);

  const handleImageDrop = useCallback((targetId) => {
    setNewProdImageFiles(prev => {
      if (draggedImageId === null || draggedImageId === targetId) return prev;
      const fromIndex = prev.findIndex(img => img.id === draggedImageId);
      const toIndex = prev.findIndex(img => img.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDraggedImageId(null);
  }, [draggedImageId]);

  // ============================================================
  // دوال إدارة صور الألوان (كل لون ممكن ياخد أكتر من صورة، بلا حد أقصى)
  // ============================================================
  const handleColorImageUpload = useCallback((colorId, fileList) => {
    const files = Array.from(fileList || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewProdColorImages(prev => ({
          ...prev,
          [colorId]: [...(prev[colorId] || []), { id: `${Date.now()}_${Math.random()}`, dataUrl: ev.target.result, name: file.name, sourceType: 'local' }]
        }));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeColorImage = useCallback((colorId, imgId) => {
    setNewProdColorImages(prev => ({ ...prev, [colorId]: (prev[colorId] || []).filter(img => img.id !== imgId) }));
  }, []);

  const setColorImageAsPrimary = useCallback((colorId, imgId) => {
    setNewProdColorImages(prev => {
      const list = prev[colorId] || [];
      const target = list.find(img => img.id === imgId);
      if (!target) return prev;
      return { ...prev, [colorId]: [target, ...list.filter(img => img.id !== imgId)] };
    });
  }, []);

  const moveColorImage = useCallback((colorId, imgId, direction) => {
    setNewProdColorImages(prev => {
      const list = [...(prev[colorId] || [])];
      const index = list.findIndex(img => img.id === imgId);
      if (index === -1) return prev;
      const newIndex = direction === 'left' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= list.length) return prev;
      [list[index], list[newIndex]] = [list[newIndex], list[index]];
      return { ...prev, [colorId]: list };
    });
  }, []);

  const handleColorImageDragStart = useCallback((colorId, imgId) => {
    setDraggedColorImageKey({ colorId, imgId });
  }, []);

  const handleColorImageDrop = useCallback((colorId, targetImgId) => {
    setNewProdColorImages(prev => {
      if (!draggedColorImageKey || draggedColorImageKey.colorId !== colorId || draggedColorImageKey.imgId === targetImgId) return prev;
      const list = [...(prev[colorId] || [])];
      const fromIndex = list.findIndex(img => img.id === draggedColorImageKey.imgId);
      const toIndex = list.findIndex(img => img.id === targetImgId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return { ...prev, [colorId]: list };
    });
    setDraggedColorImageKey(null);
  }, [draggedColorImageKey]);

  // ============================================================
  // دوال إدارة المنتجات
  // ============================================================
  // ===== إعادة ضبط نموذج المنتج بالكامل (لإضافة منتج جديد) =====
  const resetProductForm = useCallback(() => {
    setNewProdNameAr(''); setNewProdNameEn('');
    setNewProdPrice(''); setNewProdCost('');
    setNewProdCat(''); setNewProdImgs(''); setNewProdImageFiles([]);
    setNewProdDescAr(''); setNewProdDescEn('');
    setNewProdOnSale(false); setNewProdSalePrice('');
    setNewProdIsFeatured(false); setNewProdEnableRec(true); setNewProdEnableBundle(true); setNewProdEnableReviews(true);
    setNewProdVisibility('published'); setNewProdLowStockThreshold('');
    setNewProdHasSizes(true); setNewProdSelectedSizes(['S', 'M', 'L', 'XL']); setNewProdCustomSize('');
    setNewProdHasColors(false); setNewProdColors([]);
    setNewProdColorNameAr(''); setNewProdColorNameEn(''); setNewProdColorHex('#000000');
    setNewProdVariantsGenerated(null); setNewProdVariantStockInputs({});
    setNewProdColorImages({});
    setNewProdSlug(''); setNewProdMetaTitleAr(''); setNewProdMetaTitleEn(''); setNewProdMetaDescAr(''); setNewProdMetaDescEn('');
  }, []);

  // ===== فتح نموذج "إضافة منتج جديد" (فاضي تماماً) =====
  const openAddProduct = useCallback(() => {
    resetProductForm();
    setSelectedManagedProductId(null);
    setProductEditorTab('basic');
    setProductManagerMode('add');
  }, [resetProductForm]);

  // ===== فتح منتج موجود للتعديل (لازم اختيار صريح من الأدمن) =====
  const openEditProduct = useCallback((product) => {
    resetProductForm();
    setNewProdNameAr(product.name?.ar || '');
    setNewProdNameEn(product.name?.en || '');
    setNewProdPrice(product.price ?? '');
    setNewProdCost(product.costPrice ?? '');
    setNewProdCat(getLocalized(product.category) || '');
    setNewProdImageFiles((product.images || []).map((url, i) => ({ id: `existing_${i}_${Date.now()}`, dataUrl: url, name: '', sourceType: 'remote' })));
    setNewProdDescAr(product.description?.ar || '');
    setNewProdDescEn(product.description?.en || '');
    setNewProdOnSale(!!product.onSale);
    setNewProdSalePrice(product.salePrice ?? '');
    setNewProdIsFeatured(!!product.isFeatured);
    setNewProdEnableRec(product.enableRecommendations !== undefined ? product.enableRecommendations : true);
    setNewProdEnableBundle(product.enableBundle !== undefined ? product.enableBundle : true);
    setNewProdEnableReviews(product.enableReviews !== undefined ? product.enableReviews : true);
    setNewProdVisibility(product.visibility || 'published');
    setNewProdLowStockThreshold(product.lowStockThreshold !== undefined && product.lowStockThreshold !== null ? String(product.lowStockThreshold) : '');
    setNewProdHasSizes(Array.isArray(product.sizes) && product.sizes.length > 0);
    setNewProdSelectedSizes(product.sizes && product.sizes.length ? product.sizes : ['S', 'M', 'L', 'XL']);

    const variants = getVariants(product);
    const hasColors = variants.some(v => v.color);
    setNewProdHasColors(hasColors);
    const colorsList = hasColors ? variants.filter(v => v.color).map(v => ({ id: v.id, nameAr: v.color?.ar || '', nameEn: v.color?.en || '', hex: v.hex || '#000000' })) : [];
    setNewProdColors(colorsList);

    // تحميل صور كل لون
    const colorImagesMap = {};
    variants.forEach(v => {
      if (v.color && Array.isArray(v.images) && v.images.length > 0) {
        colorImagesMap[v.id] = v.images.map((url, i) => ({ id: `existing_${v.id}_${i}`, dataUrl: url, name: '', sourceType: 'remote' }));
      }
    });
    setNewProdColorImages(colorImagesMap);

    // تحميل جدول الفاريانتس (لون × مقاس) + المخزون الحالي
    const combos = [];
    const stockInputs = {};
    variants.forEach(v => {
      const sizes = Object.keys(v.sizeStock || {});
      sizes.forEach(size => {
        const key = `${v.id}__${size}`;
        combos.push({ key, colorId: v.id, colorLabel: v.color ? (v.color.ar || v.color.en) : null, hex: v.hex, size });
        stockInputs[key] = { sku: v.sizeStock[size]?.sku || '', stock: v.sizeStock[size]?.stock || 0 };
      });
    });
    setNewProdVariantsGenerated(combos);
    setNewProdVariantStockInputs(stockInputs);

    setNewProdSlug(product.slug || '');
    setNewProdMetaTitleAr(product.metaTitle?.ar || '');
    setNewProdMetaTitleEn(product.metaTitle?.en || '');
    setNewProdMetaDescAr(product.metaDescription?.ar || '');
    setNewProdMetaDescEn(product.metaDescription?.en || '');

    setSelectedManagedProductId(product.id);
    setProductEditorTab('basic');
    setProductManagerMode('edit');
  }, [resetProductForm, getLocalized]);

  const closeProductEditor = useCallback((skipConfirm) => {
    if (!skipConfirm && productEditorDirty) {
      const ok = window.confirm(t('في تعديلات لسه مش محفوظة. تأكيد الخروج بدون حفظ؟', 'You have unsaved changes. Leave without saving?'));
      if (!ok) return;
    }
    resetProductForm();
    setSelectedManagedProductId(null);
    setProductManagerMode('closed');
    setProductEditorDirty(false);
  }, [productEditorDirty, resetProductForm, t]);

  const duplicateProduct = useCallback((product) => {
    const copy = {
      ...product,
      id: Date.now(),
      name: { ar: `${product.name?.ar || ''} (نسخة)`, en: `${product.name?.en || ''} (Copy)` },
      visibility: 'draft',
      variants: getVariants(product).map(v => ({ ...v, id: `${v.id}_copy_${Date.now()}`, images: [...(v.images || [])], sizeStock: { ...v.sizeStock } }))
    };
    setProducts(prev => [copy, ...prev]);
    showToast(t('تم نسخ المنتج (كمسودة).', 'Product duplicated (as draft).'));
  }, [showToast, t]);

  const deleteProduct = useCallback((productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    if (selectedManagedProductId === productId) closeProductEditor(true);
    setConfirmDeleteProductId(null);
    showToast(t('تم حذف المنتج.', 'Product deleted.'));
  }, [selectedManagedProductId, closeProductEditor, showToast, t]);

  // ===== توليد قائمة الفاريانتس (لون × مقاس) لعرضها في نموذج إضافة منتج =====
  const generateVariantsPreview = useCallback(() => {
    const sizes = newProdHasSizes && newProdSelectedSizes.length > 0 ? newProdSelectedSizes : ['واحد'];
    const colors = newProdHasColors ? newProdColors : [{ id: NO_COLOR_ID, nameAr: '', nameEn: '', hex: null }];
    const combos = [];
    colors.forEach(c => {
      sizes.forEach(size => {
        const key = `${c.id}__${size}`;
        combos.push({
          key,
          colorId: c.id,
          colorLabel: newProdHasColors ? (c.nameAr || c.nameEn || c.hex) : null,
          hex: c.hex,
          size
        });
      });
    });
    setNewProdVariantsGenerated(combos);
    setNewProdVariantStockInputs(prev => {
      const next = { ...prev };
      combos.forEach(combo => {
        if (!next[combo.key]) {
          next[combo.key] = { sku: generateSKU({ name: { en: newProdNameEn || newProdNameAr } }, combo.colorLabel, combo.size), stock: 0 };
        }
      });
      return next;
    });
  }, [newProdHasSizes, newProdSelectedSizes, newProdHasColors, newProdColors, newProdNameEn, newProdNameAr]);

  const handleSaveProduct = useCallback((e) => {
    e.preventDefault();
    let finalImages;
    if (newProdImageFiles.length > 0) {
      finalImages = newProdImageFiles.map(f => f.dataUrl);
    } else {
      const imagesArray = newProdImgs.split('\n').map(img => img.trim()).filter(Boolean);
      finalImages = imagesArray.length > 0 ? imagesArray : [newProdImgs.trim()];
    }
    if (!finalImages[0]) {
      showToast(t('من فضلك ارفع صورة أو ادخل رابط صورة صحيح', 'Please upload an image or enter a valid image URL'));
      return;
    }
    if (!newProdNameAr.trim() && !newProdNameEn.trim()) {
      showToast(t('من فضلك ادخل اسم المنتج بالعربية أو الإنجليزية', 'Please enter product name in Arabic or English'));
      return;
    }

    const sizes = newProdHasSizes && newProdSelectedSizes.length > 0 ? newProdSelectedSizes : ['واحد'];
    const combos = newProdVariantsGenerated && newProdVariantsGenerated.length > 0
      ? newProdVariantsGenerated
      : (() => {
          // لو الأدمن ماضغطش "توليد الفاريانتس"، نولدها تلقائي بمخزون صفر
          const colors = newProdHasColors ? newProdColors : [{ id: NO_COLOR_ID, nameAr: '', nameEn: '', hex: null }];
          const list = [];
          colors.forEach(c => sizes.forEach(size => list.push({ key: `${c.id}__${size}`, colorId: c.id, colorLabel: newProdHasColors ? (c.nameAr || c.nameEn || c.hex) : null, hex: c.hex, size })));
          return list;
        })();

    // تجميع الفاريانتس بحسب اللون
    const colorGroups = {};
    combos.forEach(combo => {
      if (!colorGroups[combo.colorId]) colorGroups[combo.colorId] = [];
      colorGroups[combo.colorId].push(combo);
    });

    const variants = Object.keys(colorGroups).map(colorId => {
      const groupCombos = colorGroups[colorId];
      const colorInfo = newProdHasColors ? newProdColors.find(c => c.id === colorId) : null;
      const sizeStock = {};
      groupCombos.forEach(combo => {
        const stockInput = newProdVariantStockInputs[combo.key];
        sizeStock[combo.size] = {
          sku: stockInput?.sku || generateSKU({ name: { en: newProdNameEn || newProdNameAr } }, combo.colorLabel, combo.size),
          stock: Math.max(0, Number(stockInput?.stock) || 0)
        };
      });
      const colorImagesList = (newProdColorImages[colorId] || []).map(f => f.dataUrl);
      return {
        id: colorId,
        color: colorInfo ? { ar: colorInfo.nameAr || colorInfo.hex, en: colorInfo.nameEn || colorInfo.hex } : null,
        hex: colorInfo ? colorInfo.hex : null,
        images: colorImagesList,
        sizeStock
      };
    });

    const isEditing = productManagerMode === 'edit' && selectedManagedProductId !== null;
    const productPayload = {
      id: isEditing ? selectedManagedProductId : Date.now(),
      name: { ar: newProdNameAr.trim() || newProdNameEn.trim(), en: newProdNameEn.trim() || newProdNameAr.trim() },
      price: Number(newProdPrice),
      costPrice: Number(newProdCost),
      description: { ar: newProdDescAr.trim() || newProdDescEn.trim(), en: newProdDescEn.trim() || newProdDescAr.trim() },
      images: finalImages,
      sizes: sizes,
      colors: newProdHasColors ? newProdColors.map(c => c.hex) : [],
      variants: variants,
      visibility: newProdVisibility,
      lowStockThreshold: newProdLowStockThreshold === '' ? undefined : Number(newProdLowStockThreshold),
      category: { ar: newProdCat || '', en: newProdCat || '' },
      onSale: newProdOnSale,
      salePrice: newProdOnSale && newProdSalePrice ? Number(newProdSalePrice) : null,
      isFeatured: newProdIsFeatured,
      recommendedIds: isEditing ? undefined : [],
      bundle: isEditing ? undefined : { productIds: [], discountPercent: 0 },
      enableRecommendations: newProdEnableRec,
      enableBundle: newProdEnableBundle,
      enableReviews: newProdEnableReviews,
      slug: newProdSlug.trim() || undefined,
      metaTitle: (newProdMetaTitleAr.trim() || newProdMetaTitleEn.trim()) ? { ar: newProdMetaTitleAr.trim(), en: newProdMetaTitleEn.trim() } : undefined,
      metaDescription: (newProdMetaDescAr.trim() || newProdMetaDescEn.trim()) ? { ar: newProdMetaDescAr.trim(), en: newProdMetaDescEn.trim() } : undefined,
    };

    if (isEditing) {
      setProducts(prev => prev.map(p => p.id === selectedManagedProductId ? { ...p, ...productPayload, recommendedIds: p.recommendedIds || [], bundle: p.bundle || { productIds: [], discountPercent: 0 } } : p));
      showToast(t('تم تحديث المنتج بنجاح!', 'Product updated successfully!'));
    } else {
      setProducts(prev => [productPayload, ...prev]);
      showToast(t('تم إضافة المنتج بنجاح!', 'Product added successfully!'));
    }

    resetProductForm();
    setSelectedManagedProductId(null);
    setProductManagerMode('closed');
    setProductEditorDirty(false);
  }, [newProdNameAr, newProdNameEn, newProdPrice, newProdCost, newProdCat, newProdImgs, newProdImageFiles, newProdDescAr, newProdDescEn, newProdOnSale, newProdSalePrice, newProdIsFeatured, newProdEnableRec, newProdEnableBundle, newProdEnableReviews, newProdHasSizes, newProdSelectedSizes, newProdHasColors, newProdColors, newProdColorImages, newProdVariantsGenerated, newProdVariantStockInputs, newProdVisibility, newProdLowStockThreshold, newProdSlug, newProdMetaTitleAr, newProdMetaTitleEn, newProdMetaDescAr, newProdMetaDescEn, productManagerMode, selectedManagedProductId, resetProductForm, t]);

  // ============================================================
  // فلترة المنتجات
  // ============================================================
  const filteredProducts = useCallback(() => {
    return products.filter(p => {
      if (!isProductVisibleToCustomer(p)) return false;
      const pName = getLocalized(p.name).toLowerCase();
      const matchesSearch = pName.startsWith(searchQuery.toLowerCase()) ||
                            pName.includes(searchQuery.toLowerCase());
      const pCategory = getLocalized(p.category);
      const matchesCategory = selectedCategoryFilter === 'all' || pCategory === selectedCategoryFilter;

      const effectivePrice = getEffectivePrice(p);
      const matchesMinPrice = filterMinPrice === '' || effectivePrice >= Number(filterMinPrice);
      const matchesMaxPrice = filterMaxPrice === '' || effectivePrice <= Number(filterMaxPrice);

      const matchesSize = filterSizes.length === 0 || (p.sizes && p.sizes.some(s => filterSizes.includes(s)));

      const matchesColor = !filterColor || (p.colors && p.colors.includes(filterColor));

      const matchesSale = !filterOnSaleOnly || (p.onSale && isSaleActive());

      const matchesFeatured = !filterFeaturedOnly || !!p.isFeatured;

      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesSize && matchesColor && matchesSale && matchesFeatured;
    });
  }, [products, searchQuery, selectedCategoryFilter, getLocalized, filterMinPrice, filterMaxPrice, filterSizes, filterColor, filterOnSaleOnly, filterFeaturedOnly]);

  const priceBounds = useCallback(() => {
    if (products.length === 0) return { min: 0, max: 1000 };
    const prices = products.map(p => getEffectivePrice(p));
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const allAvailableColors = useCallback(() => {
    const colorsSet = new Set();
    products.forEach(p => (p.colors || []).forEach(c => colorsSet.add(c)));
    return Array.from(colorsSet);
  }, [products]);

  const searchSuggestions = useCallback(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products.filter(p => isProductVisibleToCustomer(p) && getLocalized(p.name).toLowerCase().includes(q)).slice(0, 5);
  }, [products, searchQuery, getLocalized]);

  const randomFeaturedSuggestions = useCallback(() => {
    const visible = products.filter(isProductVisibleToCustomer);
    const featured = visible.filter(p => p.isFeatured);
    const pool = featured.length > 0 ? featured : visible;
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
  }, [products]);

  // ============================================================
  // إدارة أقسام الصفحة الرئيسية
  // ============================================================
  const addHomeSection = (e) => {
    e.preventDefault();
    if (!newSectionTitleAr.trim() && !newSectionTitleEn.trim() && !newSectionDescAr.trim() && !newSectionDescEn.trim()) {
      showToast(t('من فضلك املأ العنوان أو الوصف', 'Please fill in title or description'));
      return;
    }
    const newSection = {
      id: Date.now(),
      type: newSectionType,
      title: { ar: newSectionTitleAr.trim() || newSectionTitleEn.trim(), en: newSectionTitleEn.trim() || newSectionTitleAr.trim() },
      description: { ar: newSectionDescAr.trim() || newSectionDescEn.trim(), en: newSectionDescEn.trim() || newSectionDescAr.trim() },
      image: newSectionImage,
      buttonAction: newSectionButtonAction,
      buttonText: {
        ar: newSectionButtonTextAr.trim() || (sectionButtonActions.find(a => a.key === newSectionButtonAction)?.defaultText?.ar) || '',
        en: newSectionButtonTextEn.trim() || (sectionButtonActions.find(a => a.key === newSectionButtonAction)?.defaultText?.en) || '',
      },
    };
    setHomeSections([...homeSections, newSection]);
    setNewSectionTitleAr('');
    setNewSectionTitleEn('');
    setNewSectionDescAr('');
    setNewSectionDescEn('');
    setNewSectionImage('');
    setNewSectionButtonAction('none');
    setNewSectionButtonTextAr('');
    setNewSectionButtonTextEn('');
    showToast(t('تم إضافة القسم بنجاح!', 'Section added!'));
  };

  const deleteHomeSection = (id) => {
    setHomeSections(homeSections.filter(s => s.id !== id));
    showToast(t('تم حذف القسم', 'Section deleted'));
  };

  // ============================================================
  // إدارة الصفحات المخصصة (يضيفها الأدمن براحته + تظهر كزرار في الناف)
  // ============================================================
  const addCustomPage = (e) => {
    e.preventDefault();
    if (!newPageTitleAr.trim() && !newPageTitleEn.trim()) {
      showToast(t('من فضلك اكتب اسم الصفحة', 'Please enter a page name'));
      return;
    }
    const newPage = {
      id: Date.now(),
      title: { ar: newPageTitleAr.trim() || newPageTitleEn.trim(), en: newPageTitleEn.trim() || newPageTitleAr.trim() },
      showInNav: true,
      sections: [],
    };
    setCustomPages([...customPages, newPage]);
    setNewPageTitleAr('');
    setNewPageTitleEn('');
    showToast(t('تم إضافة الصفحة بنجاح!', 'Page added!'));
  };

  const deleteCustomPage = (id) => {
    setCustomPages(customPages.filter(p => p.id !== id));
    if (activeCustomPageId === id) { setActiveCustomPageId(null); goTo('home'); }
    if (selectedPageForSection === String(id)) setSelectedPageForSection('');
    showToast(t('تم حذف الصفحة', 'Page deleted'));
  };

  const toggleCustomPageInNav = (id) => {
    setCustomPages(customPages.map(p => p.id === id ? { ...p, showInNav: !p.showInNav } : p));
  };

  const goToCustomPage = (id) => {
    setActiveCustomPageId(id);
    goTo('custom-page');
  };

  const addCustomPageSection = (e) => {
    e.preventDefault();
    if (!selectedPageForSection) {
      showToast(t('من فضلك اختر الصفحة الأول', 'Please choose a page first'));
      return;
    }
    if (!newPageSectionTitleAr.trim() && !newPageSectionTitleEn.trim() && !newPageSectionDescAr.trim() && !newPageSectionDescEn.trim()) {
      showToast(t('من فضلك املأ العنوان أو الوصف', 'Please fill in title or description'));
      return;
    }
    const newSection = {
      id: Date.now(),
      type: newPageSectionType,
      title: { ar: newPageSectionTitleAr.trim() || newPageSectionTitleEn.trim(), en: newPageSectionTitleEn.trim() || newPageSectionTitleAr.trim() },
      description: { ar: newPageSectionDescAr.trim() || newPageSectionDescEn.trim(), en: newPageSectionDescEn.trim() || newPageSectionDescAr.trim() },
      image: newPageSectionImage,
      buttonAction: newPageSectionButtonAction,
      buttonText: {
        ar: newPageSectionButtonTextAr.trim() || (sectionButtonActions.find(a => a.key === newPageSectionButtonAction)?.defaultText?.ar) || '',
        en: newPageSectionButtonTextEn.trim() || (sectionButtonActions.find(a => a.key === newPageSectionButtonAction)?.defaultText?.en) || '',
      },
    };
    setCustomPages(customPages.map(p => p.id === Number(selectedPageForSection) ? { ...p, sections: [...p.sections, newSection] } : p));
    setNewPageSectionTitleAr('');
    setNewPageSectionTitleEn('');
    setNewPageSectionDescAr('');
    setNewPageSectionDescEn('');
    setNewPageSectionImage('');
    setNewPageSectionButtonAction('none');
    setNewPageSectionButtonTextAr('');
    setNewPageSectionButtonTextEn('');
    showToast(t('تم إضافة القسم بنجاح!', 'Section added!'));
  };

  const deleteCustomPageSection = (pageId, sectionId) => {
    setCustomPages(customPages.map(p => p.id === pageId ? { ...p, sections: p.sections.filter(s => s.id !== sectionId) } : p));
    showToast(t('تم حذف القسم', 'Section deleted'));
  };

  // ============================================================
  // إدارة توصيات المنتجات
  // ============================================================
  const handleProductRecSelect = (productId) => {
    setSelectedProductForRec(productId);
    const prod = products.find(p => p.id === productId);
    if (prod) {
      setRecProductIds(prod.recommendedIds || []);
      setBundleProductIds(prod.bundle?.productIds || []);
      setBundleDiscountPercent(prod.bundle?.discountPercent || 0);
      setRecEnableRec(prod.enableRecommendations !== undefined ? prod.enableRecommendations : true);
      setRecEnableBundle(prod.enableBundle !== undefined ? prod.enableBundle : true);
    }
  };

  const saveRecommendations = () => {
    if (!selectedProductForRec) {
      showToast(t('من فضلك اختر منتجاً أولاً', 'Please select a product first'));
      return;
    }
    setProducts(products.map(p => {
      if (p.id === selectedProductForRec) {
        return {
          ...p,
          recommendedIds: recProductIds,
          bundle: { productIds: bundleProductIds, discountPercent: bundleDiscountPercent },
          enableRecommendations: recEnableRec,
          enableBundle: recEnableBundle
        };
      }
      return p;
    }));
    showToast(t('تم حفظ التوصيات والعروض بنجاح!', 'Recommendations and offers saved!'));
  };

  const toggleProductField = (productId, field, value) => {
    setProducts(products.map(p => p.id === productId ? { ...p, [field]: value } : p));
  };

  const setProductVisibility = useCallback((productId, visibility) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, visibility } : p));
  }, []);


  // ============================================================
  // دوال تصدير Excel / CSV
  // ============================================================
  // تصدير الطلبات المؤكدة (تم التأكيد فقط)
  const exportConfirmedOrders = useCallback(() => {
    if (typeof XLSX === 'undefined') {
      showToast(t('جاري تحميل مكتبة Excel، حاول مرة أخرى بعد ثانية', 'Loading Excel library, please try again in a second'));
      return;
    }
    const ordersToExport = orders.filter(o => 
      o.status === t('تم التأكيد', 'Confirmed')
    );
    if (ordersToExport.length === 0) {
      showToast(t('لا توجد طلبات مؤكدة', 'No confirmed orders'));
      return;
    }

    const data = ordersToExport.map(o => ({
      'رقم الطلب': o.id,
      'اسم العميل': o.customerName,
      'الهاتف': o.customerPhone,
      'الهاتف الإضافي': o.customerPhone2 || '',
      'العنوان': o.address,
      'المحافظة': o.governorate,
      'الرمز البريدي': o.zipCode || '',
      'المنتجات': (o.items || []).map(i => `${getLocalized(i.name)} (${i.size}) × ${i.qty || 1}`).join('; '),
      'الإجمالي': o.totalAmount,
      'حالة الطلب': o.status,
      'حالة التجهيز': o.packerStatus,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'طلبات مؤكدة');
    XLSX.writeFile(wb, 'confirmed_orders.xlsx');
    showToast(t('تم تصدير الطلبات المؤكدة بنجاح!', 'Confirmed orders exported!'));
  }, [orders, t, getLocalized]);

  // تصدير جميع الطلبات
  const exportAllOrders = useCallback(() => {
    if (typeof XLSX === 'undefined') {
      showToast(t('جاري تحميل مكتبة Excel، حاول مرة أخرى بعد ثانية', 'Loading Excel library, please try again in a second'));
      return;
    }
    if (orders.length === 0) {
      showToast(t('لا توجد طلبات للتصدير', 'No orders to export'));
      return;
    }

    const data = orders.map(o => ({
      'رقم الطلب': o.id,
      'اسم العميل': o.customerName,
      'الهاتف': o.customerPhone,
      'الهاتف الإضافي': o.customerPhone2 || '',
      'العنوان': o.address,
      'المحافظة': o.governorate,
      'الرمز البريدي': o.zipCode || '',
      'المنتجات': (o.items || []).map(i => `${getLocalized(i.name)} (${i.size}) × ${i.qty || 1}`).join('; '),
      'الإجمالي': o.totalAmount,
      'حالة الطلب': o.status,
      'حالة التجهيز': o.packerStatus,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'جميع الطلبات');
    XLSX.writeFile(wb, 'all_orders.xlsx');
    showToast(t('تم تصدير جميع الطلبات بنجاح!', 'All orders exported!'));
  }, [orders, t, getLocalized]);

  // تصدير الكتالوج بصيغة CSV (متوافقة مع ميتا)
  const exportCatalog = useCallback(() => {
    if (typeof XLSX === 'undefined') {
      showToast(t('جاري تحميل مكتبة Excel، حاول مرة أخرى بعد ثانية', 'Loading Excel library, please try again in a second'));
      return;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    const data = products.map(p => {
      const primaryImage = p.images && p.images.length > 0 ? p.images[0] : '';
      const additionalImages = p.images && p.images.length > 1 ? p.images.slice(1).join(',') : '';
      const price = p.salePrice && isSaleActive() ? p.salePrice : p.price;
      const salePrice = p.salePrice && isSaleActive() ? p.salePrice : '';

      return {
        'id': p.id,
        'title': getLocalized(p.name),
        'description': getLocalized(p.description),
        'price': price,
        'sale_price': salePrice,
        'currency': 'EGP',
        'link': `${origin}/product/${p.id}`,
        'image_link': primaryImage,
        'additional_image_link': additionalImages,
        'availability': 'in stock',
        'condition': 'new',
        'brand': getLocalized(adminSettings.current.storeName),
        'category': getLocalized(p.category),
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Catalog');
    // Write as CSV
    XLSX.writeFile(wb, 'catalog.csv', { bookType: 'csv' });
    showToast(t('تم تصدير الكتالوج (CSV) بنجاح!', 'Catalog (CSV) exported!'));
  }, [products, t, getLocalized, adminSettings]);

  // ============================================================
  // 6. الـ Render الرئيسي
  // ============================================================
  return (
    <div className={`font-sans min-h-screen flex flex-col bg-gray-50 ${language === 'ar' ? 'rtl' : 'ltr'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>

      <style>{`
        html, body {
          overflow-x: hidden;
          height: 100%;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 20s linear infinite;
        }
        input, select, textarea {
          transition: all 0.2s ease;
        }
        input:focus, select:focus, textarea:focus {
          box-shadow: 0 0 0 3px rgba(0,0,0,0.1);
          border-color: #000;
        }
        .fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes accountMenuFadeIn {
          0% { opacity: 0; transform: translateY(-6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: accountMenuFadeIn 0.18s ease-out;
        }
        [dir="rtl"] .text-start {
          text-align: right;
        }
        [dir="rtl"] .text-end {
          text-align: left;
        }
        [dir="ltr"] .text-start {
          text-align: left;
        }
        [dir="ltr"] .text-end {
          text-align: right;
        }
        [dir="rtl"] .flex-row-reverse\\:flex-row-reverse {
          flex-direction: row-reverse;
        }
        [dir="rtl"] .space-x-\\[reverse\\] {
          flex-direction: row-reverse;
        }
      `}</style>

      {/* ============================================================ */}
      {/* الهيدر الكامل */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 relative">
        {adminSettings.current.showCountdownBar && (
          <CountdownTimer endDate={adminSettings.current.saleEndDate} onExpire={bumpSettings} t={t} />
        )}

        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isBarVisible ? '' : 'pointer-events-none'}`}
          style={{
            maxHeight: isBarVisible ? '400px' : '0px',
            opacity: isBarVisible ? 1 : 0
          }}
          aria-hidden={!isBarVisible}
          inert={!isBarVisible}
        >
        <div className="bg-gray-200 text-black py-1 overflow-hidden text-xs md:text-sm border-b" dir="ltr">
          <div className="animate-marquee font-medium whitespace-nowrap">
            <div className="flex gap-12 px-6">
              <span>-- FREE SHIPPING ON ALL ORDERS ABOVE {adminSettings.current.freeShippingThreshold} EGP --</span>
              <span>-- {t('التوصيل مجاني للطلبات فوق', 'Free shipping on orders above')} {adminSettings.current.freeShippingThreshold} {t('جنيه', 'EGP')} --</span>
            </div>
            <div className="flex gap-12 px-6">
              <span>-- FREE SHIPPING ON ALL ORDERS ABOVE {adminSettings.current.freeShippingThreshold} EGP --</span>
              <span>-- {t('التوصيل مجاني للطلبات فوق', 'Free shipping on orders above')} {adminSettings.current.freeShippingThreshold} {t('جنيه', 'EGP')} --</span>
            </div>
          </div>
        </div>
        </div>

        <nav className={`relative flex items-center justify-between px-4 md:px-8 py-4 bg-white shadow-sm ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex items-center gap-3 text-lg text-gray-700 ${language === 'ar' ? 'flex-row' : 'flex-row'}`}>
            {user ? (
              <div className="relative account-menu">
                <button onClick={() => setShowAccountMenu(!showAccountMenu)} className="hover:text-black transition text-xl" title={user.name}>👤</button>
                {showAccountMenu && (
                  <div className={`absolute top-full mt-3 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl py-2 z-50 text-sm font-semibold overflow-hidden animate-fade-in ${language === 'ar' ? 'left-0' : 'right-0'}`}>
                    <div className={`px-4 py-3 border-b bg-gray-50 flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-black text-white text-base">👤</span>
                      <div className="min-w-0">
                        <p className="text-gray-900 truncate">{user.name}</p>
                        {user.email && <p className="text-xs font-normal text-gray-400 truncate">{user.email}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => { goTo('account'); setShowAccountMenu(false); }}
                      className={`group flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 transition-colors duration-150 ${language === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-base group-hover:bg-black group-hover:text-white transition-colors duration-150">👤</span>
                      <span>{t('معلومات الحساب', 'Account Info')}</span>
                    </button>
                    <button
                      onClick={() => { handleLogout(); setShowAccountMenu(false); }}
                      className={`group flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 text-red-600 transition-colors duration-150 border-t ${language === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-base group-hover:bg-red-600 group-hover:text-white transition-colors duration-150">🚪</span>
                      <span>{t('تسجيل الخروج', 'Logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="hover:text-black transition text-xl" title={t('حسابي', 'My Account')}>👤</button>
            )}

            <button onClick={() => goTo('wishlist')} className="hover:text-black transition relative" title={t('المفضلة', 'Wishlist')}>
              ❤️
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button onClick={() => goTo('checkout')} className="hover:text-black transition relative" title={t('عربة التسوق', 'Cart')}>
              🛒
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            </button>
          </div>

          <div
            className="absolute left-1/2 -translate-x-1/2 cursor-pointer whitespace-nowrap"
            onClick={() => goTo('home')}
          >
            {adminSettings.current.useLogoImage && adminSettings.current.logoImage ? (
              <img src={adminSettings.current.logoImage} alt={getLocalized(adminSettings.current.logoText)} className="h-10 md:h-12 w-auto object-contain" />
            ) : (
              <span className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase">{getLocalized(adminSettings.current.logoText)}</span>
            )}
          </div>

          <div className={`flex items-center gap-3 md:gap-5 font-semibold text-sm text-gray-700`}>
            <div className="hidden md:flex items-center gap-3 md:gap-5">
              <button onClick={() => goTo('home')} className="hover:text-black transition">{t('الرئيسية', 'Home')}</button>
              <button onClick={() => { setSelectedCategoryFilter('all'); goTo('shop'); }} className="hover:text-black transition">{t('المتجر', 'Shop')}</button>
              <button onClick={() => goTo('contact')} className="hover:text-black transition">{t('تواصل', 'Contact')}</button>
              {customPages.filter(p => p.showInNav).map(p => (
                <button key={p.id} onClick={() => goToCustomPage(p.id)} className="hover:text-black transition">{getLocalized(p.title)}</button>
              ))}
              {user && (user.role === 'admin' || user.role === 'call_center' || user.role === 'packer') && (
                <button onClick={() => goTo('admin')} className="text-red-600 font-bold hover:underline">{t('لوحة التحكم', 'Dashboard')}</button>
              )}
            </div>
            <button 
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="text-sm font-bold text-gray-600 hover:text-black transition"
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden text-2xl hover:text-black transition"
            >
              ☰
            </button>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className={`md:hidden absolute top-16 ${language === 'ar' ? 'left-4' : 'right-4'} left-auto bg-white/80 backdrop-blur-sm shadow-lg rounded-lg py-3 px-6 z-50 w-48 border mobile-menu`}>
            <div className={`flex flex-col gap-3 ${language === 'ar' ? 'text-right' : 'text-left'} font-semibold text-gray-700`}>
              <button onClick={() => goTo('home')} className="hover:text-black transition py-2 border-b">{t('الرئيسية', 'Home')}</button>
              <button onClick={() => { setSelectedCategoryFilter('all'); goTo('shop'); }} className="hover:text-black transition py-2 border-b">{t('المتجر', 'Shop')}</button>
              <button onClick={() => goTo('contact')} className="hover:text-black transition py-2 border-b">{t('تواصل', 'Contact')}</button>
              {customPages.filter(p => p.showInNav).map(p => (
                <button key={p.id} onClick={() => goToCustomPage(p.id)} className="hover:text-black transition py-2 border-b">{getLocalized(p.title)}</button>
              ))}
              <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="hover:text-black transition py-2 border-b text-blue-600 font-bold">
                {language === 'ar' ? 'English' : 'العربية'}
              </button>
              {user && (user.role === 'admin' || user.role === 'call_center' || user.role === 'packer') && (
                <button onClick={() => goTo('admin')} className="text-red-600 font-bold hover:underline py-2 border-b">{t('لوحة التحكم', 'Dashboard')}</button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* رسالة التنبيه (toast) */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white py-3 px-6 rounded-lg shadow-2xl z-[60] text-sm font-bold text-center max-w-[90vw]" dir="rtl">
          {toast}
        </div>
      )}

      {/* تنبيه الخصم بعد التسجيل - X هنا بيقفل التذكير بس، مش بيلغي أهلية الخصم */}
      {user && firstOrderDiscountEligible && !firstOrderDiscountUsed && !firstOrderBannerDismissed && (
        <div className="fixed left-4 bottom-4 bg-red-600 text-white py-3 px-4 rounded-lg shadow-2xl z-50 text-sm w-64 flex items-start justify-between animate-bounce" dir="rtl">
          <span>{t(`مفاجأة! لديك خصم ${adminSettings.current.promotions.guestDiscount.percentage}% على أول طلب لك بحسابك الجديد!`, `Surprise! You have ${adminSettings.current.promotions.guestDiscount.percentage}% off your first order!`)}</span>
          <button onClick={() => setFirstOrderBannerDismissed(true)} aria-label={t('إغلاق', 'Close')} className="text-white hover:text-gray-300 font-bold ml-2">X</button>
        </div>
      )}

      {/* رسالة خصم الزائر (Guest Discount) - تظهر فقط للعملاء الغير مسجلين دخول */}
      {!user && adminSettings.current.promotions.guestDiscount.enabled && !guestDiscountDismissed && (
        <div
          className={`fixed bottom-4 ${language === 'ar' ? 'right-4' : 'left-4'} z-50 w-72 max-w-[88vw] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden`}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
          role="complementary"
          aria-label={t('عرض ترويجي', 'Promotional offer')}
        >
          <div className="bg-black text-white px-4 py-3 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 font-extrabold text-sm">
              <span>🎁</span>
              <span>{getLocalized(adminSettings.current.promotions.guestDiscount.title)}</span>
            </div>
            <button
              onClick={() => setGuestDiscountDismissed(true)}
              aria-label={t('إغلاق', 'Close')}
              className="text-white/80 hover:text-white text-lg leading-none font-bold shrink-0 -mt-0.5"
            >
              ✕
            </button>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              {getLocalized(adminSettings.current.promotions.guestDiscount.message)}
            </p>
            <button
              onClick={() => { setShowLoginModal(true); setIsRegistering(false); }}
              className="w-full bg-black text-white font-bold py-2.5 rounded-lg hover:bg-gray-800 transition text-sm"
            >
              {getLocalized(adminSettings.current.promotions.guestDiscount.buttonText)}
            </button>
          </div>
        </div>
      )}

      {/* بوب أب عرض الترحيب (Welcome Offer) - إغلاقه مستقل تماماً عن خصم أول طلب/خصم الزائر */}
      {adminSettings.current.promotions.welcomeOffer.enabled && welcomeOfferVisible && !welcomeOfferClosed && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4" onClick={() => setWelcomeOfferClosed(true)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative animate-fade-in max-h-[90vh] flex flex-col"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setWelcomeOfferClosed(true)}
              aria-label={t('إغلاق', 'Close')}
              className={`absolute top-3 ${language === 'ar' ? 'left-3' : 'right-3'} z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition text-lg font-bold leading-none`}
            >
              ✕
            </button>
            {adminSettings.current.promotions.welcomeOffer.image && (
              <div className="w-full h-48 bg-gray-100 shrink-0">
                <img src={adminSettings.current.promotions.welcomeOffer.image} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 space-y-3 overflow-y-auto text-center">
              <h2 className="text-2xl font-extrabold text-gray-900">{getLocalized(adminSettings.current.promotions.welcomeOffer.title)}</h2>
              {getLocalized(adminSettings.current.promotions.welcomeOffer.offerText) && (
                <p className="text-lg font-bold text-red-600">{getLocalized(adminSettings.current.promotions.welcomeOffer.offerText)}</p>
              )}
              {getLocalized(adminSettings.current.promotions.welcomeOffer.description) && (
                <p className="text-sm text-gray-600 leading-relaxed">{getLocalized(adminSettings.current.promotions.welcomeOffer.description)}</p>
              )}
              <button
                onClick={handleWelcomeOfferCTA}
                className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition mt-2"
              >
                {getLocalized(adminSettings.current.promotions.welcomeOffer.buttonText)}
              </button>
            </div>
          </div>
        </div>
      )}


      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowLoginModal(false);
                setLoginEmail('');
                setLoginPassword('');
                setLoginPhone('');
              }}
              className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} text-gray-500 font-bold text-lg`}
            >✕</button>

            {!isRegistering ? (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-center">{t('تسجيل الدخول', 'Login')}</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                  <InputField label={t('البريد الإلكتروني', 'Email')} type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required={true} id="loginEmail" />
                  <InputField label={t('رقم الهاتف', 'Phone')} type="tel" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} required={true} id="loginPhone" />
                  <InputField label={t('كلمة المرور', 'Password')} type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required={true} id="loginPassword" />
                  <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition">{t('دخول', 'Login')}</button>
                </form>
                <div className="mt-4 text-center">
                  <button onClick={() => setIsRegistering(true)} className="text-sm text-blue-600 hover:underline font-semibold">{t(`ليس لديك حساب؟ إنشاء حساب جديد (واحصل على خصم ${adminSettings.current.promotions.guestDiscount.percentage}% على أول طلب)`, `Don't have an account? Sign up (get ${adminSettings.current.promotions.guestDiscount.percentage}% off your first order)`)}</button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-center">{t('إنشاء حساب جديد', 'Sign Up')}</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                  <InputField label={t('الاسم بالكامل', 'Full Name')} type="text" value={regName} onChange={(e) => setRegName(e.target.value)} required={true} id="regName" />
                  <InputField label={t('البريد الإلكتروني', 'Email')} type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required={true} id="regEmail" />
                  <InputField label={t('رقم الهاتف', 'Phone')} type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required={true} id="regPhone" />
                  <InputField label={t('كلمة المرور', 'Password')} type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required={true} id="regPassword" />
                  <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition">{t('تسجيل حساب', 'Sign Up')}</button>
                </form>
                <div className="mt-4 text-center">
                  <button onClick={() => setIsRegistering(false)} className="text-sm text-blue-600 hover:underline font-semibold">{t('لديك حساب بالفعل؟ تسجيل الدخول', 'Already have an account? Login')}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* المحتوى الرئيسي */}
      {/* ============================================================ */}
      <main className="flex-grow">

        {/* ========== الصفحة الرئيسية ========== */}
        {currentPage === 'home' && (
          <>
            <section
              className="relative w-full bg-cover bg-center flex items-end justify-start fade-in visible"
              style={{ height: '85vh', backgroundImage: `url('${adminSettings.current.heroImage}')` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className={`relative z-10 p-8 md:p-16 text-white max-w-xl ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <h1 className={`text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg ${language === 'ar' ? 'text-right' : 'text-left'}`}>{getLocalized(adminSettings.current.heroTitle)}</h1>
                <p className={`text-lg mb-6 drop-shadow-md ${language === 'ar' ? 'text-right' : 'text-left'}`}>{getLocalized(adminSettings.current.heroSubtitle)}</p>
                <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                  <button onClick={() => { setSelectedCategoryFilter('all'); goTo('shop'); }} className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition shadow-lg">
                    {t('تسوق الآن', 'Shop Now')}
                  </button>
                </div>
              </div>
            </section>

            <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto text-center fade-in">
              <h2 className="text-3xl font-bold mb-10 border-b-2 border-black inline-block pb-2">{t('الأقسام', 'Categories')}</h2>
              <div className="grid grid-cols-2 gap-6">
                {categories.map((cat, index) => {
                  const total = categories.length;
                  let colSpan = 'col-span-1';
                  let heightClass = 'h-64';
                  let isFirst = index === 0;
                  let isLast = index === total - 1;
                  const remainingCount = total - 1;

                  if (total <= 2) {
                    colSpan = 'col-span-1';
                    heightClass = 'h-64';
                  } else {
                    if (isFirst) {
                      colSpan = 'col-span-2';
                      heightClass = 'h-80';
                    } else {
                      colSpan = 'col-span-1';
                      heightClass = 'h-64';
                      if (isLast && remainingCount % 2 === 1) {
                        colSpan = 'col-span-2';
                        heightClass = 'h-48';
                      }
                    }
                  }

                  return (
                    <div 
                      key={cat.id} 
                      className={`${colSpan} group cursor-pointer`}
                      onClick={() => {
                        setSelectedCategoryFilter(getLocalized(cat.name));
                        goTo('shop');
                      }}
                    >
                      <div className={`${heightClass} bg-gray-200 rounded-lg overflow-hidden relative shadow-sm`}>
                        <img src={cat.image} alt={getLocalized(cat.name)} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        {isFirst && total > 2 && (
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold">{getLocalized(cat.name)}</span>
                          </div>
                        )}
                      </div>
                      {!(isFirst && total > 2) && <h3 className="mt-4 text-xl font-semibold">{getLocalized(cat.name)}</h3>}
                    </div>
                  );
                })}
              </div>
            </section>

            {homeSections.length > 0 && (
              <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto fade-in">
                <div className="space-y-8">
                  {renderSectionsList(homeSections)}
                </div>
              </section>
            )}

            <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto fade-in">
              <h2 className="text-3xl font-bold mb-8 text-center">{t('منتجات مميزة', 'Featured Products')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {products.filter(p => isProductVisibleToCustomer(p) && p.isFeatured).length > 0 ? (
                  products.filter(p => isProductVisibleToCustomer(p) && p.isFeatured).map((product) => {
                    const stockStatus = getProductStockStatus(product);
                    return (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group hover:shadow-xl transition relative"
                      onClick={() => openProductDetails(product)}
                    >
                      <div className="h-48 md:h-72 overflow-hidden bg-gray-100 relative">
                        <img src={product.images[0]} alt={getLocalized(product.name)} className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${stockStatus === 'out' ? 'opacity-50 grayscale' : ''}`} />
                        {stockStatus === 'out' && (
                          <span className="absolute top-2 start-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">{t('غير متوفر', 'Out of Stock')}</span>
                        )}
                      </div>
                      <div className={`p-3 md:p-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <h3 className="font-bold text-sm md:text-lg mb-1">{getLocalized(product.name)}</h3>
                        {product.onSale && isSaleActive() ? (
                          <p className="font-semibold text-xs md:text-base">
                            <span className="line-through text-gray-400 text-sm me-2">{product.price} {t('ج.م', 'EGP')}</span>
                            <span className="text-red-600">{product.salePrice} {t('ج.م', 'EGP')}</span>
                          </p>
                        ) : (
                          <p className="text-gray-600 font-semibold text-xs md:text-base">{product.price} {t('ج.م', 'EGP')}</p>
                        )}
                      </div>
                    </div>
                  );}
                  )
                ) : (
                  <p className="text-center col-span-2 md:col-span-4 text-gray-500">{t('لا توجد منتجات مميزة محددة حالياً من لوحة التحكم.', 'No featured products available.')}</p>
                )}
              </div>
            </section>

            <section className="py-16 bg-white px-6 md:px-12 fade-in">
              <div className="max-w-5xl mx-auto flex flex-col gap-16">
                <div className={`flex flex-col md:flex-row items-center gap-8 ${language === 'ar' ? 'md:flex-row-reverse' : ''}`}>
                  <div className="flex-1 order-first md:order-first w-full h-64 rounded-lg overflow-hidden shadow-lg">
                    <img src={adminSettings.current.aboutImage} alt="About Store" className="w-full h-full object-cover" />
                  </div>
                  <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <h2 className="text-3xl font-bold mb-4">{t('عن', 'About')} {getLocalized(adminSettings.current.storeName)}</h2>
                    <p className="text-gray-600 leading-relaxed text-lg">{getLocalized(adminSettings.current.aboutText)}</p>
                  </div>
                </div>

                <div className="w-full bg-gray-50 p-8 rounded-lg shadow-sm">
                  <h2 className="text-3xl font-bold mb-6 text-center">{t('الأسئلة الشائعة', 'FAQ')}</h2>
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {faqs.map(faq => (
                      <details key={faq.id} className="bg-white p-4 rounded shadow-sm cursor-pointer">
                        <summary className="font-semibold text-lg">{getLocalized(faq.q)}</summary>
                        <p className="text-sm text-gray-600 mt-2">{getLocalized(faq.a)}</p>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ========== صفحة المتجر ========== */}
        {currentPage === 'shop' && (
          <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto fade-in">
            <h2 className="text-4xl font-bold mb-6 text-center">
              {selectedCategoryFilter === 'all' ? t('كل المنتجات', 'All Products') : `${t('منتجات قسم', 'Products of')}: ${selectedCategoryFilter}`}
            </h2>

            <div className="max-w-md mx-auto mb-6 relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    id="searchQuery"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
                    onFocus={() => setShowSearchDropdown(true)}
                    placeholder={t('ابحث عن منتج...', 'Search for product...')}
                    autoComplete="off"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all bg-white"
                  />
                  {showSearchDropdown && searchQuery.trim() && (
                    <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-xl z-40 overflow-hidden">
                      {searchSuggestions().length > 0 ? (
                        searchSuggestions().map(product => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); openProductDetails(product); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition border-b last:border-b-0 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                          >
                            <img src={product.images[0]} alt="" className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">{getLocalized(product.name)}</p>
                              <p className="text-xs text-gray-500">{getLocalized(product.category)}</p>
                            </div>
                            <span className="text-sm font-bold text-gray-700 flex-shrink-0">{getEffectivePrice(product)} {t('ج.م', 'EGP')}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4">
                          <p className="text-center text-gray-500 text-sm mb-3">{t('لا توجد نتائج', 'No results')}</p>
                          <p className="text-xs text-gray-400 font-bold mb-2">{t('قد يعجبك أيضاً:', 'You might like:')}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {randomFeaturedSuggestions().map(product => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); openProductDetails(product); }}
                                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 transition"
                              >
                                <img src={product.images[0]} alt="" className="w-10 h-10 object-cover rounded-md" />
                                <span className="text-xs font-semibold truncate">{getLocalized(product.name)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {selectedCategoryFilter !== 'all' && (
                  <button
                    onClick={() => setSelectedCategoryFilter('all')}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-300 transition"
                  >
                    {t('إلغاء الفلتر', 'Clear filter')}
                  </button>
                )}
              </div>
            </div>

            <div className="max-w-4xl mx-auto mb-10 bg-white p-5 rounded-xl shadow-sm border space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t('السعر من', 'Price from')} ({priceBounds().min} - {priceBounds().max} {t('ج.م', 'EGP')})</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filterMinPrice}
                      onChange={(e) => setFilterMinPrice(e.target.value)}
                      placeholder={String(priceBounds().min)}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <span className="text-gray-400 text-sm">-</span>
                    <input
                      type="number"
                      value={filterMaxPrice}
                      onChange={(e) => setFilterMaxPrice(e.target.value)}
                      placeholder={String(priceBounds().max)}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <input
                    type="range"
                    min={priceBounds().min}
                    max={priceBounds().max}
                    value={filterMaxPrice === '' ? priceBounds().max : filterMaxPrice}
                    onChange={(e) => setFilterMaxPrice(e.target.value)}
                    className="w-full mt-2 accent-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t('المقاس', 'Size')}</label>
                  <div className="flex gap-2 flex-wrap">
                    {['S', 'M', 'L', 'XL'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFilterSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])}
                        className={`w-9 h-9 rounded-lg text-xs font-bold border-2 transition ${filterSizes.includes(size) ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {allAvailableColors().length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t('اللون', 'Color')}</label>
                  <div className="flex gap-2 flex-wrap items-center">
                    <button
                      type="button"
                      onClick={() => setFilterColor('')}
                      className={`text-xs font-bold px-2 py-1 rounded-full border ${!filterColor ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-300'}`}
                    >
                      {t('الكل', 'All')}
                    </button>
                    {allAvailableColors().map(color => (
                      <button
                        key={color}
                        type="button"
                        title={color}
                        onClick={() => setFilterColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-7 h-7 rounded-full border-2 transition ${filterColor === color ? 'ring-2 ring-offset-2 ring-black border-black' : 'border-gray-300 hover:border-black'}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-6 pt-2 border-t">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input type="checkbox" checked={filterOnSaleOnly} onChange={(e) => setFilterOnSaleOnly(e.target.checked)} className="w-4 h-4" />
                  {t('عرض المنتجات المخفضة فقط', 'On sale only')}
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input type="checkbox" checked={filterFeaturedOnly} onChange={(e) => setFilterFeaturedOnly(e.target.checked)} className="w-4 h-4" />
                  {t('المنتجات المميزة فقط', 'Featured only')}
                </label>
                {(filterMinPrice !== '' || filterMaxPrice !== '' || filterSizes.length > 0 || filterColor || filterOnSaleOnly || filterFeaturedOnly) && (
                  <button
                    type="button"
                    onClick={() => { setFilterMinPrice(''); setFilterMaxPrice(''); setFilterSizes([]); setFilterColor(''); setFilterOnSaleOnly(false); setFilterFeaturedOnly(false); }}
                    className="text-red-600 text-sm font-bold hover:underline ms-auto"
                  >
                    {t('مسح كل الفلاتر', 'Clear all filters')}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {filteredProducts().length === 0 ? (
                <p className="text-center col-span-2 md:col-span-3 text-gray-500">{t('لا توجد منتجات تطابق بحثك أو القسم المحدد.', 'No products match your search or category.')}</p>
              ) : (
                filteredProducts().map((product) => {
                  const stockStatus = getProductStockStatus(product);
                  const totalStock = getProductTotalStock(product);
                  return (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group hover:shadow-xl transition relative"
                    onClick={() => openProductDetails(product)}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                      className="absolute top-2 end-2 z-10 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-lg hover:scale-110 transition"
                      title={t('أضف إلى المفضلة', 'Add to wishlist')}
                    >
                      <span className={isInWishlist(product.id) ? 'text-red-600' : 'text-gray-300'}>❤</span>
                    </button>
                    <div className="h-48 md:h-80 overflow-hidden bg-gray-100 relative">
                      <img src={product.images[0]} alt={getLocalized(product.name)} className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${stockStatus === 'out' ? 'opacity-50 grayscale' : ''}`} />
                      {stockStatus === 'out' && (
                        <span className="absolute top-2 start-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">{t('غير متوفر', 'Out of Stock')}</span>
                      )}
                    </div>
                    <div className={`p-3 md:p-5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">{getLocalized(product.category)}</span>
                      <h3 className="font-bold text-sm md:text-xl mt-2 mb-2">{getLocalized(product.name)}</h3>
                      {product.onSale && isSaleActive() ? (
                        <p className="font-bold text-xs md:text-lg">
                          <span className="line-through text-gray-400 text-sm me-2">{product.price} {t('ج.م', 'EGP')}</span>
                          <span className="text-red-600">{product.salePrice} {t('ج.م', 'EGP')}</span>
                        </p>
                      ) : (
                        <p className="text-gray-600 font-bold text-xs md:text-lg">{product.price} {t('ج.م', 'EGP')}</p>
                      )}
                      {stockStatus === 'out' ? (
                        <p className="text-xs font-bold text-red-600 mt-1">{t('غير متوفر', 'Out of Stock')}</p>
                      ) : stockStatus === 'low' ? (
                        <p className="text-xs font-bold text-orange-500 mt-1">{t(`باقي ${totalStock} فقط`, `Only ${totalStock} left`)}</p>
                      ) : null}
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* ========== صفحة المفضلة (Wishlist) ========== */}
        {currentPage === 'wishlist' && (
          <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto fade-in">
            <h2 className="text-4xl font-bold mb-10 text-center">{t('المفضلة', 'Wishlist')} ❤️</h2>
            {wishlist.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">{t('قائمة المفضلة فارغة حالياً', 'Your wishlist is empty')}</p>
                <button onClick={() => { setSelectedCategoryFilter('all'); goTo('shop'); }} className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">
                  {t('تصفح المنتجات', 'Browse Products')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                {wishlist.map(id => products.find(p => p.id === id)).filter(Boolean).map(product => {
                  const stockStatus = getProductStockStatus(product);
                  const productHasColors = hasColors(product);
                  const quickAdd = () => {
                    if (productHasColors || stockStatus === 'out') {
                      // لازم يختار اللون (أو يشوف تفاصيل المنتج) قبل الإضافة
                      openProductDetails(product);
                      return;
                    }
                    const defaultVariant = getDefaultVariant(product);
                    const firstInStock = (product.sizes || []).find(s => getVariantStock(product, defaultVariant?.id, s) > 0);
                    addToCart(product, defaultVariant?.id, firstInStock || (product.sizes || [])[0] || '', null, 1);
                  };
                  return (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition relative">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-2 end-2 z-10 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-lg hover:scale-110 transition"
                      title={t('إزالة من المفضلة', 'Remove from wishlist')}
                    >
                      <span className="text-red-600">❤</span>
                    </button>
                    <div className="h-48 md:h-80 overflow-hidden bg-gray-100 cursor-pointer relative" onClick={() => openProductDetails(product)}>
                      <img src={product.images[0]} alt={getLocalized(product.name)} className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${stockStatus === 'out' ? 'opacity-50 grayscale' : ''}`} />
                      {stockStatus === 'out' && (
                        <span className="absolute top-2 start-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">{t('غير متوفر', 'Out of Stock')}</span>
                      )}
                    </div>
                    <div className={`p-3 md:p-5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <h3 className="font-bold text-sm md:text-xl mt-1 mb-2 cursor-pointer" onClick={() => openProductDetails(product)}>{getLocalized(product.name)}</h3>
                      {product.onSale && isSaleActive() ? (
                        <p className="font-bold text-xs md:text-lg mb-3">
                          <span className="line-through text-gray-400 text-sm me-2">{product.price} {t('ج.م', 'EGP')}</span>
                          <span className="text-red-600">{product.salePrice} {t('ج.م', 'EGP')}</span>
                        </p>
                      ) : (
                        <p className="text-gray-600 font-bold text-xs md:text-lg mb-3">{product.price} {t('ج.م', 'EGP')}</p>
                      )}
                      <button
                        onClick={quickAdd}
                        disabled={stockStatus === 'out'}
                        className="w-full bg-black text-white text-xs md:text-sm font-bold py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {stockStatus === 'out' ? t('غير متوفر', 'Out of Stock') : <>{t('أضف إلى السلة', 'Add to Cart')} 🛒</>}
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ========== صفحة تفاصيل المنتج ========== */}
        {currentPage === 'product-details' && selectedProduct && (
          <section className="py-16 px-6 md:px-12 max-w-6xl mx-auto fade-in">
            <button onClick={() => goTo('shop')} className={`mb-6 text-gray-600 hover:text-black font-semibold flex items-center gap-2 ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
              {language === 'ar' ? '←' : '→'} {t('العودة للمتجر', 'Back to shop')}
            </button>

            <div className={`bg-white p-8 rounded-xl shadow-md flex flex-col md:flex-row gap-12 ${language === 'ar' ? 'md:flex-row-reverse' : ''}`}>
              <div className="flex-1 flex flex-col gap-4">
                {(() => {
                  const currentImages = getVariantImages(selectedProduct, selectedColor);
                  const activeImg = currentImages[activeImageIndex] || currentImages[0];
                  return (
                    <>
                      <div className="h-96 rounded-lg overflow-hidden bg-gray-100 shadow-inner">
                        <img src={activeImg} alt={getLocalized(selectedProduct.name)} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        {currentImages.map((img, index) => (
                          <div
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={`h-20 w-20 rounded-lg overflow-hidden cursor-pointer border-2 ${activeImageIndex === index ? 'border-black' : 'border-transparent'}`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'} flex flex-col justify-between`}>
                <div>
                  <span className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-semibold">{getLocalized(selectedProduct.category)}</span>
                  <div className="flex items-center gap-3 mt-3 mb-2">
                    <h1 className="text-3xl font-bold flex-1">{getLocalized(selectedProduct.name)}</h1>
                    <button
                      onClick={() => toggleWishlist(selectedProduct.id)}
                      title={t('أضف إلى المفضلة', 'Add to wishlist')}
                      className="text-3xl hover:scale-110 transition flex-shrink-0"
                    >
                      <span className={isInWishlist(selectedProduct.id) ? 'text-red-600' : 'text-gray-300'}>❤</span>
                    </button>
                  </div>

                  {isReviewsEnabled(selectedProduct) && (() => {
                    const reviews = productReviews[selectedProduct.id] || [];
                    if (reviews.length === 0) return null;
                    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
                    return (
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <span className="text-yellow-500">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
                        <span className="text-gray-500">{avgRating.toFixed(1)} ({reviews.length} {t('تقييم', 'reviews')})</span>
                      </div>
                    );
                  })()}

                  {selectedProduct.onSale && isSaleActive() ? (
                    <p className="text-2xl font-bold text-gray-900 mb-6">
                      <span className="line-through text-gray-400 text-lg me-3">{selectedProduct.price} {t('ج.م', 'EGP')}</span>
                      <span className="text-red-600">{selectedProduct.salePrice} {t('ج.م', 'EGP')}</span>
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 mb-6">{selectedProduct.price} {t('ج.م', 'EGP')}</p>
                  )}

                  {(() => {
                    // جزء 21: لو المنتج له عروض متعددة (Product Offers) مفعّلة، نعرضها كلها كقائمة تيرز
                    const productOffers = getActiveProductOffers(selectedProduct);
                    if (productOffers.length > 0) {
                      return (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 inline-block">
                          <p className="font-bold text-red-600 text-sm mb-1">🔥 {t('عروض خاصة', 'Special Offers')}</p>
                          <div className="flex flex-col gap-0.5">
                            {productOffers.map(o => (
                              <p key={o.id} className="font-bold text-gray-800 text-sm">{getLocalized(getPromotionLabel(o))}</p>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    // مفيش عروض منتج - نرجع للسلوك القديم (عرض حملة لو موجود)
                    const activePromo = resolveActivePromotionForProduct(selectedProduct, 1);
                    if (!activePromo) return null;
                    const label = getLocalized(getPromotionLabel(activePromo));
                    if (!label) return null;
                    return (
                      <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 inline-block">
                        <p className="font-bold text-red-600 text-sm">🔥 {t('عرض خاص', 'Special Offer')}</p>
                        <p className="font-bold text-gray-800">{label}</p>
                      </div>
                    );
                  })()}

                  <p className="text-gray-600 leading-relaxed mb-6">{getLocalized(selectedProduct.description)}</p>

                  {(() => {
                    const productStockStatus = getProductStockStatus(selectedProduct);
                    const productIsOutOfStock = productStockStatus === 'out';
                    const variants = getVariants(selectedProduct);
                    const productHasColors = hasColors(selectedProduct);
                    const productHasSizes = (selectedProduct.sizes || []).length > 0;

                    // لسه محتاجين اختيار لون؟ لسه محتاجين اختيار مقاس؟ - العميل لازم يختار بنفسه، مفيش اختيار تلقائي.
                    const colorMissing = productHasColors && !selectedColor;
                    const sizeMissing = productHasSizes && !selectedSize;
                    const selectionComplete = !colorMissing && !sizeMissing;

                    // المخزون الحقيقي ميتحسبش غير لما الاختيار يكتمل بالكامل (مفيش تخمين لأي فاريانت)
                    const currentVariantStock = selectionComplete ? getVariantStock(selectedProduct, selectedColor, selectedSize) : 0;

                    const selectColor = (variantId) => {
                      setSelectedColor(variantId);
                      setActiveImageIndex(0);
                      // لما اللون يتغيّر، المقاس المختار قبل كده بقى غير صالح - لازم العميل يختار مقاس من جديد بنفسه.
                      setSelectedSize('');
                      setProductQuantity(1);
                    };

                    let selectionMessage = null;
                    if (colorMissing && sizeMissing) selectionMessage = t('من فضلك اختر لوناً ومقاساً.', 'Please select a color and size.');
                    else if (colorMissing) selectionMessage = t('من فضلك اختر لوناً.', 'Please select a color.');
                    else if (sizeMissing) selectionMessage = t('من فضلك اختر مقاساً.', 'Please select a size.');

                    return (
                      <>
                        {productIsOutOfStock && (
                          <div className="mb-4 bg-gray-900 text-white font-bold px-4 py-2 rounded-lg inline-block">
                            {t('غير متوفر حالياً', 'Out of Stock')}
                          </div>
                        )}

                        {productHasColors && (
                          <div className="mb-6">
                            <label className="block font-bold mb-2">
                              {t('اختر اللون:', 'Choose color:')}
                              {selectedColor ? (() => {
                                const v = getVariantById(selectedProduct, selectedColor);
                                return v && v.color ? <span className="font-normal text-gray-500"> ({getLocalized(v.color)})</span> : null;
                              })() : (
                                <span className="font-normal text-gray-400 text-sm"> — {t('لم يتم الاختيار بعد', 'not selected yet')}</span>
                              )}
                            </label>
                            <div className="flex gap-3 flex-wrap">
                              {variants.map((v) => {
                                const variantOut = getVariantTotalStock(v) <= 0;
                                return (
                                  <button
                                    key={v.id}
                                    onClick={() => selectColor(v.id)}
                                    title={v.color ? getLocalized(v.color) : ''}
                                    style={{ backgroundColor: v.hex || '#eee' }}
                                    className={`relative w-10 h-10 rounded-full border-2 transition ${selectedColor === v.id ? 'ring-2 ring-offset-2 ring-black border-black' : 'border-gray-300 hover:border-black'} ${variantOut ? 'opacity-40' : ''}`}
                                  >
                                    {variantOut && <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-red-600">✕</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {productHasSizes && (
                          <div className="mb-6">
                            <label className="block font-bold mb-2">{t('اختر المقاس:', 'Choose size:')}</label>
                            {colorMissing ? (
                              <p className="text-gray-500 text-sm">{t('اختر اللون أولاً لعرض المقاسات المتاحة.', 'Choose a color first to see available sizes.')}</p>
                            ) : (
                              <>
                                <div className="flex gap-3 flex-wrap">
                                  {(selectedProduct.sizes || []).map((size) => {
                                    const sizeStock = getVariantStock(selectedProduct, selectedColor, size);
                                    const sizeOut = sizeStock <= 0;
                                    return (
                                      <button
                                        key={size}
                                        disabled={sizeOut}
                                        onClick={() => { setSelectedSize(size); setProductQuantity(1); }}
                                        title={sizeOut ? t('غير متوفر', 'Out of Stock') : ''}
                                        className={`w-12 h-12 rounded-lg font-bold border-2 transition relative ${selectedSize === size && !sizeOut ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'} ${sizeOut ? 'opacity-40 cursor-not-allowed line-through hover:border-gray-300' : ''}`}
                                      >
                                        {size}
                                      </button>
                                    );
                                  })}
                                </div>
                                {!productIsOutOfStock && !sizeMissing && currentVariantStock === 0 && (
                                  <p className="text-red-600 text-sm font-bold mt-2">{t('هذا الاختيار غير متوفر', 'This option is out of stock')}</p>
                                )}
                                {!productIsOutOfStock && currentVariantStock > 0 && currentVariantStock <= getLowStockThreshold(selectedProduct) && (
                                  <p className="text-orange-500 text-sm font-bold mt-2">{t(`باقي ${currentVariantStock} قطع فقط`, `Only ${currentVariantStock} left`)}</p>
                                )}
                              </>
                            )}
                          </div>
                        )}

                        {selectionMessage && (
                          <p className="text-gray-600 text-sm font-semibold mb-4">{selectionMessage}</p>
                        )}

                        <div className="mb-6">
                          <label className="block font-bold mb-2">{t('الكمية:', 'Quantity:')}</label>
                          <div className="inline-flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                            <button
                              onClick={() => setProductQuantity(q => Math.max(1, q - 1))}
                              disabled={!selectionComplete || currentVariantStock === 0}
                              className="w-10 h-10 font-bold text-lg hover:bg-gray-100 transition disabled:opacity-40"
                              aria-label={t('إنقاص الكمية', 'Decrease quantity')}
                            >−</button>
                            <span className="w-12 h-10 flex items-center justify-center font-bold border-x-2 border-gray-300">{(!selectionComplete || currentVariantStock === 0) ? 0 : productQuantity}</span>
                            <button
                              onClick={() => setProductQuantity(q => {
                                if (q + 1 > currentVariantStock) {
                                  showToast(t(`أقصى كمية متاحة هي ${currentVariantStock}`, `Maximum available quantity is ${currentVariantStock}`));
                                  return q;
                                }
                                return Math.min(99, q + 1);
                              })}
                              disabled={!selectionComplete || currentVariantStock === 0 || productQuantity >= currentVariantStock}
                              className="w-10 h-10 font-bold text-lg hover:bg-gray-100 transition disabled:opacity-40"
                              aria-label={t('زيادة الكمية', 'Increase quantity')}
                            >+</button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {(() => {
                  const productHasColors = hasColors(selectedProduct);
                  const productHasSizes = (selectedProduct.sizes || []).length > 0;
                  const colorMissing = productHasColors && !selectedColor;
                  const sizeMissing = productHasSizes && !selectedSize;
                  const selectionComplete = !colorMissing && !sizeMissing;
                  const purchaseDisabled = !selectionComplete || getVariantStock(selectedProduct, selectedColor, selectedSize) === 0;

                  let addToCartLabel;
                  if (colorMissing && sizeMissing) addToCartLabel = t('اختر اللون والمقاس', 'Select color & size');
                  else if (colorMissing) addToCartLabel = t('اختر اللون', 'Select color');
                  else if (sizeMissing) addToCartLabel = t('اختر المقاس', 'Select size');
                  else if (getVariantStock(selectedProduct, selectedColor, selectedSize) === 0) addToCartLabel = t('غير متوفر', 'Out of Stock');
                  else addToCartLabel = <>{t('إضافة إلى عربة التسوق', 'Add to Cart')} 🛒</>;

                  return (
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <button
                        onClick={() => addToCart(selectedProduct, selectedColor, selectedSize, null, productQuantity)}
                        disabled={purchaseDisabled}
                        className="flex-1 bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition shadow-lg text-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black"
                      >
                        {addToCartLabel}
                      </button>
                      <button
                        onClick={() => buyNow(selectedProduct, selectedColor, selectedSize, null, productQuantity)}
                        disabled={purchaseDisabled}
                        className="flex-1 bg-white text-black font-bold py-4 rounded-xl border-2 border-black hover:bg-gray-100 transition shadow-lg text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {t('اشترِ الآن', 'Buy Now')} ⚡
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-xl shadow-md mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">🚚</span>
                <h4 className="font-bold">{t('شحن سريع', 'Fast Shipping')}</h4>
                <p className="text-sm text-gray-500">{t('توصيل خلال 3 إلى 5 أيام عمل', 'Delivery within 3 to 5 business days')}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">🎁</span>
                <h4 className="font-bold">{t('شحن مجاني', 'Free Shipping')}</h4>
                <p className="text-sm text-gray-500">{t('للطلبات فوق', 'On orders over')} {adminSettings.current.freeShippingThreshold} {t('جنيه', 'EGP')}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">↩️</span>
                <h4 className="font-bold">{t('استرجاع سهل', 'Easy Returns')}</h4>
                <p className="text-sm text-gray-500">{t('استرجاع مجاني خلال 14 يوم من الاستلام', 'Free returns within 14 days of delivery')}</p>
              </div>
            </div>

            {adminSettings.current.showBundleOffers && selectedProduct.enableBundle && selectedProduct.bundle && selectedProduct.bundle.productIds && selectedProduct.bundle.productIds.length > 0 && selectedProduct.bundle.discountPercent > 0 && (() => {
              const bundleProducts = selectedProduct.bundle.productIds.map(id => products.find(p => p.id === id)).filter(Boolean);
              const allBundleItems = [selectedProduct, ...bundleProducts];
              const totalOriginal = allBundleItems.reduce((sum, p) => sum + p.price, 0);
              const discountPercent = selectedProduct.bundle.discountPercent;
              const discountAmount = totalOriginal * (discountPercent / 100);
              const totalAfterDiscount = totalOriginal - discountAmount;

              const handleAddBundle = () => {
                const selectedProducts = allBundleItems.filter(p => selectedBundleIds.includes(p.id));
                if (selectedProducts.length === 0) {
                  showToast(t('من فضلك اختر منتجاً واحداً على الأقل', 'Please select at least one product'));
                  return;
                }
                addBundleToCart(selectedProduct, selectedProducts.filter(p => p.id !== selectedProduct.id), discountPercent);
              };

              return (
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-md mt-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <h3 className="text-xl font-bold mb-5">🛍️ {t('غالباً ما يتم شراؤها معاً', 'Frequently Bought Together')}</h3>

                  <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
                    {allBundleItems.map((p, index) => (
                      <React.Fragment key={p.id}>
                        <div
                          onClick={() => toggleBundleItem(p.id)}
                          className="flex flex-col items-center gap-2 w-24 cursor-pointer group"
                        >
                          <div className="relative">
                            <img
                              src={p.images[0]}
                              alt={getLocalized(p.name)}
                              className={`w-20 h-20 object-cover rounded-lg border-2 transition ${selectedBundleIds.includes(p.id) ? 'border-black' : 'border-gray-200 opacity-50'}`}
                            />
                            <input
                              type="checkbox"
                              checked={selectedBundleIds.includes(p.id)}
                              onChange={() => toggleBundleItem(p.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute -top-2 -right-2 w-5 h-5 accent-black"
                            />
                          </div>
                          <span className="text-xs text-center font-semibold line-clamp-2">
                            {p.id === selectedProduct.id && '✔ '}{getLocalized(p.name)}
                          </span>
                          <span className="text-xs text-gray-500">{p.price} {t('ج.م', 'EGP')}</span>
                        </div>
                        {index < allBundleItems.length - 1 && (
                          <span className="text-2xl text-gray-300 font-bold">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="mt-6 pt-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-start">
                      <p className="text-sm text-gray-500">{t('السعر الإجمالي', 'Total price')}</p>
                      <p>
                        <span className="line-through text-gray-400 me-2">{totalOriginal.toFixed(1)} {t('ج.م', 'EGP')}</span>
                        <span className="text-sm text-green-700 font-bold me-2">−{discountPercent}%</span>
                        <span className="font-extrabold text-xl">{totalAfterDiscount.toFixed(1)} {t('ج.م', 'EGP')}</span>
                      </p>
                    </div>
                    <button
                      onClick={handleAddBundle}
                      className="w-full sm:w-auto bg-black text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-800 transition shadow-md"
                    >
                      {t('إضافة الباقة إلى السلة', 'Add Bundle to Cart')} 🛒
                    </button>
                  </div>
                </div>
              );
            })()}

            {adminSettings.current.showRecommendations && selectedProduct.enableRecommendations && selectedProduct.recommendedIds && selectedProduct.recommendedIds.length > 0 && (
              <div className="mt-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <h3 className="text-xl font-bold mb-5">✨ {t('منتجات قد تعجبك', 'You May Also Like')}</h3>
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
                  {selectedProduct.recommendedIds.map(id => {
                    const prod = products.find(p => p.id === id);
                    if (!prod || !isProductVisibleToCustomer(prod)) return null;
                    const onSale = prod.onSale && isSaleActive();
                    const stockStatus = getProductStockStatus(prod);
                    const prodHasColors = hasColors(prod);
                    const quickAdd = (e) => {
                      e.stopPropagation();
                      if (prodHasColors || stockStatus === 'out') { openProductDetails(prod); return; }
                      const defaultVariant = getDefaultVariant(prod);
                      const firstInStock = (prod.sizes || []).find(s => getVariantStock(prod, defaultVariant?.id, s) > 0);
                      addToCart(prod, defaultVariant?.id, firstInStock || (prod.sizes || [])[0] || '', null, 1);
                    };
                    return (
                      <div
                        key={prod.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden group border hover:shadow-xl transition flex-shrink-0 w-40 md:w-48 snap-start"
                      >
                        <div className="h-32 md:h-40 overflow-hidden bg-gray-100 cursor-pointer relative" onClick={() => openProductDetails(prod)}>
                          <img src={prod.images[0]} alt={getLocalized(prod.name)} className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${stockStatus === 'out' ? 'opacity-50 grayscale' : ''}`} />
                          {stockStatus === 'out' && <span className="absolute top-1 start-1 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{t('غير متوفر', 'Out')}</span>}
                        </div>
                        <div className={`p-3 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <h4 className="font-bold text-xs md:text-sm mb-1 cursor-pointer" onClick={() => openProductDetails(prod)}>{getLocalized(prod.name)}</h4>
                          {onSale ? (
                            <p className="text-xs md:text-sm font-bold mb-2">
                              <span className="line-through text-gray-400 me-1">{prod.price}</span>
                              <span className="text-red-600">{prod.salePrice} {t('ج.م', 'EGP')}</span>
                            </p>
                          ) : (
                            <p className="text-gray-600 text-xs md:text-sm font-bold mb-2">{prod.price} {t('ج.م', 'EGP')}</p>
                          )}
                          <button
                            onClick={quickAdd}
                            disabled={stockStatus === 'out'}
                            className="w-full bg-black text-white text-xs font-bold py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {stockStatus === 'out' ? t('غير متوفر', 'Out of Stock') : <>{t('إضافة سريعة', 'Quick Add')} ＋</>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isReviewsEnabled(selectedProduct) && (() => {
              const reviews = productReviews[selectedProduct.id] || [];
              const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
              return (
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-md mt-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <h3 className="text-xl font-bold mb-1">⭐ {t('تقييمات العملاء', 'Customer Reviews')}</h3>
                  {reviews.length > 0 ? (
                    <p className="text-sm text-gray-500 mb-5">
                      {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))} {avgRating.toFixed(1)} ({reviews.length} {t('تقييم', 'reviews')})
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mb-5">{t('لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج!', 'No reviews yet. Be the first to review this product!')}</p>
                  )}

                  <div className="space-y-4 mb-6">
                    {reviews.map(r => (
                      <div key={r.id} className="border-b pb-4">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{r.name}</span>
                          <span className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg border">
                    <h4 className="font-bold mb-3">{t('أضف تقييمك', 'Write a Review')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <InputField
                        label={t('الاسم', 'Name')}
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder={t('اسمك', 'Your name')}
                        id="reviewName"
                      />
                      <SelectField
                        label={t('التقييم', 'Rating')}
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        options={[5, 4, 3, 2, 1].map(n => ({ value: n, label: '★'.repeat(n) + '☆'.repeat(5 - n) }))}
                        id="reviewRating"
                      />
                    </div>
                    <TextareaField
                      label={t('تعليقك', 'Your comment')}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder={t('شاركنا رأيك في المنتج...', 'Share your thoughts about this product...')}
                      rows={3}
                      id="reviewComment"
                    />
                    <button
                      onClick={() => submitProductReview(selectedProduct.id)}
                      className="mt-3 bg-black text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-800 transition"
                    >
                      {t('إرسال التقييم', 'Submit Review')}
                    </button>
                  </div>
                </div>
              );
            })()}

          </section>
        )}

        {/* ========== صفحة الدفع ========== */}
        {currentPage === 'checkout' && (
          <section className={`py-16 px-6 md:px-12 max-w-6xl mx-auto ${language === 'ar' ? 'text-right' : 'text-left'} fade-in`}>
            <h1 className="text-3xl font-bold mb-8">{t('عربة التسوق والدفع', 'Cart & Checkout')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md space-y-4">
                <h2 className="text-xl font-bold mb-4 border-b pb-3">{t('ملخص الطلب', 'Order Summary')}</h2>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">{t('عربة التسوق فارغة', 'Your cart is empty')}</p>
                    <button
                      onClick={() => goTo('shop')}
                      className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
                    >
                      {t('تسوق الآن', 'Shop Now')}
                    </button>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const grouped = [];
                      cart.forEach(item => {
                        const existing = grouped.find(g => g.id === item.id && g.size === item.size && g.price === item.price && (g.variantId || NO_COLOR_ID) === (item.variantId || NO_COLOR_ID));
                        if (existing) {
                          existing.qty += 1;
                          existing.cartIds.push(item.cartId);
                        } else {
                          grouped.push({ ...item, qty: 1, cartIds: [item.cartId] });
                        }
                      });
                      const cartTotalsForItems = calculateCartTotals();
                      return grouped.map(item => {
                        const productRef = products.find(p => p.id === item.id);
                        const currentStock = productRef ? getVariantStock(productRef, item.variantId, item.size) : Infinity;
                        const freeUnitsInLine = item.cartIds.filter(cid => cartTotalsForItems.promoFreeCartIds && cartTotalsForItems.promoFreeCartIds.has(cid)).length;
                        return (
                        <div key={item.cartIds[0]} className="flex justify-between items-start border-b pb-4 mb-4">
                          <div className="flex gap-4">
                            <img src={item.images[0]} alt="" className="w-20 h-20 object-cover rounded-lg" />
                            <div>
                              <h4 className="font-bold">{getLocalized(item.name)}</h4>
                              <p className="text-sm text-gray-500">
                                {t('المقاس:', 'Size:')} {item.size}
                                {item.colorLabel && <> · {t('اللون:', 'Color:')} {item.colorLabel}</>}
                              </p>
                              {freeUnitsInLine > 0 && (
                                <p className="text-xs font-bold text-green-600 mt-1">🎁 {t(`${freeUnitsInLine} قطعة مجاناً (عرض ترويجي)`, `${freeUnitsInLine} free (promotion)`)}</p>
                              )}
                              {currentStock < item.qty && (
                                <p className="text-xs font-bold text-red-600 mt-1">{t(`متوفر فقط ${currentStock} - من فضلك عدّل الكمية`, `Only ${currentStock} available - please adjust quantity`)}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                <div className="inline-flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => updateCartItemQuantity(item, item.qty - 1)}
                                    className="w-7 h-7 font-bold hover:bg-gray-100 transition"
                                    aria-label={t('إنقاص الكمية', 'Decrease quantity')}
                                  >−</button>
                                  <span className="w-8 h-7 flex items-center justify-center font-bold text-sm border-x-2 border-gray-300">{item.qty}</span>
                                  <button
                                    onClick={() => updateCartItemQuantity(item, item.qty + 1)}
                                    className="w-7 h-7 font-bold hover:bg-gray-100 transition"
                                    aria-label={t('زيادة الكمية', 'Increase quantity')}
                                  >+</button>
                                </div>
                                <button
                                  onClick={() => item.cartIds.forEach(cid => removeFromCart(cid))}
                                  className="text-red-600 text-sm font-semibold hover:underline"
                                >
                                  {t('إزالة', 'Remove')}
                                </button>
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-lg">{item.price * item.qty} {t('ج.م', 'EGP')}</span>
                        </div>
                        );
                      });
                    })()}

                    <div className="mt-6 pt-4 border-t">
                      {appliedDiscount ? (
                        <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                          <div>
                            <span className="font-bold text-green-700">✓ {appliedDiscount.code}</span>
                            <span className="text-sm text-gray-600 me-2">({appliedDiscount.discountPercent}% {t('خصم', 'off')})</span>
                          </div>
                          <button
                            onClick={removeDiscountCode}
                            className="text-red-600 text-sm font-bold hover:underline"
                          >
                            {t('إلغاء', 'Cancel')}
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={discountInput}
                            onChange={(e) => setDiscountInput(e.target.value)}
                            placeholder={t('كود الخصم...', 'Discount code...')}
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                          />
                          <button
                            onClick={applyDiscountCode}
                            className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition"
                          >
                            {t('تطبيق', 'Apply')}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-xl shadow-md sticky top-24">
                  <h2 className="text-xl font-bold mb-4 border-b pb-3">{t('إجمالي الطلب', 'Order Total')}</h2>

                  {cart.length > 0 ? (
                    <>
                      {(() => {
                        const totals = calculateCartTotals();
                        const threshold = adminSettings.current.freeShippingThreshold;
                        const remainingForFreeShipping = Math.max(0, threshold - totals.subtotal);
                        const progressPercent = Math.min(100, (totals.subtotal / threshold) * 100);
                        return (
                          <div className="space-y-3">
                            <div className="mb-2">
                              {remainingForFreeShipping > 0 ? (
                                <p className="text-xs font-semibold text-gray-600 mb-2">
                                  {t('باقي', 'You need')} <span className="text-black font-bold">{remainingForFreeShipping.toFixed(0)} {t('ج.م', 'EGP')}</span> {t('عشان توصل للشحن المجاني', 'more for free shipping')}
                                </p>
                              ) : (
                                <p className="text-xs font-bold text-green-600 mb-2">{t('مبروك! أنت مؤهل للشحن المجاني 🎉', "Congrats! You've unlocked free shipping 🎉")}</p>
                              )}
                              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${remainingForFreeShipping > 0 ? 'bg-black' : 'bg-green-500'}`}
                                  style={{ width: `${progressPercent}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">{t('المجموع الفرعي', 'Subtotal')}</span>
                              <span className="font-bold">{totals.subtotal} {t('ج.م', 'EGP')}</span>
                            </div>

                            {totals.discount > 0 && (
                              <div className="text-sm text-green-600 space-y-1">
                                {totals.discountType === 'promotion' && totals.promoAppliedLines && totals.promoAppliedLines.length > 0 ? (
                                  totals.promoAppliedLines.map((line, idx) => (
                                    <div key={idx} className="flex justify-between">
                                      <span>🎁 {getLocalized(line.label)} ({line.productName})</span>
                                      <span className="font-bold">- {line.discountAmount.toFixed(1)} {t('ج.م', 'EGP')}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex justify-between">
                                    <span>{t('الخصم', 'Discount')} {totals.discountType === 'first_order' ? `(${t(`خصم ${adminSettings.current.promotions.guestDiscount.percentage}% للحساب الجديد`, `${adminSettings.current.promotions.guestDiscount.percentage}% new user`)})` : ''}</span>
                                    <span className="font-bold">- {totals.discount.toFixed(1)} {t('ج.م', 'EGP')}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">{t('التوصيل', 'Shipping')}</span>
                              <span className={`font-bold ${!totals.shippingDetermined ? 'text-gray-500 text-xs' : ''}`}>
                                {!totals.shippingDetermined
                                  ? t('اختر مكان التوصيل لتحديد سعر الشحن', 'Select your location to calculate shipping')
                                  : totals.shipping === 0
                                    ? t('مجاناً 🎉', 'Free 🎉')
                                    : `${totals.shipping} ${t('ج.م', 'EGP')}`}
                              </span>
                            </div>

                            {!totals.shippingDetermined && (
                              <p className="text-xs text-amber-600 -mt-2">
                                {t('سعر الشحن سيُحسب بعد اختيار المحافظة في نموذج الشحن أدناه', 'Shipping will be calculated once you select your governorate in the shipping form below')}
                              </p>
                            )}

                            <div className="border-t pt-3 mt-3">
                              <div className="flex justify-between text-lg font-bold">
                                <span>{t('الإجمالي', 'Total')}</span>
                                <span>{totals.total.toFixed(1)} {t('ج.م', 'EGP')}</span>
                              </div>
                              {!totals.shippingDetermined && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {t('(بدون الشحن)', '(shipping not included yet)')}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => document.getElementById('checkoutForm')?.scrollIntoView({ behavior: 'smooth' })}
                              className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition mt-4"
                            >
                              {t('إتمام الدفع', 'Proceed to Checkout')}
                            </button>

                            <button
                              onClick={() => goTo('shop')}
                              className="w-full text-gray-600 font-semibold py-2 hover:text-black transition text-sm"
                            >
                              {language === 'ar' ? '←' : '→'} {t('الاستمرار في التسوق', 'Continue Shopping')}
                            </button>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">{t('عربة التسوق فارغة', 'Your cart is empty')}</p>
                      <button
                        onClick={() => goTo('shop')}
                        className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition w-full"
                      >
                        {t('تسوق الآن', 'Shop Now')}
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {cart.length > 0 && (
              <div className="mt-8 bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto fade-in" id="checkoutForm">
                <h2 className="text-2xl font-bold mb-6 border-b pb-3">{t('بيانات الشحن والدفع', 'Shipping & Payment')}</h2>

                {user && hasSavedShipping && (
                  <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="useExisting"
                        checked={useExistingAddress}
                        onChange={(e) => {
                          setUseExistingAddress(e.target.checked);
                          if (e.target.checked && user.savedShipping) {
                            setShippingFullName(user.savedShipping.fullName || '');
                            setShippingPhone(user.savedShipping.phone || '');
                            setShippingPhone2(user.savedShipping.phone2 || '');
                            setShippingAddress(user.savedShipping.address || '');
                            setSelectedGov(user.savedShipping.governorate || '');
                            setSelectedCountry(user.savedShipping.country || '');
                            setShippingZipCode(user.savedShipping.zipCode || '');
                          }
                        }}
                        className="w-5 h-5"
                      />
                      <label htmlFor="useExisting" className="font-bold text-blue-700 cursor-pointer text-base">
                        {t('استخدام العنوان المسجل في حسابي', 'Use saved address')}
                      </label>
                    </div>
                    {user.savedShipping && (
                      <div className="mt-2 text-sm text-gray-600 me-8">
                        <p>📦 {user.savedShipping.fullName}</p>
                        <p>📞 {user.savedShipping.phone} {user.savedShipping.phone2 && `| ${user.savedShipping.phone2}`}</p>
                        <p>📍 {user.savedShipping.address}</p>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  {(!user || !useExistingAddress) && (
                    <>
                      <InputField label={t('الاسم بالكامل', 'Full Name')} type="text" value={shippingFullName} onChange={(e) => setShippingFullName(e.target.value)} placeholder={t('ادخل اسمك بالكامل', 'Enter your full name')} required={true} id="shippingFullName" />
                      <InputField label={t('رقم الهاتف', 'Phone')} type="tel" value={shippingPhone} onChange={(e) => setShippingPhone(e.target.value)} placeholder={t('مثال: 01012345678', 'e.g. 01012345678')} required={true} id="shippingPhone" />
                      {adminSettings.current.showPhone2 && (
                        <InputField label={`${t('رقم هاتف إضافي', 'Additional phone')} ${!adminSettings.current.requiredPhone2 ? `(${t('اختياري', 'optional')})` : ''}`} type="tel" value={shippingPhone2} onChange={(e) => setShippingPhone2(e.target.value)} placeholder={t('رقم هاتف إضافي', 'Additional phone')} required={adminSettings.current.requiredPhone2} id="shippingPhone2" />
                      )}
                      {adminSettings.current.showCountry && (
                        <SelectField label={t('الدولة', 'Country')} value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} options={countries.map(c => ({ value: getLocalized(c.name), label: getLocalized(c.name) }))} required={true} id="selectedCountry" />
                      )}
                      <SelectField label={t('المحافظة', 'Governorate')} value={selectedGov} onChange={(e) => setSelectedGov(e.target.value)} options={[{ value: '', label: t('-- اختر المحافظة --', '-- Select Governorate --') }, ...governorates.map(g => ({ value: getLocalized(g.name), label: `${getLocalized(g.name)} (${g.cost} ${t('ج.م', 'EGP')})` }))]} required={true} id="selectedGov" />
                      <InputField label={t('العنوان التفصيلي', 'Detailed Address')} type="text" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder={t('الشارع، رقم العمارة، الشقة...', 'Street, building, apartment...')} required={true} id="shippingAddress" />
                      {adminSettings.current.showZipCode && (
                        <InputField label={t('الرمز البريدي (ZIP Code)', 'ZIP Code')} type="text" value={shippingZipCode} onChange={(e) => setShippingZipCode(e.target.value)} placeholder={t('مثال: 12345', 'e.g. 12345')} id="shippingZipCode" />
                      )}
                    </>
                  )}

                  {adminSettings.current.showCheckoutNotes && (
                    <TextareaField label={t('ملاحظات إضافية (اختياري)', 'Additional notes (optional)')} value={checkoutNotes} onChange={(e) => setCheckoutNotes(e.target.value)} placeholder={t('اكتب أي ملاحظات إضافية هنا...', 'Write any additional notes...')} rows={3} id="checkoutNotes" />
                  )}

                  {user && (
                    <div className="flex items-center gap-3 pt-2 border-t mt-4">
                      <input type="checkbox" id="saveShipping" checked={saveShippingInfo} onChange={(e) => setSaveShippingInfo(e.target.checked)} className="w-5 h-5" />
                      <label htmlFor="saveShipping" className="font-semibold text-sm cursor-pointer">{t('حفظ بيانات الشحن للمرة القادمة', 'Save shipping info for next time')}</label>
                    </div>
                  )}

                  <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition mt-4 text-lg">
                    {t('تأكيد الطلب', 'Confirm Order')} 🛒
                  </button>
                </form>
              </div>
            )}

          </section>
        )}

        {/* ========== صفحة تأكيد الطلب ========== */}
        {currentPage === 'order-confirmation' && (
          <section className="py-20 px-6 md:px-12 max-w-2xl mx-auto text-center fade-in">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-green-500 text-6xl mb-6">✅</div>
              <h2 className="text-3xl font-bold mb-4">{t('تم تأكيد طلبك بنجاح!', 'Order confirmed successfully!')}</h2>
              <p className="text-gray-600 text-lg mb-4">{t('شكراً لتسوقك معنا. سنقوم بمعالجة طلبك في أقرب وقت.', 'Thank you for shopping with us. We will process your order shortly.')}</p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-500">{t('رقم الطلب', 'Order Number')}</p>
                <p className="text-2xl font-bold text-gray-800">#{lastOrderId || '----'}</p>
              </div>
              <p className="text-sm text-gray-500 mb-8">{t('تم إرسال تفاصيل الطلب إلى بريدك الإلكتروني', 'Order details have been sent to your email.')}</p>
              <button
                onClick={() => goTo('home')}
                className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition"
              >
                {t('العودة للتسوق', 'Back to Shopping')} 🛍️
              </button>
            </div>
          </section>
        )}

        {/* ========== صفحة الحساب ========== */}
        {currentPage === 'account' && user && (
          <section className={`py-16 px-6 md:px-12 max-w-4xl mx-auto ${language === 'ar' ? 'text-right' : 'text-left'} fade-in`}>
            <h1 className="text-3xl font-bold mb-6">{t('حسابي الشخصي', 'My Account')}</h1>
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
              <div className={`flex justify-between items-center mb-4 ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                <h2 className="text-xl font-bold">{t('بيانات الحساب', 'Account Details')}</h2>
                {!isEditingAccount && (
                  <button onClick={() => setIsEditingAccount(true)} className="text-blue-600 font-bold hover:underline">{t('تعديل البيانات', 'Edit')}</button>
                )}
              </div>

              {isEditingAccount ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setUser({...user, ...editAccountData});
                  setIsEditingAccount(false);
                  showToast(t('تم تحديث بيانات الحساب بنجاح!', 'Account updated successfully!'));
                }} className="space-y-4">
                  <InputField label={t('الاسم', 'Name')} value={editAccountData.name} onChange={e => setEditAccountData({...editAccountData, name: e.target.value})} required={true} id="editName" />
                  <InputField label={t('البريد الإلكتروني', 'Email')} type="email" value={editAccountData.email} onChange={e => setEditAccountData({...editAccountData, email: e.target.value})} required={true} id="editEmail" />
                  <InputField label={t('رقم الهاتف', 'Phone')} type="tel" value={editAccountData.phone} onChange={e => setEditAccountData({...editAccountData, phone: e.target.value})} required={true} id="editPhone" />
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-bold">{t('حفظ التغييرات', 'Save Changes')}</button>
                    <button type="button" onClick={() => setIsEditingAccount(false)} className="px-6 py-2 rounded-lg font-bold border">{t('إلغاء', 'Cancel')}</button>
                  </div>
                </form>
              ) : (
                <div>
                  <p className="mb-2"><strong>{t('الاسم:', 'Name:')}</strong> {user.name}</p>
                  <p className="mb-2"><strong>{t('البريد الإلكتروني:', 'Email:')}</strong> {user.email}</p>
                  <p className="mb-2"><strong>{t('رقم الهاتف:', 'Phone:')}</strong> {user.phone}</p>
                  {user.savedShipping && (
                    <div className="mt-6 pt-4 border-t">
                      <h3 className="font-bold mb-2 text-green-700">✅ {t('بيانات الشحن المحفوظة', 'Saved Shipping Info')}</h3>
                      <p className="text-sm text-gray-600 mb-1">{user.savedShipping.fullName}</p>
                      <p className="text-sm text-gray-600 mb-1">{user.savedShipping.phone}</p>
                      <p className="text-sm text-gray-600">{user.savedShipping.address}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => goTo('my-orders')}
              className="w-full bg-white p-6 rounded-xl shadow-md flex items-center justify-between hover:shadow-lg transition text-start"
            >
              <span className="font-bold text-lg">📦 {t('طلباتي', 'My Orders')}</span>
              <span className="text-gray-400">{language === 'ar' ? '←' : '→'}</span>
            </button>
          </section>
        )}

        {/* ========== صفحة طلباتي ========== */}
        {currentPage === 'my-orders' && user && (
          <section className={`py-16 px-6 md:px-12 max-w-4xl mx-auto ${language === 'ar' ? 'text-right' : 'text-left'} fade-in`}>
            <button onClick={() => goTo('account')} className={`mb-6 text-gray-600 hover:text-black font-semibold flex items-center gap-2 ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
              {language === 'ar' ? '←' : '→'} {t('العودة للحساب', 'Back to account')}
            </button>
            <h1 className="text-3xl font-bold mb-8">{t('طلباتي', 'My Orders')}</h1>
            {(() => {
              const myOrders = orders.filter(o => o.customerEmail === user.email);
              if (myOrders.length === 0) {
                return (
                  <div className="text-center py-12 bg-white rounded-xl shadow-md">
                    <p className="text-gray-500 text-lg mb-4">{t('لا يوجد لديك طلبات سابقة', "You don't have any orders yet")}</p>
                    <button onClick={() => { setSelectedCategoryFilter('all'); goTo('shop'); }} className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">
                      {t('تسوق الآن', 'Shop Now')}
                    </button>
                  </div>
                );
              }

              const orderStages = [
                { key: t('جديد', 'New'), label: t('جديد', 'New') },
                { key: t('جاري التأكيد', 'Confirming'), label: t('جاري التأكيد', 'Confirming') },
                { key: t('تم التأكيد', 'Confirmed'), label: t('تم التأكيد', 'Confirmed') },
                { key: t('تم التسليم', 'Delivered'), label: t('تم التسليم', 'Delivered') },
              ];

              return (
                <div className="space-y-6">
                  {myOrders.map(ord => {
                    const isCancelledOrReturned = ord.status === t('ملغي', 'Cancelled') || ord.status === t('مرتجع', 'Returned');
                    const currentStageIndex = orderStages.findIndex(s => s.key === ord.status);
                    const baseDate = new Date();
                    return (
                      <div key={ord.id} className="bg-white p-6 rounded-xl shadow-md space-y-5">
                        <div className="flex justify-between items-center flex-wrap gap-2 border-b pb-3">
                          <div>
                            <h3 className="font-bold text-lg">{t('طلب', 'Order')} #{ord.id}</h3>
                            <p className="text-xs text-gray-500">{ord.createdAt}</p>
                          </div>
                          <span className="font-bold text-lg">{ord.totalAmount} {t('ج.م', 'EGP')}</span>
                        </div>

                        {isCancelledOrReturned ? (
                          <div className={`p-3 rounded-lg font-bold text-sm ${ord.status === t('مرتجع', 'Returned') ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'}`}>
                            {ord.status === t('مرتجع', 'Returned') ? '↩️' : '❌'} {ord.status}
                          </div>
                        ) : (
                          <div className="flex items-center">
                            {orderStages.map((stage, index) => {
                              const isDone = currentStageIndex >= 0 && index <= currentStageIndex;
                              const stageDate = new Date(baseDate.getTime() - (currentStageIndex - index) * 86400000);
                              return (
                                <React.Fragment key={stage.key}>
                                  <div className="flex flex-col items-center flex-1 text-center">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                                      {isDone ? '✓' : index + 1}
                                    </div>
                                    <span className={`text-[11px] mt-1.5 font-semibold ${isDone ? 'text-black' : 'text-gray-400'}`}>{stage.label}</span>
                                    {isDone && <span className="text-[10px] text-gray-400">{stageDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>}
                                  </div>
                                  {index < orderStages.length - 1 && (
                                    <div className={`h-0.5 flex-1 -mt-5 ${index < currentStageIndex ? 'bg-black' : 'bg-gray-200'}`}></div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        )}

                        <div className="pt-3 border-t space-y-2">
                          {(ord.items || []).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm">
                              <img src={item.images ? item.images[0] : ''} alt="" className="w-10 h-10 object-cover rounded-md" />
                              <span className="flex-1">{getLocalized(item.name)} ({item.size})</span>
                              <span className="font-bold">{item.price} {t('ج.م', 'EGP')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </section>
        )}

        {/* ========== صفحة التواصل ========== */}
        {currentPage === 'contact' && (
          <section className={`py-16 px-6 md:px-12 max-w-3xl mx-auto ${language === 'ar' ? 'text-right' : 'text-left'} fade-in`}>
            <h2 className="text-4xl font-bold mb-10 text-center">{t('تواصل معنا', 'Contact Us')}</h2>
            <form className="bg-white p-8 rounded-lg shadow-md space-y-6" onSubmit={handleContactSubmit}>
              <InputField label={t('الاسم بالكامل', 'Full Name')} type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} required={true} id="contactName" />
              <InputField label={t('رقم التليفون', 'Phone')} type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required={true} id="contactPhone" />
              <TextareaField label={t('الرسالة', 'Message')} value={contactMsg} onChange={(e) => setContactMsg(e.target.value)} placeholder={t('اكتب رسالتك هنا...', 'Write your message...')} required={true} rows={4} id="contactMsg" />
              <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition">{t('إرسال', 'Send')}</button>
            </form>
          </section>
        )}

        {/* ========== صفحة مخصصة (أضافها الأدمن) ========== */}
        {currentPage === 'custom-page' && (() => {
          const page = customPages.find(p => p.id === activeCustomPageId);
          if (!page) {
            return (
              <section className="py-16 px-6 md:px-12 max-w-3xl mx-auto text-center fade-in">
                <p className="text-gray-500 text-lg">{t('الصفحة غير موجودة', 'Page not found')}</p>
              </section>
            );
          }
          return (
            <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto fade-in">
              <h2 className="text-3xl font-bold mb-8 text-center">{getLocalized(page.title)}</h2>
              {page.sections.length > 0 ? (
                <div className="space-y-8">
                  {renderSectionsList(page.sections)}
                </div>
              ) : (
                <p className="text-center text-gray-500">{t('لا يوجد محتوى في هذه الصفحة بعد.', 'No content on this page yet.')}</p>
              )}
            </section>
          );
        })()}

        {/* ========== لوحة التحكم ========== */}
        {currentPage === 'admin' && user && (user.role === 'admin' || user.role === 'call_center' || user.role === 'packer') && (
          <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto" dir="rtl">
            <h1 className="text-4xl font-extrabold mb-4 text-center">{t('لوحة تحكم المتجر', 'Dashboard')}</h1>
            <p className="text-center text-gray-600 mb-8 font-semibold">{t('الصلاحية:', 'Role:')} <span className="text-red-600">{user.role === 'admin' ? t('المدير', 'Admin') : user.role === 'packer' ? t('محضر طلبات', 'Packer') : t('مؤكد طلبات', 'Call Center')}</span></p>

            {(() => {
              // ===== تجميع تبويبات الأدمن في قائمة جانبية منظمة حسب القسم =====
              const sidebarGroups = [
                {
                  section: t('نظرة عامة', 'OVERVIEW'),
                  items: [
                    { key: 'stats', label: t('لوحة البيانات', 'Dashboard'), icon: '📊' },
                  ],
                },
                {
                  section: t('المتجر', 'STORE'),
                  items: [
                    { key: 'products', label: t('المنتجات', 'Products'), icon: '👕' },
                    { key: 'categories', label: t('الأقسام', 'Categories'), icon: '📁' },
                    { key: 'orders', label: t('الطلبات', 'Orders'), icon: '📦', alwaysVisible: true },
                  ],
                },
                {
                  section: t('التسويق', 'MARKETING'),
                  items: [
                    { key: 'promotions', label: t('العروض الترويجية', 'Promotions'), icon: '🎁' },
                    { key: 'discounts', label: t('أكواد الخصم', 'Discounts'), icon: '🏷️' },
                    { key: 'recommendations', label: t('التوصيات والعروض', 'Recommendations & Offers'), icon: '🎯' },
                    { key: 'home_sections', label: t('الصفحة الرئيسية', 'Homepage'), icon: '🏠' },
                  ],
                },
                {
                  section: t('العمليات', 'OPERATIONS'),
                  items: [
                    { key: 'shipping', label: t('الشحن', 'Shipping'), icon: '🚚' },
                    { key: 'expenses', label: t('المصاريف', 'Expenses'), icon: '💸' },
                    { key: 'staff', label: t('الموظفين', 'Staff'), icon: '👥' },
                  ],
                },
                {
                  section: t('المحتوى', 'CONTENT'),
                  items: [
                    { key: 'content', label: t('شكل الموقع والعداد', 'Design & Timer'), icon: '⚙️' },
                    { key: 'custom_pages', label: t('الصفحات', 'Pages'), icon: '📄' },
                    { key: 'messages', label: t('الرسائل', 'Messages'), icon: '✉️' },
                  ],
                },
                {
                  section: t('الإعدادات', 'SETTINGS'),
                  items: [
                    { key: 'checkout_settings', label: t('إعدادات التشيك اوت', 'Checkout Settings'), icon: '🧾' },
                    { key: 'apikeys', label: t('مفاتيح API / التتبع', 'API / Tracking'), icon: '🔑' },
                  ],
                },
              ];

              // ===== الموظفين غير الأدمن (محضر/مؤكد طلبات) بيشوفوا "الطلبات" بس =====
              const visibleGroups = sidebarGroups
                .map(g => ({ ...g, items: g.items.filter(i => user.role === 'admin' || i.alwaysVisible) }))
                .filter(g => g.items.length > 0);

              const currentItem = visibleGroups.flatMap(g => g.items).find(i => i.key === adminTab);

              const renderNav = (closeOnSelect) => (
                <nav className="space-y-5">
                  {visibleGroups.map(group => (
                    <div key={group.section}>
                      <p className="text-[11px] font-extrabold tracking-wider text-gray-400 uppercase px-2 mb-1.5">{group.section}</p>
                      <div className="space-y-1">
                        {group.items.map(item => (
                          <button
                            key={item.key}
                            onClick={() => { setAdminTab(item.key); if (closeOnSelect) setAdminSidebarOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-bold text-start transition ${adminTab === item.key ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                          >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>
              );

              return (
                <>
                  {/* ===== زرار فتح القائمة على الموبايل ===== */}
                  <div className="lg:hidden mb-4">
                    <button
                      onClick={() => setAdminSidebarOpen(true)}
                      className="w-full bg-white border rounded-xl px-4 py-3 font-bold text-sm flex items-center justify-between shadow-sm"
                    >
                      <span className="flex items-center gap-2">☰ {t('القائمة', 'Menu')}</span>
                      <span className="text-gray-400 text-xs font-semibold">{currentItem ? `${currentItem.icon} ${currentItem.label}` : ''}</span>
                    </button>
                  </div>

                  {/* ===== درج القائمة على الموبايل ===== */}
                  {adminSidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                      <div className="absolute inset-0 bg-black/50" onClick={() => setAdminSidebarOpen(false)}></div>
                      <div className={`absolute top-0 ${language === 'ar' ? 'right-0' : 'left-0'} h-full w-72 max-w-[85%] bg-white shadow-xl overflow-y-auto p-4`}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold">{t('لوحة تحكم المتجر', 'Dashboard')}</h3>
                          <button onClick={() => setAdminSidebarOpen(false)} className="text-gray-400 text-2xl leading-none">✕</button>
                        </div>
                        {renderNav(true)}
                      </div>
                    </div>
                  )}

                  {/* ===== صف الشاشة: القائمة الجانبية (ديسكتوب) + المحتوى ===== */}
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <aside className="hidden lg:block w-64 flex-shrink-0 bg-white border rounded-xl shadow-sm p-4 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto">
                      {renderNav(false)}
                    </aside>

                    {/* ===== منطقة المحتوى الرئيسية ===== */}
                    <div className="flex-1 w-full min-w-0 space-y-8">

            {/* ===== تبويب الإحصائيات ===== */}
            {adminTab === 'stats' && user.role === 'admin' && (
              <div className="bg-gray-50 p-6 md:p-8 rounded-xl shadow-md space-y-8 border">
                <h2 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-4">{t('نظرة عامة على الأداء', 'Performance Overview')}</h2>
                {(() => {
                  const deliveredOrders = orders.filter(o => o.status === t('تم التسليم', 'Delivered'));
                  const totalSales = deliveredOrders.reduce((acc, o) => acc + o.totalAmount, 0);
                  const totalCost = deliveredOrders.reduce((acc, o) => acc + (o.items ? o.items.reduce((s, i) => s + (i.costPrice || 0), 0) : 0), 0);
                  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
                  const netProfit = totalSales - totalCost - totalExpenses;
                  const avgOrderValue = deliveredOrders.length > 0 ? (totalSales / deliveredOrders.length).toFixed(1) : 0;

                  const todayStr = new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
                  const todayOrdersCount = orders.filter(o => o.createdAt === todayStr).length;

                  const confirmedOrdersCount = orders.filter(o => o.status === t('تم التأكيد', 'Confirmed')).length;

                  const productSalesCount = {};
                  orders.forEach(o => {
                    (o.items || []).forEach(item => {
                      productSalesCount[item.id] = (productSalesCount[item.id] || 0) + 1;
                    });
                  });
                  let bestSellerName = t('لا يوجد بيانات بعد', 'No data yet');
                  let bestSellerQty = 0;
                  Object.entries(productSalesCount).forEach(([pid, qty]) => {
                    if (qty > bestSellerQty) {
                      bestSellerQty = qty;
                      const prod = products.find(p => p.id === Number(pid));
                      bestSellerName = prod ? getLocalized(prod.name) : t('منتج محذوف', 'Deleted product');
                    }
                  });

                  const monthlySalesData = [
                    { day: { ar: 'يناير', en: 'Jan' }, amount: 4200 },
                    { day: { ar: 'فبراير', en: 'Feb' }, amount: 3500 },
                    { day: { ar: 'مارس', en: 'Mar' }, amount: 5100 },
                    { day: { ar: 'أبريل', en: 'Apr' }, amount: 4800 },
                    { day: { ar: 'مايو', en: 'May' }, amount: 6200 },
                    { day: { ar: 'يونيو', en: 'Jun' }, amount: 7000 },
                  ];
                  const yearlySalesData = [
                    { day: { ar: '2022', en: '2022' }, amount: 42000 },
                    { day: { ar: '2023', en: '2023' }, amount: 58000 },
                    { day: { ar: '2024', en: '2024' }, amount: 71000 },
                    { day: { ar: '2025', en: '2025' }, amount: 89000 },
                    { day: { ar: '2026', en: '2026' }, amount: 46000 },
                  ];
                  const activeSalesData = statsPeriod === 'monthly' ? monthlySalesData : statsPeriod === 'yearly' ? yearlySalesData : salesData;
                  const maxSaleAmount = Math.max(...activeSalesData.map(d => d.amount));

                  return (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border-e-4 border-blue-500">
                          <h4 className="font-bold text-gray-500 text-sm mb-2">{t('إجمالي المبيعات', 'Total Sales')}</h4>
                          <p className="text-3xl font-extrabold text-gray-900">{totalSales} <span className="text-lg text-gray-400 font-normal">{t('ج.م', 'EGP')}</span></p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-e-4 border-indigo-500">
                          <h4 className="font-bold text-gray-500 text-sm mb-2">{t('طلبات اليوم', "Today's Orders")}</h4>
                          <p className="text-3xl font-extrabold text-gray-900">{todayOrdersCount} <span className="text-lg text-gray-400 font-normal">{t('طلب', 'orders')}</span></p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-e-4 border-teal-500">
                          <h4 className="font-bold text-gray-500 text-sm mb-2">{t('الطلبات المؤكدة', 'Confirmed Orders')}</h4>
                          <p className="text-3xl font-extrabold text-gray-900">{confirmedOrdersCount} <span className="text-lg text-gray-400 font-normal">{t('طلب', 'orders')}</span></p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-e-4 border-pink-500">
                          <h4 className="font-bold text-gray-500 text-sm mb-2">{t('أكثر منتج مبيعاً', 'Best-selling Product')}</h4>
                          <p className="text-lg font-extrabold text-gray-900 truncate" title={bestSellerName}>{bestSellerName}</p>
                          {bestSellerQty > 0 && <p className="text-xs text-gray-400 mt-1">{bestSellerQty} {t('قطعة مباعة', 'sold')}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`bg-white p-6 rounded-xl shadow-sm border-e-4 ${netProfit >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                          <h4 className="font-bold text-gray-500 text-sm mb-2">{t('صافي الربح', 'Net Profit')}</h4>
                          <p className={`text-3xl font-extrabold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{netProfit} <span className="text-lg text-gray-400 font-normal">{t('ج.م', 'EGP')}</span></p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-e-4 border-purple-500">
                          <h4 className="font-bold text-gray-500 text-sm mb-2">{t('متوسط قيمة الطلب', 'Average Order Value')}</h4>
                          <p className="text-3xl font-extrabold text-gray-900">{avgOrderValue} <span className="text-lg text-gray-400 font-normal">{t('ج.م', 'EGP')}</span></p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border-e-4 border-orange-500">
                          <h4 className="font-bold text-gray-500 text-sm mb-2">{t('عدد الطلبات الناجحة', 'Successful Orders')}</h4>
                          <p className="text-3xl font-extrabold text-gray-900">{deliveredOrders.length} <span className="text-lg text-gray-400 font-normal">{t('طلب', 'orders')}</span></p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
                          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                            <h3 className="text-xl font-bold text-gray-800">{t('مبيعات', 'Sales')}</h3>
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                              <button type="button" onClick={() => setStatsPeriod('weekly')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${statsPeriod === 'weekly' ? 'bg-black text-white' : 'text-gray-600'}`}>{t('أسبوعي', 'Weekly')}</button>
                              <button type="button" onClick={() => setStatsPeriod('monthly')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${statsPeriod === 'monthly' ? 'bg-black text-white' : 'text-gray-600'}`}>{t('شهري', 'Monthly')}</button>
                              <button type="button" onClick={() => setStatsPeriod('yearly')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${statsPeriod === 'yearly' ? 'bg-black text-white' : 'text-gray-600'}`}>{t('سنوي', 'Yearly')}</button>
                            </div>
                          </div>
                          <div className="h-64 flex items-end justify-between gap-2 pt-4 relative border-b-2 border-gray-200">
                            {activeSalesData.map((data, index) => {
                              const barHeight = `${(data.amount / maxSaleAmount) * 100}%`;
                              return (
                                <div key={index} className="flex flex-col items-center w-full group relative z-10">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded shadow-lg pointer-events-none whitespace-nowrap">
                                    {data.amount} {t('ج.م', 'EGP')}
                                    <div className="absolute w-2 h-2 bg-gray-900 rotate-45 -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                                  </div>
                                  <div className="bg-black w-full max-w-[35px] md:max-w-[50px] rounded-t-md transition-all duration-500 group-hover:bg-blue-600 cursor-pointer" style={{ height: barHeight }}></div>
                                  <span className="text-xs text-gray-500 mt-3 font-bold">{getLocalized(data.day)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col">
                          <h3 className="text-xl font-bold mb-6 text-gray-800">{t('تفاصيل الأرباح والمصاريف', 'Profit & Expense Details')}</h3>
                          <div className="space-y-4 text-sm flex-grow">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                              <span className="text-gray-600 font-bold">{t('المبيعات الإجمالية', 'Total Sales')}</span>
                              <span className="font-black text-lg text-gray-900">{totalSales} {t('ج.م', 'EGP')}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border text-red-700">
                              <span className="font-bold">{t('تكلفة المنتجات', 'Product Cost')}</span>
                              <span className="font-black">- {totalCost} {t('ج.م', 'EGP')}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border text-orange-700">
                              <span className="font-bold">{t('مصاريف أخرى', 'Other Expenses')}</span>
                              <span className="font-black">- {totalExpenses} {t('ج.م', 'EGP')}</span>
                            </div>
                          </div>
                          <div className="mt-6 pt-5 border-t-2 border-dashed border-gray-200 flex justify-between items-center">
                            <span className="font-extrabold text-gray-800 text-lg">{t('الصافي النهائي:', 'Net Profit:')}</span>
                            <span className={`text-2xl font-black px-4 py-2 rounded-lg ${netProfit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {netProfit} {t('ج.م', 'EGP')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ===== تبويب مفاتيح API ===== */}
            {adminTab === 'apikeys' && user.role === 'admin' && (
              <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <h2 className="text-2xl font-bold mb-1">🔑 {t('مركز ربط منصات الإعلانات', 'Ad Platforms Integration')}</h2>
                <p className="text-gray-600 text-sm mb-4">{t('من هنا تقدر تربط مفاتيح الـ API، تضيف البيكسلات، تفعّل الكتالوج، وتتابع أداء الحملات.', 'Connect API keys, add pixels, enable catalogs, and track campaign performance.')}</p>

                <div className="flex flex-wrap gap-2 border-b pb-4">
                  <button onClick={() => setApiSubTab('keys')} className={`px-4 py-2 rounded-lg font-bold text-sm ${apiSubTab === 'keys' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>🔑 {t('مفاتيح API', 'API Keys')}</button>
                  <button onClick={() => setApiSubTab('pixels')} className={`px-4 py-2 rounded-lg font-bold text-sm ${apiSubTab === 'pixels' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>🎯 {t('البيكسلات', 'Pixels')}</button>
                  <button onClick={() => setApiSubTab('catalog')} className={`px-4 py-2 rounded-lg font-bold text-sm ${apiSubTab === 'catalog' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>🗂️ {t('الكتالوج', 'Catalog')}</button>
                  <button onClick={() => setApiSubTab('dashboard')} className={`px-4 py-2 rounded-lg font-bold text-sm ${apiSubTab === 'dashboard' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>📈 {t('داشبورد الأداء', 'Performance Dashboard')}</button>
                </div>

                {apiSubTab === 'keys' && (
                  <div className="space-y-6">
                    <p className="text-gray-500 text-xs bg-blue-50 border border-blue-200 rounded-lg p-3">{t('المفتاح ده هو الـ Access Token اللي بيدي الموقع صلاحية يبعت أحداث وبيانات لحساب الإعلانات بتاعك.', 'This is the Access Token that allows the site to send events and data to your ad accounts.')}</p>
                    <MaskedKeyField platformIcon="🎵" label={t('تيك توك — Access Token', 'TikTok — Access Token')} value={adminSettings.current.tiktokApiKey} onChange={(e) => { adminSettings.current.tiktokApiKey = e.target.value; bumpSettings(); }} onRemove={() => { adminSettings.current.tiktokApiKey = ''; bumpSettings(); showToast(t('تم حذف مفتاح تيك توك', 'TikTok key removed')); }} placeholder={t('الصق التوكن هنا...', 'Paste token here...')} id="tiktokApiKey" t={t} />
                    <MaskedKeyField platformIcon="📘" label={t('ميتا (فيسبوك/انستجرام) — Access Token', 'Meta (Facebook/Instagram) — Access Token')} value={adminSettings.current.metaApiKey} onChange={(e) => { adminSettings.current.metaApiKey = e.target.value; bumpSettings(); }} onRemove={() => { adminSettings.current.metaApiKey = ''; bumpSettings(); showToast(t('تم حذف مفتاح ميتا', 'Meta key removed')); }} placeholder={t('الصق التوكن هنا...', 'Paste token here...')} id="metaApiKey" t={t} />
                    <MaskedKeyField platformIcon="👻" label={t('سناب شات — Access Token', 'Snapchat — Access Token')} value={adminSettings.current.snapchatApiKey} onChange={(e) => { adminSettings.current.snapchatApiKey = e.target.value; bumpSettings(); }} onRemove={() => { adminSettings.current.snapchatApiKey = ''; bumpSettings(); showToast(t('تم حذف مفتاح سناب شات', 'Snapchat key removed')); }} placeholder={t('الصق التوكن هنا...', 'Paste token here...')} id="snapchatApiKey" t={t} />
                    <MaskedKeyField platformIcon="🔍" label={t('جوجل — API Key', 'Google — API Key')} value={adminSettings.current.googleApiKey} onChange={(e) => { adminSettings.current.googleApiKey = e.target.value; bumpSettings(); }} onRemove={() => { adminSettings.current.googleApiKey = ''; bumpSettings(); showToast(t('تم حذف مفتاح جوجل', 'Google key removed')); }} placeholder={t('الصق التوكن هنا...', 'Paste token here...')} id="googleApiKey" t={t} />
                    <button onClick={() => showToast(t('تم حفظ مفاتيح API بنجاح!', 'API keys saved!'))} className="bg-black text-white px-8 py-3 rounded-lg font-bold mt-2">{t('حفظ مفاتيح API', 'Save API Keys')}</button>
                  </div>
                )}

                {apiSubTab === 'pixels' && (
                  <div className="space-y-6">
                    <p className="text-gray-500 text-xs bg-blue-50 border border-blue-200 rounded-lg p-3">{t('البيكسل (Pixel ID) هو كود بيتزرع في صفحات الموقع علشان يتابع زوار الموقع.', 'Pixel ID is a code inserted into site pages to track visitors.')}</p>
                    <MaskedKeyField platformIcon="📘" label="Meta Pixel ID" value={adminSettings.current.metaPixelId} onChange={(e) => { adminSettings.current.metaPixelId = e.target.value; bumpSettings(); }} onRemove={() => { adminSettings.current.metaPixelId = ''; bumpSettings(); showToast(t('تم حذف بيكسل ميتا', 'Meta pixel removed')); }} placeholder={t('مثال: 1234567890123456', 'Example: 1234567890123456')} id="metaPixelId" t={t} />
                    <MaskedKeyField platformIcon="🎵" label="TikTok Pixel ID" value={adminSettings.current.tiktokPixelId} onChange={(e) => { adminSettings.current.tiktokPixelId = e.target.value; bumpSettings(); }} onRemove={() => { adminSettings.current.tiktokPixelId = ''; bumpSettings(); showToast(t('تم حذف بيكسل تيك توك', 'TikTok pixel removed')); }} placeholder={t('مثال: CXXXXXXXXXXXXXXXXX', 'Example: CXXXXXXXXXXXXXXXXX')} id="tiktokPixelId" t={t} />
                    <MaskedKeyField platformIcon="🔍" label="Google Tag / Measurement ID" value={adminSettings.current.googlePixelId} onChange={(e) => { adminSettings.current.googlePixelId = e.target.value; bumpSettings(); }} onRemove={() => { adminSettings.current.googlePixelId = ''; bumpSettings(); showToast(t('تم حذف كود جوجل', 'Google tag removed')); }} placeholder={t('مثال: G-XXXXXXXXXX أو AW-XXXXXXXXX', 'Example: G-XXXXXXXXXX or AW-XXXXXXXXX')} id="googlePixelId" t={t} />
                    <MaskedKeyField platformIcon="👻" label="Snapchat Pixel ID" value={adminSettings.current.snapchatPixelId} onChange={(e) => { adminSettings.current.snapchatPixelId = e.target.value; bumpSettings(); }} onRemove={() => { adminSettings.current.snapchatPixelId = ''; bumpSettings(); showToast(t('تم حذف بيكسل سناب شات', 'Snapchat pixel removed')); }} placeholder={t('مثال: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'Example: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')} id="snapchatPixelId" t={t} />
                    <button onClick={() => showToast(t('تم حفظ البيكسلات بنجاح!', 'Pixels saved!'))} className="bg-black text-white px-8 py-3 rounded-lg font-bold mt-2">{t('حفظ البيكسلات', 'Save Pixels')}</button>
                  </div>
                )}

                {apiSubTab === 'catalog' && (
                  <div className="space-y-6">
                    <p className="text-gray-500 text-xs bg-blue-50 border border-blue-200 rounded-lg p-3">{t('الكتالوج بيولّد رابط (Feed URL) فيه كل منتجاتك بصيغة تفهمها كل منصة.', 'The catalog generates a Feed URL with all your products in a format understood by each platform.')}</p>
                    {[
                      { key: 'metaCatalogEnabled', icon: '📘', label: t('كتالوج ميتا (فيسبوك/انستجرام)', 'Meta Catalog (Facebook/Instagram)'), path: 'meta-catalog.xml' },
                      { key: 'tiktokCatalogEnabled', icon: '🎵', label: t('كتالوج تيك توك', 'TikTok Catalog'), path: 'tiktok-catalog.csv' },
                      { key: 'googleCatalogEnabled', icon: '🔍', label: t('كتالوج جوجل (Merchant Center)', 'Google Catalog (Merchant Center)'), path: 'google-catalog.xml' },
                      { key: 'snapchatCatalogEnabled', icon: '👻', label: t('كتالوج سناب شات', 'Snapchat Catalog'), path: 'snapchat-catalog.csv' },
                    ].map((platform) => {
                      const isEnabled = adminSettings.current[platform.key];
                      const feedUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/feeds/${platform.path}`;
                      return (
                        <div key={platform.key} className="bg-gray-50 p-4 rounded-lg border space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{platform.icon} {platform.label}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={isEnabled} onChange={(e) => { adminSettings.current[platform.key] = e.target.checked; bumpSettings(); }} />
                              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-all"></div>
                              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:-translate-x-5"></div>
                            </label>
                          </div>
                          {isEnabled && (
                            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-white border rounded-lg p-3">
                              <code className="flex-1 text-xs text-gray-700 break-all font-mono" dir="ltr">{feedUrl}</code>
                              <button type="button" onClick={() => { if (typeof navigator !== 'undefined' && navigator.clipboard) { navigator.clipboard.writeText(feedUrl); } showToast(t('تم نسخ رابط الكتالوج!', 'Catalog link copied!')); }} className="bg-black text-white px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap">{t('نسخ الرابط', 'Copy Link')}</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {apiSubTab === 'dashboard' && (
                  <div className="space-y-6">
                    <p className="text-gray-500 text-xs bg-yellow-50 border border-yellow-200 rounded-lg p-3">{t('⚠️ الأرقام هنا شكل تجريبي (Preview) بس لحد ما نظبط الباك اند.', '⚠️ Numbers are preview only until backend is set up.')}</p>
                    {[t('ميتا 📘', 'Meta 📘'), t('تيك توك 🎵', 'TikTok 🎵'), t('جوجل 🔍', 'Google 🔍'), t('سناب شات 👻', 'Snapchat 👻')].map((platformName) => (
                      <div key={platformName} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <h3 className="font-bold text-lg">{platformName}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: t('مرات الظهور', 'Impressions'), value: '—' },
                            { label: t('الضغطات', 'Clicks'), value: '—' },
                            { label: t('الصرف', 'Spend'), value: '—' },
                            { label: 'ROAS', value: '—' },
                          ].map((stat) => (
                            <div key={stat.label} className="bg-gray-50 border rounded-lg p-3 text-center">
                              <p className="text-xs text-gray-500 font-bold mb-1">{stat.label}</p>
                              <p className="text-xl font-black text-gray-800">{stat.value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="h-24 flex items-end gap-1 border-b-2 border-gray-100">
                          {[20, 35, 15, 45, 30, 50, 25].map((h, i) => (
                            <div key={i} className="bg-gray-200 flex-1 rounded-t" style={{ height: `${h}%` }}></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== تبويب الطلبات ===== */}
            {adminTab === 'orders' && (
              <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-bold">{t('إدارة ومتابعة الطلبات', 'Order Management')}</h2>
                  {(user.role === 'admin' || (user.role === 'call_center' && adminSettings.current.showConfirmedExportForCallCenter)) && (
                    <button
                      onClick={exportConfirmedOrders}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition"
                    >
                      📤 {t('تصدير الطلبات المؤكدة (Excel)', 'Export Confirmed Orders (Excel)')}
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <button
                      onClick={exportAllOrders}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition"
                    >
                      📤 {t('تصدير جميع الطلبات (Excel)', 'Export All Orders (Excel)')}
                    </button>
                  )}
                </div>
                {user.role === 'admin' && (
                  <label className="flex items-center gap-2 text-sm font-semibold bg-gray-50 border rounded-lg p-3 cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      checked={!!adminSettings.current.showConfirmedExportForCallCenter}
                      onChange={(e) => { adminSettings.current.showConfirmedExportForCallCenter = e.target.checked; bumpSettings(); }}
                      className="w-5 h-5"
                    />
                    {t('إظهار زرار تصدير الطلبات المؤكدة لموظف الكول سنتر', 'Show "Export Confirmed Orders" button for call center staff')}
                  </label>
                )}
                {(() => {
                  const visibleOrders = user.role === 'packer'
                      ? orders.filter(o => o.status === t('تم التأكيد', 'Confirmed'))
                      : orders;

                  if (visibleOrders.length === 0) return <p className="text-gray-500">{t('لا توجد طلبات حالياً.', 'No orders yet.')}</p>;

                  return visibleOrders.map(ord => (
                    <div key={ord.id} className="border p-6 rounded-xl bg-gray-50 space-y-3">
                      <div className="flex justify-between items-center border-b pb-3">
                        <div>
                          <h3 className="font-bold text-lg">{t('طلب', 'Order')} #{ord.id}</h3>
                          <p className="text-sm">{t('العميل:', 'Customer:')} {ord.customerName} | {t('الهاتف:', 'Phone:')} {ord.customerPhone}</p>
                          {ord.customerPhone2 && <p className="text-sm">{t('هاتف إضافي:', 'Additional phone:')} {ord.customerPhone2}</p>}
                          <p className="text-sm">{t('العنوان:', 'Address:')} {ord.address} ({ord.governorate})</p>
                          {ord.zipCode && <p className="text-sm">ZIP: {ord.zipCode}</p>}
                          {ord.discountCode && <p className="text-sm text-green-600">{t('كود الخصم:', 'Discount code:')} {ord.discountCode}</p>}
                          {ord.discountType === 'first_order' && <p className="text-sm text-green-600">{t(`تم تطبيق خصم ${adminSettings.current.promotions.guestDiscount.percentage}% للحساب الجديد`, `${adminSettings.current.promotions.guestDiscount.percentage}% new user discount applied`)}</p>}
                          {ord.promoLabel && <p className="text-sm text-green-600">🎁 {ord.promoLabel}</p>}
                          {ord.notes && <p className="text-sm text-blue-600">{t('ملاحظات:', 'Notes:')} {ord.notes}</p>}
                        </div>
                        <span className="font-bold text-lg">{ord.totalAmount} {t('ج.م', 'EGP')}</span>
                      </div>
                      <div className="flex gap-4 items-center flex-wrap">
                        <select
                          disabled={user.role === 'packer'}
                          value={ord.status}
                          onChange={(e) => setOrders(orders.map(o => o.id === ord.id ? { ...o, status: e.target.value } : o))}
                          className="px-3 py-1 border rounded bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value={t('جديد', 'New')}>{t('جديد', 'New')}</option>
                          <option value={t('جاري التأكيد', 'Confirming')}>{t('جاري التأكيد', 'Confirming')}</option>
                          <option value={t('تم التأكيد', 'Confirmed')}>{t('تم التأكيد', 'Confirmed')}</option>
                          <option value={t('تم التسليم', 'Delivered')}>{t('تم التسليم', 'Delivered')}</option>
                          <option value={t('ملغي', 'Cancelled')}>{t('ملغي', 'Cancelled')}</option>
                          <option value={t('مرتجع', 'Returned')}>{t('مرتجع', 'Returned')}</option>
                        </select>
                        <select
                          disabled={user.role === 'call_center'}
                          value={ord.packerStatus}
                          onChange={(e) => setOrders(orders.map(o => o.id === ord.id ? { ...o, packerStatus: e.target.value } : o))}
                          className="px-3 py-1 border rounded bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value={t('لم يتم التجهيز', 'Not prepared')}>{t('لم يتم التجهيز', 'Not prepared')}</option>
                          <option value={t('تم التجهيز', 'Prepared')}>{t('تم التجهيز', 'Prepared')}</option>
                          <option value={t('تم التسليم لشركة الشحن', 'Handed to courier')}>{t('تم التسليم لشركة الشحن', 'Handed to courier')}</option>
                        </select>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}

            {/* ===== تبويب المنتجات ===== */}
            {adminTab === 'products' && user.role === 'admin' && (
              <div className="space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                    <div>
                      <h2 className="text-2xl font-bold">{t('إدارة المنتجات', 'Product Management')}</h2>
                      <p className="text-gray-500 text-sm mt-1">{t('اختر منتج من القائمة لتعديله، أو أضف منتج جديد.', 'Select a product from the list to edit it, or add a new one.')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={exportCatalog}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition"
                      >
                        📥 {t('تصدير الكتالوج (CSV لميتا)', 'Export Catalog (CSV for Meta)')}
                      </button>
                      {productManagerMode === 'closed' && (
                        <button
                          onClick={openAddProduct}
                          className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition"
                        >
                          ＋ {t('إضافة منتج جديد', 'Add New Product')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ===================================================== */}
                {/* حالة القائمة: مفيش منتج مختار — لازم اختيار صريح من الأدمن */}
                {/* ===================================================== */}
                {productManagerMode === 'closed' && (() => {
                  const q = adminProductSearch.trim().toLowerCase();
                  const matchesSearch = (p) => {
                    if (!q) return true;
                    const nameAr = (p.name?.ar || '').toLowerCase();
                    const nameEn = (p.name?.en || '').toLowerCase();
                    const skus = getVariants(p).flatMap(v => Object.values(v.sizeStock || {}).map(s => (s.sku || '').toLowerCase()));
                    const cat = (getLocalized(p.category) || '').toLowerCase();
                    return nameAr.includes(q) || nameEn.includes(q) || cat.includes(q) || skus.some(s => s.includes(q));
                  };
                  const matchesFilter = (p) => {
                    const vis = p.visibility || 'published';
                    const stockStatus = getProductStockStatus(p);
                    switch (adminProductFilter) {
                      case 'published': return vis === 'published';
                      case 'hidden': return vis === 'hidden';
                      case 'draft': return vis === 'draft';
                      case 'in_stock': return stockStatus === 'in';
                      case 'low_stock': return stockStatus === 'low';
                      case 'out_of_stock': return stockStatus === 'out';
                      case 'featured': return !!p.isFeatured;
                      case 'on_sale': return !!p.onSale;
                      default: return true;
                    }
                  };
                  const visibleList = products.filter(p => matchesSearch(p) && matchesFilter(p));
                  const filterOptions = [
                    { key: 'all', label: t('الكل', 'All') },
                    { key: 'published', label: t('منشور', 'Published') },
                    { key: 'hidden', label: t('مخفي', 'Hidden') },
                    { key: 'draft', label: t('مسودة', 'Draft') },
                    { key: 'in_stock', label: t('متوفر', 'In Stock') },
                    { key: 'low_stock', label: t('مخزون منخفض', 'Low Stock') },
                    { key: 'out_of_stock', label: t('غير متوفر', 'Out of Stock') },
                    { key: 'featured', label: t('مميز', 'Featured') },
                    { key: 'on_sale', label: t('عرض', 'On Sale') },
                  ];
                  return (
                    <div className="bg-white p-6 md:p-8 rounded-xl shadow-md space-y-5">
                      <div className="flex flex-col md:flex-row gap-3 md:items-center">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={adminProductSearch}
                            onChange={(e) => setAdminProductSearch(e.target.value)}
                            placeholder={t('ابحث بالاسم أو SKU أو القسم...', 'Search by name, SKU, or category...')}
                            className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {filterOptions.map(f => (
                          <button
                            key={f.key}
                            onClick={() => setAdminProductFilter(f.key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${adminProductFilter === f.key ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      {products.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                          <div className="text-4xl mb-3">📦</div>
                          <p className="font-bold text-gray-500">{t('لا يوجد منتجات بعد.', 'No products yet.')}</p>
                          <p className="text-sm mt-1">{t('اضغط "إضافة منتج جديد" للبدء.', 'Click "Add New Product" to get started.')}</p>
                        </div>
                      ) : visibleList.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                          <div className="text-4xl mb-3">🔍</div>
                          <p className="font-bold text-gray-500">{t('مفيش منتجات مطابقة للبحث/الفلتر.', 'No products match your search or filter.')}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {visibleList.map(prod => {
                            const stockStatus = getProductStockStatus(prod);
                            const visibility = prod.visibility || 'published';
                            const firstSku = getVariants(prod).flatMap(v => Object.values(v.sizeStock || {})).map(s => s.sku)[0];
                            return (
                              <div key={prod.id} className="border rounded-lg bg-gray-50 hover:shadow-md transition overflow-hidden group">
                                <div className="cursor-pointer" onClick={() => openEditProduct(prod)}>
                                  <div className="relative">
                                    <img src={prod.images?.[0]} alt="" className="w-full h-40 object-cover" />
                                    <span className={`absolute top-1.5 start-1.5 text-[10px] font-bold px-2 py-0.5 rounded text-white ${stockStatus === 'out' ? 'bg-red-600' : stockStatus === 'low' ? 'bg-orange-500' : 'bg-green-600'}`}>
                                      {stockStatus === 'out' ? `🔴 ${t('غير متوفر', 'Out of Stock')}` : stockStatus === 'low' ? `🟡 ${t('مخزون منخفض', 'Low Stock')}` : `🟢 ${t('متوفر', 'In Stock')}`}
                                    </span>
                                    <span className={`absolute top-1.5 end-1.5 text-[10px] font-bold px-2 py-0.5 rounded text-white ${visibility === 'published' ? 'bg-green-700' : visibility === 'draft' ? 'bg-yellow-600' : 'bg-gray-500'}`}>
                                      {visibility === 'published' ? `🟢 ${t('منشور', 'Published')}` : visibility === 'draft' ? `🟡 ${t('مسودة', 'Draft')}` : `⚪ ${t('مخفي', 'Hidden')}`}
                                    </span>
                                  </div>
                                  <div className="p-3">
                                    <h4 className="font-bold truncate">{getLocalized(prod.name)}</h4>
                                    <p className="text-xs text-gray-400 truncate">{getLocalized(prod.category) || t('بدون قسم', 'No category')}{firstSku ? ` · SKU: ${firstSku}` : ''}</p>
                                    {prod.onSale && prod.salePrice ? (
                                      <p className="text-sm mt-1"><span className="line-through text-gray-400 me-2">{prod.price} {t('ج.م', 'EGP')}</span><span className="text-red-600 font-bold">{prod.salePrice} {t('ج.م', 'EGP')}</span></p>
                                    ) : (
                                      <p className="text-sm text-gray-600 mt-1">{prod.price} {t('ج.م', 'EGP')}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="px-3 pb-3 flex flex-wrap gap-1.5 border-t pt-2">
                                  <button onClick={() => openEditProduct(prod)} className="text-xs font-bold px-2.5 py-1 rounded bg-white border hover:bg-gray-100">✏️ {t('تعديل', 'Edit')}</button>
                                  <button
                                    onClick={() => setProductVisibility(prod.id, visibility === 'published' ? 'hidden' : 'published')}
                                    className="text-xs font-bold px-2.5 py-1 rounded bg-white border hover:bg-gray-100"
                                  >{visibility === 'published' ? `🙈 ${t('إخفاء', 'Hide')}` : `👁️ ${t('إظهار', 'Show')}`}</button>
                                  <button onClick={() => duplicateProduct(prod)} className="text-xs font-bold px-2.5 py-1 rounded bg-white border hover:bg-gray-100">🧬 {t('نسخ', 'Duplicate')}</button>
                                  <button onClick={() => openProductDetails(prod)} className="text-xs font-bold px-2.5 py-1 rounded bg-white border hover:bg-gray-100">🔗 {t('عرض', 'View')}</button>
                                  <button onClick={() => setConfirmDeleteProductId(prod.id)} className="text-xs font-bold px-2.5 py-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 ms-auto">🗑️ {t('حذف', 'Delete')}</button>
                                </div>
                                {confirmDeleteProductId === prod.id && (
                                  <div className="p-3 bg-red-50 border-t border-red-200 text-xs">
                                    <p className="font-bold text-red-700 mb-2">{t('متأكد إنك عايز تحذف المنتج ده؟ الإجراء ده لا يمكن التراجع عنه.', 'Delete this product? This action cannot be undone.')}</p>
                                    <div className="flex gap-2">
                                      <button onClick={() => deleteProduct(prod.id)} className="bg-red-600 text-white px-3 py-1 rounded font-bold">{t('تأكيد الحذف', 'Confirm Delete')}</button>
                                      <button onClick={() => setConfirmDeleteProductId(null)} className="bg-white border px-3 py-1 rounded font-bold">{t('إلغاء', 'Cancel')}</button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ===================================================== */}
                {/* محرر المنتج: يظهر فقط بعد اختيار/إضافة صريح */}
                {/* ===================================================== */}
                {(productManagerMode === 'add' || productManagerMode === 'edit') && (() => {
                  const editorTabs = [
                    { key: 'basic', label: t('البيانات الأساسية', 'Basic Information'), icon: '📝' },
                    { key: 'media', label: t('الوسائط', 'Media'), icon: '🖼️' },
                    { key: 'variants', label: t('الألوان والمقاسات', 'Variants'), icon: '🎨' },
                    { key: 'inventory', label: t('المخزون', 'Inventory'), icon: '📦' },
                    { key: 'visibility', label: t('الظهور', 'Visibility'), icon: '👁️' },
                    { key: 'marketing', label: t('التسويق', 'Marketing'), icon: '📣' },
                    { key: 'seo', label: t('تحسين محركات البحث', 'SEO'), icon: '🔎' },
                    { key: 'offers', label: t('عروض المنتج', 'Product Offers'), icon: '🎁' },
                  ];
                  const editingProduct = productManagerMode === 'edit' ? products.find(p => p.id === selectedManagedProductId) : null;
                  return (
                    <form onSubmit={handleSaveProduct} className="bg-white rounded-xl shadow-md overflow-hidden">
                      {/* ===== شريط علوي: رجوع + اسم المنتج + حفظ ===== */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-4 md:p-6 border-b bg-gray-50">
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => closeProductEditor(false)} className="text-gray-500 hover:text-black font-bold flex items-center gap-1.5">
                            {language === 'ar' ? '→' : '←'} {t('رجوع للقائمة', 'Back to list')}
                          </button>
                          <span className="text-gray-300">|</span>
                          <h3 className="font-extrabold text-lg">
                            {productManagerMode === 'add' ? t('إضافة منتج جديد', 'Add New Product') : `${t('تعديل:', 'Editing:')} ${getLocalized(editingProduct?.name) || ''}`}
                          </h3>
                          {productEditorDirty && (
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">{t('تعديلات غير محفوظة', 'Unsaved changes')}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => closeProductEditor(false)} className="bg-white border px-4 py-2 rounded-lg font-bold text-sm">{t('إلغاء', 'Cancel')}</button>
                          <button type="submit" className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-bold text-sm">
                            {productManagerMode === 'add' ? t('إضافة المنتج', 'Add Product') : t('حفظ التغييرات', 'Save Changes')}
                          </button>
                        </div>
                      </div>

                      {/* ===== تبويبات المحرر ===== */}
                      <div className="flex flex-wrap gap-1.5 p-3 md:px-6 bg-gray-50 border-b overflow-x-auto">
                        {editorTabs.map(tab => (
                          <button
                            key={tab.key}
                            type="button"
                            onClick={() => setProductEditorTab(tab.key)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap flex items-center gap-1 ${productEditorTab === tab.key ? 'bg-black text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}
                          >
                            {tab.icon} {tab.label}
                          </button>
                        ))}
                      </div>

                      <div className="p-4 md:p-8 space-y-6">
                        {/* ===== البيانات الأساسية ===== */}
                        {productEditorTab === 'basic' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputField label={`${t('اسم المنتج', 'Product Name')} (${t('عربي', 'Arabic')})`} type="text" value={newProdNameAr} onChange={(e) => setNewProdNameAr(e.target.value)} id="newProdNameAr" />
                              <InputField label={`${t('اسم المنتج', 'Product Name')} (English)`} type="text" value={newProdNameEn} onChange={(e) => setNewProdNameEn(e.target.value)} id="newProdNameEn" />
                              <div>
                                <label className="block text-sm font-semibold mb-1">{t('القسم', 'Category')}</label>
                                <select value={newProdCat} onChange={(e) => setNewProdCat(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white">
                                  <option value="">{t('اختر القسم', 'Select category')}</option>
                                  {categories.map(c => <option key={c.id} value={getLocalized(c.name)}>{getLocalized(c.name)}</option>)}
                                </select>
                              </div>
                              <InputField label={t('سعر البيع', 'Selling Price')} type="number" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} required={true} id="newProdPrice" />
                              <InputField label={t('تكلفة القطعة', 'Cost per Item')} type="number" value={newProdCost} onChange={(e) => setNewProdCost(e.target.value)} required={true} id="newProdCost" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <TextareaField label={`${t('الوصف', 'Description')} (${t('عربي', 'Arabic')})`} value={newProdDescAr} onChange={(e) => setNewProdDescAr(e.target.value)} rows={3} id="newProdDescAr" />
                              <TextareaField label={`${t('الوصف', 'Description')} (English)`} value={newProdDescEn} onChange={(e) => setNewProdDescEn(e.target.value)} rows={3} id="newProdDescEn" />
                            </div>
                          </div>
                        )}

                        {/* ===== الوسائط (صور عامة للمنتج) ===== */}
                        {productEditorTab === 'media' && (
                          <div className="space-y-3">
                            <label className="block font-semibold mb-1 text-sm">{t('رفع صور المنتج العامة', 'Upload general product images')}</label>
                            <p className="text-xs text-gray-400">{t('دي الصور الافتراضية. لو عايز صور مخصصة لكل لون، ضيفها من تبويب "الألوان والمقاسات".', 'These are the default images. For color-specific images, add them in the "Variants" tab.')}</p>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleProductImageUpload}
                              className="w-full text-sm border rounded-lg px-3 py-2 bg-white file:me-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-black file:text-white file:font-bold file:cursor-pointer"
                            />
                            {newProdImageFiles.length > 0 ? (
                              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {newProdImageFiles.map((img, index) => (
                                  <div
                                    key={img.id}
                                    draggable
                                    onDragStart={() => handleImageDragStart(img.id)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleImageDrop(img.id)}
                                    className={`relative border-2 rounded-lg overflow-hidden cursor-move bg-white ${index === 0 ? 'border-black' : 'border-gray-200'}`}
                                  >
                                    <img src={img.dataUrl} alt={img.name} className="w-full h-20 object-cover" />
                                    {index === 0 && (
                                      <span className="absolute top-1 start-1 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{t('أساسية', 'Primary')}</span>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 px-1 py-0.5">
                                      {index !== 0 && (
                                        <button
                                          type="button"
                                          onClick={() => setProductImageAsPrimary(img.id)}
                                          className="text-white text-[10px] font-bold hover:underline"
                                          title={t('تعيين كصورة أساسية', 'Set as primary')}
                                        >★</button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => removeProductImage(img.id)}
                                        className="text-red-400 text-[10px] font-bold hover:underline ms-auto"
                                        title={t('حذف', 'Remove')}
                                      >✕</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic py-4 text-center border rounded-lg bg-gray-50">{t('لا يوجد صور مضافة بعد.', 'No images added yet.')}</p>
                            )}
                            <p className="text-xs text-gray-400">{t('اسحب وأفلت الصور لإعادة ترتيبها، واضغط ★ لتعيين الصورة الأساسية.', 'Drag & drop to reorder, click ★ to set the primary image.')}</p>
                            <TextareaField label={t('أو روابط الصور (كل رابط في سطر) — تُستخدم فقط لو مفيش صور مرفوعة', 'Or Image URLs (one per line) — used only if no images were uploaded')} value={newProdImgs} onChange={(e) => setNewProdImgs(e.target.value)} placeholder="https://..." rows={3} id="newProdImgs" />
                          </div>
                        )}

                        {/* ===== الألوان والمقاسات (فاريانتس) ===== */}
                        {productEditorTab === 'variants' && (
                          <div className="space-y-6">
                            {/* ----- المقاسات ----- */}
                            <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                              <div className="flex items-center gap-3">
                                <input type="checkbox" id="newProdHasSizes" checked={newProdHasSizes} onChange={(e) => { setNewProdHasSizes(e.target.checked); setNewProdVariantsGenerated(null); }} className="w-5 h-5" />
                                <label htmlFor="newProdHasSizes" className="font-bold cursor-pointer">{t('هل المنتج له مقاسات؟', 'Has sizes?')}</label>
                              </div>
                              {newProdHasSizes && (
                                <>
                                  <div className="flex flex-wrap gap-4">
                                    {AVAILABLE_SIZE_OPTIONS.map(size => (
                                      <label key={size} className="flex items-center gap-1.5 text-sm cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={newProdSelectedSizes.includes(size)}
                                          onChange={(e) => {
                                            setNewProdSelectedSizes(prev => e.target.checked ? [...prev, size] : prev.filter(s => s !== size));
                                            setNewProdVariantsGenerated(null);
                                          }}
                                        />
                                        {size}
                                      </label>
                                    ))}
                                  </div>
                                  <div className="flex gap-2 items-end">
                                    <InputField label={t('مقاس مخصص', 'Custom size')} value={newProdCustomSize} onChange={(e) => setNewProdCustomSize(e.target.value)} placeholder={t('مثال: 42', 'e.g. 42')} id="newProdCustomSize" className="flex-1" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const v = newProdCustomSize.trim();
                                        if (v && !newProdSelectedSizes.includes(v)) {
                                          setNewProdSelectedSizes(prev => [...prev, v]);
                                          setNewProdVariantsGenerated(null);
                                        }
                                        setNewProdCustomSize('');
                                      }}
                                      className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm"
                                    >{t('إضافة مقاس', 'Add size')}</button>
                                  </div>
                                  {newProdSelectedSizes.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {newProdSelectedSizes.map(size => (
                                        <span key={size} className="bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                                          {size}
                                          <button type="button" onClick={() => { setNewProdSelectedSizes(prev => prev.filter(s => s !== size)); setNewProdVariantsGenerated(null); }} className="hover:text-red-400">✕</button>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {/* ----- الألوان ----- */}
                            <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                              <div className="flex items-center gap-3">
                                <input type="checkbox" id="newProdHasColors" checked={newProdHasColors} onChange={(e) => { setNewProdHasColors(e.target.checked); setNewProdVariantsGenerated(null); }} className="w-5 h-5" />
                                <label htmlFor="newProdHasColors" className="font-bold cursor-pointer">{t('هل المنتج له ألوان؟', 'Has colors?')}</label>
                              </div>
                              {newProdHasColors && (
                                <>
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                    <InputField label={t('اسم اللون (عربي)', 'Color name (Arabic)')} value={newProdColorNameAr} onChange={(e) => setNewProdColorNameAr(e.target.value)} id="newProdColorNameAr" />
                                    <InputField label={t('اسم اللون (إنجليزي)', 'Color name (English)')} value={newProdColorNameEn} onChange={(e) => setNewProdColorNameEn(e.target.value)} id="newProdColorNameEn" />
                                    <div>
                                      <label className="block text-sm font-semibold mb-1">{t('اللون', 'Color')}</label>
                                      <input type="color" value={newProdColorHex} onChange={(e) => setNewProdColorHex(e.target.value)} className="w-full h-10 border rounded-lg cursor-pointer" />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!newProdColorNameAr.trim() && !newProdColorNameEn.trim()) {
                                          showToast(t('من فضلك ادخل اسم اللون', 'Please enter a color name'));
                                          return;
                                        }
                                        setNewProdColors(prev => [...prev, { id: `c${Date.now()}`, nameAr: newProdColorNameAr.trim(), nameEn: newProdColorNameEn.trim(), hex: newProdColorHex }]);
                                        setNewProdColorNameAr(''); setNewProdColorNameEn(''); setNewProdColorHex('#000000');
                                        setNewProdVariantsGenerated(null);
                                      }}
                                      className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm h-10"
                                    >{t('إضافة لون', 'Add color')}</button>
                                  </div>

                                  {newProdColors.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">{t('هذا المنتج ليس له ألوان بعد.', 'This product has no colors yet.')}</p>
                                  ) : (
                                    <div className="space-y-4">
                                      {newProdColors.map(c => {
                                        const colorImgs = newProdColorImages[c.id] || [];
                                        return (
                                          <div key={c.id} className="bg-white border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                              <div className="flex items-center gap-2 font-bold">
                                                <span className="w-5 h-5 rounded-full border inline-block" style={{ backgroundColor: c.hex }}></span>
                                                {c.nameAr || c.nameEn || c.hex}
                                              </div>
                                              <button type="button" onClick={() => { setNewProdColors(prev => prev.filter(x => x.id !== c.id)); setNewProdColorImages(prev => { const n = { ...prev }; delete n[c.id]; return n; }); setNewProdVariantsGenerated(null); }} className="text-red-500 hover:text-red-700 text-sm font-bold">✕ {t('حذف اللون', 'Remove color')}</button>
                                            </div>

                                            <div>
                                              <label className="block text-xs font-bold text-gray-500 mb-1.5">{t('صور هذا اللون', 'Images for this color')}</label>
                                              <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => { handleColorImageUpload(c.id, e.target.files); e.target.value = ''; }}
                                                className="w-full text-sm border rounded-lg px-3 py-2 bg-white file:me-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-800 file:text-white file:font-bold file:cursor-pointer"
                                              />
                                              {colorImgs.length === 0 ? (
                                                <p className="text-xs text-gray-400 italic mt-2">{t('لا يوجد صور مضافة لهذا اللون بعد.', 'No images added for this color.')}</p>
                                              ) : (
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 mt-2.5">
                                                  {colorImgs.map((img, index) => (
                                                    <div
                                                      key={img.id}
                                                      draggable
                                                      onDragStart={() => handleColorImageDragStart(c.id, img.id)}
                                                      onDragOver={(e) => e.preventDefault()}
                                                      onDrop={() => handleColorImageDrop(c.id, img.id)}
                                                      className={`relative border-2 rounded-lg overflow-hidden cursor-move bg-white ${index === 0 ? 'border-black' : 'border-gray-200'}`}
                                                    >
                                                      <img src={img.dataUrl} alt={img.name} className="w-full h-16 object-cover" />
                                                      {index === 0 && (
                                                        <span className="absolute top-0.5 start-0.5 bg-black text-white text-[9px] font-bold px-1 py-0.5 rounded">{t('أساسية', 'Primary')}</span>
                                                      )}
                                                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-1 py-0.5 gap-0.5">
                                                        <button type="button" onClick={() => moveColorImage(c.id, img.id, 'left')} className="text-white text-[9px] font-bold" title={t('لليسار', 'Move left')}>◂</button>
                                                        {index !== 0 && (
                                                          <button type="button" onClick={() => setColorImageAsPrimary(c.id, img.id)} className="text-white text-[9px] font-bold" title={t('تعيين كأساسية', 'Set as primary')}>★</button>
                                                        )}
                                                        <button type="button" onClick={() => moveColorImage(c.id, img.id, 'right')} className="text-white text-[9px] font-bold" title={t('لليمين', 'Move right')}>▸</button>
                                                        <button type="button" onClick={() => removeColorImage(c.id, img.id)} className="text-red-400 text-[9px] font-bold" title={t('حذف', 'Remove')}>✕</button>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {/* ----- توليد الفاريانتس ----- */}
                            <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                              <button type="button" onClick={generateVariantsPreview} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm">
                                🔄 {t('توليد الفاريانتس (لون × مقاس) وضبط المخزون', 'Generate Variants (color × size) & set stock')}
                              </button>
                              {newProdVariantsGenerated && newProdVariantsGenerated.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm border-collapse">
                                    <thead>
                                      <tr className="bg-gray-200 text-left">
                                        {newProdHasColors && <th className="px-2 py-1.5">{t('اللون', 'Color')}</th>}
                                        <th className="px-2 py-1.5">{t('المقاس', 'Size')}</th>
                                        <th className="px-2 py-1.5">SKU</th>
                                        <th className="px-2 py-1.5">{t('المخزون', 'Stock')}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {newProdVariantsGenerated.map(combo => {
                                        const entry = newProdVariantStockInputs[combo.key] || { sku: '', stock: 0 };
                                        return (
                                          <tr key={combo.key} className="border-b bg-white">
                                            {newProdHasColors && (
                                              <td className="px-2 py-1.5 flex items-center gap-2">
                                                {combo.hex && <span className="w-3.5 h-3.5 rounded-full border inline-block" style={{ backgroundColor: combo.hex }}></span>}
                                                {combo.colorLabel}
                                              </td>
                                            )}
                                            <td className="px-2 py-1.5">{combo.size}</td>
                                            <td className="px-2 py-1.5">
                                              <input
                                                type="text"
                                                value={entry.sku}
                                                onChange={(e) => setNewProdVariantStockInputs(prev => ({ ...prev, [combo.key]: { ...prev[combo.key], sku: e.target.value } }))}
                                                className="w-32 px-2 py-1 border rounded"
                                              />
                                            </td>
                                            <td className="px-2 py-1.5">
                                              <input
                                                type="number"
                                                min="0"
                                                value={entry.stock}
                                                onChange={(e) => setNewProdVariantStockInputs(prev => ({ ...prev, [combo.key]: { ...prev[combo.key], stock: Math.max(0, Number(e.target.value) || 0) } }))}
                                                className="w-24 px-2 py-1 border rounded"
                                              />
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400 italic">{t('لا يوجد فاريانتس تم توليدها بعد.', 'No variants created yet.')}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* ===== المخزون ===== */}
                        {productEditorTab === 'inventory' && (
                          <div className="space-y-4">
                            <InputField label={t('حد التنبيه للمخزون المنخفض (اختياري)', 'Low stock threshold (optional)')} type="number" value={newProdLowStockThreshold} onChange={(e) => setNewProdLowStockThreshold(e.target.value)} placeholder={String(adminSettings.current.defaultLowStockThreshold)} id="newProdLowStockThreshold" />
                            {newProdVariantsGenerated && newProdVariantsGenerated.length > 0 ? (
                              <div className="border-t pt-4">
                                <p className="text-sm font-bold text-gray-500 mb-2">{t('تعديل الكمية لكل خيار (لون / مقاس)', 'Adjust quantity for each color / size option')}</p>
                                <div className="space-y-1.5">
                                  {newProdVariantsGenerated.map(combo => {
                                    const entry = newProdVariantStockInputs[combo.key] || { sku: '', stock: 0 };
                                    const s = Math.max(0, Number(entry.stock) || 0);
                                    const threshold = newProdLowStockThreshold !== '' ? Number(newProdLowStockThreshold) : adminSettings.current.defaultLowStockThreshold;
                                    const status = s <= 0 ? t('غير متوفر', 'Out') : s <= threshold ? t('منخفض', 'Low') : t('متوفر', 'In Stock');
                                    const statusColor = s <= 0 ? 'text-red-600' : s <= threshold ? 'text-orange-500' : 'text-green-600';
                                    // كل تعديل هنا بيروح لنفس الـ state اللي تبويب "الألوان والمقاسات" وزرار "حفظ التغييرات" بيقروا منه -
                                    // مفيش مصدرين مختلفين للمخزون، وده اللي كان بيسبب رجوع الكمية لصفر بعد الحفظ.
                                    const setStock = (val) => {
                                      const clamped = Math.max(0, Math.floor(Number(val)) || 0);
                                      setNewProdVariantStockInputs(prev => ({ ...prev, [combo.key]: { ...(prev[combo.key] || {}), sku: (prev[combo.key] && prev[combo.key].sku) || entry.sku, stock: clamped } }));
                                      setProductEditorDirty(true);
                                    };
                                    return (
                                      <div key={combo.key} className="flex items-center gap-2 bg-gray-50 border rounded px-2 py-1.5 text-sm">
                                        {combo.hex && <span className="w-3 h-3 rounded-full border flex-shrink-0" style={{ backgroundColor: combo.hex }}></span>}
                                        <span className="flex-1 truncate">{combo.colorLabel ? `${combo.colorLabel} / ` : ''}{combo.size} <span className="text-gray-400">({entry.sku})</span></span>
                                        <button type="button" onClick={() => setStock(s - 1)} className="w-6 h-6 border rounded font-bold hover:bg-gray-100">−</button>
                                        <input
                                          type="number"
                                          min="0"
                                          value={s}
                                          onChange={(e) => setStock(e.target.value)}
                                          className="w-16 px-1 py-0.5 border rounded text-center"
                                        />
                                        <button type="button" onClick={() => setStock(s + 1)} className="w-6 h-6 border rounded font-bold hover:bg-gray-100">+</button>
                                        <span className={`font-bold ${statusColor} whitespace-nowrap text-xs`}>{status}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                                <p className="text-xs text-gray-500 font-semibold mt-3">{t('⚠️ الكميات هنا بتتحفظ فعلياً لما تدوس "حفظ التغييرات" تحت.', '⚠️ Quantities here are actually saved when you click "Save Changes" below.')}</p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">{t('اضبط الألوان والمقاسات أولاً من تبويب "الألوان والمقاسات" (وولّد الفاريانتس) عشان تظهر خيارات المخزون هنا.', 'Set up colors/sizes first in the "Variants" tab (and generate variants) so inventory options appear here.')}</p>
                            )}
                          </div>
                        )}

                        {/* ===== الظهور ===== */}
                        {productEditorTab === 'visibility' && (
                          <div className="space-y-3 max-w-md">
                            <label className="block text-sm font-semibold mb-1">{t('حالة الظهور', 'Visibility')}</label>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => setNewProdVisibility('published')} className={`flex-1 py-2.5 rounded-lg font-bold text-sm ${newProdVisibility === 'published' ? 'bg-green-600 text-white' : 'bg-gray-50 border text-gray-600'}`}>🟢 {t('منشور', 'Published')}</button>
                              <button type="button" onClick={() => setNewProdVisibility('hidden')} className={`flex-1 py-2.5 rounded-lg font-bold text-sm ${newProdVisibility === 'hidden' ? 'bg-gray-800 text-white' : 'bg-gray-50 border text-gray-600'}`}>⚪ {t('مخفي', 'Hidden')}</button>
                              <button type="button" onClick={() => setNewProdVisibility('draft')} className={`flex-1 py-2.5 rounded-lg font-bold text-sm ${newProdVisibility === 'draft' ? 'bg-yellow-600 text-white' : 'bg-gray-50 border text-gray-600'}`}>🟡 {t('مسودة', 'Draft')}</button>
                            </div>
                            <p className="text-xs text-gray-400 pt-2">
                              {t('منشور: يظهر للعملاء. مخفي: لا يظهر في المتجر. مسودة: غير جاهز للنشر بعد. الأدمن يقدر يدير المنتج في الحالتين.', 'Published: visible to customers. Hidden: not shown on the storefront. Draft: not ready yet. The admin can still manage hidden/draft products.')}
                            </p>
                          </div>
                        )}

                        {/* ===== التسويق ===== */}
                        {productEditorTab === 'marketing' && (
                          <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-lg border max-w-xl">
                            <div className="flex items-center gap-3">
                              <input type="checkbox" id="newProdOnSale" checked={newProdOnSale} onChange={(e) => setNewProdOnSale(e.target.checked)} className="w-5 h-5" />
                              <label htmlFor="newProdOnSale" className="font-bold cursor-pointer">{t('حط المنتج ده في العرض', 'Put on sale')}</label>
                              {newProdOnSale && (
                                <input type="number" placeholder={t('سعر العرض', 'Sale Price')} value={newProdSalePrice} onChange={(e) => setNewProdSalePrice(e.target.value)} className="px-3 py-1.5 border rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-black" />
                              )}
                            </div>
                            <div className="flex items-center gap-3 pt-2 border-t">
                              <input type="checkbox" id="newProdIsFeatured" checked={newProdIsFeatured} onChange={(e) => setNewProdIsFeatured(e.target.checked)} className="w-5 h-5" />
                              <label htmlFor="newProdIsFeatured" className="font-bold cursor-pointer text-blue-700">⭐ {t('عرض في قائمة "المنتجات المميزة" في الصفحة الرئيسية', 'Show in "Featured Products" on home page')}</label>
                            </div>
                            <div className="flex items-center gap-3 pt-2 border-t">
                              <input type="checkbox" id="newProdEnableRec" checked={newProdEnableRec} onChange={(e) => setNewProdEnableRec(e.target.checked)} className="w-5 h-5" />
                              <label htmlFor="newProdEnableRec" className="font-bold cursor-pointer text-blue-700">📌 {t('تفعيل عرض المنتجات المقترحة لهذا المنتج', 'Enable recommended products for this product')}</label>
                            </div>
                            <div className="flex items-center gap-3 pt-2 border-t">
                              <input type="checkbox" id="newProdEnableBundle" checked={newProdEnableBundle} onChange={(e) => setNewProdEnableBundle(e.target.checked)} className="w-5 h-5" />
                              <label htmlFor="newProdEnableBundle" className="font-bold cursor-pointer text-blue-700">🛒 {t('تفعيل عرض عروض الباقة لهذا المنتج', 'Enable bundle offers for this product')}</label>
                            </div>
                            <div className="flex items-center gap-3 pt-2 border-t">
                              <input type="checkbox" id="newProdEnableReviews" checked={newProdEnableReviews} onChange={(e) => setNewProdEnableReviews(e.target.checked)} className="w-5 h-5" />
                              <label htmlFor="newProdEnableReviews" className="font-bold cursor-pointer text-blue-700">⭐ {t('تفعيل التقييمات والمراجعات لهذا المنتج', 'Enable reviews & ratings for this product')}</label>
                            </div>
                          </div>
                        )}

                        {/* ===== SEO ===== */}
                        {productEditorTab === 'seo' && (
                          <div className="space-y-4 max-w-2xl">
                            <InputField label={t('الرابط المختصر (Slug)', 'Slug')} value={newProdSlug} onChange={(e) => setNewProdSlug(e.target.value)} placeholder="classic-tshirt-black" id="newProdSlug" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputField label={`Meta Title (${t('عربي', 'Arabic')})`} value={newProdMetaTitleAr} onChange={(e) => setNewProdMetaTitleAr(e.target.value)} id="newProdMetaTitleAr" />
                              <InputField label="Meta Title (English)" value={newProdMetaTitleEn} onChange={(e) => setNewProdMetaTitleEn(e.target.value)} id="newProdMetaTitleEn" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <TextareaField label={`Meta Description (${t('عربي', 'Arabic')})`} value={newProdMetaDescAr} onChange={(e) => setNewProdMetaDescAr(e.target.value)} rows={2} id="newProdMetaDescAr" />
                              <TextareaField label="Meta Description (English)" value={newProdMetaDescEn} onChange={(e) => setNewProdMetaDescEn(e.target.value)} rows={2} id="newProdMetaDescEn" />
                            </div>
                          </div>
                        )}

                        {/* ===== عروض المنتج المتعددة (Product Offers) - جزء 1-8 ===== */}
                        {productEditorTab === 'offers' && (
                          <div className="max-w-2xl space-y-5">
                            {!editingProduct ? (
                              <p className="text-sm text-gray-500 bg-gray-50 border border-dashed rounded-lg p-6 text-center">
                                {t('احفظ المنتج أولاً عشان تقدر تضيف له عروضاً.', 'Please save the product first before adding offers to it.')}
                              </p>
                            ) : (() => {
                              const offers = Array.isArray(editingProduct.offers) ? editingProduct.offers : [];
                              const hasCampaignOverlap = promotions.some(pr => isPromotionCurrentlyActive(pr) && (
                                (pr.target === 'product' && pr.productId === editingProduct.id) ||
                                (pr.target === 'category' && pr.categoryId === getProductCategoryId(editingProduct)) ||
                                pr.target === 'all'
                              ));

                              const resetProductOfferForm = () => {
                                setEditingProductOfferId(null);
                                setPoName('');
                                setPoType('quantity_discount');
                                setPoMinQty(2);
                                setPoDiscountPercent(10);
                                setPoFixedAmount(50);
                                setPoBuyQty(2);
                                setPoFreeQty(1);
                                setPoActive(true);
                                setProductOfferFormOpen(false);
                              };

                              const openNewProductOfferForm = () => {
                                resetProductOfferForm();
                                setProductOfferFormOpen(true);
                              };

                              const openEditProductOfferForm = (o) => {
                                setEditingProductOfferId(o.id);
                                setPoName(o.name || '');
                                setPoType(o.type);
                                setPoMinQty(o.minQty ?? 2);
                                setPoDiscountPercent(o.discountPercent ?? 10);
                                setPoFixedAmount(o.fixedAmount ?? 50);
                                setPoBuyQty(o.buyQty ?? 2);
                                setPoFreeQty(o.freeQty ?? 1);
                                setPoActive(o.active !== false);
                                setProductOfferFormOpen(true);
                              };

                              const saveProductOffer = () => {
                                const offerData = {
                                  id: editingProductOfferId || `po-${Date.now()}`,
                                  name: poName.trim(),
                                  type: poType,
                                  minQty: Number(poMinQty) || 1,
                                  discountPercent: Number(poDiscountPercent) || 0,
                                  percentage: Number(poDiscountPercent) || 0,
                                  fixedAmount: Number(poFixedAmount) || 0,
                                  buyQty: Number(poBuyQty) || 0,
                                  freeQty: Number(poFreeQty) || 0,
                                  active: poActive,
                                };
                                setProducts(prev => prev.map(p => {
                                  if (p.id !== editingProduct.id) return p;
                                  const existing = Array.isArray(p.offers) ? p.offers : [];
                                  const nextOffers = editingProductOfferId
                                    ? existing.map(o => o.id === editingProductOfferId ? offerData : o)
                                    : [...existing, offerData];
                                  return { ...p, offers: nextOffers };
                                }));
                                resetProductOfferForm();
                              };

                              const toggleProductOfferActive = (offerId) => {
                                setProducts(prev => prev.map(p => p.id !== editingProduct.id ? p : {
                                  ...p,
                                  offers: (p.offers || []).map(o => o.id === offerId ? { ...o, active: !o.active } : o),
                                }));
                              };

                              const deleteProductOffer = (offerId) => {
                                setProducts(prev => prev.map(p => p.id !== editingProduct.id ? p : {
                                  ...p,
                                  offers: (p.offers || []).filter(o => o.id !== offerId),
                                }));
                              };

                              return (
                                <>
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold">{t('عروض المنتج', 'Product Offers')}</h3>
                                    {!productOfferFormOpen && (
                                      <button type="button" onClick={openNewProductOfferForm} className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800">
                                        + {t('إضافة عرض', 'Add Offer')}
                                      </button>
                                    )}
                                  </div>

                                  {hasCampaignOverlap && (
                                    <p className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                      ⚠️ {t('في عرض حملة (Campaign) شغال كمان بيغطي المنتج ده. عروض المنتج دي هتاخد الأولوية دايماً ولن تتراكم العروض.', 'There is also an active campaign promotion covering this product. These product offers always take priority — offers never stack.')}
                                    </p>
                                  )}

                                  {!productOfferFormOpen && offers.length === 0 && (
                                    <p className="text-sm text-gray-500 bg-gray-50 border border-dashed rounded-lg p-6 text-center">
                                      {t('لا يوجد عروض مضافة لهذا المنتج.', 'No product offers configured.')}
                                    </p>
                                  )}

                                  {!productOfferFormOpen && offers.length > 0 && (
                                    <div className="space-y-3">
                                      {offers.slice().sort((a, b) => getProductOfferThreshold(a) - getProductOfferThreshold(b)).map((o, idx) => (
                                        <div key={o.id} className="border rounded-lg p-4 bg-white space-y-2">
                                          <div className="flex items-center justify-between">
                                            <p className="font-bold text-gray-800">{t('عرض', 'Offer')} #{idx + 1}{o.name ? ` — ${o.name}` : ''}</p>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${o.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                              {o.active ? t('نشط', 'ACTIVE') : t('غير نشط', 'INACTIVE')}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-600">{getLocalized(getPromotionLabel(o))}</p>
                                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                            <p>{t('الحد الأدنى للكمية', 'Minimum Quantity')}: {o.type === 'bxgy' ? o.buyQty : o.minQty}</p>
                                            <p>
                                              {o.type === 'percentage' || o.type === 'quantity_discount' ? `${t('الخصم', 'Discount')}: ${o.discountPercent}%` : ''}
                                              {o.type === 'fixed' ? `${t('الخصم', 'Discount')}: ${o.fixedAmount} ${t('ج.م', 'EGP')}` : ''}
                                              {o.type === 'bxgy' ? `${t('مجاناً', 'Free')}: ${o.freeQty}` : ''}
                                            </p>
                                          </div>
                                          <div className="flex gap-2 pt-2 border-t">
                                            <button type="button" onClick={() => openEditProductOfferForm(o)} className="text-xs font-bold px-3 py-1.5 rounded-lg border hover:bg-gray-50">
                                              {t('تعديل', 'Edit')}
                                            </button>
                                            <button type="button" onClick={() => toggleProductOfferActive(o.id)} className="text-xs font-bold px-3 py-1.5 rounded-lg border hover:bg-gray-50">
                                              {o.active ? t('تعطيل', 'Disable') : t('تفعيل', 'Enable')}
                                            </button>
                                            <button type="button" onClick={() => deleteProductOffer(o.id)} className="text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                                              {t('حذف', 'Delete')}
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {productOfferFormOpen && (
                                    <div className="border rounded-lg p-5 bg-gray-50 space-y-4">
                                      <InputField label={t('اسم العرض', 'Offer Name')} type="text" value={poName} onChange={(e) => setPoName(e.target.value)} id="poName" placeholder={t('اختياري', 'Optional')} />

                                      <div>
                                        <label className="block font-semibold mb-2 text-sm">{t('نوع العرض', 'Offer Type')}</label>
                                        <div className="flex gap-2 flex-wrap">
                                          {[
                                            { key: 'percentage', label: t('خصم نسبة %', 'Percentage Discount') },
                                            { key: 'fixed', label: t('خصم مبلغ ثابت', 'Fixed Amount Discount') },
                                            { key: 'bxgy', label: t('اشترِ X واحصل على Y مجاناً', 'Buy X Get Y Free') },
                                            { key: 'quantity_discount', label: t('خصم كمية', 'Quantity Discount') },
                                          ].map(opt => (
                                            <button
                                              key={opt.key}
                                              type="button"
                                              onClick={() => setPoType(opt.key)}
                                              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${poType === opt.key ? 'bg-black text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}
                                            >
                                              {opt.label}
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      {poType === 'bxgy' ? (
                                        <div className="grid grid-cols-2 gap-4">
                                          <InputField label={t('اشترِ (Buy)', 'Buy Quantity')} type="number" value={poBuyQty} onChange={(e) => setPoBuyQty(e.target.value)} id="poBuyQty" />
                                          <InputField label={t('احصل مجاناً على (Free)', 'Free Quantity')} type="number" value={poFreeQty} onChange={(e) => setPoFreeQty(e.target.value)} id="poFreeQty" />
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                          <InputField label={t('الحد الأدنى للكمية', 'Minimum Quantity')} type="number" value={poMinQty} onChange={(e) => setPoMinQty(e.target.value)} id="poMinQty" />
                                          {poType === 'fixed' ? (
                                            <InputField label={t('الخصم الثابت', 'Fixed Discount')} type="number" value={poFixedAmount} onChange={(e) => setPoFixedAmount(e.target.value)} id="poFixedAmount" />
                                          ) : (
                                            <InputField label={t('نسبة الخصم (%)', 'Discount Percentage')} type="number" value={poDiscountPercent} onChange={(e) => setPoDiscountPercent(e.target.value)} id="poDiscountPercent" />
                                          )}
                                        </div>
                                      )}

                                      <p className="text-xs text-gray-500 bg-white p-3 rounded-lg border">
                                        {getLocalized(getPromotionLabel({ type: poType, buyQty: Number(poBuyQty) || 0, freeQty: Number(poFreeQty) || 0, minQty: Number(poMinQty) || 1, discountPercent: Number(poDiscountPercent) || 0, percentage: Number(poDiscountPercent) || 0, fixedAmount: Number(poFixedAmount) || 0 }))}
                                      </p>

                                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                        <label className="font-bold cursor-pointer text-sm">{t('الحالة', 'Status')}</label>
                                        <button
                                          type="button"
                                          role="switch"
                                          aria-checked={poActive}
                                          onClick={() => setPoActive(!poActive)}
                                          className={`w-14 h-8 rounded-full relative transition-colors ${poActive ? 'bg-green-500' : 'bg-gray-300'}`}
                                        >
                                          <span className={`absolute top-1 ${poActive ? (language === 'ar' ? 'right-1' : 'left-7') : (language === 'ar' ? 'right-7' : 'left-1')} w-6 h-6 bg-white rounded-full shadow transition-all`}></span>
                                        </button>
                                      </div>

                                      <div className="flex gap-2 pt-2">
                                        <button type="button" onClick={saveProductOffer} className="bg-black text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-gray-800">
                                          {t('حفظ العرض', 'Save Offer')}
                                        </button>
                                        <button type="button" onClick={resetProductOfferForm} className="bg-white border px-5 py-2 rounded-lg font-bold text-sm hover:bg-gray-100">
                                          {t('إلغاء', 'Cancel')}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 p-4 md:p-6 border-t bg-gray-50">
                        <button type="button" onClick={() => closeProductEditor(false)} className="bg-white border px-4 py-2 rounded-lg font-bold text-sm">{t('إلغاء', 'Cancel')}</button>
                        <button type="submit" className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-bold text-sm">
                          {productManagerMode === 'add' ? t('إضافة المنتج', 'Add Product') : t('حفظ التغييرات', 'Save Changes')}
                        </button>
                      </div>
                    </form>
                  );
                })()}
              </div>
            )}

            {/* ===== تبويب الأقسام ===== */}
            {adminTab === 'categories' && user.role === 'admin' && (
              <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <h2 className="text-2xl font-bold mb-4">{t('إدارة الأقسام', 'Category Management')}</h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if ((!newCatNameAr.trim() && !newCatNameEn.trim()) || !newCatImg) {
                    showToast(t('من فضلك املأ جميع الحقول', 'Please fill in all fields'));
                    return;
                  }
                  setCategories([...categories, { id: Date.now(), name: { ar: newCatNameAr.trim() || newCatNameEn.trim(), en: newCatNameEn.trim() || newCatNameAr.trim() }, image: newCatImg.trim() }]);
                  setNewCatNameAr('');
                  setNewCatNameEn('');
                  setNewCatImg('');
                  showToast(t('تم إضافة القسم بنجاح!', 'Category added!'));
                }} className="space-y-4 border-b pb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label={`${t('اسم القسم', 'Category Name')} (${t('عربي', 'Arabic')})`} type="text" value={newCatNameAr} onChange={(e) => setNewCatNameAr(e.target.value)} id="newCatNameAr" />
                    <InputField label={`${t('اسم القسم', 'Category Name')} (English)`} type="text" value={newCatNameEn} onChange={(e) => setNewCatNameEn(e.target.value)} id="newCatNameEn" />
                  </div>
                  <InputField label={t('رابط الصورة', 'Image URL')} type="text" value={newCatImg} onChange={(e) => setNewCatImg(e.target.value)} required={true} id="newCatImg" />
                  <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-bold">{t('إضافة قسم', 'Add Category')}</button>
                </form>
                <div className="space-y-3 pt-4">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <img src={cat.image} alt="" className="w-12 h-12 object-cover rounded-md" />
                        <span className="font-bold text-lg">{getLocalized(cat.name)}</span>
                      </div>
                      <button onClick={() => setCategories(categories.filter(c => c.id !== cat.id))} className="text-red-600 font-bold px-3 py-1 bg-red-50 rounded">{t('حذف', 'Delete')}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== تبويب الشحن ===== */}
            {adminTab === 'shipping' && user.role === 'admin' && (
              <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <h2 className="text-2xl font-bold mb-4">{t('إدارة الشحن والمحافظات', 'Shipping & Governorates')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-8">
                  <div>
                    <label className="block text-sm font-semibold mb-1">{t('حد الشحن المجاني (ج.م)', 'Free Shipping Threshold (EGP)')}</label>
                    <input type="number" value={adminSettings.current.freeShippingThreshold} onChange={(e) => adminSettings.current.freeShippingThreshold = Number(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                </div>
                <div className="space-y-4 pt-4">
                  <h3 className="font-bold text-lg">{t('المحافظات وأسعارها', 'Governorates & Rates')}</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if ((!newGovNameAr.trim() && !newGovNameEn.trim()) || !newGovCost) {
                      showToast(t('من فضلك املأ جميع الحقول', 'Please fill in all fields'));
                      return;
                    }
                    setGovernorates([...governorates, { id: Date.now(), name: { ar: newGovNameAr.trim() || newGovNameEn.trim(), en: newGovNameEn.trim() || newGovNameAr.trim() }, cost: Number(newGovCost) }]);
                    setNewGovNameAr('');
                    setNewGovNameEn('');
                    setNewGovCost('');
                    showToast(t('تم إضافة المحافظة بنجاح!', 'Governorate added!'));
                  }} className="flex flex-wrap gap-4">
                    <input type="text" value={newGovNameAr} onChange={(e) => setNewGovNameAr(e.target.value)} placeholder={`${t('اسم المحافظة', 'Governorate Name')} (${t('عربي', 'Arabic')})`} className="px-4 py-2 border rounded-lg flex-1 min-w-[150px] focus:outline-none focus:ring-2 focus:ring-black" />
                    <input type="text" value={newGovNameEn} onChange={(e) => setNewGovNameEn(e.target.value)} placeholder="Governorate Name (English)" className="px-4 py-2 border rounded-lg flex-1 min-w-[150px] focus:outline-none focus:ring-2 focus:ring-black" />
                    <input type="number" value={newGovCost} onChange={(e) => setNewGovCost(e.target.value)} placeholder={t('سعر الشحن', 'Shipping Cost')} className="px-4 py-2 border rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-black" required />
                    <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-bold">{t('إضافة', 'Add')}</button>
                  </form>
                  <div className="space-y-2 pt-2">
                    {governorates.map(g => (
                      <div key={g.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                        <span className="font-semibold">{getLocalized(g.name)}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-blue-600">{g.cost} {t('ج.م', 'EGP')}</span>
                          <button onClick={() => setGovernorates(governorates.filter(x => x.id !== g.id))} className="text-red-600 font-bold text-sm">{t('حذف', 'Delete')}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== تبويب إعدادات التشيك اوت ===== */}
            {adminTab === 'checkout_settings' && user.role === 'admin' && (
              <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <h2 className="text-2xl font-bold mb-4">⚙️ {t('إعدادات التشيك اوت', 'Checkout Settings')}</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border">
                    <input type="checkbox" id="showZip" checked={adminSettings.current.showZipCode} onChange={(e) => { adminSettings.current.showZipCode = e.target.checked; bumpSettings(); }} className="w-5 h-5" />
                    <label htmlFor="showZip" className="font-bold text-lg cursor-pointer">{t('إظهار حقل الرمز البريدي (ZIP Code)', 'Show ZIP Code field')}</label>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border">
                    <input type="checkbox" id="showCountry" checked={adminSettings.current.showCountry} onChange={(e) => { adminSettings.current.showCountry = e.target.checked; bumpSettings(); }} className="w-5 h-5" />
                    <label htmlFor="showCountry" className="font-bold text-lg cursor-pointer">{t('إظهار حقل الدولة', 'Show Country field')}</label>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border">
                    <input type="checkbox" id="showPhone2" checked={adminSettings.current.showPhone2} onChange={(e) => { adminSettings.current.showPhone2 = e.target.checked; bumpSettings(); }} className="w-5 h-5" />
                    <label htmlFor="showPhone2" className="font-bold text-lg cursor-pointer">{t('إظهار حقل رقم الهاتف الإضافي', 'Show additional phone field')}</label>
                  </div>
                  {adminSettings.current.showPhone2 && (
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border me-8">
                      <input type="checkbox" id="requiredPhone2" checked={adminSettings.current.requiredPhone2} onChange={(e) => { adminSettings.current.requiredPhone2 = e.target.checked; bumpSettings(); }} className="w-5 h-5" />
                      <label htmlFor="requiredPhone2" className="font-bold text-lg cursor-pointer">{t('جعل رقم الهاتف الإضافي إجباري', 'Make additional phone required')}</label>
                    </div>
                  )}
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border">
                    <input type="checkbox" id="showCheckoutNotes" checked={adminSettings.current.showCheckoutNotes} onChange={(e) => { adminSettings.current.showCheckoutNotes = e.target.checked; bumpSettings(); }} className="w-5 h-5" />
                    <label htmlFor="showCheckoutNotes" className="font-bold text-lg cursor-pointer">{t('إظهار حقل "ملاحظات إضافية" في التشيك اوت', 'Show "Additional Notes" in checkout')}</label>
                  </div>
                </div>
                <div className="pt-6 border-t">
                  <h3 className="text-xl font-bold mb-4">🌍 {t('إدارة الدول', 'Manage Countries')}</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const nameAr = prompt(t('ادخل اسم الدولة بالعربية:', 'Enter country name in Arabic:'));
                    const nameEn = prompt(t('ادخل اسم الدولة بالإنجليزية:', 'Enter country name in English:'));
                    if (nameAr || nameEn) {
                      setCountries([...countries, { id: Date.now(), name: { ar: nameAr || nameEn, en: nameEn || nameAr }, code: (nameEn || nameAr).substring(0, 2).toUpperCase() }]);
                    }
                  }} className="mb-4">
                    <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-bold">{t('إضافة دولة جديدة', 'Add New Country')}</button>
                  </form>
                  <div className="space-y-2">
                    {countries.map(c => (
                      <div key={c.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                        <span className="font-semibold">{getLocalized(c.name)} ({c.code})</span>
                        <button onClick={() => setCountries(countries.filter(x => x.id !== c.id))} className="text-red-600 font-bold text-sm">{t('حذف', 'Delete')}</button>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => showToast(t('تم حفظ الإعدادات بنجاح!', 'Settings saved!'))} className="bg-black text-white px-8 py-3 rounded-lg font-bold mt-4">{t('حفظ الإعدادات', 'Save Settings')}</button>
              </div>
            )}

            {/* ===== تبويب أكواد الخصم ===== */}
            {/* ===== تبويب مركز العروض الترويجية (Promotions Hub) ===== */}
            {adminTab === 'promotions' && user.role === 'admin' && (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">🎁 {t('مركز العروض الترويجية', 'Promotions Hub')}</h2>
                    <p className="text-sm text-gray-500">{t('المكان المركزي لإدارة كل العروض الترويجية في المتجر.', 'The central place to manage all promotional settings in the store.')}</p>
                  </div>

                  {/* ===== تابات مركز العروض الترويجية - جزء 9/26 ===== */}
                  <div className="flex flex-wrap gap-2 border-t pt-4">
                    {[
                      { key: 'overview', label: t('نظرة عامة', 'Overview'), icon: '📊' },
                      { key: 'campaigns', label: t('الحملات', 'Campaigns'), icon: '🏷️' },
                      { key: 'welcome', label: t('عرض الترحيب', 'Welcome Offer'), icon: '🎉' },
                      { key: 'guest', label: t('خصم الزائر / أول طلب', 'Guest / First Order'), icon: '👤' },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setPromotionsSubTab(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${promotionsSubTab === tab.key ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ===== نظرة عامة (Overview) - جزء 10 ===== */}
                {promotionsSubTab === 'overview' && (() => {
                  const activeCampaigns = promotions.filter(isPromotionCurrentlyActive).length;
                  const inactiveCampaigns = promotions.length - activeCampaigns;
                  const productsWithOffersCount = products.filter(p => Array.isArray(p.offers) && p.offers.some(o => o.active)).length;
                  return (
                    <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                      <h3 className="text-lg font-bold border-b pb-4">{t('نظرة عامة على العروض', 'Promotions Overview')}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                          <p className="text-2xl font-extrabold text-green-700">{activeCampaigns}</p>
                          <p className="text-xs font-bold text-gray-500 mt-1">{t('عروض نشطة', 'ACTIVE PROMOTIONS')}</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                          <p className="text-2xl font-extrabold text-gray-700">{inactiveCampaigns}</p>
                          <p className="text-xs font-bold text-gray-500 mt-1">{t('غير نشطة', 'INACTIVE')}</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                          <p className="text-lg font-extrabold text-blue-700">{adminSettings.current.promotions.welcomeOffer.enabled ? t('مفعّل', 'ACTIVE') : t('غير مفعّل', 'INACTIVE')}</p>
                          <p className="text-xs font-bold text-gray-500 mt-1">{t('عرض الترحيب', 'WELCOME OFFER')}</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                          <p className="text-2xl font-extrabold text-purple-700">{adminSettings.current.promotions.guestDiscount.enabled ? `${adminSettings.current.promotions.guestDiscount.percentage}%` : t('معطّل', 'OFF')}</p>
                          <p className="text-xs font-bold text-gray-500 mt-1">{t('خصم أول طلب', 'FIRST ORDER')}</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                          <p className="text-2xl font-extrabold text-amber-700">{productsWithOffersCount}</p>
                          <p className="text-xs font-bold text-gray-500 mt-1">{t('منتجات لها عروض', 'PRODUCT OFFERS')}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ===== خصم العميل الجديد على أول طلب (Guest / First Order) ===== */}
                {promotionsSubTab === 'guest' && (
                  <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                  <div className="border-t-0 pt-0 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold">{t('خصم العميل الجديد على أول طلب (Guest / New Customer First Order Discount)', 'Guest / New Customer First Order Discount')}</h3>
                      <p className="text-sm text-gray-500">{t('يجب على العميل إنشاء حساب ليصبح مؤهلاً. الخصم يُستخدم مرة واحدة فقط على أول طلب له.', 'Customers must create an account to become eligible. The discount can only be used on their first order.')}</p>
                    </div>

                    {/* الحالة والنسبة */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                        <label htmlFor="guestDiscountEnabled" className="font-bold cursor-pointer">{t('حالة خصم الزائر', 'Guest Discount Status')}</label>
                        <button
                          id="guestDiscountEnabled"
                          type="button"
                          role="switch"
                          aria-checked={adminSettings.current.promotions.guestDiscount.enabled}
                          onClick={() => { adminSettings.current.promotions.guestDiscount.enabled = !adminSettings.current.promotions.guestDiscount.enabled; bumpSettings(); }}
                          className={`w-14 h-8 rounded-full relative transition-colors ${adminSettings.current.promotions.guestDiscount.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-1 ${adminSettings.current.promotions.guestDiscount.enabled ? (language === 'ar' ? 'right-1' : 'left-7') : (language === 'ar' ? 'right-7' : 'left-1')} w-6 h-6 bg-white rounded-full shadow transition-all`}></span>
                        </button>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <label htmlFor="guestDiscountPercentage" className="block font-bold mb-1">{t('نسبة الخصم', 'Discount Percentage')}</label>
                        <div className="flex items-center gap-2">
                          <input
                            id="guestDiscountPercentage"
                            type="number"
                            min="0"
                            max="100"
                            value={adminSettings.current.promotions.guestDiscount.percentage}
                            onChange={(e) => { adminSettings.current.promotions.guestDiscount.percentage = Math.max(0, Math.min(100, Number(e.target.value) || 0)); bumpSettings(); }}
                            className="w-28 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                          />
                          <span className="font-bold text-gray-600">%</span>
                        </div>
                      </div>
                    </div>

                    {/* العنوان */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label={`${t('العنوان', 'Title')} (${t('عربي', 'Arabic')})`} type="text" value={adminSettings.current.promotions.guestDiscount.title.ar} onChange={(e) => { adminSettings.current.promotions.guestDiscount.title = { ...adminSettings.current.promotions.guestDiscount.title, ar: e.target.value }; bumpSettings(); }} id="guestDiscountTitleAr" />
                      <InputField label={`${t('العنوان', 'Title')} (English)`} type="text" value={adminSettings.current.promotions.guestDiscount.title.en} onChange={(e) => { adminSettings.current.promotions.guestDiscount.title = { ...adminSettings.current.promotions.guestDiscount.title, en: e.target.value }; bumpSettings(); }} id="guestDiscountTitleEn" />
                    </div>

                    {/* نص الرسالة */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextareaField label={`${t('نص الرسالة', 'Message')} (${t('عربي', 'Arabic')})`} value={adminSettings.current.promotions.guestDiscount.message.ar} onChange={(e) => { adminSettings.current.promotions.guestDiscount.message = { ...adminSettings.current.promotions.guestDiscount.message, ar: e.target.value }; bumpSettings(); }} rows={3} id="guestDiscountMessageAr" />
                      <TextareaField label={`${t('نص الرسالة', 'Message')} (English)`} value={adminSettings.current.promotions.guestDiscount.message.en} onChange={(e) => { adminSettings.current.promotions.guestDiscount.message = { ...adminSettings.current.promotions.guestDiscount.message, en: e.target.value }; bumpSettings(); }} rows={3} id="guestDiscountMessageEn" />
                    </div>
                    <p className="text-xs text-gray-500">{t('يمكنك كتابة نص مخصص بالكامل ولا يشترط ذكر النسبة داخل النص.', "You can write fully custom text — the message doesn't have to mention the percentage.")}</p>

                    {/* نص الزرار */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label={`${t('نص الزرار', 'Button Text')} (${t('عربي', 'Arabic')})`} type="text" value={adminSettings.current.promotions.guestDiscount.buttonText.ar} onChange={(e) => { adminSettings.current.promotions.guestDiscount.buttonText = { ...adminSettings.current.promotions.guestDiscount.buttonText, ar: e.target.value }; bumpSettings(); }} id="guestDiscountButtonAr" />
                      <InputField label={`${t('نص الزرار', 'Button Text')} (English)`} type="text" value={adminSettings.current.promotions.guestDiscount.buttonText.en} onChange={(e) => { adminSettings.current.promotions.guestDiscount.buttonText = { ...adminSettings.current.promotions.guestDiscount.buttonText, en: e.target.value }; bumpSettings(); }} id="guestDiscountButtonEn" />
                    </div>

                    {/* معاينة العميل */}
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold">{t('معاينة العميل', 'Customer Preview')}</h4>
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                          <button type="button" onClick={() => setPromoPreviewLang('ar')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${promoPreviewLang === 'ar' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>{t('عربي', 'Arabic')}</button>
                          <button type="button" onClick={() => setPromoPreviewLang('en')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${promoPreviewLang === 'en' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>English</button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{t('هذه معاينة فقط، وليست الإشعار الفعلي اللي هيظهر للعميل.', 'This is a preview only — not the actual customer-facing notification.')}</p>
                      <div className="w-72 max-w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden mx-auto" dir={promoPreviewLang === 'ar' ? 'rtl' : 'ltr'}>
                        <div className="bg-black text-white px-4 py-3 flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 font-extrabold text-sm">
                            <span>🎁</span>
                            <span>{adminSettings.current.promotions.guestDiscount.title[promoPreviewLang] || ''}</span>
                          </div>
                          <span className="text-white/80 text-lg leading-none font-bold shrink-0 -mt-0.5">✕</span>
                        </div>
                        <div className="p-4 space-y-3">
                          <p className="text-sm text-gray-700 leading-relaxed">{adminSettings.current.promotions.guestDiscount.message[promoPreviewLang] || ''}</p>
                          <div className="w-full bg-black text-white font-bold py-2.5 rounded-lg text-sm text-center">
                            {adminSettings.current.promotions.guestDiscount.buttonText[promoPreviewLang] || ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => showToast(t('تم حفظ إعدادات العروض الترويجية بنجاح.', 'Promotion settings saved successfully.'))}
                      className="bg-black text-white px-8 py-3 rounded-lg font-bold"
                    >
                      {t('حفظ التغييرات', 'Save Changes')}
                    </button>
                  </div>
                  </div>
                )}

                {/* ===== عرض الترحيب (Welcome Offer) ===== */}
                {promotionsSubTab === 'welcome' && (
                <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                  <div>
                    <h3 className="text-lg font-bold">🎉 {t('عرض الترحيب (Welcome Offer)', 'Welcome Offer')}</h3>
                    <p className="text-sm text-gray-500">{t('بوب أب ترويجي يظهر للعميل عند دخوله الموقع.', 'A promotional popup shown to customers when they enter the site.')}</p>
                  </div>

                  <div className="border-t pt-6 space-y-6">
                    {/* الحالة */}
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                      <label htmlFor="welcomeOfferEnabled" className="font-bold cursor-pointer">{t('حالة عرض الترحيب', 'Welcome Offer Status')}</label>
                      <button
                        id="welcomeOfferEnabled"
                        type="button"
                        role="switch"
                        aria-checked={adminSettings.current.promotions.welcomeOffer.enabled}
                        onClick={() => { adminSettings.current.promotions.welcomeOffer.enabled = !adminSettings.current.promotions.welcomeOffer.enabled; bumpSettings(); }}
                        className={`w-14 h-8 rounded-full relative transition-colors ${adminSettings.current.promotions.welcomeOffer.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-1 ${adminSettings.current.promotions.welcomeOffer.enabled ? (language === 'ar' ? 'right-1' : 'left-7') : (language === 'ar' ? 'right-7' : 'left-1')} w-6 h-6 bg-white rounded-full shadow transition-all`}></span>
                      </button>
                    </div>

                    {/* الصورة */}
                    <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                      <label className="block font-bold">{t('صورة البوب أب', 'Popup Image')}</label>
                      {adminSettings.current.promotions.welcomeOffer.image ? (
                        <div className="space-y-2">
                          <img src={adminSettings.current.promotions.welcomeOffer.image} alt="" className="w-full max-w-xs h-40 object-cover rounded-lg border" />
                          <div className="flex gap-3">
                            <label htmlFor="welcomeOfferImageInput" className="cursor-pointer text-sm font-bold bg-white border px-4 py-2 rounded-lg hover:bg-gray-100">
                              {t('استبدال الصورة', 'Replace Image')}
                            </label>
                            <button
                              type="button"
                              onClick={() => { adminSettings.current.promotions.welcomeOffer.image = ''; bumpSettings(); }}
                              className="text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100"
                            >
                              {t('إزالة الصورة', 'Remove Image')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label htmlFor="welcomeOfferImageInput" className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg py-8 cursor-pointer hover:bg-gray-100 text-gray-500">
                          <span className="text-3xl">🖼️</span>
                          <span className="text-sm font-bold">{t('اختيار صورة', 'Select Image')}</span>
                        </label>
                      )}
                      <input id="welcomeOfferImageInput" type="file" accept="image/*" onChange={handleWelcomeOfferImageUpload} className="hidden" />
                    </div>

                    {/* العنوان */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label={`${t('العنوان', 'Title')} (${t('عربي', 'Arabic')})`} type="text" value={adminSettings.current.promotions.welcomeOffer.title.ar} onChange={(e) => { adminSettings.current.promotions.welcomeOffer.title = { ...adminSettings.current.promotions.welcomeOffer.title, ar: e.target.value }; bumpSettings(); }} id="welcomeOfferTitleAr" />
                      <InputField label={`${t('العنوان', 'Title')} (English)`} type="text" value={adminSettings.current.promotions.welcomeOffer.title.en} onChange={(e) => { adminSettings.current.promotions.welcomeOffer.title = { ...adminSettings.current.promotions.welcomeOffer.title, en: e.target.value }; bumpSettings(); }} id="welcomeOfferTitleEn" />
                    </div>

                    {/* اختيار عرض ترويجي حقيقي (Part 16/29) */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                      <label className="block font-bold text-sm">{t('اختر عرضاً ترويجياً حقيقياً (اختياري)', 'Select a real promotion (optional)')}</label>
                      <select
                        value={adminSettings.current.promotions.welcomeOffer.promotionId || ''}
                        onChange={(e) => {
                          const id = e.target.value ? Number(e.target.value) : null;
                          const promo = id ? promotions.find(p => p.id === id) : null;
                          adminSettings.current.promotions.welcomeOffer.promotionId = id;
                          if (promo) {
                            const label = getPromotionLabel(promo);
                            adminSettings.current.promotions.welcomeOffer.offerText = label;
                            if (promo.target === 'product') {
                              adminSettings.current.promotions.welcomeOffer.destinationType = 'product';
                              adminSettings.current.promotions.welcomeOffer.productId = promo.productId;
                              adminSettings.current.promotions.welcomeOffer.categoryId = null;
                            } else if (promo.target === 'category') {
                              adminSettings.current.promotions.welcomeOffer.destinationType = 'category';
                              adminSettings.current.promotions.welcomeOffer.categoryId = promo.categoryId;
                              adminSettings.current.promotions.welcomeOffer.productId = null;
                            } else {
                              adminSettings.current.promotions.welcomeOffer.destinationType = 'shop';
                              adminSettings.current.promotions.welcomeOffer.productId = null;
                              adminSettings.current.promotions.welcomeOffer.categoryId = null;
                            }
                          }
                          bumpSettings();
                        }}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                      >
                        <option value="">{t('بدون ربط - نص ترويجي فقط', 'No link - promotional text only')}</option>
                        {promotions.filter(isPromotionCurrentlyActive).map(p => (
                          <option key={p.id} value={p.id}>{p.name?.ar || p.name?.en}</option>
                        ))}
                      </select>
                      <p className="text-xs text-blue-700">{t('لو اخترت عرضاً هنا، البوب أب هيعرض بياناته الحقيقية وزرار الدعوة هيوديك لنفس هدف العرض (منتج/قسم/المتجر)، والحساب الفعلي في السلة بيتم من محرك العروض نفسه - مش من البوب أب.', "If you select a promotion here, the popup shows its real info and the CTA takes the customer to that promotion's target (product/category/shop). The actual cart calculation always comes from the promotion engine, not from the popup itself.")}</p>
                    </div>

                    {/* الوصف */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextareaField label={`${t('الوصف', 'Description')} (${t('عربي', 'Arabic')})`} value={adminSettings.current.promotions.welcomeOffer.description.ar} onChange={(e) => { adminSettings.current.promotions.welcomeOffer.description = { ...adminSettings.current.promotions.welcomeOffer.description, ar: e.target.value }; bumpSettings(); }} rows={2} id="welcomeOfferDescAr" />
                      <TextareaField label={`${t('الوصف', 'Description')} (English)`} value={adminSettings.current.promotions.welcomeOffer.description.en} onChange={(e) => { adminSettings.current.promotions.welcomeOffer.description = { ...adminSettings.current.promotions.welcomeOffer.description, en: e.target.value }; bumpSettings(); }} rows={2} id="welcomeOfferDescEn" />
                    </div>

                    {/* نص العرض */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label={`${t('نص العرض', 'Offer Text')} (${t('عربي', 'Arabic')})`} type="text" value={adminSettings.current.promotions.welcomeOffer.offerText.ar} onChange={(e) => { adminSettings.current.promotions.welcomeOffer.offerText = { ...adminSettings.current.promotions.welcomeOffer.offerText, ar: e.target.value }; bumpSettings(); }} placeholder={t('مثال: اشترِ 2 واحصل على 1 مجاناً', 'e.g. Buy 2 Get 1 Free')} id="welcomeOfferOfferAr" />
                      <InputField label={`${t('نص العرض', 'Offer Text')} (English)`} type="text" value={adminSettings.current.promotions.welcomeOffer.offerText.en} onChange={(e) => { adminSettings.current.promotions.welcomeOffer.offerText = { ...adminSettings.current.promotions.welcomeOffer.offerText, en: e.target.value }; bumpSettings(); }} placeholder="e.g. Buy 2 Get 1 Free" id="welcomeOfferOfferEn" />
                    </div>
                    <p className="text-xs text-gray-500">{t('لو مرتبط بعرض حقيقي من فوق، النص هنا بيتحدّث تلقائياً منه. تقدر تعدّله يدوياً كمان، لكن الحساب الفعلي في السلة بيفضل دايماً تابع لإعدادات العرض نفسه في Campaigns، مش للنص المكتوب هنا.', 'If linked to a real promotion above, this text auto-fills from it. You can still edit it manually, but the actual cart calculation always follows the promotion settings in Campaigns, never this text.')}</p>

                    {/* نص الزرار */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label={`${t('نص الزرار', 'Button Text')} (${t('عربي', 'Arabic')})`} type="text" value={adminSettings.current.promotions.welcomeOffer.buttonText.ar} onChange={(e) => { adminSettings.current.promotions.welcomeOffer.buttonText = { ...adminSettings.current.promotions.welcomeOffer.buttonText, ar: e.target.value }; bumpSettings(); }} id="welcomeOfferButtonAr" />
                      <InputField label={`${t('نص الزرار', 'Button Text')} (English)`} type="text" value={adminSettings.current.promotions.welcomeOffer.buttonText.en} onChange={(e) => { adminSettings.current.promotions.welcomeOffer.buttonText = { ...adminSettings.current.promotions.welcomeOffer.buttonText, en: e.target.value }; bumpSettings(); }} id="welcomeOfferButtonEn" />
                    </div>

                    {/* وجهة الزرار */}
                    <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                      <label className="block font-bold">{t('وجهة الزرار', 'Button Destination')}</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'shop', label: t('المتجر', 'Shop') },
                          { key: 'category', label: t('قسم', 'Category') },
                          { key: 'product', label: t('منتج', 'Product') },
                        ].map(opt => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => { adminSettings.current.promotions.welcomeOffer.destinationType = opt.key; bumpSettings(); }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${adminSettings.current.promotions.welcomeOffer.destinationType === opt.key ? 'bg-black text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {/* اختيار منتج */}
                      {adminSettings.current.promotions.welcomeOffer.destinationType === 'product' && (
                        <div className="pt-2 space-y-2">
                          {adminSettings.current.promotions.welcomeOffer.productId ? (
                            (() => {
                              const selectedProd = products.find(p => p.id === adminSettings.current.promotions.welcomeOffer.productId);
                              return (
                                <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                                  <div>
                                    <p className="text-xs text-gray-400">{t('المنتج المختار', 'Selected Product')}</p>
                                    <p className="font-bold">{selectedProd ? getLocalized(selectedProd.name) : t('منتج محذوف', 'Deleted product')}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button type="button" onClick={() => { adminSettings.current.promotions.welcomeOffer.productId = null; bumpSettings(); }} className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200">{t('تغيير', 'Change')}</button>
                                    <button type="button" onClick={() => { adminSettings.current.promotions.welcomeOffer.productId = null; bumpSettings(); }} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">{t('إزالة', 'Remove')}</button>
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            <>
                              <p className="text-sm font-bold text-orange-600">⚠️ {t('لا يوجد منتج مختار', 'No product selected')}</p>
                              <input
                                type="text"
                                value={welcomeOfferProductSearch}
                                onChange={(e) => setWelcomeOfferProductSearch(e.target.value)}
                                placeholder={t('ابحث عن منتج...', 'Search for a product...')}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                              />
                              <div className="max-h-40 overflow-y-auto border rounded-lg divide-y bg-white">
                                {products.filter(p => getLocalized(p.name).toLowerCase().includes(welcomeOfferProductSearch.toLowerCase())).map(p => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => { adminSettings.current.promotions.welcomeOffer.productId = p.id; setWelcomeOfferProductSearch(''); bumpSettings(); }}
                                    className="w-full text-start px-3 py-2 text-sm hover:bg-gray-100"
                                  >
                                    {getLocalized(p.name)}
                                  </button>
                                ))}
                                {products.filter(p => getLocalized(p.name).toLowerCase().includes(welcomeOfferProductSearch.toLowerCase())).length === 0 && (
                                  <p className="text-xs text-gray-400 px-3 py-3 text-center">{t('لا توجد نتائج', 'No results')}</p>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* اختيار قسم */}
                      {adminSettings.current.promotions.welcomeOffer.destinationType === 'category' && (
                        <div className="pt-2 space-y-2">
                          {adminSettings.current.promotions.welcomeOffer.categoryId ? (
                            (() => {
                              const selectedCat = categories.find(c => c.id === adminSettings.current.promotions.welcomeOffer.categoryId);
                              return (
                                <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                                  <div>
                                    <p className="text-xs text-gray-400">{t('القسم المختار', 'Selected Category')}</p>
                                    <p className="font-bold">{selectedCat ? getLocalized(selectedCat.name) : t('قسم محذوف', 'Deleted category')}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button type="button" onClick={() => { adminSettings.current.promotions.welcomeOffer.categoryId = null; bumpSettings(); }} className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200">{t('تغيير', 'Change')}</button>
                                    <button type="button" onClick={() => { adminSettings.current.promotions.welcomeOffer.categoryId = null; bumpSettings(); }} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">{t('إزالة', 'Remove')}</button>
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            <>
                              <p className="text-sm font-bold text-orange-600">⚠️ {t('لا يوجد قسم مختار', 'No category selected')}</p>
                              <div className="flex flex-wrap gap-2">
                                {categories.map(c => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => { adminSettings.current.promotions.welcomeOffer.categoryId = c.id; bumpSettings(); }}
                                    className="px-4 py-2 rounded-lg text-sm font-bold bg-white border hover:bg-gray-100"
                                  >
                                    {getLocalized(c.name)}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {adminSettings.current.promotions.welcomeOffer.destinationType === 'shop' && (
                        <p className="text-xs text-gray-500 pt-1">{t('الزرار هيفتح صفحة المتجر مباشرة.', 'The button will open the Shop page directly.')}</p>
                      )}
                    </div>

                    {/* معاينة العميل */}
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold">{t('معاينة العميل', 'Customer Preview')}</h4>
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                          <button type="button" onClick={() => setWelcomeOfferPreviewLang('ar')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${welcomeOfferPreviewLang === 'ar' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>{t('عربي', 'Arabic')}</button>
                          <button type="button" onClick={() => setWelcomeOfferPreviewLang('en')} className={`px-3 py-1 rounded-md text-xs font-bold transition ${welcomeOfferPreviewLang === 'en' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>English</button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{t('هذه معاينة فقط، وليست البوب أب الفعلي اللي هيظهر للعميل.', 'This is a preview only — not the actual customer-facing popup.')}</p>
                      <div className="w-full max-w-xs bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden mx-auto" dir={welcomeOfferPreviewLang === 'ar' ? 'rtl' : 'ltr'}>
                        {adminSettings.current.promotions.welcomeOffer.image && (
                          <div className="w-full h-32 bg-gray-100">
                            <img src={adminSettings.current.promotions.welcomeOffer.image} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-4 space-y-2 text-center">
                          <p className="font-extrabold text-lg">{adminSettings.current.promotions.welcomeOffer.title[welcomeOfferPreviewLang] || ''}</p>
                          {adminSettings.current.promotions.welcomeOffer.offerText[welcomeOfferPreviewLang] && (
                            <p className="text-red-600 font-bold text-sm">{adminSettings.current.promotions.welcomeOffer.offerText[welcomeOfferPreviewLang]}</p>
                          )}
                          {adminSettings.current.promotions.welcomeOffer.description[welcomeOfferPreviewLang] && (
                            <p className="text-xs text-gray-600">{adminSettings.current.promotions.welcomeOffer.description[welcomeOfferPreviewLang]}</p>
                          )}
                          <div className="w-full bg-black text-white font-bold py-2 rounded-lg text-sm mt-2">
                            {adminSettings.current.promotions.welcomeOffer.buttonText[welcomeOfferPreviewLang] || ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        saveWelcomeOfferToStorage(adminSettings.current.promotions.welcomeOffer);
                        showToast(t('تم حفظ إعدادات عرض الترحيب بنجاح.', 'Welcome offer settings saved successfully.'));
                      }}
                      className="bg-black text-white px-8 py-3 rounded-lg font-bold"
                    >
                      {t('حفظ التغييرات', 'Save Changes')}
                    </button>
                  </div>
                </div>
                )}

                {/* ===== العروض الترويجية الحقيقية (Campaigns) ===== */}
                {promotionsSubTab === 'campaigns' && (
                <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">🏷️ {t('العروض الترويجية (Campaigns)', 'Promotions / Campaigns')}</h3>
                      <p className="text-sm text-gray-500">{t('هنا بتتحكم في العروض الحقيقية اللي بتتحسب فعلياً في السلة: اشترِ X واحصل على Y مجاناً، خصم كمية، خصم نسبة أو مبلغ ثابت.', 'This is where the real promotions that actually calculate in the cart live: Buy X Get Y Free, quantity discounts, percentage or fixed discounts.')}</p>
                    </div>
                    {!campaignFormOpen && (
                      <button type="button" onClick={openNewCampaignForm} className="bg-black text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800">
                        + {t('إنشاء عرض جديد', 'Create New Promotion')}
                      </button>
                    )}
                  </div>

                  {/* ===== قائمة العروض الحالية ===== */}
                  {!campaignFormOpen && (
                    promotions.length === 0 ? (
                      <p className="text-sm text-gray-400 bg-gray-50 border border-dashed rounded-lg p-6 text-center">{t('لا توجد عروض حتى الآن. اضغط "إنشاء عرض جديد" للبدء.', 'No promotions yet. Click "Create New Promotion" to get started.')}</p>
                    ) : (
                      <div className="space-y-3">
                        {promotions.map(promo => {
                          const isActiveNow = isPromotionCurrentlyActive(promo);
                          const targetLabel = promo.target === 'product'
                            ? `${t('منتج', 'Product')}: ${getLocalized(products.find(p => p.id === promo.productId)?.name) || t('منتج محذوف', 'deleted product')}`
                            : promo.target === 'category'
                              ? `${t('قسم', 'Category')}: ${getLocalized(categories.find(c => c.id === promo.categoryId)?.name) || t('قسم محذوف', 'deleted category')}`
                              : t('كل المنتجات', 'All Products');
                          const condLabel = getLocalized(getPromotionLabel(promo));
                          return (
                            <div key={promo.id} className="border rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 bg-gray-50">
                              <div>
                                <p className="font-bold">{getLocalized(promo.name)}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{targetLabel} · {condLabel}</p>
                                {(promo.startDate || promo.endDate) && (
                                  <p className="text-[11px] text-gray-400 mt-0.5">
                                    {promo.startDate && `${t('من', 'From')} ${new Date(promo.startDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}`}
                                    {promo.startDate && promo.endDate && ' — '}
                                    {promo.endDate && `${t('إلى', 'To')} ${new Date(promo.endDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}`}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isActiveNow ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                  {promo.active ? (isActiveNow ? t('فعّال الآن', 'Active now') : t('مفعّل - خارج المدة', 'Enabled - outside date range')) : t('غير مفعّل', 'Inactive')}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => togglePromotionActive(promo.id)}
                                  className="text-xs font-bold bg-white border px-3 py-1.5 rounded-lg hover:bg-gray-100"
                                >
                                  {promo.active ? t('تعطيل', 'Disable') : t('تفعيل', 'Enable')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditCampaignForm(promo)}
                                  className="text-xs font-bold bg-white border px-3 py-1.5 rounded-lg hover:bg-gray-100"
                                >
                                  {t('تعديل', 'Edit')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { if (window.confirm(t('تأكيد حذف هذا العرض؟', 'Confirm deleting this promotion?'))) deletePromotion(promo.id); }}
                                  className="text-xs font-bold bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100"
                                >
                                  {t('حذف', 'Delete')}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}

                  {/* ===== فورم إنشاء / تعديل عرض ===== */}
                  {campaignFormOpen && (
                    <div className="border-t pt-6 space-y-5">
                      <h4 className="font-bold text-base">{editingPromotionId ? t('تعديل العرض', 'Edit Promotion') : t('إنشاء عرض جديد', 'Create New Promotion')}</h4>

                      <InputField
                        label={t('اسم العرض (داخلي - للأدمن فقط)', 'Promotion Name (internal - admin only)')}
                        type="text"
                        value={newPromoName}
                        onChange={(e) => setNewPromoName(e.target.value)}
                        placeholder={t('مثال: اشترِ 2 واحصل على 1 مجاناً — بناطيل', 'e.g. Buy 2 Get 1 Free — Pants')}
                        id="newPromoName"
                      />

                      {/* نوع العرض */}
                      <div>
                        <label className="block font-semibold mb-2 text-sm">{t('نوع العرض', 'Promotion Type')}</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {[
                            { key: 'bxgy', label: t('اشترِ X واحصل على Y مجاناً', 'Buy X Get Y Free') },
                            { key: 'quantity_discount', label: t('خصم كمية %', 'Quantity Discount %') },
                            { key: 'percentage', label: t('خصم نسبة %', 'Percentage Discount') },
                            { key: 'fixed', label: t('خصم مبلغ ثابت', 'Fixed Amount Discount') },
                          ].map(opt => (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => setNewPromoType(opt.key)}
                              className={`px-3 py-2 rounded-lg text-xs font-bold transition ${newPromoType === opt.key ? 'bg-black text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* شروط العرض حسب النوع */}
                      {newPromoType === 'bxgy' && (
                        <div className="grid grid-cols-2 gap-4">
                          <InputField label={t('اشترِ (Buy Quantity)', 'Buy Quantity')} type="number" value={newPromoBuyQty} onChange={(e) => setNewPromoBuyQty(e.target.value)} id="newPromoBuyQty" />
                          <InputField label={t('احصل مجاناً على (Free Quantity)', 'Free Quantity')} type="number" value={newPromoFreeQty} onChange={(e) => setNewPromoFreeQty(e.target.value)} id="newPromoFreeQty" />
                        </div>
                      )}
                      {newPromoType === 'quantity_discount' && (
                        <div className="grid grid-cols-2 gap-4">
                          <InputField label={t('الحد الأدنى للكمية', 'Minimum Quantity')} type="number" value={newPromoMinQty} onChange={(e) => setNewPromoMinQty(e.target.value)} id="newPromoMinQty" />
                          <InputField label={t('نسبة الخصم (%)', 'Discount Percentage (%)')} type="number" value={newPromoDiscountPercent} onChange={(e) => setNewPromoDiscountPercent(e.target.value)} id="newPromoDiscountPercent" />
                        </div>
                      )}
                      {newPromoType === 'percentage' && (
                        <InputField label={t('نسبة الخصم (%)', 'Discount Percentage (%)')} type="number" value={newPromoPercentage} onChange={(e) => setNewPromoPercentage(e.target.value)} id="newPromoPercentage" />
                      )}
                      {newPromoType === 'fixed' && (
                        <InputField label={t('مبلغ الخصم (ج.م)', 'Discount Amount (EGP)')} type="number" value={newPromoFixedAmount} onChange={(e) => setNewPromoFixedAmount(e.target.value)} id="newPromoFixedAmount" />
                      )}

                      {/* الهدف (Target) */}
                      <div>
                        <label className="block font-semibold mb-2 text-sm">{t('هدف العرض (Target)', 'Promotion Target')}</label>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { key: 'product', label: t('منتج محدد', 'Specific Product') },
                            { key: 'category', label: t('قسم', 'Category') },
                            { key: 'all', label: t('كل المنتجات', 'All Products') },
                          ].map(opt => (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => { setNewPromoTarget(opt.key); setNewPromoProductId(null); setNewPromoCategoryId(null); setCampaignProductSearch(''); }}
                              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${newPromoTarget === opt.key ? 'bg-black text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* اختيار المنتج - لا يوجد اختيار افتراضي أبداً */}
                      {newPromoTarget === 'product' && (
                        <div>
                          {newPromoProductId ? (() => {
                            const p = products.find(pr => pr.id === newPromoProductId);
                            return (
                              <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-3">
                                <span className="font-semibold text-sm">{p ? getLocalized(p.name) : t('منتج محذوف', 'Deleted product')}</span>
                                <button type="button" onClick={() => setNewPromoProductId(null)} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">{t('تغيير', 'Change')}</button>
                              </div>
                            );
                          })() : (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-400 font-semibold">{t('لا يوجد منتج محدد بعد', 'No product selected')}</p>
                              <input
                                type="text"
                                value={campaignProductSearch}
                                onChange={(e) => setCampaignProductSearch(e.target.value)}
                                placeholder={t('ابحث عن منتج...', 'Search for a product...')}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                              />
                              <div className="w-full border rounded-lg bg-white max-h-44 overflow-y-auto divide-y">
                                {products.filter(p => getLocalized(p.name).toLowerCase().includes(campaignProductSearch.toLowerCase())).map(p => (
                                  <button
                                    type="button"
                                    key={p.id}
                                    onClick={() => setNewPromoProductId(p.id)}
                                    className="w-full text-start px-3 py-2 text-sm hover:bg-gray-50"
                                  >
                                    {getLocalized(p.name)}
                                  </button>
                                ))}
                                {products.filter(p => getLocalized(p.name).toLowerCase().includes(campaignProductSearch.toLowerCase())).length === 0 && (
                                  <p className="text-xs text-gray-400 px-3 py-2">{t('لا توجد منتجات مطابقة', 'No matching products')}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* اختيار القسم - لا يوجد اختيار افتراضي أبداً */}
                      {newPromoTarget === 'category' && (
                        <div>
                          {newPromoCategoryId ? (() => {
                            const c = categories.find(cat => cat.id === newPromoCategoryId);
                            return (
                              <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-3">
                                <span className="font-semibold text-sm">{c ? getLocalized(c.name) : t('قسم محذوف', 'Deleted category')}</span>
                                <button type="button" onClick={() => setNewPromoCategoryId(null)} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">{t('تغيير', 'Change')}</button>
                              </div>
                            );
                          })() : (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-400 font-semibold">{t('لا يوجد قسم محدد بعد', 'No category selected')}</p>
                              <div className="flex flex-wrap gap-2">
                                {categories.map(c => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setNewPromoCategoryId(c.id)}
                                    className="px-4 py-2 rounded-lg text-sm font-bold bg-white border text-gray-600 hover:bg-gray-100"
                                  >
                                    {getLocalized(c.name)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {newPromoTarget === 'all' && (
                        <p className="text-sm text-gray-500 bg-gray-50 border rounded-lg p-3">{t('العرض هيتطبق على كل المنتجات المؤهلة في المتجر تلقائياً.', 'This promotion applies automatically to all eligible products in the store.')}</p>
                      )}

                      {/* التواريخ (اختياري) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold mb-1 text-sm">{t('تاريخ البداية (اختياري)', 'Start Date (optional)')}</label>
                          <input type="datetime-local" value={newPromoStartDate} onChange={(e) => setNewPromoStartDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white" />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1 text-sm">{t('تاريخ النهاية (اختياري)', 'End Date (optional)')}</label>
                          <input type="datetime-local" value={newPromoEndDate} onChange={(e) => setNewPromoEndDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">{t('لو سبتهم فاضيين، العرض هيفضل شغال طول ما هو "مفعّل". العرض غير المفعّل أو الخارج عن نطاق التاريخ مابيأثرش على السلة أبداً.', 'If left empty, the promotion stays active as long as it is "Enabled". A disabled or out-of-date-range promotion never affects the cart.')}</p>

                      <div className="flex gap-2 pt-2">
                        <button type="button" onClick={resetCampaignForm} className="bg-white border px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-100">{t('إلغاء', 'Cancel')}</button>
                        <button type="button" onClick={saveCampaignPromotion} className="bg-black text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800">
                          {editingPromotionId ? t('حفظ التعديلات', 'Save Changes') : t('إنشاء العرض', 'Create Promotion')}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500">⚠️ {t('هذه المرحلة فرونت إند فقط - العروض محسوبة في المتصفح ومش محفوظة على سيرفر. أي تطبيق حقيقي للإنتاج لازم يتحقق من العروض من السيرفر (Backend) بما فيها المخزون وتاريخ استخدام العميل، عشان مايتحايلش عليها من جهة العميل.', "This stage is frontend-only — promotions are calculated in the browser and not persisted on a server. A real production system must validate promotions server-side (including stock and usage history) so they can't be manipulated client-side.")}</p>
                  </div>
                </div>
                )}
              </div>
            )}

            {adminTab === 'discounts' && user.role === 'admin' && (
              <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <h2 className="text-2xl font-bold mb-4">🏷️ {t('إدارة أكواد الخصم', 'Discount Codes')}</h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const code = document.getElementById('discountCode').value.trim();
                  const percent = document.getElementById('discountPercent').value;
                  if (!code || !percent) {
                    showToast(t('من فضلك املأ جميع الحقول', 'Please fill in all fields'));
                    return;
                  }
                  setDiscountCodes([...discountCodes, {
                    id: Date.now(),
                    code: code.toUpperCase(),
                    discountPercent: Number(percent),
                    isActive: true
                  }]);
                  document.getElementById('discountCode').value = '';
                  document.getElementById('discountPercent').value = '';
                  showToast(t('تم إضافة كود الخصم بنجاح!', 'Discount code added!'));
                }} className="flex gap-4 border-b pb-8">
                  <input id="discountCode" type="text" placeholder={t('اسم الكود (مثال: WELCOME10)', 'Code name (e.g. WELCOME10)')} className="px-4 py-2 border rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-black" required />
                  <input id="discountPercent" type="number" placeholder={t('نسبة الخصم %', 'Discount %')} className="px-4 py-2 border rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-black" required min="0" max="100" />
                  <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-bold">{t('إضافة كود', 'Add Code')}</button>
                </form>
                <div className="space-y-3 pt-4">
                  <h3 className="font-bold text-lg">{t('أكواد الخصم المتاحة', 'Available Discount Codes')}</h3>
                  {discountCodes.map(c => (
                    <div key={c.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center gap-6">
                        <span className="font-bold text-lg bg-black text-white px-4 py-1 rounded">{c.code}</span>
                        <span className="text-green-600 font-bold">{c.discountPercent}% {t('خصم', 'off')}</span>
                        <span className={`text-sm ${c.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {c.isActive ? '✅ ' + t('مفعل', 'Active') : '❌ ' + t('غير مفعل', 'Inactive')}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setDiscountCodes(discountCodes.map(x => x.id === c.id ? { ...x, isActive: !x.isActive } : x))} className={`px-3 py-1 rounded text-sm font-bold ${c.isActive ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {c.isActive ? t('تعطيل', 'Disable') : t('تفعيل', 'Enable')}
                        </button>
                        <button onClick={() => setDiscountCodes(discountCodes.filter(x => x.id !== c.id))} className="text-red-600 font-bold px-3 py-1 bg-red-50 rounded text-sm">{t('حذف', 'Delete')}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== تبويب المصاريف ===== */}
            {adminTab === 'expenses' && user.role === 'admin' && (
              <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <h2 className="text-2xl font-bold mb-4">{t('المصاريف النثرية', 'Miscellaneous Expenses')}</h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!newExpenseTitle || !newExpenseAmount) return;
                  setExpenses([...expenses, { id: Date.now(), title: newExpenseTitle, amount: Number(newExpenseAmount) }]);
                  setNewExpenseTitle('');
                  setNewExpenseAmount('');
                  showToast(t('تم تسجيل المصروف!', 'Expense recorded!'));
                }} className="flex gap-4 border-b pb-8">
                  <input type="text" value={newExpenseTitle} onChange={(e) => setNewExpenseTitle(e.target.value)} placeholder={t('اسم المصروف', 'Expense Name')} className="px-4 py-2 border rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-black" required />
                  <input type="number" value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(e.target.value)} placeholder={t('المبلغ', 'Amount')} className="px-4 py-2 border rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-black" required />
                  <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-bold">{t('إضافة', 'Add')}</button>
                </form>
                <div className="space-y-2 pt-4">
                  {expenses.map(ex => (
                    <div key={ex.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                      <span>{ex.title}</span>
                      <span className="font-bold text-red-600">{ex.amount} {t('ج.م', 'EGP')}</span>
                      <button onClick={() => setExpenses(expenses.filter(e => e.id !== ex.id))} className="text-red-600 font-bold px-2 hover:underline">{t('حذف', 'Delete')}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== تبويب الرسائل ===== */}
            {adminTab === 'messages' && user.role === 'admin' && (
              <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <h2 className="text-2xl font-bold mb-4">{t('رسائل العملاء', 'Customer Messages')} ({contactMessages.length})</h2>
                {contactMessages.map(msg => (
                  <div key={msg.id} className="border p-4 rounded-lg bg-gray-50 space-y-2">
                    <p className="font-bold">{msg.name} ({msg.phone})</p>
                    <p className="text-gray-700 bg-white p-3 rounded border">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ===== تبويب الموظفين ===== */}
            {adminTab === 'staff' && user.role === 'admin' && (
              <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <h2 className="text-2xl font-bold mb-4">{t('إدارة الموظفين', 'Staff Management')}</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if(!newStaffName || !newStaffEmail || !newStaffPassword) return;
                    setStaffList([...staffList, {
                        id: Date.now(),
                        name: newStaffName,
                        email: newStaffEmail,
                        phone: newStaffPhone,
                        password: newStaffPassword,
                        role: newStaffRole
                    }]);
                    setNewStaffName('');
                    setNewStaffEmail('');
                    setNewStaffPhone('');
                    setNewStaffPassword('');
                    setNewStaffRole('call_center');
                    showToast(t('تم إضافة الموظف بنجاح!', 'Staff added!'));
                }} className="space-y-4 border-b pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label={t('اسم الموظف', 'Staff Name')} type="text" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} required={true} id="sName"/>
                        <InputField label={t('البريد الإلكتروني', 'Email')} type="email" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} required={true} id="sEmail"/>
                        <InputField label={t('كلمة المرور', 'Password')} type="text" value={newStaffPassword} onChange={e => setNewStaffPassword(e.target.value)} required={true} id="sPass"/>
                        <InputField label={t('رقم الهاتف', 'Phone')} type="tel" value={newStaffPhone} onChange={e => setNewStaffPhone(e.target.value)} id="sPhone"/>
                        <SelectField label={t('الصلاحية', 'Role')} value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)} options={[{value: 'call_center', label: t('مؤكد طلبات / خدمة عملاء', 'Call Center / Support')}, {value: 'packer', label: t('محضر طلبات', 'Packer')}]} id="sRole" />
                    </div>
                    <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-bold">{t('إضافة موظف', 'Add Staff')}</button>
                </form>
                <div className="space-y-3 pt-4">
                    {staffList.length === 0 ? <p className="text-gray-500">{t('لا يوجد موظفين حتى الآن.', 'No staff yet.')}</p> : staffList.map(staff => (
                        <div key={staff.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                            <div>
                                <p className="font-bold">{staff.name} <span className="text-sm text-blue-600 me-2">({staff.role === 'packer' ? t('محضر طلبات', 'Packer') : t('مؤكد طلبات', 'Call Center')})</span></p>
                                <p className="text-sm text-gray-600 mt-1">{t('الايميل:', 'Email:')} {staff.email} | {t('الباسورد:', 'Password:')} {staff.password}</p>
                            </div>
                            <button onClick={() => setStaffList(staffList.filter(s => s.id !== staff.id))} className="text-red-600 font-bold px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition">{t('حذف', 'Delete')}</button>
                        </div>
                    ))}
                </div>
              </div>
            )}

            {/* ===== تبويب إعدادات المحتوى ===== */}
            {adminTab === 'content' && user.role === 'admin' && (
              <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <h2 className="text-2xl font-bold mb-4">{t('إعدادات شكل الموقع', 'Site Design Settings')}</h2>
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border">
                  <input type="checkbox" id="showCount" checked={adminSettings.current.showCountdownBar} onChange={(e) => { adminSettings.current.showCountdownBar = e.target.checked; bumpSettings(); }} className="w-5 h-5" />
                  <label htmlFor="showCount" className="font-bold text-lg cursor-pointer">{t('إظهار شريط العداد التنازلي', 'Show Countdown Bar')}</label>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border space-y-2">
                  <label htmlFor="saleEndDate" className="block font-bold">{t('العرض هيخلص إمتى؟', 'When does the sale end?')}</label>
                  <input type="datetime-local" id="saleEndDate" value={toDatetimeLocalValue(adminSettings.current.saleEndDate)} onChange={(e) => { if (!e.target.value) return; adminSettings.current.saleEndDate = new Date(e.target.value).toISOString(); bumpSettings(); }} className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white" />
                  <p className="text-xs text-gray-500">{t('العداد فوق الموقع والأسعار المخفّضة هترجع تلقائي للسعر العادي أول ما الوقت ده يخلص.', 'The counter and sale prices will revert automatically when this time expires.')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <InputField label={`${t('اسم المتجر', 'Store Name')} (${t('عربي', 'Arabic')})`} type="text" value={getLocalized(adminSettings.current.storeName)} onChange={(e) => { adminSettings.current.storeName = { ...adminSettings.current.storeName, ar: e.target.value }; adminSettings.current.logoText = { ...adminSettings.current.logoText, ar: e.target.value }; bumpSettings(); }} id="storeNameAr" />
                  <InputField label={`${t('اسم المتجر', 'Store Name')} (English)`} type="text" value={adminSettings.current.storeName.en || ''} onChange={(e) => { adminSettings.current.storeName = { ...adminSettings.current.storeName, en: e.target.value }; adminSettings.current.logoText = { ...adminSettings.current.logoText, en: e.target.value }; bumpSettings(); }} id="storeNameEn" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label={t('صورة البانر (الصفحة الرئيسية)', 'Hero/Banner Image')} type="text" value={adminSettings.current.heroImage} onChange={(e) => { adminSettings.current.heroImage = e.target.value; bumpSettings(); }} id="heroImage" />
                </div>
                <div className="grid grid-cols-1 gap-4 pt-4 border-t">
                  <h3 className="text-xl font-bold">{t('نص البانر (الصفحة الرئيسية)', 'Banner Text (Home Page)')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label={`${t('العنوان الرئيسي', 'Main Title')} (${t('عربي', 'Arabic')})`} type="text" value={getLocalized(adminSettings.current.heroTitle)} onChange={(e) => { adminSettings.current.heroTitle = { ...adminSettings.current.heroTitle, ar: e.target.value }; bumpSettings(); }} id="heroTitleAr" />
                    <InputField label={`${t('العنوان الرئيسي', 'Main Title')} (English)`} type="text" value={adminSettings.current.heroTitle.en || ''} onChange={(e) => { adminSettings.current.heroTitle = { ...adminSettings.current.heroTitle, en: e.target.value }; bumpSettings(); }} id="heroTitleEn" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label={`${t('العنوان الفرعي', 'Subtitle')} (${t('عربي', 'Arabic')})`} type="text" value={getLocalized(adminSettings.current.heroSubtitle)} onChange={(e) => { adminSettings.current.heroSubtitle = { ...adminSettings.current.heroSubtitle, ar: e.target.value }; bumpSettings(); }} id="heroSubtitleAr" />
                    <InputField label={`${t('العنوان الفرعي', 'Subtitle')} (English)`} type="text" value={adminSettings.current.heroSubtitle.en || ''} onChange={(e) => { adminSettings.current.heroSubtitle = { ...adminSettings.current.heroSubtitle, en: e.target.value }; bumpSettings(); }} id="heroSubtitleEn" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 pt-4 border-t">
                  <h3 className="text-xl font-bold">{t('اللوجو في الهيدر', 'Header Logo')}</h3>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="useLogoImage" checked={!!adminSettings.current.useLogoImage} onChange={(e) => { adminSettings.current.useLogoImage = e.target.checked; bumpSettings(); }} className="w-5 h-5" />
                    <label htmlFor="useLogoImage" className="font-semibold cursor-pointer">{t('استخدام صورة لوجو بدل اسم المتجر في المنتصف', 'Use a logo image instead of the store name in the header')}</label>
                  </div>
                  {adminSettings.current.useLogoImage && (
                    <InputField label={t('رابط صورة اللوجو', 'Logo Image URL')} type="text" value={adminSettings.current.logoImage} onChange={(e) => { adminSettings.current.logoImage = e.target.value; bumpSettings(); }} placeholder="https://example.com/logo.png" id="logoImageUrl" />
                  )}
                </div>
                <div className="grid grid-cols-1 gap-6 pt-4 border-t">
                  <h3 className="text-xl font-bold">{t('إعدادات قسم "عن المكان"', 'About Section Settings')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextareaField label={`${t('نص نبذة عن المتجر', 'About Text')} (${t('عربي', 'Arabic')})`} value={getLocalized(adminSettings.current.aboutText)} onChange={(e) => { adminSettings.current.aboutText = { ...adminSettings.current.aboutText, ar: e.target.value }; bumpSettings(); }} rows={4} id="aboutTextAr" />
                    <TextareaField label={`${t('نص نبذة عن المتجر', 'About Text')} (English)`} value={adminSettings.current.aboutText.en || ''} onChange={(e) => { adminSettings.current.aboutText = { ...adminSettings.current.aboutText, en: e.target.value }; bumpSettings(); }} rows={4} id="aboutTextEn" />
                  </div>
                  <InputField label={t('رابط صورة نبذة عن المتجر', 'About Image URL')} type="text" value={adminSettings.current.aboutImage} onChange={(e) => { adminSettings.current.aboutImage = e.target.value; bumpSettings(); }} id="aboutImage" />
                </div>
                <div className="grid grid-cols-1 gap-6 pt-6 border-t">
                  <h3 className="text-xl font-bold">⚙️ {t('إعدادات الفوتر', 'Footer Settings')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label={`${t('نص العنوان', 'Address Text')} (${t('عربي', 'Arabic')})`} type="text" value={getLocalized(adminSettings.current.locationText)} onChange={(e) => { adminSettings.current.locationText = { ...adminSettings.current.locationText, ar: e.target.value }; bumpSettings(); }} placeholder={t('مثال: القاهرة، مصر', 'e.g. Cairo, Egypt')} id="locationTextAr" />
                    <InputField label={`${t('نص العنوان', 'Address Text')} (English)`} type="text" value={adminSettings.current.locationText.en || ''} onChange={(e) => { adminSettings.current.locationText = { ...adminSettings.current.locationText, en: e.target.value }; bumpSettings(); }} placeholder="e.g. Cairo, Egypt" id="locationTextEn" />
                  </div>
                  <InputField label={t('رقم الهاتف', 'Phone')} type="tel" value={adminSettings.current.phone} onChange={(e) => { adminSettings.current.phone = e.target.value; bumpSettings(); }} placeholder={t('مثال: 01091900530', 'e.g. 01091900530')} id="footerPhone" />
                  <InputField label={t('رقم واتساب (اختياري)', 'WhatsApp (optional)')} type="tel" value={adminSettings.current.whatsapp} onChange={(e) => { adminSettings.current.whatsapp = e.target.value; bumpSettings(); }} placeholder={t('مثال: 01012345678', 'e.g. 01012345678')} id="footerWhatsapp" />
                  <InputField label={t('البريد الإلكتروني', 'Email')} type="email" value={adminSettings.current.email} onChange={(e) => { adminSettings.current.email = e.target.value; bumpSettings(); }} placeholder={t('مثال: info@lava.com', 'e.g. info@lava.com')} id="footerEmail" />
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border">
                    <input type="checkbox" id="showLocation" checked={adminSettings.current.showLocation} onChange={(e) => { adminSettings.current.showLocation = e.target.checked; bumpSettings(); }} className="w-5 h-5" />
                    <label htmlFor="showLocation" className="font-bold text-lg cursor-pointer">{t('إظهار العنوان / الفرع', 'Show Address / Branch')}</label>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                    <p className="font-bold">{t('روابط التواصل الاجتماعي', 'Social Media Links')}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'socialFacebook', label: t('فيسبوك', 'Facebook'), icon: 'fab fa-facebook', defaultUrl: 'https://facebook.com' },
                        { key: 'socialInstagram', label: t('انستجرام', 'Instagram'), icon: 'fab fa-instagram', defaultUrl: 'https://instagram.com' },
                        { key: 'socialTiktok', label: t('تيك توك', 'TikTok'), icon: 'fab fa-tiktok', defaultUrl: 'https://tiktok.com' },
                        { key: 'socialYoutube', label: t('يوتيوب', 'YouTube'), icon: 'fab fa-youtube', defaultUrl: '' },
                        { key: 'socialLinkedin', label: t('لينكد إن', 'LinkedIn'), icon: 'fab fa-linkedin', defaultUrl: '' },
                        { key: 'socialSnapchat', label: t('سناب شات', 'Snapchat'), icon: 'fab fa-snapchat', defaultUrl: '' },
                      ].map((platform) => {
                        const enabledKey = platform.key + 'Enabled';
                        const urlValue = adminSettings.current[platform.key] || '';
                        return (
                          <div key={platform.key} className="space-y-2 border-b pb-3">
                            <div className="flex items-center gap-3">
                              <input type="checkbox" id={enabledKey} checked={adminSettings.current[enabledKey] || false} onChange={(e) => { adminSettings.current[enabledKey] = e.target.checked; bumpSettings(); }} className="w-4 h-4" />
                              <label htmlFor={enabledKey} className="font-semibold text-sm"><i className={platform.icon}></i> {platform.label}</label>
                            </div>
                            <input type="text" value={urlValue} onChange={(e) => { adminSettings.current[platform.key] = e.target.value; bumpSettings(); }} placeholder={`${t('رابط', 'Link')} ${platform.label}`} className="w-full px-4 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm" dir="ltr" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t">
                  <h3 className="text-xl font-bold">{t('إعدادات التوصيات والعروض', 'Recommendations & Offers Settings')}</h3>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border">
                    <input type="checkbox" id="showRecommendations" checked={adminSettings.current.showRecommendations} onChange={(e) => { adminSettings.current.showRecommendations = e.target.checked; bumpSettings(); }} className="w-5 h-5" />
                    <label htmlFor="showRecommendations" className="font-bold text-lg cursor-pointer">{t('إظهار المنتجات المقترحة', 'Show Recommended Products')}</label>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border">
                    <input type="checkbox" id="showBundleOffers" checked={adminSettings.current.showBundleOffers} onChange={(e) => { adminSettings.current.showBundleOffers = e.target.checked; bumpSettings(); }} className="w-5 h-5" />
                    <label htmlFor="showBundleOffers" className="font-bold text-lg cursor-pointer">{t('إظهار عروض الشراء المشترك', 'Show Bundle Offers')}</label>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border">
                    <input type="checkbox" id="showReviews" checked={adminSettings.current.showReviews} onChange={(e) => { adminSettings.current.showReviews = e.target.checked; bumpSettings(); }} className="w-5 h-5" />
                    <label htmlFor="showReviews" className="font-bold text-lg cursor-pointer">⭐ {t('تفعيل التقييمات والمراجعات (عام)', 'Enable Reviews & Ratings (global)')}</label>
                  </div>
                  <p className="text-xs text-gray-500 px-1">{t('يمكنك أيضاً تفعيل/تعطيل التقييمات لكل منتج على حدة من تبويب "إدارة المنتجات".', 'You can also enable/disable reviews per individual product from the "Product Management" tab.')}</p>
                </div>
                <div className="pt-6 border-t space-y-3">
                  <h3 className="text-xl font-bold">{t('إعدادات المخزون والتوفر', 'Inventory & Availability Settings')}</h3>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border">
                    <input type="checkbox" id="displayOutOfStockProducts" checked={adminSettings.current.displayOutOfStockProducts} onChange={(e) => { adminSettings.current.displayOutOfStockProducts = e.target.checked; bumpSettings(); }} className="w-5 h-5" />
                    <label htmlFor="displayOutOfStockProducts" className="font-bold text-lg cursor-pointer">{t('إظهار المنتجات غير المتوفرة للعملاء (بعلامة "غير متوفر")', 'Display out-of-stock products to customers (with "Out of Stock" badge)')}</label>
                  </div>
                  <p className="text-xs text-gray-500 px-1">{t('لو الخيار مقفول، المنتجات اللي كل الفاريانتس بتاعتها بمخزون صفر هتتخفي تماماً من الرئيسية والمتجر والبحث والتوصيات.', 'When off, products with zero stock across all variants are hidden entirely from home, shop, search, and recommendations.')}</p>
                  <div className="bg-gray-50 p-4 rounded-lg border max-w-xs">
                    <label className="block font-bold text-sm mb-1">{t('حد التنبيه الافتراضي للمخزون المنخفض', 'Default low stock threshold')}</label>
                    <input
                      type="number"
                      min="0"
                      value={adminSettings.current.defaultLowStockThreshold}
                      onChange={(e) => { adminSettings.current.defaultLowStockThreshold = Math.max(0, Number(e.target.value) || 0); bumpSettings(); }}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">{t('ينطبق على أي منتج مالوش حد مخصص خاص بيه.', 'Applies to any product without its own custom threshold.')}</p>
                  </div>
                </div>
                <button onClick={() => showToast(t('تم حفظ التعديلات بنجاح!', 'Settings saved!'))} className="bg-black text-white px-8 py-3 rounded-lg font-bold">{t('حفظ التعديلات', 'Save Changes')}</button>
              </div>
            )}

            {/* ===== تبويب أقسام الصفحة الرئيسية ===== */}
            {adminTab === 'home_sections' && user.role === 'admin' && (
              <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <h2 className="text-2xl font-bold mb-4">🏠 {t('إدارة أقسام الصفحة الرئيسية', 'Home Page Sections')}</h2>
                <p className="text-sm text-gray-600 mb-4">{t('أضف أقساماً جديدة تظهر في الصفحة الرئيسية (صورة، نص، أو كلاهما).', 'Add new sections to the home page (image, text, or both).')}</p>

                <form onSubmit={addHomeSection} className="space-y-4 border-b pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      label={t('نوع القسم', 'Section Type')}
                      value={newSectionType}
                      onChange={(e) => setNewSectionType(e.target.value)}
                      options={[
                        { value: 'image-text', label: t('صورة + نص', 'Image + Text') },
                        { value: 'image-only', label: t('صورة فقط', 'Image Only') },
                        { value: 'text-only', label: t('نص فقط', 'Text Only') }
                      ]}
                      id="sectionType"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label={`${t('العنوان', 'Title')} (${t('عربي', 'Arabic')})`} type="text" value={newSectionTitleAr} onChange={(e) => setNewSectionTitleAr(e.target.value)} placeholder={t('عنوان القسم', 'Section Title')} id="sectionTitleAr" />
                    <InputField label={`${t('العنوان', 'Title')} (English)`} type="text" value={newSectionTitleEn} onChange={(e) => setNewSectionTitleEn(e.target.value)} placeholder="Section Title" id="sectionTitleEn" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextareaField label={`${t('الوصف', 'Description')} (${t('عربي', 'Arabic')})`} value={newSectionDescAr} onChange={(e) => setNewSectionDescAr(e.target.value)} placeholder={t('وصف القسم', 'Section description')} rows={2} id="sectionDescAr" />
                    <TextareaField label={`${t('الوصف', 'Description')} (English)`} value={newSectionDescEn} onChange={(e) => setNewSectionDescEn(e.target.value)} placeholder="Section description" rows={2} id="sectionDescEn" />
                  </div>
                  <InputField label={t('رابط الصورة', 'Image URL')} type="text" value={newSectionImage} onChange={(e) => setNewSectionImage(e.target.value)} placeholder="https://example.com/image.jpg" id="sectionImage" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      label={t('الزرار (اختياري) — من الأزرار الموجودة فعلاً', 'Button (optional) — from existing buttons')}
                      value={newSectionButtonAction}
                      onChange={(e) => setNewSectionButtonAction(e.target.value)}
                      options={sectionButtonActions.map(a => ({ value: a.key, label: a.label }))}
                      id="sectionButtonAction"
                    />
                  </div>
                  {newSectionButtonAction !== 'none' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label={`${t('نص الزرار', 'Button Text')} (${t('عربي', 'Arabic')})`} type="text" value={newSectionButtonTextAr} onChange={(e) => setNewSectionButtonTextAr(e.target.value)} placeholder={t('مثال: تسوق الآن', 'e.g. Shop Now')} id="sectionButtonTextAr" />
                      <InputField label={`${t('نص الزرار', 'Button Text')} (English)`} type="text" value={newSectionButtonTextEn} onChange={(e) => setNewSectionButtonTextEn(e.target.value)} placeholder="e.g. Shop Now" id="sectionButtonTextEn" />
                    </div>
                  )}
                  <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-bold">{t('إضافة القسم', 'Add Section')}</button>
                </form>

                <div className="space-y-4 mt-4">
                  <h3 className="font-bold text-lg">{t('الأقسام الحالية', 'Current Sections')}</h3>
                  {homeSections.length === 0 && <p className="text-gray-500">{t('لا توجد أقسام مضافة.', 'No sections added.')}</p>}
                  {homeSections.map((section, idx) => (
                    <div key={section.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                      <div className="flex-1">
                        <span className="font-semibold">#{idx+1}</span>
                        <span className="me-2 text-sm bg-gray-200 px-2 py-1 rounded">{section.type}</span>
                        {section.title && <span className="me-2">{getLocalized(section.title)}</span>}
                        {section.image && <span className="text-xs text-gray-500 me-2">(🖼️ {t('صورة', 'Image')})</span>}
                      </div>
                      <button onClick={() => deleteHomeSection(section.id)} className="text-red-600 font-bold px-3 py-1 bg-red-50 rounded hover:bg-red-100">{t('حذف', 'Delete')}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== تبويب الصفحات المخصصة ===== */}
            {adminTab === 'custom_pages' && user.role === 'admin' && (
              <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <h2 className="text-2xl font-bold mb-4">📄 {t('إدارة الصفحات', 'Pages Management')}</h2>
                <p className="text-sm text-gray-600 mb-4">{t('أضف صفحات جديدة براحتك، وهتظهر كزرار في القائمة العلوية. كل صفحة ممكن تحتوي على أقسام (صورة/نص/زرار) زي أقسام الصفحة الرئيسية.', 'Add as many pages as you like — each one shows as a button in the top nav. Each page can hold sections (image/text/button) just like the home page sections.')}</p>

                <form onSubmit={addCustomPage} className="space-y-4 border-b pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label={`${t('اسم الصفحة', 'Page Name')} (${t('عربي', 'Arabic')})`} type="text" value={newPageTitleAr} onChange={(e) => setNewPageTitleAr(e.target.value)} placeholder={t('مثال: عروضنا', 'e.g. Our Offers')} id="pageTitleAr" />
                    <InputField label={`${t('اسم الصفحة', 'Page Name')} (English)`} type="text" value={newPageTitleEn} onChange={(e) => setNewPageTitleEn(e.target.value)} placeholder="e.g. Our Offers" id="pageTitleEn" />
                  </div>
                  <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-bold">{t('إضافة صفحة جديدة', 'Add New Page')}</button>
                </form>

                <div className="space-y-3">
                  <h3 className="font-bold text-lg">{t('الصفحات الحالية', 'Current Pages')}</h3>
                  {customPages.length === 0 && <p className="text-gray-500">{t('لا توجد صفحات مضافة بعد.', 'No pages added yet.')}</p>}
                  {customPages.map(page => (
                    <div key={page.id} className="bg-gray-50 p-4 rounded-lg border space-y-2">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="font-bold">{getLocalized(page.title)}</span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                            <input type="checkbox" checked={page.showInNav} onChange={() => toggleCustomPageInNav(page.id)} className="w-4 h-4" />
                            {t('إظهار في القائمة العلوية', 'Show in nav')}
                          </label>
                          <button onClick={() => deleteCustomPage(page.id)} className="text-red-600 font-bold px-3 py-1 bg-red-50 rounded hover:bg-red-100 text-sm">{t('حذف الصفحة', 'Delete Page')}</button>
                        </div>
                      </div>
                      {page.sections.length > 0 && (
                        <div className="space-y-2 pt-2 border-t">
                          {page.sections.map((section, idx) => (
                            <div key={section.id} className="flex justify-between items-center bg-white p-3 rounded border text-sm">
                              <div className="flex-1">
                                <span className="font-semibold">#{idx + 1}</span>
                                <span className="mx-2 text-xs bg-gray-200 px-2 py-1 rounded">{section.type}</span>
                                {section.title && <span className="me-2">{getLocalized(section.title)}</span>}
                              </div>
                              <button onClick={() => deleteCustomPageSection(page.id, section.id)} className="text-red-600 font-bold px-2 py-1 bg-red-50 rounded hover:bg-red-100 text-xs">{t('حذف', 'Delete')}</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {customPages.length > 0 && (
                  <div className="pt-6 border-t space-y-4">
                    <h3 className="font-bold text-lg">{t('إضافة قسم (صورة/نص/زرار) لصفحة', 'Add a section (image/text/button) to a page')}</h3>
                    <SelectField
                      label={t('اختر الصفحة', 'Choose Page')}
                      value={selectedPageForSection}
                      onChange={(e) => setSelectedPageForSection(e.target.value)}
                      options={[
                        { value: '', label: '-- ' + t('اختر صفحة', 'Choose a page') + ' --' },
                        ...customPages.map(p => ({ value: String(p.id), label: getLocalized(p.title) }))
                      ]}
                      id="selectedPageForSection"
                    />
                    {selectedPageForSection && (
                      <form onSubmit={addCustomPageSection} className="space-y-4">
                        <SelectField
                          label={t('نوع القسم', 'Section Type')}
                          value={newPageSectionType}
                          onChange={(e) => setNewPageSectionType(e.target.value)}
                          options={[
                            { value: 'image-text', label: t('صورة + نص', 'Image + Text') },
                            { value: 'image-only', label: t('صورة فقط', 'Image Only') },
                            { value: 'text-only', label: t('نص فقط', 'Text Only') }
                          ]}
                          id="pageSectionType"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField label={`${t('العنوان', 'Title')} (${t('عربي', 'Arabic')})`} type="text" value={newPageSectionTitleAr} onChange={(e) => setNewPageSectionTitleAr(e.target.value)} placeholder={t('عنوان القسم', 'Section Title')} id="pageSectionTitleAr" />
                          <InputField label={`${t('العنوان', 'Title')} (English)`} type="text" value={newPageSectionTitleEn} onChange={(e) => setNewPageSectionTitleEn(e.target.value)} placeholder="Section Title" id="pageSectionTitleEn" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <TextareaField label={`${t('الوصف', 'Description')} (${t('عربي', 'Arabic')})`} value={newPageSectionDescAr} onChange={(e) => setNewPageSectionDescAr(e.target.value)} placeholder={t('وصف القسم', 'Section description')} rows={2} id="pageSectionDescAr" />
                          <TextareaField label={`${t('الوصف', 'Description')} (English)`} value={newPageSectionDescEn} onChange={(e) => setNewPageSectionDescEn(e.target.value)} placeholder="Section description" rows={2} id="pageSectionDescEn" />
                        </div>
                        <InputField label={t('رابط الصورة', 'Image URL')} type="text" value={newPageSectionImage} onChange={(e) => setNewPageSectionImage(e.target.value)} placeholder="https://example.com/image.jpg" id="pageSectionImage" />
                        <SelectField
                          label={t('الزرار (اختياري) — من الأزرار الموجودة فعلاً', 'Button (optional) — from existing buttons')}
                          value={newPageSectionButtonAction}
                          onChange={(e) => setNewPageSectionButtonAction(e.target.value)}
                          options={sectionButtonActions.map(a => ({ value: a.key, label: a.label }))}
                          id="pageSectionButtonAction"
                        />
                        {newPageSectionButtonAction !== 'none' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label={`${t('نص الزرار', 'Button Text')} (${t('عربي', 'Arabic')})`} type="text" value={newPageSectionButtonTextAr} onChange={(e) => setNewPageSectionButtonTextAr(e.target.value)} placeholder={t('مثال: تسوق الآن', 'e.g. Shop Now')} id="pageSectionButtonTextAr" />
                            <InputField label={`${t('نص الزرار', 'Button Text')} (English)`} type="text" value={newPageSectionButtonTextEn} onChange={(e) => setNewPageSectionButtonTextEn(e.target.value)} placeholder="e.g. Shop Now" id="pageSectionButtonTextEn" />
                          </div>
                        )}
                        <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-bold">{t('إضافة القسم', 'Add Section')}</button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ===== تبويب توصيات وعروض المنتجات ===== */}
            {adminTab === 'recommendations' && user.role === 'admin' && (
              <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <h2 className="text-2xl font-bold mb-4">🎯 {t('إدارة التوصيات والعروض', 'Recommendations & Offers')}</h2>
                <p className="text-sm text-gray-600 mb-4">{t('اختر منتجاً، ثم حدد المنتجات المقترحة وعروض الشراء المشترك.', 'Select a product, then set recommended products and bundle offers.')}</p>

                <div className="space-y-4">
                  <SelectField
                    label={t('اختر المنتج', 'Select Product')}
                    value={selectedProductForRec || ''}
                    onChange={(e) => handleProductRecSelect(Number(e.target.value))}
                    options={[
                      { value: '', label: '-- ' + t('اختر منتجاً', 'Choose a product') + ' --' },
                      ...products.map(p => ({ value: p.id, label: getLocalized(p.name) }))
                    ]}
                    id="productRecSelect"
                  />

                  {selectedProductForRec && (
                    <>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="recEnableRec" checked={recEnableRec} onChange={(e) => setRecEnableRec(e.target.checked)} className="w-5 h-5" />
                          <label htmlFor="recEnableRec" className="font-bold cursor-pointer">📌 {t('تفعيل التوصيات لهذا المنتج', 'Enable recommendations for this product')}</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="recEnableBundle" checked={recEnableBundle} onChange={(e) => setRecEnableBundle(e.target.checked)} className="w-5 h-5" />
                          <label htmlFor="recEnableBundle" className="font-bold cursor-pointer">🛒 {t('تفعيل عروض الباقة لهذا المنتج', 'Enable bundle offers for this product')}</label>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-sm mb-1">{t('بحث في المنتجات', 'Search products')}</label>
                        <input
                          type="text"
                          value={recSearchQuery}
                          onChange={(e) => setRecSearchQuery(e.target.value)}
                          placeholder={t('ابحث عن منتج...', 'Search for product...')}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-sm mb-1">{t('المنتجات المقترحة', 'Recommended Products')}</label>
                        {recProductIds.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {recProductIds.map(id => {
                              const p = products.find(pr => pr.id === id);
                              if (!p) return null;
                              return (
                                <span key={id} className="inline-flex items-center gap-2 bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                                  {getLocalized(p.name)}
                                  <button
                                    type="button"
                                    onClick={() => setRecProductIds(prev => prev.filter(i => i !== id))}
                                    className="hover:text-red-400 font-bold leading-none"
                                    aria-label={t('إزالة', 'Remove')}
                                  >×</button>
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <div className="w-full border rounded-lg bg-white max-h-44 overflow-y-auto divide-y">
                          {products
                            .filter(p => p.id !== selectedProductForRec)
                            .filter(p => getLocalized(p.name).toLowerCase().includes(recSearchQuery.toLowerCase()))
                            .map(p => (
                              <label key={p.id} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                                <input
                                  type="checkbox"
                                  checked={recProductIds.includes(p.id)}
                                  onChange={(e) => {
                                    setRecProductIds(prev => e.target.checked ? [...prev, p.id] : prev.filter(i => i !== p.id));
                                  }}
                                  className="w-4 h-4"
                                />
                                {getLocalized(p.name)}
                              </label>
                            ))}
                          {products.filter(p => p.id !== selectedProductForRec && getLocalized(p.name).toLowerCase().includes(recSearchQuery.toLowerCase())).length === 0 && (
                            <p className="text-xs text-gray-400 px-3 py-2">{t('لا توجد منتجات مطابقة', 'No matching products')}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-sm mb-1">{t('منتجات العروض المشتركة', 'Bundle Products')}</label>
                        {bundleProductIds.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {bundleProductIds.map(id => {
                              const p = products.find(pr => pr.id === id);
                              if (!p) return null;
                              return (
                                <span key={id} className="inline-flex items-center gap-2 bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                                  {getLocalized(p.name)}
                                  <button
                                    type="button"
                                    onClick={() => setBundleProductIds(prev => prev.filter(i => i !== id))}
                                    className="hover:text-red-400 font-bold leading-none"
                                    aria-label={t('إزالة', 'Remove')}
                                  >×</button>
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <div className="w-full border rounded-lg bg-white max-h-44 overflow-y-auto divide-y">
                          {products
                            .filter(p => p.id !== selectedProductForRec)
                            .filter(p => getLocalized(p.name).toLowerCase().includes(recSearchQuery.toLowerCase()))
                            .map(p => (
                              <label key={p.id} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                                <input
                                  type="checkbox"
                                  checked={bundleProductIds.includes(p.id)}
                                  onChange={(e) => {
                                    setBundleProductIds(prev => e.target.checked ? [...prev, p.id] : prev.filter(i => i !== p.id));
                                  }}
                                  className="w-4 h-4"
                                />
                                {getLocalized(p.name)}
                              </label>
                            ))}
                          {products.filter(p => p.id !== selectedProductForRec && getLocalized(p.name).toLowerCase().includes(recSearchQuery.toLowerCase())).length === 0 && (
                            <p className="text-xs text-gray-400 px-3 py-2">{t('لا توجد منتجات مطابقة', 'No matching products')}</p>
                          )}
                        </div>
                      </div>

                      <InputField
                        label={t('نسبة الخصم على العرض المشترك (%)', 'Bundle Discount (%)')}
                        type="number"
                        value={bundleDiscountPercent}
                        onChange={(e) => setBundleDiscountPercent(Number(e.target.value))}
                        placeholder={t('مثال: 15', 'e.g. 15')}
                        id="bundleDiscount"
                      />

                      <button
                        onClick={saveRecommendations}
                        className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition"
                      >
                        {t('حفظ التوصيات والعروض', 'Save Recommendations & Offers')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

                    </div>
                  </div>
                </>
              );
            })()}

          </section>
        )}

      </main>

      {/* ============================================================ */}
      {/* الفوتر */}
      {/* ============================================================ */}
      <footer className="bg-gray-900 text-white py-8 px-6 md:px-12" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className={`max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center ${language === 'ar' ? 'md:text-right' : 'md:text-left'}`}>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{getLocalized(adminSettings.current.storeName)}</h3>
            <p className="text-gray-400 text-xs mt-1">{t('اشعل ستايلك مع أحدث صيحات الموضة.', 'Ignite your style with the latest fashion.')}</p>
          </div>

          <div className="flex-1 text-gray-400 text-sm">
            {adminSettings.current.showLocation ? (
              <p>{getLocalized(adminSettings.current.locationText)}</p>
            ) : (
              <p>{t('متجر أونلاين', 'Online Store')}</p>
            )}
            {adminSettings.current.phone && (
              <p className="mt-1">📞 {adminSettings.current.phone}</p>
            )}
            {adminSettings.current.whatsapp && (
              <p className="mt-1">💬 {t('واتساب:', 'WhatsApp:')} {adminSettings.current.whatsapp}</p>
            )}
            {adminSettings.current.email && (
              <p className="mt-1">✉️ {adminSettings.current.email}</p>
            )}
          </div>

          <div className="flex-1">
            <p className="text-gray-400 text-sm mb-2">{t('مواقعنا', 'Our Sites')}</p>
            <div className={`flex justify-center gap-5 text-2xl ${language === 'ar' ? 'md:justify-start' : 'md:justify-end'}`}>
              {[
                { key: 'socialFacebook', icon: 'fab fa-facebook', color: '#1877f2' },
                { key: 'socialInstagram', icon: 'fab fa-instagram', color: '#e4405f' },
                { key: 'socialTiktok', icon: 'fab fa-tiktok', color: '#ffffff' },
                { key: 'socialYoutube', icon: 'fab fa-youtube', color: '#ff0000' },
                { key: 'socialLinkedin', icon: 'fab fa-linkedin', color: '#0a66c2' },
                { key: 'socialSnapchat', icon: 'fab fa-snapchat', color: '#fffc00' },
              ].map((platform) => {
                const enabled = adminSettings.current[platform.key + 'Enabled'];
                const url = adminSettings.current[platform.key];
                if (!enabled || !url) return null;
                return (
                  <a key={platform.key} href={url} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-200" style={{ color: platform.color }}>
                    <i className={platform.icon}></i>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}