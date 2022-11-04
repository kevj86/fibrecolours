let elementSize = null;
let fibreSelect = null;

const maxElementFibre = 12;
const maxElementFibreEight = 8;

const fibreColours = ["blue", "orange", "green", "red", "slate", "yellow", "brown", "purple", "black", "white", "pink", "aqua"];
const fibreColoursEight = ["blue", "orange", "green", "red", "slate", "yellow", "brown", "purple"];

// DOM Selectors

const fibreNumber = document.getElementById("fibre-number");
const elementNumber = document.getElementById("fibre-element");
const displayFibre = document.getElementById("display-fibre");
const displayElement = document.getElementById("display-element");
const twelveFibre = document.getElementById("12f");
const eightFibre = document.getElementById("8f");

function getFibreNumber() {
  const fibre = fibreNumber.value;
  const elementValue = Math.ceil(fibre / 12);

  let fibreColour = fibre < 13 ? fibre / elementValue - 1 : fibre - (elementValue - 1) * 12 - 1;

  let coloursHtml = fibreColours
    .map((fibreColour, index) => {
      return `<span class="fibre-span ${fibreColour}-fibre">${maxElementFibre * elementValue - (11 - index)}</span> `;
    })
    .join("");

  if (fibreNumber.value === "" || fibreNumber.value === "0") {
  } else if (fibreNumber.value > 864) {
    displayFibre.innerHTML = `
        <div class="alert">MAX FIBRE COUNT 864</div>
    `;
  } else {
    displayFibre.innerHTML = `
        <div>Fibre <span class="accent">${fibre}<span> is  <span class="${fibreColours[fibreColour]}-fibre inline-span">${fibreColours[fibreColour]}</span></div>
        <div>and is in ELEMENT <span class="accent">${elementValue}</span></div>
        <div class="colour-display">${coloursHtml}</div>`;
  }
}

function getFibreNumberEight() {
  const fibre = fibreNumber.value;
  const elementValue = Math.ceil(fibre / 8);

  let fibreColour = fibre < 9 ? fibre / elementValue - 1 : fibre - (elementValue - 1) * 8 - 1;

  let coloursHtml = fibreColoursEight
    .map((fibreColour, index) => {
      return `<span class="fibre-span ${fibreColour}-fibre">${maxElementFibreEight * elementValue - (7 - index)}</span> `;
    })
    .join("");

  if (fibreNumber.value === "" || fibreNumber.value === "0") {
  } else if (fibreNumber.value > 96) {
    displayFibre.innerHTML = `
        <div class="alert">MAX FIBRE COUNT 96</div>
    `;
  } else {
    displayFibre.innerHTML = `
        <div>Fibre <span class="accent">${fibre}<span> is  <span class="${fibreColoursEight[fibreColour]}-fibre inline-span">${fibreColoursEight[fibreColour]}</span></div>
        <div>and is in ELEMENT <span class="accent">${elementValue}</span></div>
        <div class="colour-display">${coloursHtml}</div>`;
  }
}

function getElementNumber() {
  let coloursHtml = fibreColours
    .map((fibreColour, index) => {
      return `<span class="fibre-span ${fibreColour}-fibre">${maxElementFibre * elementNumber.value - (11 - index)}</span> `;
    })
    .join("");

  if (elementNumber.value === "" || elementNumber === "0") {
  } else if (elementNumber.value > 72) {
    displayElement.innerHTML = `<div id="element-Count" class="alert">MAX ELEMENT COUNT 72</div>`;
  } else {
    displayElement.innerHTML = `
      <div>Fibre numbers in ELEMENT <span class="accent">${elementNumber.value}</span></div>
      <div class="colour-display">${coloursHtml}</div>`;
  }
}
// Reset Content

function resetValues() {
  fibreNumber.value = "";
  elementNumber.value = "";
  displayElement.innerHTML = "";
  displayFibre.innerHTML = "";
}

// Event Listeners

fibreNumber.addEventListener("keyup", function () {
  fibreNumber.value === "" ? resetValues() : null;

  if (fibreSelect === 12) {
    getFibreNumber();
  } else if (fibreSelect === 8) {
    getFibreNumberEight();
  }
});

elementNumber.addEventListener("keyup", function () {
  getElementNumber();
});

document.getElementById("reset").addEventListener("click", () => {
  resetValues();
});

twelveFibre.addEventListener("click", function () {
  fibreSelect = 12;
  resetValues();
  eightFibre.classList.remove("active");
  twelveFibre.classList.add("active");
});

eightFibre.addEventListener("click", function () {
  fibreSelect = 8;
  resetValues();
  eightFibre.classList.add("active");
  twelveFibre.classList.remove("active");
});
