/*
  NovaCart Frontend Store
  - Handles product rendering
  - Cart management with localStorage
  - Login/signup with localStorage
  - Page-specific behavior
*/

const PRODUCTS = [
  { id: 1, name: "Men's Urban Jacket", category: "Men", price: 89, rating: 4.6, image: "https://images.unsplash.com/photo-1593032465171-8bd6f71f5076?auto=format&fit=crop&w=900&q=80", description: "Lightweight premium jacket for everyday comfort and style." },
  { id: 2, name: "Women's Classic Handbag", category: "Women", price: 74, rating: 4.7, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80", description: "Elegant handbag with spacious compartments and durable finish." },
  { id: 3, name: "Wireless Headphones", category: "Electronics", price: 129, rating: 4.5, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80", description: "Noise-cancelling headphones with rich audio and long battery life." },
  { id: 4, name: "Smart Watch Pro", category: "Electronics", price: 159, rating: 4.4, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80", description: "Track your fitness, calls, and notifications on the go." },
  { id: 5, name: "Men's Sneakers", category: "Men", price: 65, rating: 4.3, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80", description: "Comfortable sneakers with modern silhouette and strong grip." },
  { id: 6, name: "Women's Summer Dress", category: "Women", price: 52, rating: 4.8, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80", description: "Breathable fabric dress perfect for casual outings." },
  { id: 7, name: "Minimal Table Lamp", category: "Home", price: 34, rating: 4.2, image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80", description: "Soft ambient lighting with premium matte finish." },
  { id: 8, name: "Home Coffee Maker", category: "Home", price: 95, rating: 4.1, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80", description: "Brew café-style coffee in minutes with simple controls." }
];

const storage = {
  getCart() {
    return JSON.parse(localStorage.getItem("novacart_cart") || "[]");
  },
  setCart(cart) {
    localStorage.setItem("novacart_cart", JSON.stringify(cart));
  },
  getUsers() {
    return JSON.parse(localStorage.getItem("novacart_users") || "[]");
  },
  setUsers(users) {
    localStorage.setItem("novacart_users", JSON.stringify(users));
  },
  setCurrentUser(user) {
    localStorage.setItem("novacart_current_user", JSON.stringify(user));
  }
};

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function hideLoader() {
  const loader = document.getElementById("loading-overlay");
  if (loader) {
    setTimeout(() => loader.classList.add("hidden"), 350);
  }
}

function updateCartCount() {
  const countEl = document.getElementById("cart-count");
  if (!countEl) return;
  const totalItems = storage.getCart().reduce((sum, item) => sum + item.qty, 0);
  countEl.textContent = String(totalItems);
}

function addToCart(productId, qty = 1) {
  const cart = storage.getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }
  storage.setCart(cart);
  updateCartCount();
  showToast("Added to Cart");
}

function removeFromCart(productId) {
  const next = storage.getCart().filter(item => item.id !== productId);
  storage.setCart(next);
  renderCartPage();
  renderCheckoutSummary();
  updateCartCount();
  showToast("Item removed");
}

function updateQuantity(productId, qty) {
  if (qty < 1) return;
  const cart = storage.getCart();
  const item = cart.find(entry => entry.id === productId);
  if (!item) return;
  item.qty = qty;
  storage.setCart(cart);
  renderCartPage();
  renderCheckoutSummary();
  updateCartCount();
}

function productCard(product) {
  return `
    <article class="product-card">
      <a href="product.html?id=${product.id}"><img src="${product.image}" alt="${product.name}" /></a>
      <h3>${product.name}</h3>
      <p class="muted">${product.category}</p>
      <div class="product-meta">
        <span class="price">$${product.price.toFixed(2)}</span>
        <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    </article>
  `;
}

function filterProducts({ search = "", category = "All", priceRange = "all" }) {
  const query = search.trim().toLowerCase();
  return PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(query);
    const matchesCategory = category === "All" || product.category === category;
    const [min, max] = priceRange === "all" ? [0, Number.POSITIVE_INFINITY] : priceRange.split("-").map(Number);
    const matchesPrice = product.price >= min && product.price <= max;
    return matchesSearch && matchesCategory && matchesPrice;
  });
}

function renderHomePage() {
  const container = document.getElementById("featured-products");
  if (!container) return;
  container.innerHTML = PRODUCTS.slice(0, 4).map(productCard).join("");

  const globalSearch = document.getElementById("global-search");
  if (globalSearch) {
    globalSearch.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        window.location.href = `products.html?search=${encodeURIComponent(globalSearch.value.trim())}`;
      }
    });
  }
}

function renderProductsPage() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const categoryFilter = document.getElementById("category-filter");
  const priceFilter = document.getElementById("price-filter");
  const searchInput = document.getElementById("product-search");

  const categories = [...new Set(PRODUCTS.map(item => item.category))];
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter?.append(option);
  });

  const params = new URLSearchParams(window.location.search);
  const urlCategory = params.get("category") || "All";
  const urlSearch = params.get("search") || "";
  if (categoryFilter) categoryFilter.value = urlCategory;
  if (searchInput) searchInput.value = urlSearch;

  const draw = () => {
    const products = filterProducts({
      search: searchInput?.value || "",
      category: categoryFilter?.value || "All",
      priceRange: priceFilter?.value || "all"
    });

    grid.innerHTML = products.length
      ? products.map(productCard).join("")
      : '<p class="muted">No products found. Try another filter.</p>';
  };

  [categoryFilter, priceFilter].forEach(control => control?.addEventListener("change", draw));
  searchInput?.addEventListener("input", draw);
  draw();
}

function renderProductDetailsPage() {
  const container = document.getElementById("product-details");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const product = PRODUCTS.find(item => item.id === id);

  if (!product) {
    container.innerHTML = '<p class="muted">Product not found.</p>';
    return;
  }

  container.innerHTML = `
    <img src="${product.image}" alt="${product.name}" />
    <div>
      <p class="muted">${product.category}</p>
      <h1>${product.name}</h1>
      <p class="muted">${product.description}</p>
      <p><strong>Rating:</strong> ⭐ ${product.rating}</p>
      <p class="price">$${product.price.toFixed(2)}</p>

      <div class="qty-control">
        <button id="qty-minus">−</button>
        <span id="qty-value">1</span>
        <button id="qty-plus">+</button>
      </div>
      <br />
      <button id="add-details-cart" class="btn btn-primary">Add to Cart</button>
    </div>
  `;

  let qty = 1;
  const qtyValue = document.getElementById("qty-value");
  document.getElementById("qty-minus")?.addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    if (qtyValue) qtyValue.textContent = String(qty);
  });
  document.getElementById("qty-plus")?.addEventListener("click", () => {
    qty += 1;
    if (qtyValue) qtyValue.textContent = String(qty);
  });
  document.getElementById("add-details-cart")?.addEventListener("click", () => addToCart(product.id, qty));
}

function cartLineItem(item) {
  const product = PRODUCTS.find(p => p.id === item.id);
  if (!product) return "";
  return `
    <article class="cart-item">
      <img src="${product.image}" alt="${product.name}" />
      <div>
        <h3>${product.name}</h3>
        <p class="muted">$${product.price.toFixed(2)} each</p>
        <div class="qty-control">
          <button onclick="updateQuantity(${product.id}, ${item.qty - 1})">−</button>
          <span>${item.qty}</span>
          <button onclick="updateQuantity(${product.id}, ${item.qty + 1})">+</button>
        </div>
      </div>
      <div>
        <p class="price">$${(product.price * item.qty).toFixed(2)}</p>
        <button class="btn btn-ghost" onclick="removeFromCart(${product.id})">Remove</button>
      </div>
    </article>
  `;
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => {
    const product = PRODUCTS.find(p => p.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

function renderCartPage() {
  const list = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!list || !totalEl) return;

  const cart = storage.getCart();
  list.innerHTML = cart.length
    ? cart.map(cartLineItem).join("")
    : '<p class="muted">Your cart is empty. <a href="products.html">Start shopping</a>.</p>';

  totalEl.textContent = cartTotal(cart).toFixed(2);
}

function renderCheckoutSummary() {
  const summary = document.getElementById("checkout-summary");
  const totalEl = document.getElementById("checkout-total");
  if (!summary || !totalEl) return;

  const cart = storage.getCart();
  summary.innerHTML = cart.length
    ? cart.map(item => {
        const product = PRODUCTS.find(p => p.id === item.id);
        if (!product) return "";
        return `
          <article class="summary-item">
            <img src="${product.image}" alt="${product.name}" />
            <div>
              <h4>${product.name}</h4>
              <p class="muted">Qty: ${item.qty}</p>
            </div>
            <p class="price">$${(product.price * item.qty).toFixed(2)}</p>
          </article>
        `;
      }).join("")
    : '<p class="muted">No items in cart.</p>';

  totalEl.textContent = cartTotal(cart).toFixed(2);
}

function handleCheckout() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    const name = document.getElementById("checkout-name")?.value.trim();
    const address = document.getElementById("checkout-address")?.value.trim();
    const phone = document.getElementById("checkout-phone")?.value.trim();
    const payment = document.getElementById("checkout-payment")?.value;

    if (!name || !address || !phone || !payment) {
      showToast("Please complete all checkout fields.");
      return;
    }

    showToast("Order placed successfully!");
    storage.setCart([]);
    updateCartCount();
    form.reset();
    renderCheckoutSummary();
  });
}

function handleAuth() {
  const signup = document.getElementById("signup-form");
  const login = document.getElementById("login-form");

  signup?.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("signup-name")?.value.trim();
    const email = document.getElementById("signup-email")?.value.trim().toLowerCase();
    const password = document.getElementById("signup-password")?.value;

    if (!name || !email || !password || password.length < 6) {
      showToast("Please fill valid signup details.");
      return;
    }

    const users = storage.getUsers();
    if (users.some(user => user.email === email)) {
      showToast("Email already registered.");
      return;
    }

    users.push({ name, email, password });
    storage.setUsers(users);
    showToast("Signup successful. You can now login.");
    signup.reset();
  });

  login?.addEventListener("submit", event => {
    event.preventDefault();

    const email = document.getElementById("login-email")?.value.trim().toLowerCase();
    const password = document.getElementById("login-password")?.value;

    const users = storage.getUsers();
    const user = users.find(entry => entry.email === email && entry.password === password);
    if (!user) {
      showToast("Invalid email or password.");
      return;
    }

    storage.setCurrentUser({ name: user.name, email: user.email });
    showToast(`Welcome back, ${user.name}!`);
    login.reset();
  });
}

function initPage() {
  const page = document.body.dataset.page;
  updateCartCount();

  switch (page) {
    case "home":
      renderHomePage();
      break;
    case "products":
      renderProductsPage();
      break;
    case "product-details":
      renderProductDetailsPage();
      break;
    case "cart":
      renderCartPage();
      break;
    case "checkout":
      renderCheckoutSummary();
      handleCheckout();
      break;
    case "auth":
      handleAuth();
      break;
    default:
      break;
  }

  hideLoader();
}

document.addEventListener("DOMContentLoaded", initPage);
