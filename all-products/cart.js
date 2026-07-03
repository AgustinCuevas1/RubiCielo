const CART_STORAGE_KEY = 'rubicielo_cart';
const cartCount = document.getElementById('count-carrito');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartPopup = document.getElementById('cartPopup');
const cartBackdrop = document.getElementById('cartBackdrop');
const cartIcon = document.querySelector('.contenedor__carrito');
const closeCart = document.getElementById('closeCart');
const cartWhatsapp = document.getElementById('cartWhatsapp');
const addToCartButton = document.getElementById('addToCartButton');
const productContainer = document.querySelector('.product-detail-main');

function loadCart() {
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

const cart = loadCart();

function formatPrice(amount) {
  return '$' + amount.toLocaleString('es-AR', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
}

function calculateCartSummary() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartCount) cartCount.textContent = totalQuantity;
  if (cartTotal) cartTotal.textContent = formatPrice(totalPrice);
  return { totalQuantity, totalPrice };
}

function updateWhatsappLink() {
  const { totalPrice } = calculateCartSummary();
  const productsList = cart.map((item) => `${item.name} (${item.quantity}x)`).join(', ');
  const messageText = cart.length > 0
    ? `Hola! Quiero consultar por un pedido de RubiCielo.\nPresupuesto: ${formatPrice(totalPrice)}.\nProductos: ${productsList}.`
    : 'Hola! Quiero consultar por un pedido de RubiCielo.';

  if (cartWhatsapp) {
    cartWhatsapp.href = `https://wa.me/549498400377?text=${encodeURIComponent(messageText)}`;
  }
}

function renderCartItems() {
  if (!cartItemsContainer) return;
  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="cart-popup__empty">El carrito está vacío. Agregá productos para ver tu presupuesto.</p>';
    updateWhatsappLink();
    return;
  }

  cart.forEach((item) => {
    const itemNode = document.createElement('div');
    itemNode.className = 'cart-item';
    itemNode.dataset.name = item.name;
    itemNode.innerHTML = `
      <div class="cart-item__details">
        <p>${item.name}</p>
        <span>${item.quantity} x ${formatPrice(item.price)}</span>
      </div>
      <button type="button" class="cart-item__remove" data-remove="${item.name}" aria-label="Eliminar ${item.name}">×</button>
    `;
    cartItemsContainer.appendChild(itemNode);
  });

  updateWhatsappLink();
}

function addToCart(product) {
  const existingItem = cart.find((item) => item.name === product.name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  calculateCartSummary();
  renderCartItems();
}

function removeFromCart(productName) {
  const itemIndex = cart.findIndex((item) => item.name === productName);
  if (itemIndex === -1) return;
  cart.splice(itemIndex, 1);
  saveCart(cart);
  calculateCartSummary();
  renderCartItems();
}

function openCart() {
  if (!cartPopup) return;
  cartPopup.classList.add('open');
  cartPopup.setAttribute('aria-hidden', 'false');
}

function closeCartPopup() {
  if (!cartPopup) return;
  cartPopup.classList.remove('open');
  cartPopup.setAttribute('aria-hidden', 'true');
}

if (cartIcon) {
  cartIcon.addEventListener('click', (event) => {
    event.preventDefault();
    if (!cartPopup) return;
    if (cartPopup.classList.contains('open')) {
      closeCartPopup();
    } else {
      openCart();
    }
  });
}

if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartPopup);
if (closeCart) closeCart.addEventListener('click', closeCartPopup);
if (cartItemsContainer) {
  cartItemsContainer.addEventListener('click', (event) => {
    const removeButton = event.target.closest('.cart-item__remove');
    if (!removeButton) return;
    const productName = removeButton.dataset.remove;
    removeFromCart(productName);
  });
}

if (addToCartButton && productContainer) {
  addToCartButton.addEventListener('click', () => {
    const name = productContainer.dataset.productName;
    const price = Number(productContainer.dataset.productPrice);
    if (!name || Number.isNaN(price)) return;
    addToCart({ name, price });
  });
}

renderCartItems();
updateWhatsappLink();
