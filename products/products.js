      const searchInput = document.getElementById('searchInput');
      const lineFilter = document.getElementById('lineFilter');
      const cards = Array.from(document.querySelectorAll('.product-card'));
      const resultsCounter = document.getElementById('resultsCounter');

      function normalizeValue(value) {
        return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      }

      function updateProducts() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedLine = normalizeValue(lineFilter.value);
        let visibleCount = 0;

        cards.forEach((card) => {
          const name = card.dataset.name.toLowerCase();
          const line = normalizeValue(card.dataset.line);
          const description = card.dataset.description.toLowerCase();
          const matchesQuery = name.includes(query) || description.includes(query);
          const matchesLine = selectedLine === 'todas' || line === selectedLine;
          const isVisible = matchesQuery && matchesLine;

          card.style.display = isVisible ? 'flex' : 'none';
          if (isVisible) visibleCount += 1;
        });

        resultsCounter.textContent = `Mostrando ${visibleCount} productos`;
      }

      const params = new URLSearchParams(window.location.search);
      const selectedLineFromUrl = params.get('line');

      if (selectedLineFromUrl) {
        const normalizedLineParam = normalizeValue(selectedLineFromUrl);
        const matchingOption = Array.from(lineFilter.options).find((option) => {
          return normalizeValue(option.value) === normalizedLineParam;
        });

        if (matchingOption) {
          lineFilter.value = matchingOption.value;
        }
      }

      searchInput.addEventListener('input', updateProducts);
      lineFilter.addEventListener('change', updateProducts);
      updateProducts();

      const cartCount = document.getElementById('count-carrito');
      const cartItemsContainer = document.getElementById('cartItems');
      const cartTotal = document.getElementById('cartTotal');
      const cartPopup = document.getElementById('cartPopup');
      const cartBackdrop = document.getElementById('cartBackdrop');
      const cartIcon = document.querySelector('.contenedor__carrito');
      const closeCart = document.getElementById('closeCart');
      const cartWhatsapp = document.getElementById('cartWhatsapp');

      const cart = [];

      function parsePrice(priceText) {
        const cleanText = priceText.replace(/[^\d.,]/g, '');
        if (!cleanText) return 0;
        if (cleanText.includes(',') && cleanText.includes('.')) {
          return parseFloat(cleanText.replace(/\./g, '').replace(',', '.')) || 0;
        }
        if (cleanText.includes(',') && !cleanText.includes('.')) {
          return parseFloat(cleanText.replace(',', '.')) || 0;
        }
        return parseFloat(cleanText.replace(/\./g, '')) || 0;
      }

      function formatPrice(amount) {
        return '$' + amount.toLocaleString('es-AR', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
      }

      function calculateCartSummary() {
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        cartCount.textContent = totalQuantity;
        cartTotal.textContent = formatPrice(totalPrice);
        return { totalQuantity, totalPrice };
      }

      function updateWhatsappLink() {
        const { totalPrice } = calculateCartSummary();
        const productsList = cart.map((item) => `${item.name} (${item.quantity}x)`).join(', ');
        const messageText = cart.length > 0
          ? `Hola! Quiero consultar por un pedido de RubiCielo.\nPresupuesto: ${formatPrice(totalPrice)}.\nProductos: ${productsList}.`
          : 'Hola! Quiero consultar por un pedido de RubiCielo.';

        cartWhatsapp.href = `https://wa.me/549498400377?text=${encodeURIComponent(messageText)}`;
      }

      function renderCartItems() {
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

        calculateCartSummary();
        renderCartItems();
      }

      function removeFromCart(productName) {
        const itemIndex = cart.findIndex((item) => item.name === productName);
        if (itemIndex === -1) return;
        cart.splice(itemIndex, 1);
        calculateCartSummary();
        renderCartItems();
      }

      function openCart() {
        cartPopup.classList.add('open');
        cartPopup.setAttribute('aria-hidden', 'false');
      }

      function closeCartPopup() {
        cartPopup.classList.remove('open');
        cartPopup.setAttribute('aria-hidden', 'true');
      }

      cartIcon.addEventListener('click', (event) => {
        event.preventDefault();
        if (cartPopup.classList.contains('open')) {
          closeCartPopup();
        } else {
          openCart();
        }
      });

      cartBackdrop.addEventListener('click', closeCartPopup);
      closeCart.addEventListener('click', closeCartPopup);

      cartItemsContainer.addEventListener('click', (event) => {
        const removeButton = event.target.closest('.cart-item__remove');
        if (!removeButton) return;
        const productName = removeButton.dataset.remove;
        removeFromCart(productName);
      });

      document.querySelectorAll('.btn-add-carrito').forEach((button) => {
        button.addEventListener('click', (event) => {
          const card = event.target.closest('.product-card');
          if (!card) return;
          const name = card.dataset.name;
          const priceText = card.querySelector('.product-card__meta span').textContent;
          const price = parsePrice(priceText);
          addToCart({ name, price });
        });
      });

      renderCartItems();
      updateWhatsappLink();
