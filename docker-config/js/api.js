// ═══════════════════════════════════════════════════════════════
//  API — fetch-обёртка + все эндпоинты
//
//  Контракт (стандартный REST, замените BASE_URL на свой):
//
//  POST   /auth/login        { email, password }          → { token, user }
//  POST   /auth/register     { name, email, password }    → { token, user }
//  POST   /auth/logout                                    → 200
//  GET    /auth/me                                        → { user }
//
//  GET    /products          ?category=&q=&sort=&page=    → { items[], total }
//  GET    /products/:id                                   → { product }
//  GET    /categories                                     → { items[] }
//
//  GET    /cart                                           → { items[] }
//  POST   /cart              { productId, qty }           → { items[] }
//  PATCH  /cart/:productId   { qty }                      → { items[] }
//  DELETE /cart/:productId                                → { items[] }
//  POST   /cart/merge        { items[] }                  → { items[] }
//
//  GET    /orders                                         → { items[] }
//  POST   /orders                                         → { order }
//
//  GET    /wishlist                                       → { items[] }
//  POST   /wishlist          { productId }                → { items[] }
//  DELETE /wishlist/:id                                   → { items[] }
// ═══════════════════════════════════════════════════════════════

const BASE_URL = '/api'; // ← замените на свой (https://api.example.com)

// ── Токен ──────────────────────────────────────────────────────
const Token = {
  get()       { return localStorage.getItem('auth_token'); },
  set(t)      { localStorage.setItem('auth_token', t); },
  clear()     { localStorage.removeItem('auth_token'); },
  exists()    { return !!this.get(); },
};

// ── Базовый fetch ───────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  if (Token.exists()) {
    headers['Authorization'] = `Bearer ${Token.get()}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('Нет соединения с сервером', 0);
  }

  // 401 → разлогинить и перенаправить на главную
  if (res.status === 401) {
    Token.clear();
    Store._state.session = null;
    Store._persist();
    updateNavUser();
    updateCartBadge();
    navigate('home');
    toast('Сессия истекла. Войдите снова.', 'error');
    throw new ApiError('Unauthorized', 401);
  }

  let body;
  try { body = await res.json(); } catch { body = {}; }

  if (!res.ok) {
    // бэкенд должен вернуть { message: "..." } при ошибке
    throw new ApiError(body.message || `Ошибка ${res.status}`, res.status, body);
  }

  return body;
}

// Хелпер-класс ошибок
class ApiError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.status = status;
    this.data   = data;
  }
}

// ── Shorthand ──────────────────────────────────────────────────
const get    = (path)         => apiFetch(path);
const post   = (path, body)   => apiFetch(path, { method:'POST',   body: JSON.stringify(body) });
const patch  = (path, body)   => apiFetch(path, { method:'PATCH',  body: JSON.stringify(body) });
const del    = (path)         => apiFetch(path, { method:'DELETE' });

// ═══════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════
const API = {
  auth: {
    async login(email, password) {
      const data = await post('/auth/login', { email, password });
      // ожидаем { token, user: { name, email, ... } }
      Token.set(data.token);
      return data.user;
    },

    async register(name, email, password) {
      const data = await post('/auth/register', { name, email, password });
      Token.set(data.token);
      return data.user;
    },

    async logout() {
      try { await post('/auth/logout', {}); } catch { /* игнорируем */ }
      Token.clear();
    },

    async me() {
      // вызывается при старте для восстановления сессии
      if (!Token.exists()) return null;
      try {
        const data = await get('/auth/me');
        return data.user;
      } catch {
        Token.clear();
        return null;
      }
    },
  },

  // ═════════════════════════════════════════════════════════════
  //  PRODUCTS
  // ═════════════════════════════════════════════════════════════
  products: {
    async list({ category = '', q = '', sort = 'popular', page = 1 } = {}) {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.set('category', category);
      if (q)    params.set('q', q);
      if (sort) params.set('sort', sort);
      params.set('page', page);
      const data = await get(`/products?${params}`);
      // ожидаем { items: [...], total: N }
      return data;
    },

    async get(id) {
      const data = await get(`/products/${id}`);
      return data.product ?? data;
    },

    async categories() {
      const data = await get('/categories');
      return data.items ?? data;
    },
  },

  // ═════════════════════════════════════════════════════════════
  //  CART
  // ═════════════════════════════════════════════════════════════
  cart: {
    async get() {
      const data = await get('/cart');
      return data.items ?? data;
    },

    async add(productId, qty = 1) {
      const data = await post('/cart', { productId, qty });
      return data.items ?? data;
    },

    async update(productId, qty) {
      const data = await patch(`/cart/${productId}`, { qty });
      return data.items ?? data;
    },

    async remove(productId) {
      const data = await del(`/cart/${productId}`);
      return data.items ?? data;
    },

    // перенос гостевой корзины после логина
    async merge(guestItems) {
      if (!guestItems.length) return this.get();
      const data = await post('/cart/merge', { items: guestItems });
      return data.items ?? data;
    },
  },

  // ═════════════════════════════════════════════════════════════
  //  ORDERS
  // ═════════════════════════════════════════════════════════════
  orders: {
    async list() {
      const data = await get('/orders');
      return data.items ?? data;
    },

    async place() {
      const data = await post('/orders', {});
      return data.order ?? data;
    },
  },

  // ═════════════════════════════════════════════════════════════
  //  WISHLIST
  // ═════════════════════════════════════════════════════════════
  wishlist: {
    async list() {
      const data = await get('/wishlist');
      return data.items ?? data;
    },

    async add(productId) {
      const data = await post('/wishlist', { productId });
      return data.items ?? data;
    },

    async remove(productId) {
      const data = await del(`/wishlist/${productId}`);
      return data.items ?? data;
    },
  },
};
