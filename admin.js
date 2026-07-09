const state = {
  orders: [],
  search: "",
  status: "all"
};

const statuses = ["Pending", "Preparing", "Out for Delivery", "Completed", "Cancelled"];

const elements = {
  ordersList: document.getElementById("ordersList"),
  searchInput: document.getElementById("searchInput"),
  statusFilter: document.getElementById("statusFilter"),
  refreshBtn: document.getElementById("refreshBtn"),
  syncState: document.getElementById("syncState"),
  orderCount: document.getElementById("orderCount"),
  pendingCount: document.getElementById("pendingCount"),
  activeCount: document.getElementById("activeCount"),
  completedCount: document.getElementById("completedCount"),
  revenueTotal: document.getElementById("revenueTotal"),
  toast: document.getElementById("toast")
};

function money(value) {
  const amount = Number(value || 0);
  return `Rs${amount.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

function clean(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function slug(value) {
  return String(value || "pending").trim().toLowerCase().replace(/\s+/g, "-");
}

function normalizeStatus(value) {
  const raw = String(value || "Pending").trim().toLowerCase();
  if (raw === "out for delivery" || raw === "delivery") return "Out for Delivery";
  return statuses.find(status => status.toLowerCase() === raw) || "Pending";
}

function normalizeCustomer(order) {
  if (order.customer && typeof order.customer === "object") {
    return {
      name: order.customer.name || order.customer.customerName || "Guest customer",
      phone: order.customer.phone || order.phone || "No phone",
      address: order.customer.address || order.address || "No address"
    };
  }

  return {
    name: order.customer || order.name || "Guest customer",
    phone: order.phone || "No phone",
    address: order.address || "No address"
  };
}

function normalizeItems(order) {
  if (Array.isArray(order.items) && order.items.length) {
    return order.items.map(item => ({
      name: item.name || item.item || "Item",
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0)
    }));
  }

  if (order.item) {
    const match = String(order.item).match(/Rs\s*([\d,.]+)/i);
    return [{
      name: String(order.item).replace(/\s*-\s*Rs\s*[\d,.]+/i, ""),
      quantity: Number(order.quantity || 1),
      price: match ? Number(match[1].replace(/,/g, "")) : 0
    }];
  }

  return [];
}

function normalizeOrder(order) {
  const items = normalizeItems(order);
  const customer = normalizeCustomer(order);
  const total = Number(
    order.total ??
    order.totals?.total ??
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  return {
    id: order.id,
    customer,
    items,
    total,
    status: normalizeStatus(order.status),
    date: order.date || order.createdAt || "",
    raw: order
  };
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2600);
}

function setSyncState(message) {
  elements.syncState.textContent = message;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

async function loadOrders() {
  try {
    setSyncState("Loading");
    const orders = await request("/api/orders");
    state.orders = Array.isArray(orders) ? orders.map(normalizeOrder).sort((a, b) => Number(b.id) - Number(a.id)) : [];
    setSyncState("Updated");
    render();
  } catch (error) {
    setSyncState("Offline");
    elements.ordersList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h3>Orders could not load</h3>
        <p>Start the PizzaTrack server, then refresh this page.</p>
      </div>
    `;
  }
}

function getVisibleOrders() {
  const query = state.search.trim().toLowerCase();
  return state.orders.filter(order => {
    const statusMatches = state.status === "all" || order.status.toLowerCase() === state.status;
    const haystack = [
      order.id,
      order.customer.name,
      order.customer.phone,
      order.customer.address,
      order.items.map(item => item.name).join(" ")
    ].join(" ").toLowerCase();

    return statusMatches && (!query || haystack.includes(query));
  });
}

function renderStats() {
  const pending = state.orders.filter(order => order.status === "Pending").length;
  const active = state.orders.filter(order => ["Preparing", "Out for Delivery"].includes(order.status)).length;
  const completed = state.orders.filter(order => order.status === "Completed").length;
  const revenue = state.orders
    .filter(order => order.status !== "Cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  elements.pendingCount.textContent = pending;
  elements.activeCount.textContent = active;
  elements.completedCount.textContent = completed;
  elements.revenueTotal.textContent = money(revenue);
}

function renderOrders() {
  const orders = getVisibleOrders();
  elements.orderCount.textContent = `${orders.length} of ${state.orders.length} orders shown`;

  if (!orders.length) {
    elements.ordersList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-receipt"></i>
        <h3>No orders found</h3>
        <p>Try a different search or status filter.</p>
      </div>
    `;
    return;
  }

  elements.ordersList.innerHTML = orders.map(order => {
    const date = order.date ? new Date(order.date).toLocaleString() : "No date";
    const items = order.items.length ? order.items.map(item => `
      <div class="item-line">
        <span>${clean(item.quantity)} x ${clean(item.name)}</span>
        <strong>${money(item.price * item.quantity)}</strong>
      </div>
    `).join("") : '<p class="item-line">No items listed</p>';

    return `
      <article class="order-card" data-id="${clean(order.id)}">
        <div class="order-top">
          <div>
            <h3>Order #${clean(order.id)}</h3>
            <p class="order-id">${clean(date)}</p>
          </div>
          <span class="status-badge status-${slug(order.status)}">${clean(order.status)}</span>
        </div>
        <div class="customer-row">
          <div>
            <h3>${clean(order.customer.name)}</h3>
            <p class="meta"><i class="fa-solid fa-phone"></i> ${clean(order.customer.phone)}</p>
          </div>
          <p class="address">${clean(order.customer.address)}</p>
        </div>
        <div class="items">${items}</div>
        <div class="order-footer">
          <div class="total">${money(order.total)}</div>
          <div class="order-actions">
            <select class="status-select" aria-label="Change status for order ${clean(order.id)}">
              ${statuses.map(status => `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`).join("")}
            </select>
            <button class="delete-btn" type="button" aria-label="Delete order" title="Delete order">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function render() {
  renderStats();
  renderOrders();
}

async function updateStatus(id, status) {
  try {
    setSyncState("Saving");
    await request(`/api/orders/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
    const order = state.orders.find(item => String(item.id) === String(id));
    if (order) order.status = normalizeStatus(status);
    render();
    setSyncState("Updated");
    showToast("Order status updated");
  } catch (error) {
    setSyncState("Error");
    showToast(error.message || "Could not update order");
    loadOrders();
  }
}

async function deleteOrder(id) {
  const confirmed = window.confirm("Delete this order permanently?");
  if (!confirmed) return;

  try {
    setSyncState("Deleting");
    await request(`/api/orders/${encodeURIComponent(id)}`, { method: "DELETE" });
    state.orders = state.orders.filter(order => String(order.id) !== String(id));
    render();
    setSyncState("Updated");
    showToast("Order deleted");
  } catch (error) {
    setSyncState("Error");
    showToast(error.message || "Could not delete order");
  }
}

function bindEvents() {
  elements.refreshBtn.addEventListener("click", loadOrders);
  elements.searchInput.addEventListener("input", event => {
    state.search = event.target.value;
    renderOrders();
  });
  elements.statusFilter.addEventListener("change", event => {
    state.status = event.target.value;
    renderOrders();
  });
  elements.ordersList.addEventListener("change", event => {
    const select = event.target.closest(".status-select");
    if (!select) return;
    const card = event.target.closest(".order-card");
    updateStatus(card.dataset.id, select.value);
  });
  elements.ordersList.addEventListener("click", event => {
    const button = event.target.closest(".delete-btn");
    if (!button) return;
    const card = event.target.closest(".order-card");
    deleteOrder(card.dataset.id);
  });
}

bindEvents();
loadOrders();