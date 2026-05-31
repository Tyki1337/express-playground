// ═══════════════════════════════════════
//  ROUTER / NAVIGATION
// ═══════════════════════════════════════

const PAGES = {
  home: renderHome,
  catalog: renderCatalog,
  profile: renderProfile,
};

function navigate(page) {
  if (!PAGES[page]) return;
  Store._state.currentPage = page;
  PAGES[page]();

  // update nav active state
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.classList.toggle('active', el.dataset.nav === page);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ═══════════════════════════════════════
//  HOME PAGE
// ═══════════════════════════════════════

function renderHome() {
  document.getElementById('page-content').innerHTML = `
    <!-- HERO -->
    <section class="hero">
      <div class="container">
        <div class="hero-grid">
          <div>
            <span class="hero-tag">✦ Новая коллекция 2025</span>
            <h1>Магазин для <em>ценителей</em> качества</h1>
            <p>Тщательно отобранные товары: электроника, мода, дом и книги — всё в одном месте с гарантией качества.</p>
            <div class="hero-actions">
              <button class="btn btn-primary btn-lg" onclick="navigate('catalog')">Смотреть каталог</button>
              <button class="btn btn-ghost btn-lg" onclick="navigate('catalog')">Акции недели →</button>
            </div>
            <div class="hero-stats">
              <div>
                <div class="hero-stat-num">12K+</div>
                <div class="hero-stat-label">Товаров</div>
              </div>
              <div>
                <div class="hero-stat-num">98%</div>
                <div class="hero-stat-label">Довольных клиентов</div>
              </div>
              <div>
                <div class="hero-stat-num">2-3 дня</div>
                <div class="hero-stat-label">Срок доставки</div>
              </div>
            </div>
          </div>
          <div class="hero-visual">🛍️</div>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Категории</h2>
            <p class="section-subtitle">Найдите то, что ищете</p>
          </div>
        </div>
        <div class="cat-grid">
          ${CATEGORIES.map(c => `
            <div class="cat-card" onclick="navigate('catalog');setTimeout(()=>setCatalogCategory('${c.id}'),50)">
              <div class="cat-icon">${c.emoji}</div>
              <div class="cat-name">${c.name}</div>
              <div class="cat-count">${c.count} товаров</div>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <!-- FEATURED -->
    <section class="section" style="background:var(--bg2);padding:60px 0">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Популярные товары</h2>
            <p class="section-subtitle">Лидеры продаж этого месяца</p>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="navigate('catalog')">Все товары →</button>
        </div>
        <div class="product-grid">
          ${PRODUCTS.slice(0, 8).map(renderProductCard).join('')}
        </div>
      </div>
    </section>

    <!-- PROMO BANNER -->
    <section class="section">
      <div class="container">
        <div style="background: linear-gradient(135deg, var(--surface) 0%, var(--bg3) 100%);
          border: 1px solid var(--border); border-radius: 24px; padding: 48px 40px;
          display:flex; justify-content:space-between; align-items:center; gap:24px; flex-wrap:wrap;">
          <div>
            <div style="font-size:0.75rem;color:var(--accent);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;font-weight:600">Специальное предложение</div>
            <h2 style="font-size:2rem">Бесплатная доставка<br>от <span class="text-accent">$100</span></h2>
            <p class="text-muted" style="margin-top:10px">На все товары в каталоге. Без ограничений по весу.</p>
          </div>
          <button class="btn btn-primary btn-lg" onclick="navigate('catalog')">Начать покупки</button>
        </div>
      </div>
    </section>

    <!-- SALE PRODUCTS -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">🔥 Скидки</h2>
            <p class="section-subtitle">Успейте купить по сниженной цене</p>
          </div>
        </div>
        <div class="product-grid">
          ${PRODUCTS.filter(p=>p.oldPrice).map(renderProductCard).join('')}
        </div>
      </div>
    </section>
  `;
}

// ═══════════════════════════════════════
//  CATALOG PAGE
// ═══════════════════════════════════════

let _currentCat = 'all';
let _currentSort = 'popular';

function renderCatalog() {
  document.getElementById('page-content').innerHTML = `
    <div class="section">
      <div class="container">
        <div style="margin-bottom:32px">
          <h1 style="font-size:2rem">Каталог</h1>
          <p class="text-muted" style="margin-top:6px">Выберите товары из нашей коллекции</p>
        </div>

        <!-- Inline search -->
        <div style="position:relative;margin-bottom:20px">
          <input id="catalog-search" class="form-input" placeholder="🔍  Поиск по каталогу..."
            style="border-radius:40px;padding-left:20px" oninput="filterProducts()">
        </div>

        <!-- Category chips -->
        <div class="filters-row">
          ${CATEGORIES.map(c => `
            <button class="filter-chip ${_currentCat===c.id?'active':''}"
              data-cat="${c.id}" onclick="setCatalogCategory('${c.id}')">${c.emoji} ${c.name}</button>
          `).join('')}
          <div class="filter-sep">
            <select class="sort-select" onchange="setSortMode(this.value)">
              <option value="popular" ${_currentSort==='popular'?'selected':''}>Популярные</option>
              <option value="price-asc" ${_currentSort==='price-asc'?'selected':''}>Цена ↑</option>
              <option value="price-desc" ${_currentSort==='price-desc'?'selected':''}>Цена ↓</option>
              <option value="rating" ${_currentSort==='rating'?'selected':''}>Рейтинг</option>
              <option value="sale" ${_currentSort==='sale'?'selected':''}>Скидки</option>
            </select>
          </div>
        </div>

        <!-- Product grid -->
        <div id="catalog-grid" class="product-grid"></div>
        <div id="catalog-empty" class="hidden" style="text-align:center;padding:80px 0;color:var(--text3)">
          <div style="font-size:3rem;margin-bottom:16px">🔍</div>
          <p>Товары не найдены</p>
          <button class="btn btn-ghost btn-sm mt-16" onclick="setCatalogCategory('all');document.getElementById('catalog-search').value='';filterProducts()">Сбросить фильтры</button>
        </div>
      </div>
    </div>`;

  filterProducts();
}

function setCatalogCategory(cat) {
  _currentCat = cat;
  document.querySelectorAll('.filter-chip').forEach(el => {
    el.classList.toggle('active', el.dataset.cat === cat);
  });
  filterProducts();
}

function setSortMode(mode) {
  _currentSort = mode;
  filterProducts();
}

function filterProducts() {
  let products = [...PRODUCTS];
  const q = (document.getElementById('catalog-search')?.value || '').trim().toLowerCase();

  if (_currentCat !== 'all') products = products.filter(p => p.category === _currentCat);
  if (q) products = products.filter(p => p.name.toLowerCase().includes(q) || p.category.includes(q));
  if (_currentSort === 'sale') products = products.filter(p => !!p.oldPrice);

  products.sort((a, b) => {
    if (_currentSort === 'price-asc')  return a.price - b.price;
    if (_currentSort === 'price-desc') return b.price - a.price;
    if (_currentSort === 'rating')     return b.rating - a.rating;
    if (_currentSort === 'sale')       return (b.oldPrice ? b.oldPrice - b.price : 0) - (a.oldPrice ? a.oldPrice - a.price : 0);
    return b.reviews - a.reviews; // popular
  });

  const grid  = document.getElementById('catalog-grid');
  const empty = document.getElementById('catalog-empty');
  if (!products.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
  } else {
    grid.innerHTML = products.map(renderProductCard).join('');
    empty.classList.add('hidden');
  }
}

// ═══════════════════════════════════════
//  PROFILE PAGE
// ═══════════════════════════════════════

async function renderProfile() {
  const session = Store.get('session');
  if (!session) {
    document.getElementById('page-content').innerHTML = `
      <div class="section">
        <div class="container" style="text-align:center;padding:80px 0">
          <div style="font-size:4rem;margin-bottom:20px">👤</div>
          <h2>Войдите в аккаунт</h2>
          <p class="text-muted" style="margin-top:10px;margin-bottom:28px">Для доступа к личному кабинету необходима авторизация</p>
          <button class="btn btn-primary btn-lg" onclick="openAuthModal('login')">Войти</button>
          <span style="margin: 0 12px; color:var(--text3)">или</span>
          <button class="btn btn-ghost btn-lg" onclick="openAuthModal('register')">Создать аккаунт</button>
        </div>
      </div>`;
    return;
  }

  const orders = await API.orders.list().catch(() => Store.get('orders'));
  const wishlist = Store.get('wishlist');

  document.getElementById('page-content').innerHTML = `
    <div class="section">
      <div class="container">
        <div class="profile-header">
          <div class="profile-avatar-lg">${session.initials}</div>
          <div>
            <div class="profile-name">${session.name}</div>
            <div class="profile-email">${session.email}</div>
            <div style="display:flex;gap:20px;margin-top:14px">
              <div><span class="fw-bold text-accent">${orders.length}</span> <span class="text-muted" style="font-size:0.8rem">заказов</span></div>
              <div><span class="fw-bold text-accent">${wishlist.length}</span> <span class="text-muted" style="font-size:0.8rem">в избранном</span></div>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="doLogout()" style="margin-left:auto">Выйти</button>
        </div>

        <div class="profile-tabs">
          <div class="profile-tab active" data-tab="orders" onclick="showProfileTab('orders')">📦 Заказы</div>
          <div class="profile-tab" data-tab="wishlist" onclick="showProfileTab('wishlist')">❤️ Избранное</div>
          <div class="profile-tab" data-tab="settings" onclick="showProfileTab('settings')">⚙️ Настройки</div>
        </div>

        <!-- ORDERS -->
        <div class="profile-section active" id="tab-orders">
          ${orders.length ? orders.map(o => {
            const statusMap = { delivered:'status-delivered', shipping:'status-shipping', processing:'status-processing' };
            const statusLabel = { delivered:'Доставлен', shipping:'В пути', processing:'Обрабатывается' };
            return `
              <div class="order-card">
                <div class="order-header">
                  <div>
                    <div class="order-id">${o.id}</div>
                    <div class="order-date">${o.date}</div>
                  </div>
                  <span class="order-status ${statusMap[o.status]}">${statusLabel[o.status]}</span>
                </div>
                <div class="order-items-list">
                  ${o.items.map(i => {
                    const p = PRODUCTS.find(x => x.id === i.id);
                    return p ? `<div class="order-item-row">
                      <span class="order-item-emoji">${p.emoji}</span>
                      <span class="order-item-text">${p.name} × ${i.qty}</span>
                    </div>` : '';
                  }).join('')}
                </div>
                <div class="order-total">Итого: $${o.total.toFixed(2)}</div>
              </div>`;
          }).join('') : `<div style="text-align:center;padding:60px;color:var(--text3)">
            <div style="font-size:3rem;margin-bottom:12px">📦</div>
            <p>Заказов пока нет</p>
            <button class="btn btn-primary btn-sm mt-16" onclick="navigate('catalog')">Начать покупки</button>
          </div>`}
        </div>

        <!-- WISHLIST -->
        <div class="profile-section" id="tab-wishlist">
          ${wishlist.length ? `<div class="product-grid">${
            wishlist.map(id => {
              const p = PRODUCTS.find(x => x.id === id);
              return p ? renderProductCard(p) : '';
            }).join('')
          }</div>` : `<div style="text-align:center;padding:60px;color:var(--text3)">
            <div style="font-size:3rem;margin-bottom:12px">🤍</div>
            <p>Избранное пусто</p>
            <button class="btn btn-primary btn-sm mt-16" onclick="navigate('catalog')">Смотреть каталог</button>
          </div>`}
        </div>

        <!-- SETTINGS -->
        <div class="profile-section" id="tab-settings">
          <div style="max-width:480px">
            <h3 style="margin-bottom:24px">Личные данные</h3>
            <div class="form-group">
              <label class="form-label">Имя</label>
              <input class="form-input" id="settings-name" value="${session.name}">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" id="settings-email" value="${session.email}" type="email">
            </div>
            <div class="form-group">
              <label class="form-label">Адрес доставки</label>
              <input class="form-input" placeholder="ул. Примерная, д. 1, кв. 1">
            </div>
            <button class="btn btn-primary" onclick="saveSettings()">Сохранить изменения</button>
            <hr class="divider">
            <h3 style="margin-bottom:16px">Безопасность</h3>
            <div class="form-group">
              <label class="form-label">Новый пароль</label>
              <input class="form-input" type="password" placeholder="••••••••">
            </div>
            <button class="btn btn-secondary">Сменить пароль</button>
          </div>
        </div>
      </div>
    </div>`;
}

function showProfileTab(tab) {
  document.querySelectorAll('.profile-tab').forEach(el => el.classList.toggle('active', el.dataset.tab === tab));
  document.querySelectorAll('.profile-section').forEach(el => el.classList.toggle('active', el.id === `tab-${tab}`));
}

async function saveSettings() {
  const name  = document.getElementById('settings-name').value.trim();
  const email = document.getElementById('settings-email').value.trim();

  if (!name || name.length < 2) { toast('Введите корректное имя (минимум 2 символа)', 'error'); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { toast('Введите корректный email', 'error'); return; }

  const btn = document.querySelector('#tab-settings .btn-primary');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>'; }

  try {
    // PATCH /auth/me — обновление профиля
    await apiFetch('/auth/me', { method: 'PATCH', body: JSON.stringify({ name, email }) });
    Store._state.session.name    = name;
    Store._state.session.email   = email;
    Store._state.session.initials = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    Store._persist();
    updateNavUser();
    toast('Данные сохранены', 'success');
  } catch (e) {
    toast(e.message || 'Ошибка сохранения', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = 'Сохранить изменения'; }
  }
}
