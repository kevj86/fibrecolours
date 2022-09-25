const fibreNumber = document.getElementById("fibre-number")
const elementNumber = document.getElementById("element-number")
const elementCount = document.getElementById("element-count")
const elementOther = document.getElementById("element-others")
const numberResults = document.getElementById("number-results")
const numberColour = document.getElementById("number-colour")
const numberElement = document.getElementById("number-element")
const numberOthers = document.getElementById("number-others")
const resetButton = document.getElementById("reset")

const maxElementFibre = 12
// prettier-ignore
const fibreColours = ["blue", "orange", "green", "red", "slate", "yellow", "brown", "purple", "black", "white", "pink", "aqua"]
// function

function getFibreNumber() {
  const fibre = fibreNumber.value
  const elementValue = Math.ceil(fibre / 12)

  let fibreColour = fibre < 13 ? fibre / elementValue - 1 : fibre - (elementValue - 1) * 12 - 1
  let coloursHtml = ""

  for (let i = 0; i < fibreColours.length; i++) {
    coloursHtml += `<span class="${fibreColours[i]}-fibre">${maxElementFibre * elementValue - (11 - i)}</span> `
  }

  if (fibreNumber.value === "" || fibreNumber.value === "0") {
  } else if (fibreNumber.value > 864) {
    numberColour.innerHTML = `<div id="number-colour" class="alert"> MAX FIBRE COUNT 864</div>`
    numberElement.innerHTML = ``
    numberOthers.innerHTML = ``
  } else {
    numberColour.innerHTML = `<div id="number-colour">Fibre ${fibre} is <span class="${fibreColours[fibreColour]}-fibre inline-span">${fibreColours[fibreColour]}</span></div>`
    numberElement.innerHTML = `<div id="number-element">Fibre is in ELEMENT ${elementValue}</div>`
    numberOthers.innerHTML = `<div id="number-others">${coloursHtml}</div>`
  }
}

function getElementNumber() {
  //prettier-ignore
  // let fibreColour = fibre < 13 ? fibre / elementValue - 1 : fibre - (elementValue - 1) * 12 - 1;
  let coloursHtml = "";

  for (let i = 0; i < fibreColours.length; i++) {
    coloursHtml += `<span class="${fibreColours[i]}-fibre">${maxElementFibre * elementNumber.value - (11 - i)}</span> `
  }

  if (elementNumber.value === "" || elementNumber === "0") {
  } else if (elementNumber.value > 72) {
    elementCount.innerHTML = `<div id="element-Count" class="alert">MAX ELEMENT COUNT 72</div>`
    elementOther.innerHTML = `<div id="element-others"></div>`
  } else {
    elementCount.innerHTML = `<div id="element-Count">Fibres ELEMENT ${elementNumber.value}</div>`
    elementOther.innerHTML = `<div id="element-others">${coloursHtml}</div>`
  }
}

function resetContent() {
  elementCount.innerHTML = ``
  elementOther.innerHTML = ``
  numberColour.innerHTML = ``
  numberElement.innerHTML = ``
  numberOthers.innerHTML = ``
  fibreNumber.value = ``
  elementNumber.value = ``
}

fibreNumber.addEventListener("keyup", getFibreNumber)
elementNumber.addEventListener("keyup", getElementNumber)
resetButton.addEventListener("click", resetContent)
