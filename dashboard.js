const PRODUCTS = [
  { id: 1, name: "Men's Urban Jacket", price: 89, image: "https://images.unsplash.com/photo-1593032465171-8bd6f71f5076?auto=format&fit=crop&w=900&q=80" },
  { id: 2, name: "Women's Classic Handbag", price: 74, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80" },
  { id: 3, name: "Wireless Headphones", price: 129, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80" },
  { id: 4, name: "Smart Watch Pro", price: 159, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80" },
  { id: 5, name: "Men's Sneakers", price: 65, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80" },
  { id: 6, name: "Women's Summer Dress", price: 52, image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80" },
  { id: 7, name: "Minimal Table Lamp", price: 34, image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80" },
  { id: 8, name: "Home Coffee Maker", price: 95, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80" }
];

const storage = {
  getCurrentUser: () => JSON.parse(localStorage.getItem("novacart_current_user") || "null"),
  setCurrentUser: (user) => localStorage.setItem("novacart_current_user", JSON.stringify(user)),
  getCart: () => JSON.parse(localStorage.getItem("novacart_cart") || "[]"),
  setCart: (cart) => localStorage.setItem("novacart_cart", JSON.stringify(cart)),
  getOrders: () => JSON.parse(localStorage.getItem("novacart_orders") || "[]"),
  getWishlist: () => JSON.parse(localStorage.getItem("novacart_wishlist") || "[]"),
  setWishlist: (wishlist) => localStorage.setItem("novacart_wishlist", JSON.stringify(wishlist))
};

const $ = (s) => document.querySelector(s);

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1800);
}

function ensureAuth() {
  const user = storage.getCurrentUser();
  if (!user) {
    window.location.href = "auth.html";
    return null;
  }
  return user;
}

function productById(id) {
  return PRODUCTS.find(p => p.id === id);
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => {
    const p = productById(item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function switchSection(key) {
  document.querySelectorAll(".section").forEach((section) => section.classList.remove("active"));
  document.querySelectorAll(".side-link[data-section]").forEach((link) => link.classList.remove("active"));
  $(`#section-${key}`)?.classList.add("active");
  document.querySelector(`.side-link[data-section="${key}"]`)?.classList.add("active");
}

function renderHome(user) {
  $("#top-user-name").textContent = user.name;
  $("#welcome-msg").textContent = `Welcome back, ${user.name}!`;
  $("#total-orders").textContent = storage.getOrders().length;
  $("#total-cart-items").textContent = storage.getCart().reduce((sum, item) => sum + item.qty, 0);
  $("#total-wishlist-items").textContent = storage.getWishlist().length;
}

function renderOrders() {
  const tbody = $("#dashboard-orders");
  const orders = storage.getOrders();

  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="5">No orders yet.</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map((order) => {
    const status = (order.status || "Pending").toLowerCase();
    return `
      <tr>
        <td>${order.id || "ORD-NA"}</td>
        <td>${order.product}</td>
        <td>$${order.price}</td>
        <td><span class="status ${status === "delivered" ? "delivered" : "pending"}">${order.status || "Pending"}</span></td>
        <td>${order.date}</td>
      </tr>
    `;
  }).join("");
}

function renderCart() {
  const wrap = $("#dashboard-cart");
  const cart = storage.getCart();

  if (!cart.length) {
    wrap.innerHTML = '<div class="card">Cart is empty.</div>';
    $("#dashboard-cart-total").textContent = "0.00";
    return;
  }

  wrap.innerHTML = cart.map((item) => {
    const p = productById(item.id);
    if (!p) return "";
    return `
      <article class="list-item">
        <img src="${p.image}" alt="${p.name}" />
        <div>
          <h4>${p.name}</h4>
          <p>$${p.price.toFixed(2)} each</p>
          <div class="qty-wrap">
            <button onclick="updateCartQty(${p.id}, ${item.qty - 1})">−</button>
            <span>${item.qty}</span>
            <button onclick="updateCartQty(${p.id}, ${item.qty + 1})">+</button>
          </div>
        </div>
        <div>
          <p>$${(p.price * item.qty).toFixed(2)}</p>
          <button class="btn btn-danger" onclick="removeFromCart(${p.id})">Remove</button>
        </div>
      </article>
    `;
  }).join("");

  $("#dashboard-cart-total").textContent = cartTotal(cart).toFixed(2);
}

function renderWishlist() {
  const wrap = $("#dashboard-wishlist");
  const wishlist = storage.getWishlist();

  if (!wishlist.length) {
    wrap.innerHTML = '<div class="card">Wishlist is empty.</div>';
    return;
  }

  wrap.innerHTML = wishlist.map((id) => {
    const p = productById(id);
    if (!p) return "";
    return `
      <article class="list-item">
        <img src="${p.image}" alt="${p.name}" />
        <div>
          <h4>${p.name}</h4>
          <p>$${p.price.toFixed(2)}</p>
        </div>
        <div>
          <button class="btn btn-success" onclick="moveWishlistToCart(${p.id})">Move to Cart</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderProfile(user) {
  $("#profile-name").value = user.name || "";
  $("#profile-email").value = user.email || "";
  $("#profile-phone").value = user.phone || "";
  $("#profile-address").value = user.address || "";
}

function updateCartQty(productId, qty) {
  if (qty < 1) return;
  const cart = storage.getCart();
  const item = cart.find(entry => entry.id === productId);
  if (!item) return;
  item.qty = qty;
  storage.setCart(cart);
  renderCart();
  renderHome(storage.getCurrentUser());
}

function removeFromCart(productId) {
  storage.setCart(storage.getCart().filter(item => item.id !== productId));
  renderCart();
  renderHome(storage.getCurrentUser());
  toast("Item removed");
}

function moveWishlistToCart(productId) {
  const wishlist = storage.getWishlist().filter(id => id !== productId);
  storage.setWishlist(wishlist);

  const cart = storage.getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: productId, qty: 1 });
  storage.setCart(cart);

  renderWishlist();
  renderCart();
  renderHome(storage.getCurrentUser());
  toast("Moved to cart");
}

function bindSidebar() {
  document.querySelectorAll(".side-link[data-section]").forEach((button) => {
    button.addEventListener("click", () => switchSection(button.dataset.section));
  });

  $("#sidebar-toggle")?.addEventListener("click", () => {
    $("#sidebar")?.classList.toggle("open");
  });
}

function bindProfileForm() {
  const form = $("#profile-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const updated = {
      name: $("#profile-name").value.trim(),
      email: $("#profile-email").value.trim(),
      phone: $("#profile-phone").value.trim(),
      address: $("#profile-address").value.trim()
    };

    if (!updated.name || !updated.email) return toast("Name and email are required");

    storage.setCurrentUser(updated);

    const users = JSON.parse(localStorage.getItem("novacart_users") || "[]");
    const idx = users.findIndex(user => user.email === updated.email);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updated };
      localStorage.setItem("novacart_users", JSON.stringify(users));
    }

    renderHome(updated);
    toast("Profile updated");
  });
}

function bindLogout() {
  $("#logout-btn")?.addEventListener("click", () => {
    localStorage.removeItem("novacart_current_user");
    window.location.href = "auth.html";
  });
}

function init() {
  const user = ensureAuth();
  if (!user) return;

  bindSidebar();
  bindProfileForm();
  bindLogout();

  renderHome(user);
  renderOrders();
  renderCart();
  renderWishlist();
  renderProfile(user);
}

document.addEventListener("DOMContentLoaded", init);
