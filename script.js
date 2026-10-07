const viewsInput = document.getElementById("monthlyviews-input");
const platformInput = document.getElementById("platform");
const calculateButton = document.getElementById("calculate-button");
const estimate = document.getElementById("estimate");
const yearly_estimate = document.getElementById("yearly-estimate");
const currencyInput = document.getElementById("currency");

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


setTimeout(displayUpdateTimestamp, 1500);

function calculate(){
    updateExchangeRates();
    const rate = exchangeRates[currencyInput.value];
    const views = Number(viewsInput.value);
    const platform = platformInput.value;

    const range = rpmRanges[platform];

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
})

currencyInput.addEventListener("change", function() {
    calculate();
})


