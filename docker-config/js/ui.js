// ═══════════════════════════════════════
//  TOAST NOTIFICATIONS
// ═══════════════════════════════════════

function toast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success:'✅', error:'❌', info:'🛍️' };
  el.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 400);
  }, 3000);
}

// ═══════════════════════════════════════
//  PRODUCT CARD RENDER
// ═══════════════════════════════════════

function renderProductCard(product) {
  const inWish = Store.inWishlist(product.id);
  const stars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating));
  const oldPriceHtml = product.oldPrice
    ? `<span class="product-price-old">$${product.oldPrice}</span>` : '';
  const badgeHtml = product.badge
    ? `<span class="product-badge ${product.badge==='Sale'?'sale':''}">${product.badge}</span>` : '';

  return `
    <div class="product-card" onclick="openProduct(${product.id})">
      <div class="product-img">
        ${badgeHtml}
        <button class="product-wishlist ${inWish?'active':''}"
          onclick="event.stopPropagation();wishlistToggle(${product.id},this)"
          title="В избранное">
          ${inWish ? '❤️' : '🤍'}
        </button>
        <span style="position:relative;z-index:1">${product.emoji}</span>
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-rating">
          <span class="stars">${stars}</span>
          <span class="rating-count">(${product.reviews.toLocaleString()})</span>
        </div>
        <div class="product-footer">
          <div>${oldPriceHtml}<span class="product-price">$${product.price}</span></div>
          <button class="product-add-btn" onclick="event.stopPropagation();addToCart(${product.id})" title="Добавить в корзину">+</button>
        </div>
      </div>
    </div>`;
}

function wishlistToggle(productId, btn) {
  Store.toggleWishlist(productId);
  const active = Store.inWishlist(productId);
  btn.classList.toggle('active', active);
  btn.textContent = active ? '❤️' : '🤍';
  toast(active ? 'Добавлено в избранное' : 'Убрано из избранного', active ? 'success' : 'info');
  updateWishlistBadge();
}

function updateWishlistBadge() {
  const badge = document.getElementById('wishlist-badge');
  const count = Store.get('wishlist').length;
  badge.textContent = count;
  badge.classList.toggle('show', count > 0);
}

// ═══════════════════════════════════════
//  CART PANEL
// ═══════════════════════════════════════

async function addToCart(productId, qty = 1) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (Store.get('session')) {
    try {
      const items = await API.cart.add(productId, qty);
      // синхронизируем локальный стейт с ответом сервера
      Store._state.cart = items;
      Store._persist();
    } catch (e) {
      toast(e.message || 'Не удалось добавить товар', 'error');
      return;
    }
  } else {
    // гостевая корзина — только localStorage
    Store.addToCart(productId, qty);
  }
  toast(`${p.name} добавлен в корзину`, 'success');
  updateCartBadge();
  renderCartPanel();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const count = Store.cartCount();
  badge.textContent = count;
  badge.classList.toggle('show', count > 0);
}

function renderCartPanel() {
  if (Store.get('session')) {
    try {
      const items = qty < 1
        ? await API.cart.remove(productId)
        : await API.cart.update(productId, qty);
      Store._state.cart = items;
      Store._persist();
    } catch (e) {
      toast(e.message || 'Ошибка обновления корзины', 'error');
      return;
    }
  } else {
    Store.updateQty(productId, qty);
  }
  updateCartBadge();
  renderCartPanel();
}

async function removeFromCart(productId) {
  if (Store.get('session')) {
    try {
      const items = await API.cart.remove(productId);
      Store._state.cart = items;
      Store._persist();
    } catch (e) {
      toast(e.message || 'Ошибка удаления товара', 'error');
      return;
    }
  } else {
    Store.removeFromCart(productId);
  }
  updateCartBadge();
  renderCartPanel();
  toast('Товар удалён из корзины', 'info');
}
  const body = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');
  const cart = Store.getActiveCart();

  if (!cart.length) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Ваша корзина пуста</p>
        <p class="text-muted" style="font-size:0.8rem;margin-top:6px">Добавьте товары из каталога</p>
      </div>`;
    footer.innerHTML = '';
    return;
  }

  body.innerHTML = cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.productId);
    if (!p) return '';
    return `
      <div class="cart-item">
        <div class="cart-item-img">${p.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-variant">${p.category}</div>
          <div class="cart-item-price">$${(p.price * item.qty).toFixed(2)}</div>
          <div class="cart-qty">
            <button class="qty-btn" onclick="changeQty(${p.id}, ${item.qty - 1})">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${p.id}, ${item.qty + 1})">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${p.id})" title="Удалить">🗑</button>
      </div>`;
  }).join('');

  const shipping = Store.cartTotal() >= 100 ? 0 : 9.99;
  const total = Store.cartTotal() + shipping;

  footer.innerHTML = `
    <div class="cart-summary">
      <div class="cart-row"><span>Товары (${Store.cartCount()})</span><span>$${Store.cartTotal().toFixed(2)}</span></div>
      <div class="cart-row"><span>Доставка</span><span>${shipping === 0 ? '🎁 Бесплатно' : '$' + shipping.toFixed(2)}</span></div>
      <div class="cart-row total"><span>Итого</span><span>$${total.toFixed(2)}</span></div>
    </div>
    <button class="btn btn-primary btn-full mt-16" onclick="checkout()">Оформить заказ</button>
    <p class="text-muted" style="text-align:center;font-size:0.75rem;margin-top:10px">Бесплатная доставка от $100</p>`;


function changeQty(productId, qty) {
  Store.updateQty(productId, qty);
  updateCartBadge();
  renderCartPanel();
}

function removeFromCart(productId) {
  Store.removeFromCart(productId);
  updateCartBadge();
  renderCartPanel();
  toast('Товар удалён из корзины', 'info');
}

async function checkout() {
  if (!Store.get('session')) {
    closeCart();
    setTimeout(() => openAuthModal('login'), 300);
    toast('Войдите, чтобы оформить заказ', 'info');
    return;
  }

  const checkoutBtn = document.querySelector('#cart-footer .btn-primary');
  if (checkoutBtn) { checkoutBtn.disabled = true; checkoutBtn.innerHTML = '<span class="spinner"></span> Оформляем...'; }

  try {
    const order = await API.orders.place();
    // очищаем локальную корзину после успешного заказа
    Store._state.cart = [];
    Store._persist();
    closeCart();
    updateCartBadge();
    toast(`Заказ ${order.id || '#' + Math.floor(Math.random()*9000)} оформлен!`, 'success');
    setTimeout(() => { navigate('profile'); showProfileTab('orders'); }, 400);
  } catch (e) {
    toast(e.message || 'Ошибка при оформлении заказа', 'error');
    if (checkoutBtn) { checkoutBtn.disabled = false; checkoutBtn.innerHTML = 'Оформить заказ'; }
  }
}

// ═══════════════════════════════════════
//  SEARCH
// ═══════════════════════════════════════

function initSearch() {
  const input  = document.getElementById('nav-search-input');
  const drop   = document.getElementById('search-dropdown');

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { drop.classList.remove('show'); return; }

    const results = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    ).slice(0, 6);

    if (!results.length) {
      drop.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text3);font-size:0.875rem">Ничего не найдено</div>`;
    } else {
      drop.innerHTML = results.map(p => `
        <div class="search-item" onclick="searchSelect(${p.id})">
          <div class="search-item-img">${p.emoji}</div>
          <div>
            <div class="search-item-name">${p.name}</div>
            <div class="search-item-price">$${p.price}</div>
          </div>
        </div>`).join('');
    }
    drop.classList.add('show');
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) { searchGlobal(q); drop.classList.remove('show'); input.blur(); }
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-search')) drop.classList.remove('show');
  });
}

function searchSelect(productId) {
  document.getElementById('search-dropdown').classList.remove('show');
  document.getElementById('nav-search-input').value = '';
  openProduct(productId);
}

function searchGlobal(q) {
  navigate('catalog');
  setTimeout(() => {
    document.getElementById('catalog-search').value = q;
    filterProducts();
  }, 50);
}

// ═══════════════════════════════════════
//  PANELS / MODALS
// ═══════════════════════════════════════

function openCart() {
  renderCartPanel();
  document.getElementById('overlay').classList.add('show');
  document.getElementById('cart-panel').classList.add('show');
}
function closeCart() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('cart-panel').classList.remove('show');
}

function openAuthModal(tab = 'login') {
  document.getElementById('overlay').classList.add('show');
  document.getElementById('auth-modal').classList.add('show');
  switchAuthTab(tab);
}
function closeAuthModal() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('auth-modal').classList.remove('show');
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('register-form').classList.toggle('hidden', tab !== 'register');
}

document.addEventListener('click', e => {
  if (e.target.id === 'overlay') {
    closeCart();
    closeAuthModal();
    closeProductModal();
  }
});

// ═══════════════════════════════════════
//  VALIDATION HELPERS
// ═══════════════════════════════════════

const Validate = {
  // email RFC-упрощённый паттерн
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
  // имя: минимум 2 символа, только буквы/пробел/дефис
  name:  v => v.trim().length >= 2,
  // пароль: мин 6, хотя бы одна буква и цифра
  password: v => v.length >= 6,
  passwordStrong: v => v.length >= 6 && /[a-zA-Zа-яА-Я]/.test(v) && /\d/.test(v),
};

// Показать ошибку у конкретного поля
function fieldError(inputId, message) {
  const input = document.getElementById(inputId);
  let errEl   = input.parentElement.querySelector('.field-error');
  if (!errEl) {
    errEl = document.createElement('div');
    errEl.className = 'form-error field-error';
    input.parentElement.appendChild(errEl);
  }
  errEl.textContent = message;
  errEl.classList.add('show');
  input.style.borderColor = 'var(--red)';
  input.focus();
}

function clearFieldError(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const errEl = input.parentElement?.querySelector('.field-error');
  if (errEl) errEl.classList.remove('show');
  input.style.borderColor = '';
}

// Установить состояние кнопки «загрузка»
function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.dataset.originalText = btn.dataset.originalText || btn.innerHTML;
  btn.innerHTML = loading
    ? `<span class="spinner"></span> Подождите...`
    : btn.dataset.originalText;
}

// ═══════════════════════════════════════
//  AUTH ACTIONS
// ═══════════════════════════════════════

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const err   = document.getElementById('login-error');
  err.classList.remove('show');
  ['login-email','login-pass'].forEach(clearFieldError);

  // Фронтовая валидация
  let valid = true;
  if (!email) { fieldError('login-email', 'Введите email'); valid = false; }
  else if (!Validate.email(email)) { fieldError('login-email', 'Некорректный формат email'); valid = false; }
  if (!pass) { fieldError('login-pass', 'Введите пароль'); valid = false; }
  if (!valid) return;

  setLoading('btn-login', true);
  try {
    const user = await API.auth.login(email, pass);
    // сохраняем сессию и переносим гостевую корзину
    const guestCart = [...Store._state.guestCart];
    Store.login(user.name || email.split('@')[0], user.email || email);
    if (guestCart.length) {
      await API.cart.merge(guestCart).catch(() => null);
    }
    closeAuthModal();
    updateNavUser();
    toast(`Добро пожаловать, ${Store.get('session').name}!`, 'success');
  } catch (e) {
    err.textContent = e.message || 'Неверный email или пароль';
    err.classList.add('show');
  } finally {
    setLoading('btn-login', false);
  }
}

async function doRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  const err   = document.getElementById('register-error');
  err.classList.remove('show');
  ['reg-name','reg-email','reg-pass','reg-pass2'].forEach(clearFieldError);

  // Фронтовая валидация
  let valid = true;
  if (!name) { fieldError('reg-name', 'Введите имя'); valid = false; }
  else if (!Validate.name(name)) { fieldError('reg-name', 'Минимум 2 символа'); valid = false; }
  if (!email) { fieldError('reg-email', 'Введите email'); valid = false; }
  else if (!Validate.email(email)) { fieldError('reg-email', 'Некорректный формат email'); valid = false; }
  if (!pass) { fieldError('reg-pass', 'Введите пароль'); valid = false; }
  else if (!Validate.password(pass)) { fieldError('reg-pass', 'Минимум 6 символов'); valid = false; }
  else if (!Validate.passwordStrong(pass)) { fieldError('reg-pass', 'Добавьте буквы и цифры'); valid = false; }
  if (pass && pass !== pass2) { fieldError('reg-pass2', 'Пароли не совпадают'); valid = false; }
  if (!valid) return;

  setLoading('btn-register', true);
  try {
    const user = await API.auth.register(name, email, pass);
    const guestCart = [...Store._state.guestCart];
    Store.register(user.name || name, user.email || email);
    if (guestCart.length) {
      await API.cart.merge(guestCart).catch(() => null);
    }
    closeAuthModal();
    updateNavUser();
    toast(`Аккаунт создан! Добро пожаловать, ${name}!`, 'success');
  } catch (e) {
    err.textContent = e.message || 'Ошибка регистрации';
    err.classList.add('show');
  } finally {
    setLoading('btn-register', false);
  }
}

async function doLogout() {
  await API.auth.logout().catch(() => null);
  Store.logout();
  updateNavUser();
  updateCartBadge();
  navigate('home');
  toast('Вы вышли из аккаунта', 'info');
}

function updateNavUser() {
  const session = Store.get('session');
  const userBtn = document.getElementById('nav-user-btn');
  const loginBtn = document.getElementById('nav-login-btn');
  if (session) {
    document.getElementById('nav-avatar-text').textContent = session.initials;
    document.getElementById('nav-user-name').textContent = session.name;
    userBtn.classList.remove('hidden');
    loginBtn.classList.add('hidden');
  } else {
    userBtn.classList.add('hidden');
    loginBtn.classList.remove('hidden');
  }
}

// ═══════════════════════════════════════
//  PRODUCT MODAL
// ═══════════════════════════════════════

let detailQty = 1;

function openProduct(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  detailQty = 1;
  const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
  const modal = document.getElementById('product-modal');
  modal.querySelector('.modal-box').innerHTML = `
    <button class="panel-close" onclick="closeProductModal()" style="position:absolute;top:16px;right:16px">✕</button>
    <div class="product-detail-grid">
      <div class="product-detail-img">${p.emoji}</div>
      <div class="product-detail-info">
        <div class="product-category">${p.category}</div>
        <h2 style="font-size:1.5rem">${p.name}</h2>
        <div class="product-detail-rating">
          <span class="stars">${stars}</span>
          <span class="rating-count" style="font-size:0.8rem;color:var(--text3)">${p.rating} · ${p.reviews.toLocaleString()} отзывов</span>
        </div>
        <div class="product-detail-price">
          ${p.oldPrice ? `<span style="font-size:1rem;color:var(--text3);text-decoration:line-through;margin-right:8px">$${p.oldPrice}</span>` : ''}
          $${p.price}
        </div>
        <p class="product-detail-desc">${p.desc}</p>
        <div class="quantity-row">
          <div class="quantity-control">
            <button class="qty-btn" onclick="detailQtyChange(-1)">−</button>
            <span class="qty-val" id="detail-qty">1</span>
            <button class="qty-btn" onclick="detailQtyChange(1)">+</button>
          </div>
        </div>
        <div class="detail-actions">
          <button class="btn btn-primary btn-lg" onclick="addToCart(${p.id}, detailQty);closeProductModal()">
            🛒 В корзину
          </button>
          <button class="btn btn-secondary" onclick="wishlistToggle(${p.id}, document.querySelector('#product-modal .wish-btn'))">
            <span class="wish-btn">${Store.inWishlist(p.id)?'❤️':'🤍'}</span>
          </button>
        </div>
      </div>
    </div>`;

  document.getElementById('overlay').classList.add('show');
  modal.classList.add('show');
}

function detailQtyChange(delta) {
  detailQty = Math.max(1, detailQty + delta);
  document.getElementById('detail-qty').textContent = detailQty;
}

function closeProductModal() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('product-modal').classList.remove('show');
}
