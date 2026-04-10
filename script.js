/* NovaCart - Shared site logic (light theme pages) */

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
  getCart: () => JSON.parse(localStorage.getItem("novacart_cart") || "[]"),
  setCart: (cart) => localStorage.setItem("novacart_cart", JSON.stringify(cart)),
  getUsers: () => JSON.parse(localStorage.getItem("novacart_users") || "[]"),
  setUsers: (users) => localStorage.setItem("novacart_users", JSON.stringify(users)),
  getCurrentUser: () => JSON.parse(localStorage.getItem("novacart_current_user") || "null"),
  setCurrentUser: (user) => localStorage.setItem("novacart_current_user", JSON.stringify(user)),
  getOrders: () => JSON.parse(localStorage.getItem("novacart_orders") || "[]"),
  setOrders: (orders) => localStorage.setItem("novacart_orders", JSON.stringify(orders)),
  getWishlist: () => JSON.parse(localStorage.getItem("novacart_wishlist") || "[]"),
  setWishlist: (wishlist) => localStorage.setItem("novacart_wishlist", JSON.stringify(wishlist))
};

const $ = (selector) => document.querySelector(selector);

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function toggleMenu() {
  const button = $("#menu-toggle");
  const menu = $("#nav-menu");
  if (!button || !menu) return;
  button.addEventListener("click", () => menu.classList.toggle("open"));
}

function updateCartCount() {
  const countEl = $("#cart-count");
  if (!countEl) return;
  countEl.textContent = storage.getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateAuthLinks() {
  const user = storage.getCurrentUser();
  document.querySelectorAll('a[href="auth.html"]').forEach((link) => {
    if (user) {
      link.href = "dashboard.html";
      link.textContent = "Profile";
    }
  });
}

function addToCart(productId, qty = 1) {
  const cart = storage.getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) existing.qty += qty;
  else cart.push({ id: productId, qty });
  storage.setCart(cart);
  updateCartCount();
  showToast("Added to cart");
}

function addToWishlist(productId) {
  const wishlist = storage.getWishlist();
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    storage.setWishlist(wishlist);
    showToast("Added to wishlist");
  } else {
    showToast("Already in wishlist");
  }
}

function removeFromCart(productId) {
  storage.setCart(storage.getCart().filter(item => item.id !== productId));
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

function cardTemplate(product) {
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
    const matchesCategory = category === "All" || category === product.category;
    const [min, max] = priceRange === "all" ? [0, Number.POSITIVE_INFINITY] : priceRange.split("-").map(Number);
    const matchesPrice = product.price >= min && product.price <= max;
    return matchesSearch && matchesCategory && matchesPrice;
  });
}

function renderHomePage() {
  const featured = $("#featured-products");
  if (featured) featured.innerHTML = PRODUCTS.slice(0, 4).map(cardTemplate).join("");

  const search = $("#global-search");
  search?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") window.location.href = `products.html?search=${encodeURIComponent(search.value.trim())}`;
  });
}

function renderProductsPage() {
  const grid = $("#products-grid");
  if (!grid) return;

  const category = $("#category-filter");
  const price = $("#price-filter");
  const search = $("#product-search");

  [...new Set(PRODUCTS.map(item => item.category))].forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    category?.append(option);
  });

  const params = new URLSearchParams(window.location.search);
  if (category) category.value = params.get("category") || "All";
  if (search) search.value = params.get("search") || "";

  const draw = () => {
    const results = filterProducts({
      search: search?.value || "",
      category: category?.value || "All",
      priceRange: price?.value || "all"
    });

    grid.innerHTML = results.length ? results.map(cardTemplate).join("") : '<p class="muted">No products found for this filter.</p>';
  };

  category?.addEventListener("change", draw);
  price?.addEventListener("change", draw);
  search?.addEventListener("input", draw);
  draw();
}

function renderProductDetailsPage() {
  const container = $("#product-details");
  if (!container) return;

  const id = Number(new URLSearchParams(window.location.search).get("id"));
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
      <div class="detail-actions">
        <button id="add-details-cart" class="btn btn-primary">Add to Cart</button>
        <button id="add-details-wishlist" class="btn btn-success">Add to Wishlist</button>
      </div>
    </div>
  `;

  let qty = 1;
  const qtyValue = $("#qty-value");
  $("#qty-minus")?.addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    if (qtyValue) qtyValue.textContent = String(qty);
  });
  $("#qty-plus")?.addEventListener("click", () => {
    qty += 1;
    if (qtyValue) qtyValue.textContent = String(qty);
  });
  $("#add-details-cart")?.addEventListener("click", () => addToCart(product.id, qty));
  $("#add-details-wishlist")?.addEventListener("click", () => addToWishlist(product.id));
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => {
    const product = PRODUCTS.find(entry => entry.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

function cartItemTemplate(item) {
  const product = PRODUCTS.find(entry => entry.id === item.id);
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
        <button class="btn" onclick="removeFromCart(${product.id})">Remove</button>
      </div>
    </article>
  `;
}

function renderCartPage() {
  const list = $("#cart-items");
  const total = $("#cart-total");
  if (!list || !total) return;

  const cart = storage.getCart();
  list.innerHTML = cart.length ? cart.map(cartItemTemplate).join("") : '<p class="muted">Your cart is empty. <a class="text-link" href="products.html">Start shopping</a>.</p>';
  total.textContent = cartTotal(cart).toFixed(2);
}

function renderCheckoutSummary() {
  const summary = $("#checkout-summary");
  const total = $("#checkout-total");
  if (!summary || !total) return;

  const cart = storage.getCart();
  summary.innerHTML = cart.length
    ? cart.map(item => {
        const product = PRODUCTS.find(entry => entry.id === item.id);
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

  total.textContent = cartTotal(cart).toFixed(2);
}

function handleCheckout() {
  const form = $("#checkout-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("#checkout-name")?.value.trim();
    const address = $("#checkout-address")?.value.trim();
    const phone = $("#checkout-phone")?.value.trim();
    const payment = $("#checkout-payment")?.value;

    if (!name || !address || !phone || !payment) return showToast("Please fill all checkout fields.");

    const cart = storage.getCart();
    if (!cart.length) return showToast("Your cart is empty.");

    const orders = storage.getOrders();
    const orderDate = new Date().toISOString().slice(0, 10);
    cart.forEach((item, index) => {
      const product = PRODUCTS.find(entry => entry.id === item.id);
      if (!product) return;
      orders.push({
        id: `ORD-${Date.now()}-${index + 1}`,
        product: product.name,
        price: (product.price * item.qty).toFixed(2),
        date: orderDate,
        status: Math.random() > 0.4 ? "Delivered" : "Pending"
      });
    });
    storage.setOrders(orders);

    storage.setCart([]);
    updateCartCount();
    renderCheckoutSummary();
    form.reset();
    showToast("Order placed successfully");
  });
}

function renderOrdersPage() {
  const list = $("#orders-list");
  if (!list) return;

  const orders = storage.getOrders();
  if (!orders.length) {
    list.innerHTML = '<tr><td colspan="4" class="muted">No orders yet. Place one from checkout.</td></tr>';
    return;
  }

  list.innerHTML = orders.map(order => `
    <tr>
      <td>${order.product}</td>
      <td>$${order.price}</td>
      <td>${order.date}</td>
      <td><span class="status">${order.status || "Pending"}</span></td>
    </tr>
  `).join("");
}

function handleAuth() {
  const signup = $("#signup-form");
  const login = $("#login-form");

  signup?.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("#signup-name")?.value.trim();
    const email = $("#signup-email")?.value.trim().toLowerCase();
    const password = $("#signup-password")?.value;

    if (!name || !email || !password || password.length < 6) return showToast("Use valid signup details.");

    const users = storage.getUsers();
    if (users.some(user => user.email === email)) return showToast("Email already exists.");

    users.push({ name, email, password, phone: "", address: "" });
    storage.setUsers(users);
    signup.reset();
    showToast("Signup successful");
  });

  login?.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = $("#login-email")?.value.trim().toLowerCase();
    const password = $("#login-password")?.value;

    const user = storage.getUsers().find(entry => entry.email === email && entry.password === password);
    if (!user) return showToast("Invalid login credentials");

    storage.setCurrentUser({ name: user.name, email: user.email, phone: user.phone || "", address: user.address || "" });
    login.reset();
    showToast(`Welcome back, ${user.name}`);
    setTimeout(() => { window.location.href = "dashboard.html"; }, 500);
  });
}

function handleContactForm() {
  const form = $("#contact-form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    form.reset();
    showToast("Thanks! We will contact you soon.");
  });
}

function bindGlobalSearch() {
  const search = $("#global-search");
  search?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") window.location.href = `products.html?search=${encodeURIComponent(search.value.trim())}`;
  });
}

function initPage() {
  toggleMenu();
  updateCartCount();
  updateAuthLinks();
  bindGlobalSearch();

  switch (document.body.dataset.page) {
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
    case "orders":
      renderOrdersPage();
      break;
    case "auth":
      handleAuth();
      break;
    case "contact":
      handleContactForm();
      break;
    default:
      break;
  }
}

document.addEventListener("DOMContentLoaded", initPage);
