// ============================================
// DATABASE
// ============================================

import { database } from "./firebase-config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const itemsRef = ref(database, "items");

// ============================================
// TOAST
// ============================================

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("toast-visible");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("toast-visible"), 3000);
}

// ============================================
// UTILS
// ============================================

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ============================================
// ITEM CODES (stores.html)
// ============================================

if (document.getElementById("display-items")) {
  const selectEl = document.getElementById("display-items");
  const searchEl = document.getElementById("search-items");
  const countEl  = document.getElementById("items-count");
  let allItems = [];

  function render() {
    const selected = selectEl.value;
    const query    = (searchEl?.value || "").trim().toLowerCase();

    const filtered = query
      ? allItems.filter(i =>
          i.itemname.toLowerCase().includes(query) ||
          i.itemcode.toLowerCase().includes(query)
        )
      : allItems.filter(i => i.storetype === selected);

    if (countEl) {
      countEl.textContent = `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`;
    }

    const container = document.getElementById("display-results");

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-outlined">search_off</span>
          <span>No items found</span>
        </div>`;
      return;
    }

    container.innerHTML = filtered.map(item => `
      <div class="store-info">
        <div class="store-item">${escHtml(item.itemname)}</div>
        <div class="store-code" data-code="${escHtml(item.itemcode)}" title="Tap to copy">
          <span>${escHtml(item.itemcode)}</span>
          <span class="copy-icon material-symbols-outlined">content_copy</span>
        </div>
      </div>`).join("");

    container.querySelectorAll(".store-code").forEach(el => {
      el.addEventListener("click", () => {
        navigator.clipboard?.writeText(el.dataset.code).then(() => showToast("Code copied"));
      });
    });
  }

  onValue(itemsRef, snapshot => {
    allItems = [];
    if (snapshot.val()) {
      allItems = Object.entries(snapshot.val()).map(([key, entry]) => ({ key, ...entry }));
      allItems.sort((a, b) => a.itemname.localeCompare(b.itemname));
    }
    render();
  });

  selectEl.addEventListener("change", render);
  searchEl?.addEventListener("input", render);
}

// ============================================
// GLOW
// ============================================

const fibreGlowColors = {
  blue:   "rgba(13, 71, 161, 0.55)",
  orange: "rgba(230, 81, 0, 0.55)",
  green:  "rgba(27, 94, 32, 0.55)",
  red:    "rgba(183, 28, 28, 0.55)",
  slate:  "rgba(84, 110, 122, 0.5)",
  yellow: "rgba(255, 235, 59, 0.4)",
  brown:  "rgba(78, 52, 46, 0.5)",
  purple: "rgba(106, 27, 154, 0.55)",
  black:  "rgba(200, 200, 200, 0.15)",
  white:  "rgba(240, 240, 240, 0.3)",
  pink:   "rgba(240, 98, 146, 0.5)",
  aqua:   "rgba(107, 201, 245, 0.5)",
};

function setGlowColor(colourName) {
  const glowEl = document.getElementById("glow");
  if (!glowEl) return;
  glowEl.style.background = colourName
    ? (fibreGlowColors[colourName] || "transparent")
    : "transparent";
}

// ============================================
// FIBRE DATA
// ============================================

let fibreSelect = 12;

const maxFibre12 = 12;
const maxFibre8  = 8;

const fibreColours12 = ["blue","orange","green","red","slate","yellow","brown","purple","black","white","pink","aqua"];
const fibreColours8  = ["blue","orange","green","red","slate","yellow","brown","purple"];

// ============================================
// DOM SELECTORS
// ============================================

const fibreNumber   = document.getElementById("fibre-number");
const elementNumber = document.getElementById("fibre-element");
const displayFibre  = document.getElementById("display-fibre");
const displayElement = document.getElementById("display-element");
const twelveFibre   = document.getElementById("12f");
const eightFibre    = document.getElementById("8f");

const tabNumber     = document.getElementById("tab-number");
const tabElement    = document.getElementById("tab-element");
const sectionNumber = document.getElementById("section-number");
const sectionElement = document.getElementById("section-element");
const hintNumber    = document.getElementById("hint-number");
const hintElement   = document.getElementById("hint-element");

// ============================================
// TABS
// ============================================

function switchTab(active) {
  const isNumber = active === "number";
  tabNumber?.classList.toggle("tab-active", isNumber);
  tabElement?.classList.toggle("tab-active", !isNumber);
  sectionNumber?.classList.toggle("hidden", !isNumber);
  sectionElement?.classList.toggle("hidden", isNumber);
  resetValues();
  updateHints();
}

tabNumber?.addEventListener("click", () => switchTab("number"));
tabElement?.addEventListener("click", () => switchTab("element"));

// ============================================
// HINTS
// ============================================

function updateHints() {
  if (fibreSelect === 8) {
    if (hintNumber) hintNumber.textContent = "Max 96 fibres";
    if (hintElement) hintElement.textContent = "Max 12 elements";
  } else {
    if (hintNumber) hintNumber.textContent = "Max 864 fibres";
    if (hintElement) hintElement.textContent = "Max 72 elements";
  }
}

// ============================================
// RESET
// ============================================

function resetValues() {
  if (fibreNumber)   fibreNumber.value = "";
  if (elementNumber) elementNumber.value = "";
  if (displayFibre)  displayFibre.innerHTML = "";
  if (displayElement) displayElement.innerHTML = "";
  setGlowColor(null);
}

// ============================================
// FIBRE BY NUMBER — 12F
// ============================================

function getFibreNumber() {
  const fibre = parseInt(fibreNumber.value);
  if (!fibre || fibre < 1) { resetValues(); return; }

  if (fibre > 864) {
    displayFibre.innerHTML = `<div class="alert">MAX FIBRE COUNT 864</div>`;
    setGlowColor(null);
    return;
  }

  const elementValue = Math.ceil(fibre / 12);
  const colourIndex  = fibre < 13
    ? fibre / elementValue - 1
    : fibre - (elementValue - 1) * 12 - 1;
  const colourName   = fibreColours12[colourIndex];
  const position     = colourIndex + 1;

  const coloursHtml = fibreColours12.map((c, i) => {
    const num = maxFibre12 * elementValue - (11 - i);
    return `<span class="fibre-span ${c}-fibre">${num}</span>`;
  }).join("");

  displayFibre.innerHTML = `
    <div class="result-card">
      <span class="result-colour-chip ${colourName}-fibre"></span>
      <div class="result-name">${colourName}</div>
      <div class="result-detail">Element ${elementValue} &middot; Fibre ${position}</div>
      <div class="colour-display">${coloursHtml}</div>
    </div>`;

  setGlowColor(colourName);
}

// ============================================
// FIBRE BY NUMBER — 8F
// ============================================

function getFibreNumberEight() {
  const fibre = parseInt(fibreNumber.value);
  if (!fibre || fibre < 1) { resetValues(); return; }

  if (fibre > 96) {
    displayFibre.innerHTML = `<div class="alert">MAX FIBRE COUNT 96</div>`;
    setGlowColor(null);
    return;
  }

  const elementValue = Math.ceil(fibre / 8);
  const colourIndex  = fibre < 9
    ? fibre / elementValue - 1
    : fibre - (elementValue - 1) * 8 - 1;
  const colourName   = fibreColours8[colourIndex];
  const position     = colourIndex + 1;

  const coloursHtml = fibreColours8.map((c, i) => {
    const num = maxFibre8 * elementValue - (7 - i);
    return `<span class="fibre-span ${c}-fibre">${num}</span>`;
  }).join("");

  displayFibre.innerHTML = `
    <div class="result-card">
      <span class="result-colour-chip ${colourName}-fibre"></span>
      <div class="result-name">${colourName}</div>
      <div class="result-detail">Element ${elementValue} &middot; Fibre ${position}</div>
      <div class="colour-display colour-display-8f">${coloursHtml}</div>
    </div>`;

  setGlowColor(colourName);
}

// ============================================
// FIBRE BY ELEMENT — 12F
// ============================================

function getElementNumber() {
  const el = parseInt(elementNumber.value);
  if (!el || el < 1) { if (displayElement) displayElement.innerHTML = ""; return; }

  if (el > 72) {
    displayElement.innerHTML = `<div class="alert">MAX ELEMENT COUNT 72</div>`;
    return;
  }

  const coloursHtml = fibreColours12.map((c, i) => {
    const num = maxFibre12 * el - (11 - i);
    return `<span class="fibre-span ${c}-fibre">${num}</span>`;
  }).join("");

  displayElement.innerHTML = `
    <div class="result-card">
      <div class="result-detail-header">Fibres in Element ${el}</div>
      <div class="colour-display">${coloursHtml}</div>
    </div>`;
}

// ============================================
// FIBRE BY ELEMENT — 8F
// ============================================

function getElementNumberEight() {
  const el = parseInt(elementNumber.value);
  if (!el || el < 1) { if (displayElement) displayElement.innerHTML = ""; return; }

  if (el > 12) {
    displayElement.innerHTML = `<div class="alert">MAX ELEMENT COUNT 12</div>`;
    return;
  }

  const coloursHtml = fibreColours8.map((c, i) => {
    const num = maxFibre8 * el - (7 - i);
    return `<span class="fibre-span ${c}-fibre">${num}</span>`;
  }).join("");

  displayElement.innerHTML = `
    <div class="result-card">
      <div class="result-detail-header">Fibres in Element ${el}</div>
      <div class="colour-display colour-display-8f">${coloursHtml}</div>
    </div>`;
}

// ============================================
// EVENT LISTENERS
// ============================================

fibreNumber?.addEventListener("keyup", function () {
  const val = parseInt(fibreNumber.value);
  if (!fibreNumber.value || val < 1) { resetValues(); return; }
  if (!fibreSelect) {
    displayFibre.innerHTML = `<div class="alert">Must select 12F or 8F</div>`;
    return;
  }
  if (fibreSelect === 12) getFibreNumber();
  else if (fibreSelect === 8) getFibreNumberEight();
});

elementNumber?.addEventListener("keyup", function () {
  const val = parseInt(elementNumber.value);
  if (!elementNumber.value || val < 1) {
    if (displayElement) displayElement.innerHTML = "";
    return;
  }
  if (!fibreSelect) {
    displayElement.innerHTML = `<div class="alert">Must select 12F or 8F</div>`;
    return;
  }
  if (fibreSelect === 12) getElementNumber();
  else if (fibreSelect === 8) getElementNumberEight();
});

fibreNumber?.addEventListener("wheel", function (e) {
  e.preventDefault();
  const current = parseInt(fibreNumber.value) || 0;
  const newVal = e.deltaY < 0 ? current + 1 : current - 1;
  if (newVal < 1) return;
  fibreNumber.value = newVal;
  if (!fibreSelect) {
    displayFibre.innerHTML = `<div class="alert">Must select 12F or 8F</div>`;
    return;
  }
  if (fibreSelect === 12) getFibreNumber();
  else if (fibreSelect === 8) getFibreNumberEight();
}, { passive: false });

elementNumber?.addEventListener("wheel", function (e) {
  e.preventDefault();
  const current = parseInt(elementNumber.value) || 0;
  const newVal = e.deltaY < 0 ? current + 1 : current - 1;
  if (newVal < 1) return;
  elementNumber.value = newVal;
  if (!fibreSelect) {
    displayElement.innerHTML = `<div class="alert">Must select 12F or 8F</div>`;
    return;
  }
  if (fibreSelect === 12) getElementNumber();
  else if (fibreSelect === 8) getElementNumberEight();
}, { passive: false });

document.getElementById("reset")?.addEventListener("click", () => {
  resetValues();
});

twelveFibre?.addEventListener("click", function () {
  fibreSelect = 12;
  resetValues();
  eightFibre.classList.remove("active");
  twelveFibre.classList.add("active");
  updateHints();
});

eightFibre?.addEventListener("click", function () {
  fibreSelect = 8;
  resetValues();
  eightFibre.classList.add("active");
  twelveFibre.classList.remove("active");
  updateHints();
});

// ============================================
// SFP DATA
// ============================================

const SFP = [
  { SFPName: "SFP-05",  PartNumb: "0061003014",    Distance: "16km",      LatchColour: "Blue"   },
  { SFPName: "SFP-06",  PartNumb: "0061003015",    Distance: "16km",      LatchColour: "Purple" },
  { SFPName: "SFP-07",  PartNumb: "0061003018",    Distance: "40km",      LatchColour: "Blue"   },
  { SFPName: "SFP-08",  PartNumb: "0061003019",    Distance: "40km",      LatchColour: "Purple" },
  { SFPName: "SFP-21",  PartNumb: "0061003028",    Distance: "66km",      LatchColour: "Purple" },
  { SFPName: "SFP-22",  PartNumb: "0061003029",    Distance: "66km",      LatchColour: "Gold"   },
  { SFPName: "SFP-23",  PartNumb: "0061003030",    Distance: "86km",      LatchColour: "Green"  },
  { SFPName: "SFP-24",  PartNumb: "0061003031",    Distance: "86km",      LatchColour: "Red"    },
  { SFPName: "SFP-09",  PartNumb: "0061003006",    Distance: "Cust Port", LatchColour: "Silver" },
  { SFPName: "SFP-10",  PartNumb: "0061003008",    Distance: "Cust Port", LatchColour: "Blue"   },
  { SFPName: "SFP-98",  PartNumb: "1061903214-02", Distance: "16km",      LatchColour: "Blue"   },
  { SFPName: "SFP-99",  PartNumb: "1061903215-02", Distance: "16km",      LatchColour: "Purple" },
  { SFPName: "SFP-100", PartNumb: "1061903218-02", Distance: "40km",      LatchColour: "Blue"   },
  { SFPName: "SFP-101", PartNumb: "1061903219-02", Distance: "40km",      LatchColour: "Purple" },
  { SFPName: "SFP-104", PartNumb: "106705880-01",  Distance: "86km",      LatchColour: "Green"  },
  { SFPName: "SFP-105", PartNumb: "106705881-01",  Distance: "86km",      LatchColour: "Red"    },
  { SFPName: "SFP-009", PartNumb: "1061705854-02", Distance: "Cust Port", LatchColour: "Black"  },
  { SFPName: "SFP-010", PartNumb: "1061705850-02", Distance: "Cust Port", LatchColour: "Blue"   },
  { SFPName: "SFP-106", PartNumb: "0061705890",    Distance: "RJ45",      LatchColour: "Yellow" },
  { SFPName: "SFP-207", PartNumb: "1061701887-01", Distance: "16km",      LatchColour: "Blue"   },
  { SFPName: "SFP-206", PartNumb: "1061701888-01", Distance: "16km",      LatchColour: "Blue"   },
  { SFPName: "SFP-208", PartNumb: "1061701848-01", Distance: "26km",      LatchColour: "Blue"   },
  { SFPName: "SFP-209", PartNumb: "1061701849-01", Distance: "26km",      LatchColour: "Blue"   },
  { SFPName: "SFP-210", PartNumb: "1061701889-01", Distance: "40km",      LatchColour: "Blue"   },
  { SFPName: "SFP-211", PartNumb: "1061701890-01", Distance: "40km",      LatchColour: "Blue"   },
  { SFPName: "SFP-212", PartNumb: "1061701858-01", Distance: "Cust Port", LatchColour: "Grey"   },
  { SFPName: "SFP-213", PartNumb: "1061701859-01", Distance: "Cust Port", LatchColour: "Blue"   },
];

function getSFPInfo() {
  const target = document.querySelector(".display-sfp");
  if (!target) return;
  target.innerHTML = SFP.map((data) => `
    <div class="wrapper-row">
      <div class="wrapper-column">${data.SFPName}</div>
      <div class="wrapper-column">${data.PartNumb}</div>
      <div class="wrapper-column">${data.Distance}</div>
      <div class="wrapper-column">${data.LatchColour}</div>
    </div>`).join("");
}

getSFPInfo();

// Initialise with 12F selected
twelveFibre?.classList.add("active");
updateHints();
