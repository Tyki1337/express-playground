// ═══════════════════════════════════════
//  STORE DATA
// ═══════════════════════════════════════

const PRODUCTS = [
  { id:1,  name:'Sony WH-1000XM5',       category:'electronics', emoji:'🎧', price:349, oldPrice:449, rating:4.8, reviews:1243, badge:'Hit',  desc:'Industry-leading noise cancellation with 30-hour battery life and premium audio.' },
  { id:2,  name:'Mechanical Keyboard Pro',category:'electronics', emoji:'⌨️', price:129, oldPrice:null,rating:4.6, reviews:892,  badge:null,  desc:'Tactile switches, per-key RGB, aluminum frame for the ultimate typing feel.' },
  { id:3,  name:'Nike Air Max 2024',      category:'fashion',    emoji:'👟', price:189, oldPrice:229, rating:4.7, reviews:2341, badge:'Sale', desc:'Breathable mesh upper, responsive Air cushioning for all-day comfort.' },
  { id:4,  name:'Leather Wallet Slim',    category:'fashion',    emoji:'👛', price:59,  oldPrice:null,rating:4.5, reviews:456,  badge:null,  desc:'Full-grain leather, RFID blocking, fits 8 cards and cash.' },
  { id:5,  name:'Monstera Deliciosa',     category:'home',       emoji:'🌿', price:42,  oldPrice:null,rating:4.9, reviews:678,  badge:'New', desc:'Large tropical houseplant, easy to care for, ships in ceramic pot.' },
  { id:6,  name:'Scented Candle Set',     category:'home',       emoji:'🕯️', price:38,  oldPrice:48,  rating:4.7, reviews:1120, badge:'Sale', desc:'Set of 3 hand-poured soy candles: cedar, sandalwood, and amber.' },
  { id:7,  name:'The Art of Design Book', category:'books',      emoji:'📚', price:34,  oldPrice:null,rating:4.8, reviews:342,  badge:null,  desc:'Deep dive into visual principles, typography, and creative process.' },
  { id:8,  name:'Atomic Habits',          category:'books',      emoji:'📖', price:18,  oldPrice:24,  rating:4.9, reviews:8921, badge:'Best', desc:'James Clear\'s groundbreaking guide to building better habits.' },
  { id:9,  name:'Running Watch Ultra',    category:'sports',     emoji:'⌚', price:299, oldPrice:379, rating:4.6, reviews:567,  badge:'Sale', desc:'GPS, heart rate, sleep tracking, 14-day battery. Waterproof 100m.' },
  { id:10, name:'Yoga Mat Premium',       category:'sports',     emoji:'🧘', price:68,  oldPrice:null,rating:4.7, reviews:234,  badge:null,  desc:'6mm thick non-slip cork mat with alignment lines and carry strap.' },
  { id:11, name:'MacBook Stand Pro',      category:'electronics', emoji:'💻', price:79,  oldPrice:99,  rating:4.5, reviews:780,  badge:'Sale', desc:'Aluminum adjustable stand, 360° swivel, fits all laptops 10–17".' },
  { id:12, name:'Minimalist Wall Clock',  category:'home',       emoji:'🕐', price:55,  oldPrice:null,rating:4.4, reviews:213,  badge:null,  desc:'Silent quartz movement, walnut frame, 30cm diameter.' },
];

const CATEGORIES = [
  { id:'all',         name:'All',         emoji:'✨', count: PRODUCTS.length },
  { id:'electronics', name:'Electronics', emoji:'💡', count: PRODUCTS.filter(p=>p.category==='electronics').length },
  { id:'fashion',     name:'Fashion',     emoji:'👗', count: PRODUCTS.filter(p=>p.category==='fashion').length },
  { id:'home',        name:'Home',        emoji:'🏠', count: PRODUCTS.filter(p=>p.category==='home').length },
  { id:'books',       name:'Books',       emoji:'📚', count: PRODUCTS.filter(p=>p.category==='books').length },
  { id:'sports',      name:'Sports',      emoji:'⚽', count: PRODUCTS.filter(p=>p.category==='sports').length },
];

// ═══════════════════════════════════════
//  STATE MANAGEMENT
// ═══════════════════════════════════════

const Store = {
  _state: {
    session: null,       // { name, email, initials }
    cart: [],            // { productId, qty }
    guestCart: [],       // persisted across login
    wishlist: [],        // productIds
    currentPage: 'home',
    currentCategory: 'all',
    searchQuery: '',
    currentProduct: null,
    orders: [],
  },

  init() {
    const saved = localStorage.getItem('shop_state');
    if (saved) {
      const p = JSON.parse(saved);
      this._state.session   = p.session  || null;
      this._state.cart      = p.cart     || [];
      this._state.guestCart = p.guestCart|| [];
      this._state.wishlist  = p.wishlist || [];
      this._state.orders    = p.orders   || this._mockOrders();
    } else {
      this._state.orders = this._mockOrders();
    }
  },

  _persist() {
    localStorage.setItem('shop_state', JSON.stringify({
      session:   this._state.session,
      cart:      this._state.cart,
      guestCart: this._state.guestCart,
      wishlist:  this._state.wishlist,
      orders:    this._state.orders,
    }));
  },

  _mockOrders() {
    return [
      {
        id: '#ORD-8821', date: '14 May 2025', status: 'delivered',
        items: [{id:1,qty:1},{id:3,qty:2}],
        total: 349+189*2
      },
      {
        id: '#ORD-7643', date: '02 Apr 2025', status: 'shipping',
        items: [{id:8,qty:1},{id:6,qty:1}],
        total: 18+38
      },
    ];
  },

  get(key) { return this._state[key]; },

  // ── AUTH ──
  login(name, email) {
    const initials = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    this._state.session = { name, email, initials };
    // merge guest cart into user cart
    if (this._state.guestCart.length) {
      this._state.guestCart.forEach(gi => {
        const existing = this._state.cart.find(i => i.productId === gi.productId);
        if (existing) existing.qty += gi.qty;
        else this._state.cart.push({...gi});
      });
      this._state.guestCart = [];
      toast('Корзина из гостевого сеанса перенесена', 'info');
    }
    this._persist();
  },

  logout() {
    // save cart as guest before clearing session
    this._state.guestCart = [...this._state.cart];
    this._state.cart = [];
    this._state.session = null;
    this._persist();
  },

  register(name, email) {
    this.login(name, email);
  },

  // ── CART ──
  getActiveCart() {
    return this._state.session ? this._state.cart : this._state.guestCart;
  },

  addToCart(productId, qty = 1) {
    const cart = this.getActiveCart();
    const existing = cart.find(i => i.productId === productId);
    if (existing) existing.qty += qty;
    else cart.push({ productId, qty });
    this._persist();
    this._emit('cart');
  },

  removeFromCart(productId) {
    const isUser = !!this._state.session;
    if (isUser) this._state.cart = this._state.cart.filter(i => i.productId !== productId);
    else this._state.guestCart = this._state.guestCart.filter(i => i.productId !== productId);
    this._persist();
    this._emit('cart');
  },

  updateQty(productId, qty) {
    const cart = this.getActiveCart();
    const item = cart.find(i => i.productId === productId);
    if (item) { if (qty < 1) this.removeFromCart(productId); else item.qty = qty; }
    this._persist();
    this._emit('cart');
  },

  cartTotal() {
    return this.getActiveCart().reduce((sum, i) => {
      const p = PRODUCTS.find(p => p.id === i.productId);
      return sum + (p ? p.price * i.qty : 0);
    }, 0);
  },

  cartCount() {
    return this.getActiveCart().reduce((sum,i) => sum + i.qty, 0);
  },

  // ── WISHLIST ──
  toggleWishlist(productId) {
    const idx = this._state.wishlist.indexOf(productId);
    if (idx === -1) this._state.wishlist.push(productId);
    else this._state.wishlist.splice(idx, 1);
    this._persist();
    this._emit('wishlist');
  },

  inWishlist(productId) { return this._state.wishlist.includes(productId); },

  // ── ORDERS ──
  placeOrder() {
    const cart = this.getActiveCart();
    if (!cart.length) return false;
    const order = {
      id: '#ORD-' + Math.floor(1000 + Math.random()*9000),
      date: new Date().toLocaleDateString('ru-RU', {day:'2-digit',month:'short',year:'numeric'}),
      status: 'processing',
      items: cart.map(i => ({id: i.productId, qty: i.qty})),
      total: this.cartTotal(),
    };
    this._state.orders.unshift(order);
    if (this._state.session) this._state.cart = [];
    else this._state.guestCart = [];
    this._persist();
    this._emit('cart');
    return order;
  },

  // ── EVENTS ──
  _listeners: {},
  _emit(event) { (this._listeners[event]||[]).forEach(fn=>fn()); },
  on(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  },
};
