/* =========================================================
   Morrow Coffee Co. — main.js
   Cart · menu filters · forms · FAQ · mobile nav · toasts
   ========================================================= */

const CART_KEY = "morrow-cart";

/* ---------- Cart state ---------- */
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let cart = loadCart();

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    /* storage unavailable — cart stays in-memory */
  }
}

function cartCount() {
  return cart.reduce((n, item) => n + item.qty, 0);
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function money(n) {
  return `$${n.toFixed(2)}`;
}

function renderCart() {
  const count = cartCount();
  const total = cartTotal();

  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = String(count);
    el.style.display = count > 0 ? "" : "none";
  });

  document.querySelectorAll("#cartItems").forEach((box) => {
    if (!cart.length) {
      box.innerHTML =
        '<p class="cart-empty">Your basket is empty — add something good from the menu.</p>';
      return;
    }
    box.innerHTML = cart
      .map(
        (item, idx) => `
      <div class="cart-line">
        <div>
          <b>${escapeHtml(item.name)}</b>
          <span>× ${item.qty}</span>
        </div>
        <div class="cart-line-right">
          <span>${money(item.price * item.qty)}</span>
          <button class="cart-remove" data-remove-index="${idx}" aria-label="Remove ${escapeHtml(
          item.name
        )}" title="Remove">×</button>
        </div>
      </div>`
      )
      .join("");
  });

  document.querySelectorAll("#cartTotal").forEach((el) => {
    el.textContent = money(total);
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function addToCart(name, price) {
  const existing = cart.find((i) => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price: Number(price), qty: 1 });
  }
  saveCart();
  renderCart();
  showToast(`Added ${name} ✓`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

/* ---------- Toast ---------- */
let toastTimer;

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

/* ---------- Mobile nav ---------- */
function initMobileNav() {
  const toggle = document.getElementById("menuToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "✕" : "☰";
  });

  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    })
  );
}

/* ---------- Menu filters + search ---------- */
function initMenuFilters() {
  const filters = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll("[data-menu-category]");
  const search = document.getElementById("menuSearch");
  const results = document.getElementById("menuResults");
  if (!cards.length) return;

  let activeFilter = "all";

  function apply() {
    const q = (search?.value || "").trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const category = card.dataset.menuCategory;
      const text = (card.textContent || "").toLowerCase();
      const matchesFilter = activeFilter === "all" || category === activeFilter;
      const matchesSearch = !q || text.includes(q);
      const show = matchesFilter && matchesSearch;
      card.style.display = show ? "" : "none";
      if (show) visible += 1;
    });

    if (results) {
      results.textContent = `${visible} item${visible === 1 ? "" : "s"}`;
    }
  }

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter || "all";
      apply();
    });
  });

  if (search) search.addEventListener("input", apply);
  apply();
}

/* ---------- Forms ---------- */
function initForms() {
  const messages = {
    chefForm: "Request sent — our kitchen team will reply within one business day.",
    orderForm: "Order request received — we’ll confirm timing shortly by phone.",
    enquiryForm: "Enquiry sent — a human will get back to you soon.",
  };

  Object.entries(messages).forEach(([id, success]) => {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = form.querySelector(".form-status");
      if (status) status.textContent = success;
      showToast(success);
      if (id === "orderForm") {
        cart = [];
        saveCart();
        renderCart();
      }
      form.reset();
    });
  });

  const newsletter = document.querySelector(".newsletter-form");
  if (newsletter) {
    newsletter.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("You’re on the list — see you in your inbox ✦");
      newsletter.reset();
    });
  }
}

/* ---------- FAQ accordion ---------- */
function initFaq() {
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const wasOpen = item.classList.contains("open");
      document
        .querySelectorAll(".faq-item.open")
        .forEach((open) => open.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });
}

/* ---------- Checkout button (menu page) ---------- */
function initCheckout() {
  const btn = document.getElementById("checkoutButton");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!cart.length) {
      showToast("Your basket is empty — add something first ☕");
      return;
    }
    window.location.href = "order.html";
  });
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const targets = document.querySelectorAll(
    ".menu-card, .quote, .service-card, .story-image, .chef-feature, .chef-side, .gallery figure, .cta-card"
  );
  targets.forEach((el) => el.classList.add("reveal"));

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => io.observe(el));
}

/* ---------- Global click delegation ---------- */
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add-to-cart]");
  if (add) {
    addToCart(add.dataset.name, add.dataset.price);
    return;
  }

  const remove = e.target.closest("[data-remove-index]");
  if (remove) {
    removeFromCart(Number(remove.dataset.removeIndex));
  }
});

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  initMobileNav();
  initMenuFilters();
  initForms();
  initFaq();
  initCheckout();
  initReveal();
});
