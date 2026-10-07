const viewsInput = document.getElementById("monthlyviews-input");
const platformInput = document.getElementById("platform");
const calculateButton = document.getElementById("calculate-button");
const estimate = document.getElementById("estimate");
const yearly_estimate = document.getElementById("yearly-estimate");
const currencyInput = document.getElementById("currency");
const rpmInput = document.getElementById("RPM-input");
const revenue_section = document.getElementById("custom-revenue");
const inputs = document.querySelectorAll("input, select");
const rpm_radio = document.querySelectorAll('input[name="rpm-radio"]');


let rpmMode = "platforms"

const rpmRanges = {
    youtube: {
        low: 1.00,
        average: 4.00,
        high: 12.00
    },

    youtube_shorts: {
        low: 0.01,
        average: 0.04,
        high: 0.08
    },

    tiktok: {
        low: 0.20,
        average: 0.50,
        high: 1.00
    },

    twitch_ads: {
        low: 1.50,
        average: 3.50,
        high: 6.00
    },

    facebook_instream: {
        low: 0.50,
        average: 1.50,
        high: 4.00
    },

    x_revenue: {
        low: 0.05,
        average: 0.15,
        high: 0.50
    },
};


const platformColorSchemes = {
    default: {
        mainColor: "#2e6fac",
        secondaryColor: "#275c8d"
    },

    youtube: {
        mainColor: "#FF0000",
        secondaryColor: "#FF0000"
    },
    youtube_shorts: {
        mainColor: "#ff1b0a",
        secondaryColor: "#FF0000"
    },
    tiktok: {
        mainColor: "#FE2C55",
        secondaryColor: "#25F4EE"
    },
    twitch_ads: {
        mainColor: "#9146FF",
        secondaryColor: "#a844eb"
    },
    facebook_instream: {
        mainColor: "#1877F2",
        secondaryColor: "#1877F2"
    },
    x_revenue: {
        mainColor: "#000000",
        secondaryColor: "#000000"
    }
}

let lastUpdatedDate = "";
let exchangeRates = {
    USD: 1,
    EUR: 0.86,
    GBP: 0.75,
    EGP: 48.5,
    SAR: 3.75,
    AED: 3.67,
    CAD: 1.38,
    AUD: 1.51
};

async function updateExchangeRates() {
    try {

        const targetCurrencies = Object.keys(exchangeRates)
            .filter(currency => currency !== "USD")
            .join(",");

        const response = await fetch(
            `https://api.frankfurter.dev/v2/rates?base=USD&quotes=${targetCurrencies}`
        );

        if (!response.ok) {
            throw new Error("Network response failed");
        }


        const data = await response.json();



    if (data.length > 0) {
        lastUpdatedDate = data[0].date; 
      
        for (const item of data) {
            exchangeRates[item.quote] = item.rate;
        }

    }

        exchangeRates.USD = 1;

        console.log(
            "Live exchange rates updated:",
            exchangeRates
        );

    } catch (error) {

        console.error(
            "Failed to fetch live rates. Using fallback rates.",
            error
        );
    }
}

updateExchangeRates();

function displayUpdateTimestamp() {
    const statusElement = document.getElementById('exchange-time');
    statusElement.innerHTML = `Currency rates updated as of: <span style="color: rgb(38, 94, 146); font-weight: bold;">${lastUpdatedDate}</span> <h5>(Updated daily ~16:00 CET)</h5>`;
    console.log(lastUpdatedDate);
}


const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short'
});

setTimeout(displayUpdateTimestamp, 1500);

function calculate(){
    const rate = exchangeRates[currencyInput.value];
    const views = Number(viewsInput.value);
    const platform = platformInput.value;

    let range;

    if (rpmMode === "custom") {

        range = {
            low: Number(document.getElementById("monthly-low-input").value),
            average: Number(document.getElementById("estimate-input").value),
            high: Number(document.getElementById("monthly-low-input").value)
        };

    } else {

        range = rpmRanges[platform];

    }

    const lowRevenue = (views / 1000) * range.low;
    const averageRevenue = (views / 1000) * range.average;
    const highRevenue = (views / 1000) * range.high;

    const lowYearly = lowRevenue * 12;
    const averageYearly = averageRevenue * 12;
    const highYearly = highRevenue * 12;


    const convertedLow = lowRevenue * rate;
    const convertedAverage = averageRevenue * rate;
    const convertedHigh = highRevenue * rate;

    const convertedYearlyLow = lowYearly * rate;
    const convertedYearlyAverage = averageYearly * rate;
    const convertedYearlyHigh = highYearly * rate;

    const money = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyInput.value
    });


    document.getElementById("inputted-views").innerText = `${compactFormatter.format(views)} views`;

    document.getElementById("monthly-low").textContent = money.format(convertedLow);

    document.getElementById("estimate").textContent = money.format(convertedAverage);

    document.getElementById("monthly-high").textContent = money.format(convertedHigh);

    document.getElementById("yearly-low").textContent = money.format(convertedYearlyLow);

    document.getElementById("yearly-estimate").textContent = money.format(convertedYearlyAverage);

    document.getElementById("yearly-high").textContent = money.format(convertedYearlyHigh);
}

calculateButton.addEventListener("click", function () {
    calculate();
});


platformInput.addEventListener("change", function() {
    calculate();
    changeSchemeColor();
})

currencyInput.addEventListener("change", function() {
    calculate();
})

rpm_radio.forEach(function(radio) {
    radio.addEventListener("change", function() {
        changeRPMmode(this.value);
    });
});

function changeSchemeColor(){
    const platform = platformInput.value;
    
    let mainColor;
    let secondaryColor;

    if (rpmMode === "custom"){
        mainColor = platformColorSchemes["default"].mainColor;
        secondaryColor = platformColorSchemes["default"].secondaryColor;
    } else {
        mainColor = platformColorSchemes[platform].mainColor;
        secondaryColor = platformColorSchemes[platform].secondaryColor;
    }

    document.getElementById("TopHeader").style.backgroundColor = mainColor;
    calculateButton.style.backgroundColor = secondaryColor;

    inputs.forEach(input => {
        input.dataset.focusColor = secondaryColor;
    });
}


function changeRPMmode(mode){
    if (mode == "custom"){
        revenue_section.style.display = "grid";
        platformInput.disabled = true;
        calculate();
    }else{
        revenue_section.style.display = "none";
        platformInput.disabled = false;
        calculate();
    }
    rpmMode = mode;
    changeSchemeColor();
}

changeSchemeColor();
