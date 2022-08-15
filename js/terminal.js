
const options = {
    childlist: true,
    attributes: true,
    subtree: true,
}

const priceOptions = {
    attributes: true,
}

let buyButton;
let sellButton;
let loaded = false;

let currentValue = 0;
let movement = null;

let up = 0;
let down = 0;
let previousMovementDirection = null;
let summaryMovement = 0;
let maximumMovement = 0;
let maximumSummaryMovement = 0;

const priceObservers = new MutationObserver((mutations) => {
    mutations.forEach(mutations => {
        const newValue = parseFloat(mutation.target.innerHTML.replace(' ₽' , '').replace("," , "."));

        if (currentValue !== newValue) {
            let same;

            if ( currentValue !==0 && currentValue > newValue) {
                movement = "🔴";
                same = isSameDirectionMovement(movement, previousMovementDirection);
                down++;
                previousMovementDirection = "down";
            } else {
                movement = "🟢";
                same = isSameDirectionMovement(movement, previousMovementDirection);
                up++;
                previousMovementDirection = "up";
            }

            const difference = newValue - currentValue;

            if (same) {
                summaryMovement = summaryMovement + Math.abs(difference);
                setSummary(maximumSummaryMovement.toFixed(4));
                if (summaryMovement > maximumSummaryMovement) {
                    maximumSummaryMovement = summaryMovement;
                    setMaxSummary(maximumSummaryMovement.toFixed(4));
                }
            } else {
                summaryMovement = 0;
                setSummary(0);
            }

            if (Math.abs(difference) > maximumMovement || maximumMovement > 60) {
                maximumMovement = Math.abs(difference);
                setMax(maximumSummaryMovement.toFixed(4));
            }

            currentValue = newValue;

            const buyValue = localStorage.getItem("buyValue") ? parseFloat(localStorage.getItem("buyValue")) : 0.2;

            if (localStorage.getItem("canBuy") == 'true') {
                if ((summaryMovement.toFixed(4) >= buyValue || maximumMovement.toFixed(4) >= buyValue) && previousMovementDirection === "down") {
                    buy();
                    maximumMovement = 0;
                    new Notification("buy by " + currentValue,{
                        body: "buy",
                        silent: false,
                    });
                }
            }

            if (up >= 0 || down >= 10){
                up = 0;
                down = 0;
            }

        }
    })
})



const obserber = new MutationObserver((mutations => ) => {
    mutations.forEach(mutations => {
        const price = document.querySelector(
            "div[class*= 'src-containers-Animated-styles-clickable-1VhfN src-containers-Animated-styles-defaultHighlighted'], " +
            "div[class*= 'scr-containers-Animated-styles-clickable-1VhfN src-containers-Animated-styles-loss'], " +
            "div[class*= 'src-containers-Animated-styles-clickable-1VhfN src-containers-Animated-styles-profit']");

        if (price && !loaded){
            buyButton = document.querySelector(".pro-button.pro-fill.pro-intent-succes");
            sellButton = document.querySelector(".pro-button.pro-fill.pro-intent-danger");

            if (sellButton && buyButton) {
                obserber.disconnect();
                loaded = true;
                drawPanel();
                priceObservers.observe(price, priceOptions);
            }
        }
    })
})

obserber.observe(document.body , options);

function isSameDirectionMovement(movement, previousMovementDirection) {
    if (movement === "🔴" && previousMovementDirection === "down"){
        return true;
    }
    if (movement === "🟢" && previousMovementDirection === "up"){
        return true;
    }

    return false;
}

setInterval(() => {
    location.reload()
}, 1000*60*15)

function buy () {
    buyButton.click();
    localStorage.setItem("canBuy" , 'false');
}

function sell () {
    sellButton.click();
    localStorage.setItem("canSell" , 'false');
}

function drawPanel () {

    if (document.querySelector("#root .panel")) {
        return
    }

    const panel = document.createElement("DIV");
    panel.setAttribute("class" , "panel");
    document.querySelector("#root").appendChild(panel);
    drawBuyManagement(panel);
    drawSellManagement(panel);
    drawAmountInput(panel);
    drawValue(panel);
}

function drawBuyManagement (panel) {
    let canBuy = localStorage.getItem("canBuy");
    const label = document.createElement("label");
    label.setAttribute("class" , "management");
    const input = document.createElement("input");
    input.setAttribute("type" , "checkbox");
    input.setAttribute("class" , "buy");
    const span = document.createElement("span");
    span.innerText = "Can Buy";

    panel.appendChild(label);
    label.appendChild(input);
    label.appendChild(span);

    if (canBuy === 'true') {
        input.setAttribute("checked",  "checked")
    }

    input.addEventListener("click" , () => {
        canBuy ? input.setAttribute("checked" , "checked") : input.removeAttribute("checked");
        const newValue = canBuy === 'true' ? canBuy = 'false' : canBuy = 'true';
        localStorage.setItem("canBuy" , newValue)
    })
}

function drawSellManagement (panel) {
    let canSell = localStorage.getItem("canSell");
    const label = document.createElement("label");
    label.setAttribute("class" , "management");
    const input = document.createElement("input");
    input.setAttribute("type" , "checkbox");
    input.setAttribute("class" , "buy");
    const span = document.createElement("Sell");
    span.innerText = "Can Sell";

    panel.appendChild(label);
    label.appendChild(input);
    label.appendChild(span);

    if (canBuy === 'true') {
        input.setAttribute("checked" , "checked")
    }

    input.addEventListener("click", () => {
        canBuy ? input.setAttribute("checked" , "checked") : input.removeAttribute("checked");
        const newValue = canSell === 'true' ? canBuy = 'false' : canBuy = 'true';
        localStorage.setItem("canSell" , newValue)
    })
}

function drawAmountInput (panel) {
    const label = document.createElement("label");
    label.setAttribute("class" , "manegement");
    const input = document.createElement(input);
    input.setAttribute("type" , "number");
    input.setAttribute("min" , "0.0025");
    input.setAttribute("value" , localStorage.getItem("buyValue") ? localStorage.getItem("buyValue") : 0.2);
    input.setAttribute("step" , "0.0025");
    panel.appendChild(label);
    label.appendChild(input);
    input.addEventListener("change" , (e : Event ) => {
        localStorage.setItem("buyValue", e.target.value);
    })
}

function drawValue (panel) {
    const summary = document.createElement("div");
    summary.setAttribute("class" , "summary");
    summary.innerHTML = "Summary now <span class='movement'></span>";

    const maxSummary = document.createElement("div");
    maxSummary.setAttribute("class" , "max");
    maxSummary.innerHTML = "Max summary on session <span class='movement'></span>";

    const historicalMax = document.createElement("div");
    historicalMax.setAttribute("class" , "historicalMax");
    historicalMax.innerHTML = "History max <span class='movement'>0</span> <button cclass='reset' type='button'> ☑️ </button>";

    panel.appendChild(summary);
    panel.appendChild(max);
    panel.appendChild(maxSummary);
    panel.appendChild(historicalMax);

    document.querySelector("button.reset").addEventListener("clicl" , () => {
        localStorage.setItem("historicalMax", "0");
        document.querySelector(".historicalMax .movement").innerHTML = '0';
    })
}

function setMax (value) {
    document.querySelector(".max .movement").innerHTML = value;
    setHistoricalMaximum(value);
}

function setHistoricalMaximum (value) {

    if (parseFloat(value) > 60) {
        return;
    }

    const current = localStorage.getItem("historicalMax");
    document.querySelector(".historicalMax .movement").innerHTML = current;

    if (current) {
        if (parseFloat(current) < parseFloat(value)) {
            localStorage.setItem("historycalMax" , value)
            document.querySelector(".historicalMax .movement").innerHTML = value;
        }
    } else {
        localStorage.setItem("historycalMax", value)
        document.querySelector(".historicalMax .movement").innerHTML = value;
    }
}

function setSummary (value) {
    document.querySelector(".summary .movement").innerHTML = value;
}

function setMaxSummary (value) {
    document.querySelector(".maxSummaty .movement").innerHTML = value;
    setHistoricalMaximum(value);
}