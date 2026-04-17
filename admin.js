import { auth, database } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  ref,
  onValue,
  push,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// ============================================
// STATE
// ============================================

let allItems   = [];
let editingId  = null;
let unsubscribe = null;

const CATEGORIES = [
  { value: "ethernet",    label: "Ethernet"    },
  { value: "newsite",     label: "Newsite"     },
  { value: "exchange",    label: "Exchange"    },
  { value: "overhead",    label: "Overhead"    },
  { value: "nodes",       label: "Nodes"       },
  { value: "blownfibre",  label: "Blown Fibre" },
  { value: "consumables", label: "Consumables" },
  { value: "tools",       label: "Tools"       },
  { value: "misc",        label: "Misc"        },
];

function categoryLabel(value) {
  return CATEGORIES.find(c => c.value === value)?.label ?? value;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ============================================
// AUTH STATE
// ============================================

onAuthStateChanged(auth, user => {
  if (user) {
    showDashboard();
    startListening();
  } else {
    stopListening();
    showLogin();
  }
});

// ============================================
// LOGIN / LOGOUT
// ============================================

const loginSection    = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm       = document.getElementById("login-form");
const loginBtn        = document.getElementById("login-btn");
const loginError      = document.getElementById("login-error");

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email    = document.getElementById("admin-email").value.trim();
  const password = document.getElementById("admin-password").value;

  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in…";
  loginError.classList.add("hidden");
  loginError.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    loginError.textContent = friendlyAuthError(err.code);
    loginError.classList.remove("hidden");
    loginBtn.disabled = false;
    loginBtn.textContent = "Sign in";
  }
});

document.getElementById("sign-out-btn").addEventListener("click", () => signOut(auth));

const signOutBtn = document.getElementById("sign-out-btn");

function showLogin() {
  loginSection.classList.remove("hidden");
  dashboardSection.classList.add("hidden");
  if (signOutBtn) signOutBtn.style.display = "none";
  loginBtn.disabled = false;
  loginBtn.textContent = "Sign in";
  loginError.classList.add("hidden");
  document.getElementById("admin-email").value = "";
  document.getElementById("admin-password").value = "";
}

function showDashboard() {
  loginSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  if (signOutBtn) signOutBtn.style.display = "";
}

function friendlyAuthError(code) {
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "Incorrect email or password.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many attempts. Try again later.";
  }
  return "Sign-in failed. Please try again.";
}

// ============================================
// FIREBASE LISTENER
// ============================================

function startListening() {
  const itemsRef = ref(database, "items");
  unsubscribe = onValue(itemsRef, snapshot => {
    allItems = [];
    if (snapshot.val()) {
      allItems = Object.entries(snapshot.val()).map(([key, entry]) => ({ key, ...entry }));
      allItems.sort((a, b) => a.itemname.localeCompare(b.itemname));
    }
    renderItems();
    updateCount();
  });
}

function stopListening() {
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }
}

// ============================================
// RENDER ITEMS
// ============================================

const adminSearch = document.getElementById("admin-search");
adminSearch.addEventListener("input", () => { renderItems(); updateCount(); });

function renderItems() {
  const query    = adminSearch.value.trim().toLowerCase();
  const filtered = query
    ? allItems.filter(i =>
        i.itemname.toLowerCase().includes(query) ||
        i.itemcode.toLowerCase().includes(query) ||
        categoryLabel(i.storetype).toLowerCase().includes(query)
      )
    : allItems;

  const container = document.getElementById("admin-items-list");

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="material-symbols-outlined">inventory_2</span>
        <span>${allItems.length === 0 ? "No items yet. Add one above." : "No items match your search."}</span>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="admin-item-row">
      <div class="admin-item-info">
        <div class="admin-item-name">${escHtml(item.itemname)}</div>
        <div class="admin-item-meta">
          <span class="admin-item-code">${escHtml(item.itemcode)}</span>
          <span class="admin-category-badge">${escHtml(categoryLabel(item.storetype))}</span>
        </div>
      </div>
      <div class="admin-item-actions">
        <button class="admin-action-btn admin-edit-btn" data-id="${escHtml(item.key)}" aria-label="Edit ${escHtml(item.itemname)}">
          <span class="material-symbols-outlined">edit</span>
        </button>
        <button class="admin-action-btn admin-delete-btn" data-id="${escHtml(item.key)}" data-name="${escHtml(item.itemname)}" aria-label="Delete ${escHtml(item.itemname)}">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>`).join("");

  container.querySelectorAll(".admin-edit-btn").forEach(btn => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.id));
  });
  container.querySelectorAll(".admin-delete-btn").forEach(btn => {
    btn.addEventListener("click", () => openConfirmDialog(btn.dataset.id, btn.dataset.name));
  });
}

function updateCount() {
  const query = adminSearch.value.trim().toLowerCase();
  const count = query
    ? allItems.filter(i =>
        i.itemname.toLowerCase().includes(query) ||
        i.itemcode.toLowerCase().includes(query) ||
        categoryLabel(i.storetype).toLowerCase().includes(query)
      ).length
    : allItems.length;
  const el = document.getElementById("admin-count");
  if (el) el.textContent = `${count} item${count !== 1 ? "s" : ""}`;
}

// ============================================
// ADD / EDIT MODAL
// ============================================

const modalOverlay   = document.getElementById("modal-overlay");
const modalTitle     = document.getElementById("modal-title");
const itemForm       = document.getElementById("item-form");
const itemNameInput  = document.getElementById("item-name-input");
const itemCodeInput  = document.getElementById("item-code-input");
const itemCatSelect  = document.getElementById("item-category-select");
const modalError     = document.getElementById("modal-error");
const modalSaveBtn   = document.getElementById("modal-save-btn");
const modalCancelBtn = document.getElementById("modal-cancel-btn");

document.getElementById("add-item-btn").addEventListener("click", openAddModal);
modalCancelBtn.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) closeModal(); });

function openAddModal() {
  editingId = null;
  modalTitle.textContent = "Add Item";
  itemNameInput.value = "";
  itemCodeInput.value = "";
  itemCatSelect.value = "ethernet";
  modalError.classList.add("hidden");
  modalError.textContent = "";
  modalSaveBtn.textContent = "Add Item";
  showModal();
  itemNameInput.focus();
}

function openEditModal(id) {
  editingId = id;
  const item = allItems.find(i => i.key === id);
  if (!item) return;
  modalTitle.textContent = "Edit Item";
  itemNameInput.value = item.itemname;
  itemCodeInput.value = item.itemcode;
  itemCatSelect.value = item.storetype;
  modalError.classList.add("hidden");
  modalError.textContent = "";
  modalSaveBtn.textContent = "Save Changes";
  showModal();
  itemNameInput.focus();
}

function showModal() {
  modalOverlay.classList.remove("hidden");
  modalOverlay.classList.add("modal-open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalOverlay.classList.remove("modal-open");
  setTimeout(() => modalOverlay.classList.add("hidden"), 200);
  document.body.style.overflow = "";
  editingId = null;
}

itemForm.addEventListener("submit", async e => {
  e.preventDefault();
  const name      = itemNameInput.value.trim();
  const code      = itemCodeInput.value.trim();
  const storetype = itemCatSelect.value;

  if (!name || !code) return;

  modalSaveBtn.disabled = true;
  modalSaveBtn.textContent = "Saving…";
  modalError.classList.add("hidden");

  try {
    if (editingId) {
      await update(ref(database, `items/${editingId}`), { itemname: name, itemcode: code, storetype });
      showToast("Item updated");
    } else {
      await push(ref(database, "items"), { itemname: name, itemcode: code, storetype });
      showToast("Item added");
    }
    closeModal();
  } catch (err) {
    modalError.textContent = "Save failed. Check your connection and try again.";
    modalError.classList.remove("hidden");
  } finally {
    modalSaveBtn.disabled = false;
    modalSaveBtn.textContent = editingId ? "Save Changes" : "Add Item";
  }
});

// ============================================
// DELETE CONFIRM DIALOG
// ============================================

const confirmOverlay    = document.getElementById("confirm-overlay");
const confirmItemName   = document.getElementById("confirm-item-name");
const confirmDeleteBtn  = document.getElementById("confirm-delete-btn");
const confirmCancelBtn  = document.getElementById("confirm-cancel-btn");

confirmCancelBtn.addEventListener("click", closeConfirmDialog);
confirmOverlay.addEventListener("click", e => { if (e.target === confirmOverlay) closeConfirmDialog(); });

function openConfirmDialog(id, name) {
  confirmItemName.textContent = name;
  confirmDeleteBtn.dataset.id = id;
  confirmOverlay.classList.remove("hidden");
  confirmOverlay.classList.add("modal-open");
  document.body.style.overflow = "hidden";
}

function closeConfirmDialog() {
  confirmOverlay.classList.remove("modal-open");
  setTimeout(() => confirmOverlay.classList.add("hidden"), 200);
  document.body.style.overflow = "";
}

confirmDeleteBtn.addEventListener("click", async e => {
  const id = e.currentTarget.dataset.id;
  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.textContent = "Deleting…";
  try {
    await remove(ref(database, `items/${id}`));
    showToast("Item deleted");
    closeConfirmDialog();
  } catch {
    showToast("Delete failed. Try again.");
    closeConfirmDialog();
  } finally {
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = "Delete";
  }
});

// ============================================
// TOAST
// ============================================

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("toast-visible");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("toast-visible"), 3000);
}

// ============================================
// KEYBOARD — ESC closes modals
// ============================================

document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!modalOverlay.classList.contains("hidden"))   closeModal();
  if (!confirmOverlay.classList.contains("hidden")) closeConfirmDialog();
});
