/**
 * THE ART MAKAN - HIGH PERFORMANCE E-COMMERCE ENGINE
 * Lightweight Vanilla JS • Fast • Multi-Language • Multi-Currency • Live 3D Studio
 */

(function () {
  'use strict';

  const STORAGE_KEY_PRODUCTS = 'artmakan_products';
  const STORAGE_KEY_ADMIN = 'artmakan_admin_mode';

  // Safe Storage Wrapper (handles private browsing, file:// sandbox & quota limits)
  const safeStorage = {
    get(key, fallback = null) {
      try {
        const val = localStorage.getItem(key);
        return val !== null ? val : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, val) {
      try {
        localStorage.setItem(key, String(val));
      } catch (e) {
        console.warn('localStorage set failed:', e);
      }
    },
    getJSON(key, fallback = null) {
      try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    setJSON(key, val) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        console.warn('localStorage setJSON failed:', e);
      }
    }
  };

  // State Management
  const STATE = {
    lang: safeStorage.get('artmakan_lang', 'ar'), // Default Arabic for Saudi Store
    currency: safeStorage.get('artmakan_curr', 'SAR'),
    isAdminMode: safeStorage.get(STORAGE_KEY_ADMIN) === 'true',
    rates: {
      SAR: 1.0,
      USD: 0.266,
      EUR: 0.245,
      GBP: 0.210,
      AED: 0.980,
      PKR: 74.20,
      INR: 22.30,
      KWD: 0.082,
      QAR: 0.970,
      OMR: 0.102,
      BHD: 0.100
    },
    translations: {},
    products: [],
    filteredProducts: [],
    selectedCategory: 'all',
    searchQuery: '',
    sortBy: 'featured',
    currentPage: 1,
    pageSize: 12,
    cart: safeStorage.getJSON('artmakan_cart', []),
    
    // Live Studio State
    studio: {
      productType: 'mug',
      text: '',
      font: 'font-calligraphy',
      color: '#f7f3ec',
      imageData: null,
      sizeExtra: 0,
      basePriceSAR: 55
    }
  };

  // WhatsApp Business Number (Saudi Format)
  const WHATSAPP_PHONE = '966500000000';

  // Currency symbols & names mapping
  const CURRENCY_CONFIG = {
    SAR: { symbol: 'SAR', ar_symbol: 'ر.س', ur_symbol: 'ریال', decimals: 2 },
    USD: { symbol: '$', ar_symbol: '$', ur_symbol: '$', decimals: 2 },
    EUR: { symbol: '€', ar_symbol: '€', ur_symbol: '€', decimals: 2 },
    GBP: { symbol: '£', ar_symbol: '£', ur_symbol: '£', decimals: 2 },
    AED: { symbol: 'AED', ar_symbol: 'د.إ', ur_symbol: 'درہم', decimals: 2 },
    PKR: { symbol: 'PKR', ar_symbol: 'PKR', ur_symbol: 'روپے', decimals: 0 },
    INR: { symbol: 'INR', ar_symbol: 'INR', ur_symbol: 'روپے', decimals: 0 },
    KWD: { symbol: 'KWD', ar_symbol: 'د.ك', ur_symbol: 'دینار', decimals: 3 },
    QAR: { symbol: 'QAR', ar_symbol: 'ر.ق', ur_symbol: 'ریال', decimals: 2 },
    OMR: { symbol: 'OMR', ar_symbol: 'ر.ع', ur_symbol: 'ریال', decimals: 3 },
    BHD: { symbol: 'BHD', ar_symbol: 'د.ب', ur_symbol: 'دینار', decimals: 3 }
  };

  // DOM Elements Cache
  const DOM = {};

  function initDOMElements() {
    DOM.html = document.documentElement;
    DOM.langSelect = document.getElementById('lang-select');
    DOM.currSelect = document.getElementById('curr-select');
    DOM.cartToggleBtn = document.getElementById('cart-toggle-btn');
    DOM.cartBadge = document.getElementById('cart-badge');
    DOM.cartDrawer = document.getElementById('cart-drawer');
    DOM.cartOverlay = document.getElementById('cart-overlay');
    DOM.cartCloseBtn = document.getElementById('cart-close-btn');
    DOM.cartItemsList = document.getElementById('cart-items-list');
    DOM.cartSubtotal = document.getElementById('cart-subtotal');
    DOM.cartVat = document.getElementById('cart-vat');
    DOM.cartShipping = document.getElementById('cart-shipping');
    DOM.cartTotal = document.getElementById('cart-total');
    DOM.cartShippingMeter = document.getElementById('cart-shipping-meter');
    DOM.checkoutBtn = document.getElementById('cart-checkout-btn');
    
    DOM.productGrid = document.getElementById('product-grid');
    DOM.loadMoreBtn = document.getElementById('load-more-btn');
    DOM.paginationWrap = document.getElementById('pagination-wrap');
    DOM.categoryFilterPills = document.querySelectorAll('.cat-pill-btn');
    DOM.searchInput = document.getElementById('search-input');
    DOM.sortSelect = document.getElementById('sort-select');
    DOM.productsCountLabel = document.getElementById('products-count');

    // Studio Elements
    DOM.studioText = document.getElementById('studio-text-input');
    DOM.studioColorDots = document.querySelectorAll('.color-dot');
    DOM.studioTypePills = document.querySelectorAll('.studio-type-pill');
    DOM.studioFontSelect = document.getElementById('studio-font-select');
    DOM.studioSizeSelect = document.getElementById('studio-size-select');
    DOM.studioFileInput = document.getElementById('studio-file-input');
    DOM.mockupMug = document.getElementById('mockup-mug');
    DOM.mockupText = document.getElementById('mockup-text');
    DOM.mockupImage = document.getElementById('mockup-image');
    DOM.mockupPrice = document.getElementById('mockup-price');
    DOM.studioAddCartBtn = document.getElementById('studio-add-cart-btn');
    DOM.studioWhatsAppBtn = document.getElementById('studio-whatsapp-btn');

    // Modal & Toast
    DOM.quickModal = document.getElementById('quick-modal');
    DOM.checkoutModal = document.getElementById('checkout-modal');
    DOM.toast = document.getElementById('toast-notice');

    // Mobile Navigation Elements
    DOM.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    DOM.mobileMenuClose = document.getElementById('mobile-menu-close');
    DOM.mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    DOM.mobileNavDrawer = document.getElementById('mobile-nav-drawer');
    DOM.mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-btn-custom');
    DOM.mobileLangSelect = document.getElementById('mobile-lang-select');
    DOM.mobileCurrSelect = document.getElementById('mobile-curr-select');

    // Admin & Artwork Management Elements
    DOM.adminModeToggle = document.getElementById('admin-mode-toggle');
    DOM.mobileAdminModeToggle = document.getElementById('mobile-admin-mode-toggle');
    DOM.adminGalleryBar = document.getElementById('admin-gallery-bar');
    DOM.adminAddArtBtn = document.getElementById('admin-add-art-btn');
    DOM.adminResetCatalogBtn = document.getElementById('admin-reset-catalog-btn');
    DOM.artManageModal = document.getElementById('art-manage-modal');
    DOM.artManageModalTitle = document.getElementById('art-manage-modal-title');
    DOM.artManageForm = document.getElementById('art-manage-form');
    DOM.artFormId = document.getElementById('art-form-id');
    DOM.artTitle = document.getElementById('art-title');
    DOM.artPrice = document.getElementById('art-price');
    DOM.artCategory = document.getElementById('art-category');
    DOM.artDimensions = document.getElementById('art-dimensions');
    DOM.artIsSoldOut = document.getElementById('art-is-sold-out');
    DOM.artUploadDropzone = document.getElementById('art-upload-dropzone');
    DOM.artFileInput = document.getElementById('art-file-input');
    DOM.artPreviewImg = document.getElementById('art-preview-img');
    DOM.artImageUrl = document.getElementById('art-image-url');
    DOM.artCancelBtn = document.getElementById('art-manage-cancel-btn');
  }

  /* -------------------------------------------------------------------------
     1. Multi-Language (i18n) Engine
     ------------------------------------------------------------------------- */
  async function loadTranslations(lang) {
    if (STATE.translations[lang]) return STATE.translations[lang];
    if (window.EMBEDDED_LOCALES && window.EMBEDDED_LOCALES[lang]) {
      STATE.translations[lang] = window.EMBEDDED_LOCALES[lang];
      return window.EMBEDDED_LOCALES[lang];
    }
    try {
      const res = await fetch(`locales/${lang}.json`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      STATE.translations[lang] = data;
      return data;
    } catch (err) {
      console.warn(`Could not load locales/${lang}.json, falling back:`, err);
      return {};
    }
  }

  async function setLanguage(newLang) {
    if (newLang !== 'ar' && newLang !== 'en') newLang = 'ar';
    STATE.lang = newLang;
    safeStorage.set('artmakan_lang', newLang);
    if (DOM.langSelect) DOM.langSelect.value = newLang;
    if (DOM.mobileLangSelect) DOM.mobileLangSelect.value = newLang;

    // Apply RTL / LTR layout
    const isRTL = newLang === 'ar';
    DOM.html.setAttribute('lang', newLang);
    DOM.html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

    // Load strings
    const dict = await loadTranslations(newLang);

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // Re-render dynamic elements
    renderProducts();
    renderCart();
    updateStudioPreview();
    updateAdminUI();
  }

  function t(key, replacements = {}) {
    const dict = STATE.translations[STATE.lang] || {};
    let text = dict[key] || key;
    for (const [k, v] of Object.entries(replacements)) {
      text = text.replace(`{${k}}`, v);
    }
    return text;
  }

  /* -------------------------------------------------------------------------
     2. Multi-Currency Engine
     ------------------------------------------------------------------------- */
  async function initExchangeRates() {
    const cached = safeStorage.getJSON('artmakan_rates');
    const cachedTime = safeStorage.get('artmakan_rates_time');
    const oneDay = 24 * 60 * 60 * 1000;

    if (cached && cachedTime && (Date.now() - Number(cachedTime) < oneDay)) {
      try {
        STATE.rates = Object.assign(STATE.rates, cached);
        return;
      } catch (e) {}
    }

    // Fetch from free API
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/SAR');
      if (res.ok) {
        const json = await res.json();
        if (json && json.rates) {
          STATE.rates = Object.assign(STATE.rates, json.rates);
          safeStorage.setJSON('artmakan_rates', STATE.rates);
          safeStorage.set('artmakan_rates_time', String(Date.now()));
        }
      }
    } catch (e) {
      console.log('Using offline fallback exchange rates.');
    }
  }

  function setCurrency(curr) {
    if (!CURRENCY_CONFIG[curr]) curr = 'SAR';
    STATE.currency = curr;
    safeStorage.set('artmakan_curr', curr);
    if (DOM.currSelect) DOM.currSelect.value = curr;
    if (DOM.mobileCurrSelect) DOM.mobileCurrSelect.value = curr;

    renderProducts();
    renderCart();
    updateStudioPreview();
  }

  function formatPrice(amountSAR) {
    const rate = STATE.rates[STATE.currency] || 1.0;
    const converted = amountSAR * rate;
    const cfg = CURRENCY_CONFIG[STATE.currency] || CURRENCY_CONFIG.SAR;
    const formattedNum = converted.toLocaleString(undefined, {
      minimumFractionDigits: cfg.decimals,
      maximumFractionDigits: cfg.decimals
    });

    let sym = cfg.symbol;
    if (STATE.lang === 'ar') sym = cfg.ar_symbol;
    else if (STATE.lang === 'ur') sym = cfg.ur_symbol;

    if (STATE.lang === 'ar' || STATE.lang === 'ur') {
      return `${formattedNum} ${sym}`;
    }
    return `${sym} ${formattedNum}`;
  }

  /* -------------------------------------------------------------------------
     3. Products Catalog Engine & Persistence
     ------------------------------------------------------------------------- */
  async function loadProducts() {
    const cachedProducts = safeStorage.getJSON(STORAGE_KEY_PRODUCTS);
    if (cachedProducts && Array.isArray(cachedProducts) && cachedProducts.length > 0) {
      STATE.products = cachedProducts;
      applyFilters();
      return;
    }

    if (window.EMBEDDED_PRODUCTS && window.EMBEDDED_PRODUCTS.length > 0) {
      STATE.products = window.EMBEDDED_PRODUCTS.slice();
      saveProducts();
      applyFilters();
      return;
    }

    try {
      const res = await fetch('products.json');
      STATE.products = await res.json();
      saveProducts();
      applyFilters();
    } catch (e) {
      console.error('Failed loading products.json', e);
    }
  }

  function saveProducts() {
    safeStorage.setJSON(STORAGE_KEY_PRODUCTS, STATE.products);
  }

  function applyFilters() {
    let list = STATE.products.slice();

    // Category filter
    if (STATE.selectedCategory && STATE.selectedCategory !== 'all') {
      list = list.filter(p => p.category === STATE.selectedCategory);
    }

    // Search query
    if (STATE.searchQuery.trim()) {
      const q = STATE.searchQuery.trim().toLowerCase();
      list = list.filter(p => {
        const tr = p.translations[STATE.lang] || p.translations.en || {};
        const title = (tr.title || '').toLowerCase();
        const desc = (tr.desc || '').toLowerCase();
        return title.includes(q) || desc.includes(q) || p.category.includes(q);
      });
    }

    // Sorting
    if (STATE.sortBy === 'price_asc') {
      list.sort((a, b) => a.base_price_sar - b.base_price_sar);
    } else if (STATE.sortBy === 'price_desc') {
      list.sort((a, b) => b.base_price_sar - a.base_price_sar);
    } else if (STATE.sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    STATE.filteredProducts = list;
    STATE.currentPage = 1;
    renderProducts();
  }

  function renderProducts() {
    if (!DOM.productGrid) return;
    DOM.productGrid.innerHTML = '';

    const total = STATE.filteredProducts.length;
    if (DOM.productsCountLabel) {
      DOM.productsCountLabel.textContent = t('showing_products', { count: total });
    }

    const visibleItems = STATE.filteredProducts.slice(0, STATE.currentPage * STATE.pageSize);

    if (visibleItems.length === 0) {
      DOM.productGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <p style="font-size: 1.125rem;">${t('cart_empty')}</p>
        </div>
      `;
      if (DOM.paginationWrap) DOM.paginationWrap.style.display = 'none';
      return;
    }

    const fragment = document.createDocumentFragment();

    visibleItems.forEach(prod => {
      const tr = prod.translations[STATE.lang] || prod.translations.en || {};
      const card = document.createElement('article');
      const isSoldOut = !!prod.is_sold_out;
      card.className = 'product-card' + (isSoldOut ? ' is-sold-out' : '');
      card.setAttribute('data-id', prod.id);

      const categoryLabel = t(`cat_${prod.category.replace('-', '_')}`) || prod.category;
      const priceFormatted = formatPrice(prod.base_price_sar);
      const startingFromText = prod.starting_from ? `<span class="price-starting-label">${t('starting_from')}</span>` : '';

      let badgeHTML = '';
      if (isSoldOut) {
        badgeHTML = `<span class="product-badge badge-sold-out">${t('admin_sold_out')}</span>`;
      } else if (prod.badge) {
        badgeHTML = `<span class="product-badge">${prod.badge}</span>`;
      }

      let actionBtnHTML = '';
      if (isSoldOut) {
        actionBtnHTML = `
          <button type="button" class="btn-card-add" disabled style="opacity: 0.7; cursor: not-allowed;">
            ${t('admin_sold_out')}
          </button>
        `;
      } else {
        actionBtnHTML = `
          <button type="button" class="btn-card-add" data-action="add-cart" data-id="${prod.id}">
            ${t('add_to_cart')}
          </button>
        `;
      }

      card.innerHTML = `
        <div class="card-admin-bar">
          <button type="button" class="btn-card-edit" data-action="admin-edit" data-id="${prod.id}" title="${t('admin_edit')}">
            ✏️ ${t('admin_edit')}
          </button>
          <button type="button" class="btn-card-delete" data-action="admin-delete" data-id="${prod.id}" title="${t('admin_delete')}">
            🗑️ ${t('admin_delete')}
          </button>
        </div>
        <div class="product-image-wrapper">
          ${badgeHTML}
          <img src="${prod.image}" alt="${tr.title}" loading="lazy" width="600" height="600" />
          <button type="button" class="product-quick-btn" data-action="quick-view" data-id="${prod.id}">
            ${t('quick_view')}
          </button>
        </div>
        <div class="product-body">
          <span class="product-category-name">${categoryLabel}</span>
          <h3 class="product-title">${tr.title}</h3>
          <div class="product-meta-row">
            <div class="product-price-box">
              ${startingFromText}
              <span class="product-price">${priceFormatted}</span>
            </div>
            <span class="vat-badge-tag">${t('vat_included')}</span>
          </div>
          <div class="product-actions">
            ${actionBtnHTML}
            <button type="button" class="btn-card-wa" title="${t('order_whatsapp')}" data-action="whatsapp-order" data-id="${prod.id}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </button>
          </div>
        </div>
      `;

      fragment.appendChild(card);
    });

    DOM.productGrid.appendChild(fragment);

    // Show or hide pagination
    if (DOM.paginationWrap) {
      if (visibleItems.length < total) {
        DOM.paginationWrap.style.display = 'block';
      } else {
        DOM.paginationWrap.style.display = 'none';
      }
    }
  }

  /* -------------------------------------------------------------------------
     4. Interactive Custom Studio (CSS 3D Mockup + Image Compression)
     ------------------------------------------------------------------------- */
  function initCustomStudio() {
    // Product Type Selection
    if (DOM.studioTypePills) {
      DOM.studioTypePills.forEach(pill => {
        pill.addEventListener('click', () => {
          DOM.studioTypePills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          const type = pill.getAttribute('data-type');
          STATE.studio.productType = type;

          if (type === 'mug') {
            STATE.studio.basePriceSAR = 55;
            if (DOM.mockupMug) {
              DOM.mockupMug.style.borderRadius = '12px 12px 40px 40px';
              DOM.mockupMug.style.aspectRatio = '190 / 230';
            }
          } else if (type === 'cushion') {
            STATE.studio.basePriceSAR = 95;
            if (DOM.mockupMug) {
              DOM.mockupMug.style.borderRadius = '24px';
              DOM.mockupMug.style.aspectRatio = '1 / 1';
            }
          } else if (type === 'shirt') {
            STATE.studio.basePriceSAR = 89;
            if (DOM.mockupMug) {
              DOM.mockupMug.style.borderRadius = '16px 16px 8px 8px';
              DOM.mockupMug.style.aspectRatio = '200 / 240';
            }
          } else if (type === 'calligraphy') {
            STATE.studio.basePriceSAR = 220;
            if (DOM.mockupMug) {
              DOM.mockupMug.style.borderRadius = '4px';
              DOM.mockupMug.style.aspectRatio = '180 / 240';
            }
          }
          updateStudioPreview();
        });
      });
    }

    // Text Live Input
    if (DOM.studioText) {
      DOM.studioText.addEventListener('input', (e) => {
        STATE.studio.text = e.target.value;
        updateStudioPreview();
      });
    }

    // Font Style Select
    if (DOM.studioFontSelect) {
      DOM.studioFontSelect.addEventListener('change', (e) => {
        STATE.studio.font = e.target.value;
        updateStudioPreview();
      });
    }

    // Base Color Selection
    if (DOM.studioColorDots) {
      DOM.studioColorDots.forEach(dot => {
        dot.addEventListener('click', () => {
          DOM.studioColorDots.forEach(d => d.classList.remove('active'));
          dot.classList.add('active');
          STATE.studio.color = dot.getAttribute('data-color');
          updateStudioPreview();
        });
      });
    }

    // Size / Option Select
    if (DOM.studioSizeSelect) {
      DOM.studioSizeSelect.addEventListener('change', (e) => {
        STATE.studio.sizeExtra = Number(e.target.value) || 0;
        updateStudioPreview();
      });
    }

    // In-Browser Image Upload with Compression via Canvas (< 150KB)
    if (DOM.studioFileInput) {
      DOM.studioFileInput.addEventListener('change', handleStudioImageUpload);
    }

    // Add Custom Design to Cart
    if (DOM.studioAddCartBtn) {
      DOM.studioAddCartBtn.addEventListener('click', () => {
        const customTitle = `${t('customize_this')} - ${t(`studio_prod_${STATE.studio.productType}`)}`;
        const totalSAR = STATE.studio.basePriceSAR + STATE.studio.sizeExtra;
        
        addToCart({
          id: `custom-${Date.now()}`,
          title: customTitle,
          priceSAR: totalSAR,
          image: STATE.studio.imageData || 'images/category_mugs.jpg',
          options: `Text: "${STATE.studio.text || 'Custom'}" • Color: ${STATE.studio.color}`,
          quantity: 1
        });

        showToast(t('toast_added_to_cart'));
      });
    }

    // Order Custom Design via WhatsApp
    if (DOM.studioWhatsAppBtn) {
      DOM.studioWhatsAppBtn.addEventListener('click', () => {
        const totalSAR = STATE.studio.basePriceSAR + STATE.studio.sizeExtra;
        const priceStr = formatPrice(totalSAR);
        const prodName = t(`studio_prod_${STATE.studio.productType}`);
        
        let msg = `*The Art Makan - Custom Design Order*\n`;
        msg += `• Product: ${prodName}\n`;
        msg += `• Custom Text/Note: "${STATE.studio.text || 'None'}"\n`;
        msg += `• Font Style: ${STATE.studio.font}\n`;
        msg += `• Base Color: ${STATE.studio.color}\n`;
        msg += `• Price: ${priceStr} (${totalSAR} SAR)\n`;
        if (STATE.studio.imageData) {
          msg += `• Photo: [Attached via Design Studio]\n`;
        }
        msg += `\nPlease confirm production time and delivery options.`;

        const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank');
      });
    }

    updateStudioPreview();
  }

  function handleStudioImageUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    // Validate size (max 5MB original)
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo is larger than 5MB. Please choose a smaller photo.');
      return;
    }

    // Browser-side Canvas Compression to < 150KB
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Export as optimized JPEG/WebP dataURL
        const compressedData = canvas.toDataURL('image/jpeg', 0.82);
        STATE.studio.imageData = compressedData;
        updateStudioPreview();
        showToast(t('toast_photo_compressed'));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function updateStudioPreview() {
    if (DOM.mockupMug) {
      DOM.mockupMug.style.backgroundColor = STATE.studio.color;
    }

    if (DOM.mockupText) {
      DOM.mockupText.textContent = STATE.studio.text || 'Your Name / Artwork';
      DOM.mockupText.className = `mockup-custom-text ${STATE.studio.font}`;
    }

    if (DOM.mockupImage) {
      if (STATE.studio.imageData) {
        DOM.mockupImage.src = STATE.studio.imageData;
        DOM.mockupImage.style.display = 'block';
      } else {
        DOM.mockupImage.style.display = 'none';
      }
    }

    if (DOM.mockupPrice) {
      const totalSAR = STATE.studio.basePriceSAR + STATE.studio.sizeExtra;
      DOM.mockupPrice.textContent = formatPrice(totalSAR);
    }
  }

  /* -------------------------------------------------------------------------
     5. Shopping Cart & Checkout Engine
     ------------------------------------------------------------------------- */
  function addToCart(item) {
    const existingIndex = STATE.cart.findIndex(i => i.id === item.id && i.options === item.options);
    if (existingIndex > -1) {
      STATE.cart[existingIndex].quantity += (item.quantity || 1);
    } else {
      STATE.cart.push(item);
    }
    saveCart();
    renderCart();
    openCart();
  }

  function removeFromCart(index) {
    STATE.cart.splice(index, 1);
    saveCart();
    renderCart();
  }

  function updateItemQty(index, delta) {
    if (!STATE.cart[index]) return;
    STATE.cart[index].quantity += delta;
    if (STATE.cart[index].quantity <= 0) {
      STATE.cart.splice(index, 1);
    }
    saveCart();
    renderCart();
  }

  function saveCart() {
    safeStorage.setJSON('artmakan_cart', STATE.cart);
  }

  function renderCart() {
    const totalCount = STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (DOM.cartBadge) DOM.cartBadge.textContent = totalCount;

    if (!DOM.cartItemsList) return;
    DOM.cartItemsList.innerHTML = '';

    let subtotalSAR = 0;

    if (STATE.cart.length === 0) {
      DOM.cartItemsList.innerHTML = `
        <div style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px; display: block; opacity: 0.5;">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <p style="font-size: 1rem; margin-bottom: 16px;">${t('cart_empty')}</p>
          <button type="button" class="btn btn-secondary" onclick="document.body.classList.remove('cart-open')">
            ${t('cart_empty_cta')}
          </button>
        </div>
      `;
      if (DOM.cartSubtotal) DOM.cartSubtotal.textContent = formatPrice(0);
      if (DOM.cartVat) DOM.cartVat.textContent = formatPrice(0);
      if (DOM.cartShipping) DOM.cartShipping.textContent = formatPrice(0);
      if (DOM.cartTotal) DOM.cartTotal.textContent = formatPrice(0);
      if (DOM.cartShippingMeter) DOM.cartShippingMeter.style.display = 'none';
      return;
    }

    const fragment = document.createDocumentFragment();

    STATE.cart.forEach((item, index) => {
      subtotalSAR += item.priceSAR * item.quantity;
      const row = document.createElement('div');
      row.className = 'cart-item-row';
      row.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="cart-item-thumb" width="72" height="72" />
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.title}</h4>
          ${item.options ? `<p class="cart-item-opt">${item.options}</p>` : ''}
          <div class="cart-item-price-row">
            <div class="cart-qty-ctrl">
              <button type="button" class="qty-btn" data-action="qty-minus" data-idx="${index}">-</button>
              <span class="qty-num">${item.quantity}</span>
              <button type="button" class="qty-btn" data-action="qty-plus" data-idx="${index}">+</button>
            </div>
            <span style="font-weight: 700;">${formatPrice(item.priceSAR * item.quantity)}</span>
            <button type="button" class="cart-remove-item" data-action="remove" data-idx="${index}">✕</button>
          </div>
        </div>
      `;
      fragment.appendChild(row);
    });

    DOM.cartItemsList.appendChild(fragment);

    // VAT & Shipping Calculation (Saudi 15% VAT Included)
    const vatSAR = Math.round(subtotalSAR * (15 / 115) * 100) / 100;
    const isFreeShippingKSA = subtotalSAR >= 250;
    const shippingSAR = isFreeShippingKSA ? 0 : 25;
    const totalSAR = subtotalSAR + (isFreeShippingKSA ? 0 : shippingSAR);

    if (DOM.cartSubtotal) DOM.cartSubtotal.textContent = formatPrice(subtotalSAR);
    if (DOM.cartVat) DOM.cartVat.textContent = formatPrice(vatSAR);
    if (DOM.cartShipping) DOM.cartShipping.textContent = isFreeShippingKSA ? 'FREE (KSA)' : formatPrice(shippingSAR);
    if (DOM.cartTotal) DOM.cartTotal.textContent = formatPrice(totalSAR);

    // Shipping Meter progress bar
    if (DOM.cartShippingMeter) {
      DOM.cartShippingMeter.style.display = 'block';
      if (isFreeShippingKSA) {
        DOM.cartShippingMeter.innerHTML = t('cart_free_shipping_unlocked');
        DOM.cartShippingMeter.style.color = 'var(--saudi-green)';
      } else {
        const remaining = 250 - subtotalSAR;
        DOM.cartShippingMeter.innerHTML = t('cart_free_shipping_notice', { amount: formatPrice(remaining) });
        DOM.cartShippingMeter.style.color = 'var(--text-main)';
      }
    }
  }

  function openCart() {
    document.body.classList.add('cart-open');
  }

  function closeCart() {
    document.body.classList.remove('cart-open');
  }

  function findProduct(prodId) {
    if (!prodId) return null;
    const str = String(prodId).trim();
    return STATE.products.find(p => String(p.id) === str || String(p.id) === `calligraphy-0${str}` || String(p.id) === `calligraphy-${str}` || String(p.id) === `art-${str}`);
  }

  /* -------------------------------------------------------------------------
     6. Quick View & WhatsApp Ordering
     ------------------------------------------------------------------------- */
  function openQuickView(prodId) {
    const prod = findProduct(prodId);
    if (!prod || !DOM.quickModal) return;

    const tr = prod.translations[STATE.lang] || prod.translations.en || {};
    const modalContent = DOM.quickModal.querySelector('.modal-content-inner');
    if (!modalContent) return;

    let sizeOptionsHTML = '';
    if (prod.options && prod.options.sizes && prod.options.sizes.length > 0) {
      sizeOptionsHTML = `
        <div class="form-row" style="margin-top: 16px;">
          <label class="form-label">${t('studio_select_size')}</label>
          <select id="quick-size-select" class="form-select">
            ${prod.options.sizes.map((s, idx) => `
              <option value="${s.extra_sar}" data-name="${s.name}">${s.name} ${s.extra_sar > 0 ? `(+${formatPrice(s.extra_sar)})` : ''}</option>
            `).join('')}
          </select>
        </div>
      `;
    }

    let customInputHTML = '';
    if (prod.has_customization) {
      customInputHTML = `
        <div class="form-row">
          <label class="form-label">${t('studio_custom_text')}</label>
          <input type="text" id="quick-custom-text" class="form-input" placeholder="${t('studio_text_placeholder')}" />
        </div>
      `;
    }

    modalContent.innerHTML = `
      <div class="quick-modal-grid">
        <div class="quick-modal-media">
          <img src="${prod.image}" alt="${tr.title}" />
        </div>
        <div class="quick-modal-info">
          <span class="product-category-name">${t(`cat_${prod.category.replace('-', '_')}`)}</span>
          <h2 style="font-size: 1.5rem; margin-bottom: 8px;">${tr.title}</h2>
          <p style="font-size: 1.375rem; font-weight: 700; color: var(--text-main); margin-bottom: 12px;">
            ${formatPrice(prod.base_price_sar)} <small style="font-size: 0.75rem; color: var(--saudi-green); font-weight: 600;">${t('vat_included')}</small>
          </p>
          <p style="color: var(--text-muted); font-size: 0.9375rem; line-height: 1.6; margin-bottom: 12px;">${tr.desc}</p>
          <p style="color: var(--text-light); font-size: 0.8125rem; margin-bottom: 16px;">ℹ️ ${tr.details || ''}</p>
          
          ${sizeOptionsHTML}
          ${customInputHTML}

          <div class="quick-modal-actions">
            ${prod.is_sold_out ? `
              <button type="button" class="btn btn-secondary" style="flex: 1; cursor: not-allowed; opacity: 0.7;" disabled>
                ${t('admin_sold_out')}
              </button>
            ` : `
              <button type="button" class="btn btn-primary" id="quick-add-btn" style="flex: 1;">
                ${t('add_to_cart')}
              </button>
            `}
            <button type="button" class="btn btn-whatsapp" id="quick-wa-btn">
              ${t('order_whatsapp')}
            </button>
          </div>
        </div>
      </div>
    `;

    DOM.quickModal.classList.add('active');

    // Quick Modal Events
    const addBtn = modalContent.querySelector('#quick-add-btn');
    const waBtn = modalContent.querySelector('#quick-wa-btn');
    const sizeSelect = modalContent.querySelector('#quick-size-select');
    const textInput = modalContent.querySelector('#quick-custom-text');

    if (addBtn) {
      addBtn.onclick = () => {
        const extra = sizeSelect ? Number(sizeSelect.value) || 0 : 0;
        const sizeName = sizeSelect ? sizeSelect.options[sizeSelect.selectedIndex].getAttribute('data-name') : '';
        const customText = textInput ? textInput.value.trim() : '';
        
        let optString = sizeName;
        if (customText) optString += (optString ? ' • ' : '') + `"${customText}"`;

        addToCart({
          id: prod.id,
          title: tr.title,
          priceSAR: prod.base_price_sar + extra,
          image: prod.image,
          options: optString,
          quantity: 1
        });

        DOM.quickModal.classList.remove('active');
        showToast(t('toast_added_to_cart'));
      };
    }

    if (waBtn) {
      waBtn.onclick = () => {
        sendDirectWhatsAppOrder(prod, sizeSelect, textInput);
      };
    }
  }

  function sendDirectWhatsAppOrder(prod, sizeSelect, textInput) {
    const tr = prod.translations[STATE.lang] || prod.translations.en || {};
    const extra = sizeSelect ? Number(sizeSelect.value) || 0 : 0;
    const sizeName = sizeSelect ? sizeSelect.options[sizeSelect.selectedIndex].getAttribute('data-name') : 'Standard';
    const customText = textInput ? textInput.value.trim() : '';
    const totalSAR = prod.base_price_sar + extra;
    const priceStr = formatPrice(totalSAR);

    let msg = `*The Art Makan - Order Inquiry*\n`;
    msg += `• Product: ${tr.title} (ID: ${prod.id})\n`;
    msg += `• Selected Size/Option: ${sizeName}\n`;
    if (customText) msg += `• Personalization: "${customText}"\n`;
    msg += `• Price: ${priceStr} (${totalSAR} SAR - 15% VAT Included)\n`;
    msg += `• Country: Saudi Arabia / Worldwide\n`;
    msg += `\nPlease confirm availability and payment link.`;

    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  /* -------------------------------------------------------------------------
     7. Checkout Modal & Order Submission
     ------------------------------------------------------------------------- */
  function openCheckoutModal() {
    if (STATE.cart.length === 0) {
      showToast(t('cart_empty'));
      return;
    }
    closeCart();
    if (DOM.checkoutModal) DOM.checkoutModal.classList.add('active');
  }

  function handleCheckoutSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const country = form.country.value;
    const city = form.city.value.trim();
    const address = form.address.value.trim();
    const payment = form.payment.value;

    let subtotalSAR = STATE.cart.reduce((s, i) => s + i.priceSAR * i.quantity, 0);
    const isFreeKSA = country === 'SA' && subtotalSAR >= 250;
    let shippingSAR = 25;
    if (country === 'SA') shippingSAR = isFreeKSA ? 0 : 25;
    else if (['AE', 'KW', 'QA', 'BH', 'OM'].includes(country)) shippingSAR = 45;
    else shippingSAR = 85;

    const totalSAR = subtotalSAR + shippingSAR;

    let msg = `*New Order - The Art Makan*\n`;
    msg += `----------------------------\n`;
    msg += `👤 Customer: ${name}\n`;
    msg += `📞 Mobile: ${phone}\n`;
    msg += `📍 Address: ${address}, ${city}, ${country}\n`;
    msg += `💳 Payment Method: ${payment}\n`;
    msg += `----------------------------\n`;
    msg += `*Items Ordered:*\n`;
    STATE.cart.forEach((it, idx) => {
      msg += `${idx + 1}. ${it.title} (x${it.quantity}) - ${formatPrice(it.priceSAR * it.quantity)}\n`;
      if (it.options) msg += `   ↳ ${it.options}\n`;
    });
    msg += `----------------------------\n`;
    msg += `Subtotal: ${formatPrice(subtotalSAR)}\n`;
    msg += `Shipping: ${shippingSAR === 0 ? 'FREE' : formatPrice(shippingSAR)}\n`;
    msg += `*Grand Total: ${formatPrice(totalSAR)} (Includes 15% VAT)*\n`;

    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    // Clear cart and show notification
    STATE.cart = [];
    saveCart();
    renderCart();
    if (DOM.checkoutModal) DOM.checkoutModal.classList.remove('active');
    showToast('Order details prepared! Redirecting to WhatsApp...');
  }

  /* -------------------------------------------------------------------------
     8. Utility: Toast Notification
     ------------------------------------------------------------------------- */
  function showToast(msg) {
    if (!DOM.toast) return;
    DOM.toast.textContent = msg;
    DOM.toast.classList.add('show');
    setTimeout(() => {
      DOM.toast.classList.remove('show');
    }, 3200);
  }

  /* -------------------------------------------------------------------------
     9. Admin Mode & In-Browser Artwork Management System
     ------------------------------------------------------------------------- */
  let currentArtImageData = null;

  function updateAdminUI() {
    const isMode = !!STATE.isAdminMode;
    document.body.classList.toggle('admin-mode-active', isMode);

    if (DOM.adminGalleryBar) {
      DOM.adminGalleryBar.style.display = isMode ? 'flex' : 'none';
    }

    const icon = isMode ? '🔓' : '🔒';
    const labelKey = isMode ? 'admin_mode_exit' : 'admin_mode_toggle';
    const labelText = t(labelKey);

    [DOM.adminModeToggle, DOM.mobileAdminModeToggle].forEach(btn => {
      if (!btn) return;
      btn.classList.toggle('active', isMode);
      const iconEl = btn.querySelector('.admin-icon');
      const labelEl = btn.querySelector('.admin-label');
      if (iconEl) iconEl.textContent = icon;
      if (labelEl) labelEl.textContent = labelText;
    });
  }

  function toggleAdminMode() {
    STATE.isAdminMode = !STATE.isAdminMode;
    safeStorage.set(STORAGE_KEY_ADMIN, String(STATE.isAdminMode));
    updateAdminUI();
    const notice = STATE.isAdminMode
      ? (STATE.lang === 'ar' ? 'تم تفعيل وضع الفنان 🔓' : 'Artist Admin Mode Activated 🔓')
      : (STATE.lang === 'ar' ? 'تم إغلاق وضع الفنان 🔒' : 'Artist Admin Mode Locked 🔒');
    showToast(notice);
  }

  function compressImageFile(file, maxWidth = 800, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Invalid image file'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (w > maxWidth || h > maxWidth) {
            if (w > h) {
              h = Math.round((h * maxWidth) / w);
              w = maxWidth;
            } else {
              w = Math.round((w * maxWidth) / h);
              h = maxWidth;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  function openAddArtModal() {
    if (!DOM.artManageModal) return;
    if (DOM.artManageForm) DOM.artManageForm.reset();
    if (DOM.artFormId) DOM.artFormId.value = '';
    if (DOM.artCategory) DOM.artCategory.value = 'arabic-calligraphy';
    if (DOM.artIsSoldOut) DOM.artIsSoldOut.checked = false;
    if (DOM.artImageUrl) DOM.artImageUrl.value = '';

    currentArtImageData = null;
    if (DOM.artPreviewImg) {
      DOM.artPreviewImg.src = 'images/category_arabic_calligraphy.jpg';
    }
    if (DOM.artManageModalTitle) {
      DOM.artManageModalTitle.textContent = t('admin_form_title_add');
    }
    DOM.artManageModal.classList.add('active');
  }

  function openEditArtModal(prodId) {
    const prod = findProduct(prodId);
    if (!prod || !DOM.artManageModal) return;

    const tr = prod.translations[STATE.lang] || prod.translations.en || prod.translations.ar || {};

    if (DOM.artFormId) DOM.artFormId.value = prod.id;
    if (DOM.artTitle) DOM.artTitle.value = tr.title || '';
    if (DOM.artPrice) DOM.artPrice.value = prod.base_price_sar || '';
    if (DOM.artCategory) DOM.artCategory.value = prod.category || 'arabic-calligraphy';
    if (DOM.artDimensions) DOM.artDimensions.value = tr.details || tr.desc || '';
    if (DOM.artIsSoldOut) DOM.artIsSoldOut.checked = !!prod.is_sold_out;
    if (DOM.artImageUrl) DOM.artImageUrl.value = prod.image || '';

    currentArtImageData = prod.image || null;
    if (DOM.artPreviewImg) {
      DOM.artPreviewImg.src = prod.image || 'images/category_arabic_calligraphy.jpg';
    }
    if (DOM.artManageModalTitle) {
      DOM.artManageModalTitle.textContent = t('admin_form_title_edit');
    }

    DOM.artManageModal.classList.add('active');
  }

  async function handleArtFileSelect(file) {
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFile(file, 800, 0.82);
      currentArtImageData = compressedDataUrl;
      if (DOM.artPreviewImg) DOM.artPreviewImg.src = compressedDataUrl;
      if (DOM.artImageUrl) DOM.artImageUrl.value = '';
    } catch (err) {
      console.warn('Image compression fallback:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        currentArtImageData = e.target.result;
        if (DOM.artPreviewImg) DOM.artPreviewImg.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  function handleArtFormSubmit(e) {
    e.preventDefault();
    const id = (DOM.artFormId ? DOM.artFormId.value : '').trim();
    const title = (DOM.artTitle ? DOM.artTitle.value : '').trim();
    const price = parseFloat(DOM.artPrice ? DOM.artPrice.value : 0) || 0;
    const category = DOM.artCategory ? DOM.artCategory.value : 'arabic-calligraphy';
    const dimensions = (DOM.artDimensions ? DOM.artDimensions.value : '').trim();
    const isSoldOut = DOM.artIsSoldOut ? DOM.artIsSoldOut.checked : false;
    const directUrl = (DOM.artImageUrl ? DOM.artImageUrl.value : '').trim();
    const image = currentArtImageData || directUrl || 'images/category_arabic_calligraphy.jpg';

    if (!title || price <= 0) {
      showToast(STATE.lang === 'ar' ? 'يرجى إدخال اسم العمل وسعر صالح' : 'Please provide a title and valid price');
      return;
    }

    if (id) {
      const prod = findProduct(id);
      if (prod) {
        prod.base_price_sar = price;
        prod.category = category;
        prod.is_sold_out = isSoldOut;
        if (image) prod.image = image;

        if (!prod.translations) prod.translations = {};
        if (!prod.translations.en) prod.translations.en = {};
        if (!prod.translations.ar) prod.translations.ar = {};

        prod.translations[STATE.lang].title = title;
        if (dimensions) {
          prod.translations[STATE.lang].desc = dimensions;
          prod.translations[STATE.lang].details = dimensions;
        }

        const otherLang = STATE.lang === 'ar' ? 'en' : 'ar';
        if (!prod.translations[otherLang].title) {
          prod.translations[otherLang].title = title;
          prod.translations[otherLang].desc = dimensions;
          prod.translations[otherLang].details = dimensions;
        }
      }
    } else {
      const newId = 'art-' + Date.now();
      const defaultDescEn = dimensions || 'Original handmade artwork crafted with precision and passion.';
      const defaultDescAr = dimensions || 'عمل فني أصلي مصنوع يدوياً بكل إتقان وشغف في المملكة العربية السعودية.';

      const newProd = {
        id: newId,
        category: category,
        base_price_sar: price,
        starting_from: false,
        image: image,
        badge: category === 'arabic-calligraphy' ? 'Handmade Calligraphy' : 'Original Artwork',
        rating: 5.0,
        reviews_count: 1,
        is_sold_out: isSoldOut,
        translations: {
          en: {
            title: title,
            desc: defaultDescEn,
            details: dimensions || 'Handcrafted original piece'
          },
          ar: {
            title: title,
            desc: defaultDescAr,
            details: dimensions || 'قطعة يدوية أصلية فريدة'
          }
        }
      };

      STATE.products.unshift(newProd);
    }

    saveProducts();
    if (DOM.artManageModal) DOM.artManageModal.classList.remove('active');
    applyFilters();
    showToast(t('admin_saved_toast'));
  }

  function deleteArtwork(prodId) {
    const prod = findProduct(prodId);
    if (!prod) return;

    const tr = prod.translations[STATE.lang] || prod.translations.en || {};
    const confirmMsg = `${t('admin_confirm_delete')}\n\n"${tr.title}" (${prod.base_price_sar} SAR)`;
    if (!window.confirm(confirmMsg)) return;

    STATE.products = STATE.products.filter(p => String(p.id) !== String(prod.id));
    saveProducts();
    applyFilters();
    showToast(t('admin_deleted_toast'));
  }

  function resetCatalog() {
    if (!window.confirm(t('admin_confirm_reset'))) return;

    if (window.EMBEDDED_PRODUCTS && window.EMBEDDED_PRODUCTS.length > 0) {
      STATE.products = JSON.parse(JSON.stringify(window.EMBEDDED_PRODUCTS));
      saveProducts();
      applyFilters();
      showToast(t('admin_reset_toast'));
    } else {
      fetch('products.json')
        .then(res => res.json())
        .then(data => {
          STATE.products = data;
          saveProducts();
          applyFilters();
          showToast(t('admin_reset_toast'));
        })
        .catch(err => {
          console.error('Reset failed:', err);
        });
    }
  }

  /* -------------------------------------------------------------------------
     10. Global Events Binding
     ------------------------------------------------------------------------- */
  function bindEvents() {
    // Language Switcher
    if (DOM.langSelect) {
      DOM.langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
    }

    // Currency Switcher
    if (DOM.currSelect) {
      DOM.currSelect.addEventListener('change', (e) => setCurrency(e.target.value));
    }

    // Mobile Navigation Drawer Events
    function openMobileNav() {
      document.body.classList.add('mobile-nav-open');
      if (DOM.mobileMenuToggle) DOM.mobileMenuToggle.setAttribute('aria-expanded', 'true');
      if (DOM.mobileNavDrawer) DOM.mobileNavDrawer.setAttribute('aria-hidden', 'false');
    }

    function closeMobileNav() {
      document.body.classList.remove('mobile-nav-open');
      if (DOM.mobileMenuToggle) DOM.mobileMenuToggle.setAttribute('aria-expanded', 'false');
      if (DOM.mobileNavDrawer) DOM.mobileNavDrawer.setAttribute('aria-hidden', 'true');
    }

    if (DOM.mobileMenuToggle) DOM.mobileMenuToggle.addEventListener('click', openMobileNav);
    if (DOM.mobileMenuClose) DOM.mobileMenuClose.addEventListener('click', closeMobileNav);
    if (DOM.mobileNavOverlay) DOM.mobileNavOverlay.addEventListener('click', closeMobileNav);

    if (DOM.mobileNavLinks) {
      DOM.mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileNav);
      });
    }

    if (DOM.mobileLangSelect) {
      DOM.mobileLangSelect.addEventListener('change', (e) => setLanguage(e.target.value));
    }
    if (DOM.mobileCurrSelect) {
      DOM.mobileCurrSelect.addEventListener('change', (e) => setCurrency(e.target.value));
    }

    // Cart Drawer Toggle
    if (DOM.cartToggleBtn) DOM.cartToggleBtn.addEventListener('click', openCart);
    if (DOM.cartCloseBtn) DOM.cartCloseBtn.addEventListener('click', closeCart);
    if (DOM.cartOverlay) DOM.cartOverlay.addEventListener('click', closeCart);
    if (DOM.checkoutBtn) DOM.checkoutBtn.addEventListener('click', openCheckoutModal);

    // Search Input
    if (DOM.searchInput) {
      DOM.searchInput.addEventListener('input', (e) => {
        STATE.searchQuery = e.target.value;
        applyFilters();
      });
    }

    // Sort Select
    if (DOM.sortSelect) {
      DOM.sortSelect.addEventListener('change', (e) => {
        STATE.sortBy = e.target.value;
        applyFilters();
      });
    }

    // Category Filter Pills
    if (DOM.categoryFilterPills) {
      DOM.categoryFilterPills.forEach(pill => {
        pill.addEventListener('click', () => {
          DOM.categoryFilterPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          STATE.selectedCategory = pill.getAttribute('data-cat') || 'all';
          applyFilters();
          // Scroll smoothly to products section
          const sec = document.getElementById('shop-section');
          if (sec) sec.scrollIntoView({ behavior: 'smooth' });
        });
      });
    }

    // Pagination / Load More
    if (DOM.loadMoreBtn) {
      DOM.loadMoreBtn.addEventListener('click', () => {
        STATE.currentPage++;
        renderProducts();
      });
    }

    // Delegated Product Card Actions
    if (DOM.productGrid) {
      DOM.productGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (btn) {
          const action = btn.getAttribute('data-action');
          const prodId = btn.getAttribute('data-id');

          if (action === 'quick-view') {
            openQuickView(prodId);
          } else if (action === 'admin-edit') {
            openEditArtModal(prodId);
          } else if (action === 'admin-delete') {
            deleteArtwork(prodId);
          } else if (action === 'add-cart') {
            const prod = findProduct(prodId);
            if (prod) {
              const tr = prod.translations[STATE.lang] || prod.translations.en || {};
              addToCart({
                id: prod.id,
                title: tr.title,
                priceSAR: prod.base_price_sar,
                image: prod.image,
                options: '',
                quantity: 1
              });
              showToast(t('toast_added_to_cart'));
            }
          } else if (action === 'whatsapp-order') {
            const prod = findProduct(prodId);
            if (prod) sendDirectWhatsAppOrder(prod, null, null);
          }
          return;
        }

        // Tapping card image or title opens Quick View (ergonomic mobile experience)
        const card = e.target.closest('.product-card');
        const isImage = e.target.closest('.product-image-wrapper');
        const isTitle = e.target.closest('.product-title');
        if (card && (isImage || isTitle)) {
          const prodId = card.getAttribute('data-id');
          if (prodId) openQuickView(prodId);
        }
      });
    }

    // Delegated Cart Quantity Controls
    if (DOM.cartItemsList) {
      DOM.cartItemsList.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        const action = target.getAttribute('data-action');
        const idx = Number(target.getAttribute('data-idx'));

        if (action === 'qty-plus') updateItemQty(idx, 1);
        else if (action === 'qty-minus') updateItemQty(idx, -1);
        else if (action === 'remove') removeFromCart(idx);
      });
    }

    // Modal Close
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('.modal-close-x')) {
          modal.classList.remove('active');
        }
      });
    });

    // Checkout Form Submit
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckoutSubmit);

    // Admin Mode Toggles
    if (DOM.adminModeToggle) {
      DOM.adminModeToggle.addEventListener('click', toggleAdminMode);
    }
    if (DOM.mobileAdminModeToggle) {
      DOM.mobileAdminModeToggle.addEventListener('click', () => {
        closeMobileNav();
        toggleAdminMode();
      });
    }

    // Admin Gallery Action Buttons
    if (DOM.adminAddArtBtn) {
      DOM.adminAddArtBtn.addEventListener('click', openAddArtModal);
    }
    if (DOM.adminResetCatalogBtn) {
      DOM.adminResetCatalogBtn.addEventListener('click', resetCatalog);
    }

    // Art Modal Form Submit & Cancel
    if (DOM.artManageForm) {
      DOM.artManageForm.addEventListener('submit', handleArtFormSubmit);
    }
    if (DOM.artCancelBtn) {
      DOM.artCancelBtn.addEventListener('click', () => {
        if (DOM.artManageModal) DOM.artManageModal.classList.remove('active');
      });
    }

    // Image Upload & Preview Handling
    if (DOM.artUploadDropzone && DOM.artFileInput) {
      DOM.artUploadDropzone.addEventListener('click', () => {
        DOM.artFileInput.click();
      });

      DOM.artUploadDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        DOM.artUploadDropzone.style.borderColor = 'var(--text-main)';
        DOM.artUploadDropzone.style.backgroundColor = '#f6f2ec';
      });

      DOM.artUploadDropzone.addEventListener('dragleave', () => {
        DOM.artUploadDropzone.style.borderColor = '';
        DOM.artUploadDropzone.style.backgroundColor = '';
      });

      DOM.artUploadDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        DOM.artUploadDropzone.style.borderColor = '';
        DOM.artUploadDropzone.style.backgroundColor = '';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleArtFileSelect(e.dataTransfer.files[0]);
        }
      });

      DOM.artFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleArtFileSelect(e.target.files[0]);
        }
      });
    }

    // Image URL text input change updates preview
    if (DOM.artImageUrl) {
      DOM.artImageUrl.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val && DOM.artPreviewImg) {
          DOM.artPreviewImg.src = val;
          currentArtImageData = null;
        }
      });
    }
  }

  /* -------------------------------------------------------------------------
     11. Bootstrap Initialization
     ------------------------------------------------------------------------- */
  async function init() {
    initDOMElements();
    bindEvents();
    initCustomStudio();

    // Auto-detect currency/language if not stored (only Arabic and English)
    if (!safeStorage.get('artmakan_lang')) {
      const browserLang = (navigator.language || '').toLowerCase();
      STATE.lang = browserLang.startsWith('ar') ? 'ar' : 'en';
    } else if (STATE.lang !== 'ar' && STATE.lang !== 'en') {
      STATE.lang = 'ar';
    }

    await initExchangeRates();
    await setLanguage(STATE.lang);
    setCurrency(STATE.currency);
    await loadProducts();
    updateAdminUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
