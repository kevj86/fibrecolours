let elementSize = null;

const maxElementFibre = 12;
const maxElementFibreEight = 8;

const fibreColours = ["blue", "orange", "green", "red", "slate", "yellow", "brown", "purple", "black", "white", "pink", "aqua"];
const fibreColoursEight = ["blue", "orange", "green", "red", "slate", "yellow", "brown", "purple"];

// DOM Selectors

const fibreNumber = document.getElementById("fibre-number");
const elementNumber = document.getElementById("fibre-element");
const displayFibre = document.getElementById("display-fibre");
const displayElement = document.getElementById("display-element");

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

// Event Listeners

fibreNumber.addEventListener("keyup", function () {
  getFibreNumber();
});

elementNumber.addEventListener("keyup", function () {
  getElementNumber();
});
