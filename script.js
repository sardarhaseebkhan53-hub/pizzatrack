/* ==========================================================
   PIZZATRACK PRO — script.js
   Cleaned up + Add to Cart, Wishlist, Login/Signup and
   Day/Night theme toggle added.
========================================================== */

document.addEventListener("DOMContentLoaded", function () {

/* ==========================================================
   LIVE CLOCK TOP BAR
========================================================== */

(function () {
    // ── Inject styles ──────────────────────────────────────
    const style = document.createElement("style");
    style.innerHTML = `
        #pizzaTopBar {
            width: 100%;
            background: #1a1a1a;
            color: #f5f5f5;
            font-family: 'Poppins', sans-serif;
            font-size: 13px;
            padding: 8px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 8px;
            z-index: 99999;
            box-sizing: border-box;
            border-bottom: 2px solid #e63946;
        }
        #pizzaTopBar .topbar-left {
            display: flex;
            align-items: center;
            gap: 18px;
        }
        #pizzaTopBar .topbar-center {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
            font-size: 13px;
            color: #fff;
            background: #e63946;
            padding: 4px 14px;
            border-radius: 20px;
            letter-spacing: 0.3px;
        }
        #pizzaTopBar .topbar-center .deal-label {
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #ffe;
            opacity: 0.85;
        }
        #pizzaTopBar .countdown-blocks {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        #pizzaTopBar .cd-block {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: rgba(0,0,0,0.25);
            border-radius: 6px;
            padding: 2px 7px;
            min-width: 34px;
        }
        #pizzaTopBar .cd-block .cd-num {
            font-size: 15px;
            font-weight: 800;
            line-height: 1.2;
            color: #fff;
        }
        #pizzaTopBar .cd-block .cd-label {
            font-size: 9px;
            text-transform: uppercase;
            color: #ffd;
            opacity: 0.8;
            letter-spacing: 0.5px;
        }
        #pizzaTopBar .cd-colon {
            font-size: 15px;
            font-weight: 800;
            color: #fff;
            margin-bottom: 8px;
        }
        #pizzaTopBar .topbar-right {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            font-size: 14px;
            color: #e63946;
        }
        #pizzaTopBar .topbar-right .clock-icon {
            font-size: 15px;
        }
        #pizzaTopBar a {
            color: #ccc;
            text-decoration: none;
            transition: color .2s;
        }
        #pizzaTopBar a:hover { color: #e63946; }
        #pizzaTopBar .topbar-divider {
            color: #444;
        }
        #pizzaTopBar .deal-expired {
            font-size: 12px;
            font-weight: 700;
            color: #fff;
            letter-spacing: 1px;
        }
        @keyframes dealPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        #pizzaTopBar .topbar-center.expiring-soon {
            animation: dealPulse 1s infinite;
            background: #c62828;
        }
        @media (max-width: 768px) {
            #pizzaTopBar .topbar-left { display: none; }
            #pizzaTopBar { justify-content: space-between; }
        }
        @media (max-width: 480px) {
            #pizzaTopBar { justify-content: center; flex-direction: column; text-align: center; }
            #pizzaTopBar .topbar-right { justify-content: center; }
        }
    `;
    document.head.appendChild(style);

    // ── Build the bar ──────────────────────────────────────
    const bar = document.createElement("div");
    bar.id = "pizzaTopBar";
    bar.innerHTML = `
        <div class="topbar-left">
            <span>🍕 Free delivery on orders over $25</span>
            <span class="topbar-divider">|</span>
            <a href="tel:+1234567890">📞 (123) 456-7890</a>
        </div>
        <div class="topbar-center" id="dealCountdownBox">
            <span class="deal-label">🔥 Deal Ends In</span>
            <div class="countdown-blocks">
                <div class="cd-block"><span class="cd-num" id="cdHours">00</span><span class="cd-label">hrs</span></div>
                <span class="cd-colon">:</span>
                <div class="cd-block"><span class="cd-num" id="cdMins">00</span><span class="cd-label">min</span></div>
                <span class="cd-colon">:</span>
                <div class="cd-block"><span class="cd-num" id="cdSecs">00</span><span class="cd-label">sec</span></div>
            </div>
        </div>
        <div class="topbar-right">
            <span class="clock-icon">🕐</span>
            <span id="liveClock">--:--:-- --</span>
        </div>
    `;

    // Insert before anything else in the body
    document.body.insertBefore(bar, document.body.firstChild);

    // ── Deal Countdown ─────────────────────────────────────
    // Set your deal end date/time here (YYYY, MM-1, DD, HH, MM, SS)
    // Example below: deal ends at midnight tonight
    const dealDeadline = (function () {
        const d = new Date();
        d.setHours(23, 59, 59, 0); // ends at end of today — change as needed
        return d;
    })();

    function updateCountdown() {
        const now = new Date();
        const diff = dealDeadline - now;
        const box = document.getElementById("dealCountdownBox");

        if (diff <= 0) {
            if (box) box.innerHTML = `<span class="deal-expired">🎉 Deal Expired!</span>`;
            return;
        }

        const hours   = Math.floor(diff / 1000 / 60 / 60);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        const pad = n => String(n).padStart(2, "0");

        const elH = document.getElementById("cdHours");
        const elM = document.getElementById("cdMins");
        const elS = document.getElementById("cdSecs");

        if (elH) elH.textContent = pad(hours);
        if (elM) elM.textContent = pad(minutes);
        if (elS) elS.textContent = pad(seconds);

        // Pulse red when under 30 minutes remaining
        if (box) box.classList.toggle("expiring-soon", diff < 30 * 60 * 1000);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ── Live Clock ─────────────────────────────────────────
    function updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });
        const clockEl = document.getElementById("liveClock");
        if (clockEl) clockEl.textContent = time;
    }

    updateClock();
    setInterval(updateClock, 1000);
})();

/* ==========================================================
   AOS INIT
========================================================== */

if (window.AOS) {
    AOS.init({
        duration: 1000,
        once: true,
        easing: "ease-in-out"
    });
}

/* ==========================================================
   TOAST NOTIFICATIONS
========================================================== */

let toastContainer = document.getElementById("toastContainer");

if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.style.cssText =
        "position:fixed;top:25px;right:25px;z-index:999999;display:flex;flex-direction:column;gap:15px;";
    document.body.appendChild(toastContainer);
}

if (!document.getElementById("toastAnim")) {
    const toastAnimStyle = document.createElement("style");
    toastAnimStyle.id = "toastAnim";
    toastAnimStyle.innerHTML = `
        @keyframes toastSlide{ from{opacity:0;transform:translateX(80px);} to{opacity:1;transform:translateX(0);} }
        @keyframes ripple{ to{ transform:scale(4); opacity:0; } }
    `;
    document.head.appendChild(toastAnimStyle);
}

window.showToast = function (message, type = "success") {

    const colors = {
        success: ["#16a34a", "✅"],
        error: ["#dc2626", "❌"],
        warning: ["#f59e0b", "⚠️"],
        info: ["#2563eb", "ℹ️"]
    };

    const [color, icon] = colors[type] || colors.success;

    const toast = document.createElement("div");

    toast.innerHTML = `
        <div style="min-width:300px;max-width:420px;background:#1b1b1b;color:white;
            border-left:6px solid ${color};border-radius:14px;padding:18px 22px;
            box-shadow:0 20px 45px rgba(0,0,0,.35);font-family:Poppins,sans-serif;
            display:flex;align-items:center;gap:15px;animation:toastSlide .45s ease;">
            <div style="font-size:24px;">${icon}</div>
            <div style="flex:1;">
                <strong style="display:block;margin-bottom:4px;">PizzaTrack</strong>
                <span>${message}</span>
            </div>
        </div>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(80px)";
        toast.style.transition = ".4s";
        setTimeout(() => toast.remove(), 400);
    }, 3000);
};

/* ==========================================================
   LOADER
========================================================== */

window.addEventListener("load", () => {
    const loader = document.querySelector(".loader-overlay");
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
        }, 700);
    }
});

/* ==========================================================
   COOKIE BANNER
========================================================== */

(function () {
    const banner = document.getElementById("cookieBanner");
    if (!banner) return;

    if (localStorage.getItem("pizzaCookieChoice")) {
        banner.style.display = "none";
        return;
    }

    document.getElementById("acceptCookies")?.addEventListener("click", () => {
        localStorage.setItem("pizzaCookieChoice", "accepted");
        banner.style.display = "none";
    });

    document.getElementById("rejectCookies")?.addEventListener("click", () => {
        localStorage.setItem("pizzaCookieChoice", "rejected");
        banner.style.display = "none";
    });
})();

/* ==========================================================
   STICKY NAVBAR
========================================================== */

const navbar = document.querySelector(".navbar");

if (navbar) {
    window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 80);
    });
}

/* ==========================================================
   MOBILE MENU
========================================================== */

const menuBtn = document.querySelector(".mobile-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("active");
        menuBtn.classList.toggle("active");
    });

    document.querySelectorAll(".mobile-menu a").forEach(link => {
        link.addEventListener("click", () => {
            mobileMenu.classList.remove("active");
            menuBtn.classList.remove("active");
        });
    });

    // Mobile filter links — tap a category in the mobile menu to filter the menu section
    document.querySelectorAll(".mobile-filter-link").forEach(link => {
        link.addEventListener("click", function() {
            const filter = this.dataset.filter;
            if (!filter) return;
            // Activate the matching menu tab
            const targetTab = document.querySelector(`.menu-tabs button[data-filter="${filter}"]`);
            if (targetTab) {
                targetTab.click();
            }
        });
    });
}

/* ==========================================================
   SMOOTH SCROLL
========================================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId.length < 2) return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
});

/* ==========================================================
   ACTIVE NAV LINK ON SCROLL
========================================================== */

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 150) {
            current = section.getAttribute("id");
        }
    });
    navLinks.forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
});

/* ==========================================================
   BACK TO TOP
========================================================== */

const backToTop = document.getElementById("backToTop");

if (backToTop) {
    window.addEventListener("scroll", () => {
        backToTop.classList.toggle("show", window.scrollY > 500);
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* ==========================================================
   FAQ ACCORDION
========================================================== */

document.querySelectorAll(".faq-item").forEach(item => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    question.addEventListener("click", () => {
        const opened = answer.style.display === "block";

        document.querySelectorAll(".faq-answer").forEach(a => a.style.display = "none");
        document.querySelectorAll(".faq-question i").forEach(icon => icon.className = "fa-solid fa-plus");

        if (!opened) {
            answer.style.display = "block";
            question.querySelector("i").className = "fa-solid fa-minus";
        }
    });
});

/* ==========================================================
   MENU TABS — CATEGORY FILTER
========================================================== */

const tabs = document.querySelectorAll(".menu-tabs button");
const filterCards = document.querySelectorAll(".menu-card");

tabs.forEach(btn => {
    btn.addEventListener("click", () => {
        tabs.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter || "all";

        filterCards.forEach(card => {
            const matches = filter === "all" || card.dataset.category === filter;
            card.style.display = matches ? "" : "none";
        });

        // clear any active live-search text so filtering isn't hidden by it
        if (searchInput) searchInput.value = "";
    });
});

/* ==========================================================
   HERO SLIDER
========================================================== */

const slides = document.querySelectorAll(".hero-slide");
const dots = document.querySelectorAll(".hero-dot");
let currentSlide = 0;
let heroInterval;

function showSlide(index) {
    slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

if (slides.length) {
    showSlide(0);
    heroInterval = setInterval(nextSlide, 5000);
}

dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        currentSlide = index;
        showSlide(index);
        clearInterval(heroInterval);
        heroInterval = setInterval(nextSlide, 5000);
    });
});

document.querySelector(".prev-slide")?.addEventListener("click", () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
});

document.querySelector(".next-slide")?.addEventListener("click", nextSlide);

/* ==========================================================
   SEARCH OVERLAY + LIVE SEARCH
========================================================== */

const searchOverlay = document.getElementById("searchOverlay");
const searchOpen = document.getElementById("searchBtn");
const searchInput = document.getElementById("overlaySearchInput");
const searchSubmitBtn = document.getElementById("overlaySearchBtn");
const menuCards = document.querySelectorAll(".menu-card");

searchOpen?.addEventListener("click", () => {
    searchOverlay.classList.add("active");
    setTimeout(() => searchInput?.focus(), 200);
});

searchOverlay?.addEventListener("click", (e) => {
    if (e.target === searchOverlay) searchOverlay.classList.remove("active");
});

// Live-filter the menu grid as the person types (no need to press anything)
function filterMenuCards(value) {
    const query = value.toLowerCase().trim();
    let visibleCount = 0;

    menuCards.forEach(card => {
        const title = card.querySelector(".menu-title")?.innerText.toLowerCase() || "";
        const desc = card.querySelector(".menu-description")?.innerText.toLowerCase() || "";
        const matches = !query || title.includes(query) || desc.includes(query);
        card.style.display = matches ? "" : "none";
        if (matches) visibleCount++;
    });

    return visibleCount;
}

// Runs the search, jumps to the menu section so results are visible, and closes the overlay
function runSearch() {
    const value = searchInput?.value || "";
    const matchCount = filterMenuCards(value);

    if (value.trim()) {
        // reset any active category tab since we're now showing search results
        document.querySelectorAll(".menu-tabs button").forEach(b => b.classList.remove("active"));
        document.querySelector('.menu-tabs button[data-filter="all"]')?.classList.add("active");

        searchOverlay?.classList.remove("active");

        const menuSection = document.getElementById("menu");
        if (menuSection) {
            setTimeout(() => menuSection.scrollIntoView({ behavior: "smooth" }), 150);
        }

        showToast(matchCount ? `Found ${matchCount} item${matchCount === 1 ? "" : "s"} for "${value.trim()}"` : `No results for "${value.trim()}"`, matchCount ? "success" : "warning");
    }
}

searchInput?.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
        runSearch();
        return;
    }
    filterMenuCards(this.value);
});

// This is the button inside the search overlay — previously had no click handler at all
searchSubmitBtn?.addEventListener("click", runSearch);

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchOverlay?.classList.add("active");
        setTimeout(() => searchInput?.focus(), 200);
    }
    if (e.key === "Escape") {
        searchOverlay?.classList.remove("active");
    }
});

/* ==========================================================
   COUNTER ANIMATION
========================================================== */

const counters = document.querySelectorAll(".counter");

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const counter = entry.target;
        const target = parseInt(counter.innerText);
        let count = 0;
        const speed = Math.max(20, target / 120);

        const update = () => {
            count += speed;
            if (count < target) {
                counter.innerText = Math.floor(count);
                requestAnimationFrame(update);
            } else {
                counter.innerText = target + "+";
            }
        };

        update();
        counterObserver.unobserve(counter);
    });
});

counters.forEach(counter => counterObserver.observe(counter));

/* ==========================================================
   THEME TOGGLE (Day / Night)
========================================================== */

(function () {
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    const icon = toggle.querySelector("i");
    const saved = localStorage.getItem("pizzaTheme") || "dark";

    function applyTheme(theme) {
        if (theme === "light") {
            document.documentElement.setAttribute("data-theme", "light");
            icon.className = "fa-solid fa-sun";
            toggle.classList.remove("night");
        } else {
            document.documentElement.removeAttribute("data-theme");
            icon.className = "fa-solid fa-moon";
            toggle.classList.add("night");
        }
    }

    applyTheme(saved);

    toggle.addEventListener("click", () => {
        const isLight = document.documentElement.getAttribute("data-theme") === "light";
        const next = isLight ? "dark" : "light";
        applyTheme(next);
        localStorage.setItem("pizzaTheme", next);
        showToast(next === "light" ? "Day mode on ☀️" : "Night mode on 🌙", "info");
    });

    document.getElementById("mobileThemeBtn")?.addEventListener("click", () => {
        document.getElementById("mobileMenu")?.classList.remove("active");
        document.getElementById("mobileToggle")?.classList.remove("active");
        toggle.click();
    });
})();

/* ==========================================================
   LOGIN / SIGN UP
========================================================== */

(function () {
    const authOverlay = document.getElementById("authOverlay");
    const authModal = document.getElementById("authModal");
    const authClose = document.getElementById("authClose");
    const loginBtn = document.getElementById("loginBtn");
    const userChip = document.getElementById("userChip");
    const userChipName = document.getElementById("userChipName");
    const logoutBtn = document.getElementById("logoutBtn");

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const authTabs = document.querySelectorAll(".auth-tab");

    if (!authModal) return;

    function openAuth() {
        authOverlay.classList.add("active");
        authModal.classList.add("active");
    }

    function closeAuth() {
        authOverlay.classList.remove("active");
        authModal.classList.remove("active");
    }

    function switchTab(tab) {
        authTabs.forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
        loginForm.classList.toggle("active", tab === "login");
        signupForm.classList.toggle("active", tab === "signup");
    }

    function getUsers() {
        return JSON.parse(localStorage.getItem("pizzaUsers") || "[]");
    }

    function saveUsers(users) {
        localStorage.setItem("pizzaUsers", JSON.stringify(users));
    }

    function setCurrentUser(user) {
        if (user) {
            localStorage.setItem("pizzaCurrentUser", JSON.stringify(user));
        } else {
            localStorage.removeItem("pizzaCurrentUser");
        }
        renderAuthState();
    }

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem("pizzaCurrentUser"));
        } catch (e) {
            return null;
        }
    }

    function renderAuthState() {
        const user = getCurrentUser();
        if (user) {
            loginBtn.style.display = "none";
            userChip.classList.add("show");
            userChipName.textContent = user.name;
        } else {
            loginBtn.style.display = "";
            userChip.classList.remove("show");
        }
    }

    loginBtn?.addEventListener("click", () => {
        switchTab("login");
        openAuth();
    });

    authClose?.addEventListener("click", closeAuth);

    authOverlay?.addEventListener("click", closeAuth);

    authTabs.forEach(tab => {
        tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    });

    document.querySelectorAll(".auth-switch").forEach(link => {
        link.addEventListener("click", () => switchTab(link.dataset.tab));
    });

    signupForm?.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim().toLowerCase();
        const password = document.getElementById("signupPassword").value;

        if (password.length < 6) {
            showToast("Password must be at least 6 characters", "error");
            return;
        }

        const users = getUsers();

        if (users.some(u => u.email === email)) {
            showToast("An account already exists with this email", "error");
            return;
        }

        users.push({ name, email, password });
        saveUsers(users);
        setCurrentUser({ name, email });

        showToast("Account created — welcome, " + name + "! 🎉");
        signupForm.reset();
        closeAuth();
    });

    loginForm?.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            showToast("Incorrect email or password", "error");
            return;
        }

        setCurrentUser({ name: user.name, email: user.email });
        showToast("Welcome back, " + user.name + "! 👋");
        loginForm.reset();
        closeAuth();
    });

    logoutBtn?.addEventListener("click", () => {
        setCurrentUser(null);
        showToast("Logged out", "info");
    });

    renderAuthState();
})();

/* ==========================================================
   CART SIDEBAR (created once, injected into the page)
========================================================== */

if (!document.getElementById("cartSidebar")) {
    const sidebar = document.createElement("div");
    sidebar.id = "cartSidebar";
    sidebar.innerHTML = `
        <div id="cartOverlay"></div>
        <div id="cartPanel">
            <div class="cart-header">
                <h2>🛒 Shopping Cart</h2>
                <button id="closeCart"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div id="cartItems"><p class="empty-cart">Your cart is empty.</p></div>
            <div class="cart-footer">
                <div class="coupon-row">
                    <input id="couponInput" placeholder="Coupon Code (try PIZZA20)">
                    <button id="applyCoupon">Apply</button>
                </div>
                <div class="cart-total-row">
                    <span>Total</span>
                    <span id="cartTotal">PKR 0</span>
                </div>
                <button id="checkoutBtn" class="btn btn-primary">Checkout</button>
            </div>
        </div>`;
    document.body.appendChild(sidebar);
}

/* ==========================================================
   WISHLIST SIDEBAR (created once, injected into the page)
========================================================== */

if (!document.getElementById("wishlistSidebar")) {
    const wishSidebar = document.createElement("div");
    wishSidebar.id = "wishlistSidebar";
    wishSidebar.innerHTML = `
        <div id="wishlistOverlay"></div>
        <div id="wishlistPanel">
            <div class="cart-header">
                <h2>❤️ Wishlist</h2>
                <button id="closeWishlist"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div id="wishlistItems"><p class="empty-wishlist">Your wishlist is empty.</p></div>
        </div>`;
    document.body.appendChild(wishSidebar);
}

/* ==========================================================
   ADD TO CART + WISHLIST (single source of truth)
========================================================== */

(function () {

    const cartBtn = document.getElementById("cartBtn");
    const wishlistBtn = document.getElementById("wishlistBtn");
    const cartBadge = cartBtn?.querySelector(".nav-badge");
    const wishBadge = wishlistBtn?.querySelector(".nav-badge");

    const cartPanel = document.getElementById("cartPanel");
    const cartOverlay = document.getElementById("cartOverlay");
    const cartItemsEl = document.getElementById("cartItems");
    const cartTotalEl = document.getElementById("cartTotal");
    const closeCartBtn = document.getElementById("closeCart");

    let discount = 0;

    function getKey(card) {
        return card.querySelector(".menu-title")?.innerText.trim() || Math.random().toString(36);
    }

    function readCard(card) {
        const name = card.querySelector(".menu-title")?.innerText.trim() || "Item";
        const priceNode = card.querySelector(".price");
        const priceText = priceNode ? priceNode.childNodes[0].textContent : "PKR 0";
        const price = parseInt(priceText.replace(/[^0-9]/g, ""), 10) || 0;
        const image = card.querySelector("img")?.src || "";
        return { name, price, image };
    }

    /* ---------- CART ---------- */

    function loadCart() {
        try {
            return JSON.parse(localStorage.getItem("pizzaTrackCart")) || [];
        } catch (e) {
            return [];
        }
    }

    let cart = loadCart();

    function saveCart() {
        localStorage.setItem("pizzaTrackCart", JSON.stringify(cart));
    }

    function updateCartBadge() {
        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        if (cartBadge) cartBadge.textContent = count;
    }

    function renderCart() {

        if (!cart.length) {
            cartItemsEl.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
        } else {
            cartItemsEl.innerHTML = cart.map((item, index) => `
                <div class="cart-product">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-product-info">
                        <h4>${item.name}</h4>
                        <div class="cart-price">PKR ${(item.price * item.qty).toLocaleString()}</div>
                        <div class="cart-qty">
                            <button class="qtyMinus" data-index="${index}">-</button>
                            <span>${item.qty}</span>
                            <button class="qtyPlus" data-index="${index}">+</button>
                        </div>
                    </div>
                    <button class="cart-remove" data-index="${index}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `).join("");
        }

        const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const total = Math.max(0, Math.round(subtotal * (1 - discount)));
        cartTotalEl.textContent = "PKR " + total.toLocaleString();

        updateCartBadge();
        saveCart();
    }

    cartItemsEl.addEventListener("click", (e) => {
        const index = e.target.closest("[data-index]")?.dataset.index;
        if (index === undefined) return;
        const i = parseInt(index, 10);

        if (e.target.closest(".qtyPlus")) {
            cart[i].qty++;
        } else if (e.target.closest(".qtyMinus")) {
            cart[i].qty--;
            if (cart[i].qty <= 0) cart.splice(i, 1);
        } else if (e.target.closest(".cart-remove")) {
            cart.splice(i, 1);
            showToast("Item removed from cart", "warning");
        }

        renderCart();
    });

    function addToCart(card) {
        const data = readCard(card);
        const key = getKey(card);
        const existing = cart.find(item => item.key === key);

        if (existing) {
            existing.qty++;
        } else {
            cart.push({ key, ...data, qty: 1 });
        }

        renderCart();
        showToast(data.name + " added to cart 🛒");
    }

    document.querySelectorAll(".add-cart").forEach(btn => {
        btn.addEventListener("click", function () {
            const card = this.closest(".menu-card");
            if (!card) return;

            this.innerHTML = '<i class="fa-solid fa-check"></i> Added';
            setTimeout(() => {
                this.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> Add';
            }, 1200);

            addToCart(card);
        });
    });

    function openCart() {
        cartPanel.classList.add("open");
        cartOverlay.classList.add("show");
        document.getElementById("cartSidebar").classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeCartPanel() {
        cartPanel.classList.remove("open");
        cartOverlay.classList.remove("show");
        document.getElementById("cartSidebar").classList.remove("active");
        document.body.style.overflow = "";
    }

    cartBtn?.addEventListener("click", openCart);
    closeCartBtn?.addEventListener("click", closeCartPanel);
    cartOverlay?.addEventListener("click", closeCartPanel);

    document.getElementById("applyCoupon")?.addEventListener("click", () => {
        const code = document.getElementById("couponInput").value.trim().toUpperCase();

        if (code === "PIZZA20") {
            discount = 0.2;
            showToast("20% discount applied 🎉");
        } else if (code === "FREEDELIVERY") {
            showToast("Free delivery activated 🚚");
        } else {
            discount = 0;
            showToast("Invalid coupon code", "error");
        }

        renderCart();
    });

    /* ---------- CHECKOUT / ORDER ---------- */

    const orderOverlay = document.getElementById("orderOverlay");
    const orderModal = document.getElementById("orderModal");
    const orderClose = document.getElementById("orderClose");
    const orderSummaryEl = document.getElementById("orderSummary");
    const orderForm = document.getElementById("orderForm");
    const placeOrderBtn = document.getElementById("placeOrderBtn");
    const whatsappOrderBtn = document.getElementById("whatsappOrderBtn");

    const WHATSAPP_NUMBER = "923001234567"; // same number used across the site

    function currentTotal() {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        return Math.max(0, Math.round(subtotal * (1 - discount)));
    }

    function renderOrderSummary() {
        const total = currentTotal();
        orderSummaryEl.innerHTML =
            cart.map(item => `
                <div class="order-row">
                    <span>${item.name} × ${item.qty}</span>
                    <span>PKR ${(item.price * item.qty).toLocaleString()}</span>
                </div>
            `).join("") +
            `<div class="order-row order-total">
                <span>Total</span>
                <span>PKR ${total.toLocaleString()}</span>
            </div>`;
    }

    function openOrderModal() {
        renderOrderSummary();
        orderOverlay.classList.add("active");
        orderModal.classList.add("active");
    }

    function closeOrderModal() {
        orderOverlay.classList.remove("active");
        orderModal.classList.remove("active");
    }

    orderClose?.addEventListener("click", closeOrderModal);
    orderOverlay?.addEventListener("click", closeOrderModal);

    document.getElementById("checkoutBtn")?.addEventListener("click", () => {
        if (!cart.length) {
            showToast("Your cart is empty", "warning");
            return;
        }
        openOrderModal();
    });

    function getOrderDetails() {
        const name = document.getElementById("orderName").value.trim();
        const phone = document.getElementById("orderPhone").value.trim();
        const address = document.getElementById("orderAddress").value.trim();

        if (!name || !phone || !address) {
            showToast("Please fill in your name, phone and address", "warning");
            return null;
        }

        return { name, phone, address };
    }

    function buildOrderPayload(details) {
        return {
            customer: details.name,
            phone: details.phone,
            address: details.address,
            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                qty: item.qty,
                subtotal: item.price * item.qty
            })),
            total: currentTotal()
        };
    }

    function completeOrder() {
        cart = [];
        discount = 0;
        renderCart();
        closeOrderModal();
        closeCartPanel();
        orderForm.reset();
    }

    // Place order through the PizzaTrack backend (server.js -> /api/order)
    orderForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const details = getOrderDetails();
        if (!details) return;

        const payload = buildOrderPayload(details);

        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Placing Order...';

        try {
            const response = await fetch("/api/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Server error");

            const data = await response.json();

            showToast("Order placed successfully! Order #" + data.order.id);
            completeOrder();

        } catch (err) {
            showToast("Could not reach the server. Try 'Order via WhatsApp' instead.", "error");
        } finally {
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> Place Order';
        }
    });

    // Order via WhatsApp — sends the same order details as a formatted chat message
    whatsappOrderBtn?.addEventListener("click", () => {
        const details = getOrderDetails();
        if (!details) return;

        const total = currentTotal();

        const lines = [
            "🍕 *New Order — PizzaTrack*",
            "",
            ...cart.map(item => `• ${item.name} × ${item.qty} — PKR ${(item.price * item.qty).toLocaleString()}`),
            "",
            `*Total:* PKR ${total.toLocaleString()}`,
            "",
            `*Name:* ${details.name}`,
            `*Phone:* ${details.phone}`,
            `*Address:* ${details.address}`
        ];

        const message = encodeURIComponent(lines.join("\n"));
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");

        showToast("Redirecting to WhatsApp to confirm your order 🟢");
        completeOrder();
    });

    renderCart();

    /* ---------- WISHLIST ---------- */

    const wishlistPanel = document.getElementById("wishlistPanel");
    const wishlistOverlay = document.getElementById("wishlistOverlay");
    const wishlistItemsEl = document.getElementById("wishlistItems");
    const closeWishlistBtn = document.getElementById("closeWishlist");

    function loadWishlist() {
        try {
            const saved = JSON.parse(localStorage.getItem("pizzaWishlist")) || [];
            // Support the old format (array of plain string keys) so nobody loses
            // items that were saved before this update, then upgrade it in place.
            return saved.map(entry =>
                typeof entry === "string" ? { key: entry, name: entry, price: 0, image: "" } : entry
            );
        } catch (e) {
            return [];
        }
    }

    let wishlist = loadWishlist();

    function saveWishlist() {
        localStorage.setItem("pizzaWishlist", JSON.stringify(wishlist));
    }

    function updateWishBadge() {
        if (wishBadge) wishBadge.textContent = wishlist.length;
    }

    function renderWishlist() {
        if (!wishlist.length) {
            wishlistItemsEl.innerHTML = `<p class="empty-wishlist">Your wishlist is empty.</p>`;
        } else {
            wishlistItemsEl.innerHTML = wishlist.map((item, index) => `
                <div class="wish-product">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="wish-product-info">
                        <h4>${item.name}</h4>
                        <div class="wish-price">PKR ${(item.price || 0).toLocaleString()}</div>
                        <div class="wish-actions">
                            <button class="wish-move" data-index="${index}">
                                <i class="fa-solid fa-cart-plus"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                    <button class="wish-remove" data-index="${index}" aria-label="Remove from wishlist">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `).join("");
        }
        updateWishBadge();
        saveWishlist();
    }

    function openWishlist() {
        wishlistPanel.classList.add("open");
        document.getElementById("wishlistSidebar").classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeWishlistPanel() {
        wishlistPanel.classList.remove("open");
        document.getElementById("wishlistSidebar").classList.remove("active");
        document.body.style.overflow = "";
    }

    wishlistBtn?.addEventListener("click", openWishlist);

    document.getElementById("mobileWishlistBtn")?.addEventListener("click", () => {
        document.getElementById("mobileMenu")?.classList.remove("active");
        document.getElementById("mobileToggle")?.classList.remove("active");
        openWishlist();
    });
    closeWishlistBtn?.addEventListener("click", closeWishlistPanel);
    wishlistOverlay?.addEventListener("click", closeWishlistPanel);

    wishlistItemsEl.addEventListener("click", (e) => {
        const index = e.target.closest("[data-index]")?.dataset.index;
        if (index === undefined) return;
        const i = parseInt(index, 10);
        const item = wishlist[i];
        if (!item) return;

        if (e.target.closest(".wish-move")) {
            const existing = cart.find(c => c.key === item.key);
            if (existing) {
                existing.qty++;
            } else {
                cart.push({ key: item.key, name: item.name, price: item.price, image: item.image, qty: 1 });
            }
            renderCart();
            wishlist.splice(i, 1);

            const heartBtn = document.querySelector(`.wishlist-btn[data-key="${CSS.escape(item.key)}"]`);
            if (heartBtn) {
                heartBtn.classList.remove("active");
                heartBtn.querySelector("i").className = "fa-regular fa-heart";
            }

            renderWishlist();
            showToast(item.name + " moved to cart 🛒");
        } else if (e.target.closest(".wish-remove")) {
            wishlist.splice(i, 1);

            const heartBtn = document.querySelector(`.wishlist-btn[data-key="${CSS.escape(item.key)}"]`);
            if (heartBtn) {
                heartBtn.classList.remove("active");
                heartBtn.querySelector("i").className = "fa-regular fa-heart";
            }

            renderWishlist();
            showToast("Removed from wishlist", "info");
        }
    });

    document.querySelectorAll(".wishlist-btn").forEach(btn => {
        const card = btn.closest(".menu-card");
        const key = getKey(card);
        const icon = btn.querySelector("i");
        btn.dataset.key = key;

        if (wishlist.some(item => item.key === key)) {
            btn.classList.add("active");
            icon.className = "fa-solid fa-heart";
        }

        btn.addEventListener("click", () => {
            const existingIndex = wishlist.findIndex(item => item.key === key);

            if (existingIndex > -1) {
                wishlist.splice(existingIndex, 1);
                btn.classList.remove("active");
                icon.className = "fa-regular fa-heart";
                showToast("Removed from wishlist", "info");
            } else {
                wishlist.push({ key, ...readCard(card) });
                btn.classList.add("active");
                icon.className = "fa-solid fa-heart";
                showToast("Added to wishlist ❤️");
            }
            renderWishlist();
        });
    });

    renderWishlist();

})();

/* ==========================================================
   QUICK VIEW MODAL
========================================================== */

(function () {

    if (!document.getElementById("quickViewModal")) {
        const modal = document.createElement("div");
        modal.id = "quickViewModal";
        modal.innerHTML = `
            <div id="quickViewOverlay"></div>
            <div id="quickViewBox">
                <button id="closeQuickView">&times;</button>
                <img id="quickViewImage" src="" alt="">
                <h2 id="quickViewTitle"></h2>
                <p id="quickViewDesc"></p>
                <h3 id="quickViewPrice"></h3>
                <button id="quickViewCart" class="btn btn-primary">
                    <i class="fa-solid fa-cart-shopping"></i> Add To Cart
                </button>
            </div>`;
        document.body.appendChild(modal);

        const quickStyle = document.createElement("style");
        quickStyle.innerHTML = `
            #quickViewOverlay{position:fixed;inset:0;background:rgba(0,0,0,.75);display:none;z-index:99998;}
            #quickViewBox{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) scale(.8);
                width:min(450px,92%);background:#181818;border-radius:20px;padding:25px;color:white;
                text-align:center;display:none;z-index:99999;transition:.3s;}
            #quickViewBox img{width:100%;border-radius:15px;margin-bottom:20px;height:260px;object-fit:cover;}
            #quickViewBox button{margin-top:20px;padding:15px 25px;border:none;border-radius:10px;
                background:#ff3d00;color:white;cursor:pointer;font-weight:600;}
            #closeQuickView{position:absolute;top:15px;right:18px;background:none!important;font-size:28px;}
        `;
        document.head.appendChild(quickStyle);
    }

    const overlay = document.getElementById("quickViewOverlay");
    const box = document.getElementById("quickViewBox");
    let activeCard = null;

    document.querySelectorAll(".quick-view-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const card = this.closest(".menu-card");
            if (!card) return;

            activeCard = card;

            document.getElementById("quickViewImage").src = card.querySelector("img").src;
            document.getElementById("quickViewTitle").innerHTML = card.querySelector(".menu-title").innerHTML;
            document.getElementById("quickViewDesc").innerHTML = card.querySelector(".menu-description").innerHTML;
            document.getElementById("quickViewPrice").innerHTML = card.querySelector(".price").innerHTML;

            overlay.style.display = "block";
            box.style.display = "block";
            requestAnimationFrame(() => box.style.transform = "translate(-50%,-50%) scale(1)");
        });
    });

    function closeQuickView() {
        overlay.style.display = "none";
        box.style.display = "none";
        box.style.transform = "translate(-50%,-50%) scale(.8)";
    }

    document.getElementById("closeQuickView").onclick = closeQuickView;
    overlay.onclick = closeQuickView;

    document.getElementById("quickViewCart").addEventListener("click", () => {
        if (activeCard) {
            activeCard.querySelector(".add-cart")?.click();
            closeQuickView();
        }
    });

})();

/* ==========================================================
   NEWSLETTER + CONTACT FORMS
========================================================== */

document.querySelector(".newsletter-form")?.addEventListener("submit", function (e) {
    e.preventDefault();
    showToast("Newsletter subscribed successfully 📧");
    this.reset();
});

document.querySelector(".contact-form form")?.addEventListener("submit", function (e) {
    e.preventDefault();
    showToast("Message sent successfully ✉️");
    this.reset();
});

/* ==========================================================
   FLOATING WHATSAPP + CALL BUTTONS
========================================================== */

/* NOTE: these used to rely on Font Awesome webfont icons drawn via inline
   styles. On slower mobile connections the icon font sometimes hadn't
   finished loading yet, so the button showed as a plain black circle
   instead of the phone/WhatsApp glyph. They're now built with inline SVG
   (bundled in the JS itself) so the icon always renders instantly, on
   every device, with no external font dependency — and styling now lives
   in style.css (.float-action-btn) instead of inline styles. */

if (!document.getElementById("floatingCall")) {
    const call = document.createElement("a");
    call.id = "floatingCall";
    call.className = "float-action-btn";
    call.href = "tel:+923001234567";
    call.setAttribute("aria-label", "Call PizzaTrack");
    call.title = "Call us";
    call.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.01l-2.2 2.21Z"/></svg>`;
    document.body.appendChild(call);
}

if (!document.getElementById("whatsappFloat")) {
    const whatsapp = document.createElement("a");
    whatsapp.id = "whatsappFloat";
    whatsapp.className = "float-action-btn";
    whatsapp.href = "https://wa.me/923001234567";
    whatsapp.target = "_blank";
    whatsapp.rel = "noopener";
    whatsapp.setAttribute("aria-label", "Chat on WhatsApp");
    whatsapp.title = "Chat on WhatsApp";
    whatsapp.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.4 1.26 4.83L2 22l5.36-1.29a9.9 9.9 0 0 0 4.68 1.19h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2Zm5.83 14.11c-.25.7-1.25 1.29-2.03 1.46-.55.12-1.26.21-3.65-.78-2.98-1.24-4.9-4.26-5.05-4.46-.15-.2-1.2-1.6-1.2-3.05 0-1.45.75-2.16 1.02-2.46.26-.3.58-.37.77-.37.19 0 .39.002.55.01.18.01.42-.07.65.5.25.6.85 2.08.92 2.23.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.61.17.3.76 1.26 1.63 2.04 1.12 1 2.06 1.31 2.36 1.46.3.15.47.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.66-.15.27.1 1.71.81 2 .96.3.15.5.22.57.35.07.13.07.75-.18 1.45Z"/></svg>`;
    document.body.appendChild(whatsapp);
}

/* ==========================================================
   SCROLL PROGRESS BAR
========================================================== */

if (!document.getElementById("scrollProgress")) {
    const progress = document.createElement("div");
    progress.id = "scrollProgress";
    progress.style.cssText = "position:fixed;left:0;top:0;height:4px;background:#ff3d00;width:0;z-index:99999;";
    document.body.appendChild(progress);

    window.addEventListener("scroll", () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (total > 0 ? (window.pageYOffset / total) * 100 : 0) + "%";
    });
}

/* ==========================================================
   BUTTON RIPPLE EFFECT
========================================================== */

document.querySelectorAll(".btn, .add-cart").forEach(button => {
    button.addEventListener("click", function (e) {
        const ripple = document.createElement("span");
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;
            top:${e.clientY - rect.top - size / 2}px;position:absolute;border-radius:50%;
            background:rgba(255,255,255,.35);transform:scale(0);animation:ripple .6s linear;
            pointer-events:none;`;

        this.style.position = "relative";
        this.style.overflow = "hidden";
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

/* ==========================================================
   IMAGE ZOOM (menu images)
========================================================== */

document.querySelectorAll(".menu-image img").forEach(img => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => {
        const overlay = document.createElement("div");
        overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;
            justify-content:center;align-items:center;z-index:999999;`;

        const image = document.createElement("img");
        image.src = img.src;
        image.style.cssText = "max-width:90%;max-height:90%;border-radius:20px;";

        overlay.appendChild(image);
        overlay.onclick = () => overlay.remove();
        document.body.appendChild(overlay);
    });
});

/* ==========================================================
   CURRENT YEAR + BRANDING
========================================================== */

const year = document.querySelector(".current-year");
if (year) year.textContent = new Date().getFullYear();

console.log("%cPizzaTrack Pro Loaded Successfully", "color:#ff3d00;font-size:18px;font-weight:bold;");

});

const now = new Date();
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');
const timeString = `${hours}:${minutes}:${seconds}`; // "12:34:05"