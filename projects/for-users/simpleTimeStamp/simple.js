// listens for click on submit, then starts to assembleQueryURL for api request
document.addEventListener("submit", getHistogramValues);
function getHistogramValues(e) {
  e.preventDefault(); //stops default action of submit form

  const priceCheckInputs = getPriceCheckInputsFromUser();
  const timeUnixSec = convertTimeToUnix(priceCheckInputs.date, priceCheckInputs.time);

  // ETH DATE TIME FIAT
  const baseURL = "https://min-api.cryptocompare.com/data/histohour?";
  const histogramUrl = makeFullHistogramUrl(
    baseURL,
    { coin, fiat, timeUnixSec }
  );

  const histogramResponse = sendFetchRequest(histogramUrl);
  const averagedHistogram = averageHistogramValues(histogramResponse)
  displayHistogram(averagedHistogram)
}

/**
 * Fetch the required user inputs from the DOM
 * that are needed to perform a histogram request
 * @returns time: HH:MM:SS, coin: string, date: DD:MM:YYYY, fiat: string
 */
function getPriceCheckInputsFromUser() {
  //gets all values needed from form to make API URL and returns
  return {
    time: document.getElementById("timeSelect").value,
    coin: document.getElementById("coinSelect").value,
    date: document.getElementById("dateSelect").value,
    fiat: document.getElementById("fiatSelect").value
  };
}

// rounding time to nearest hour better naming
function roundToNearestHour(timeMs) {
  const oneSecond = 1000;
  const oneMinute = 60 * oneSecond;
  const oneHour = 60 * oneMinute;
  const date = new Date(timeMs);

  if (date.getMinutes() >= 30) {
    const convertedTime = timeMs + oneHour;
    return convertedTime;
  } else {
    return timeMs;
  }
}


/**
 * Convert a date and time string into unix time(seconds)
 * @param {*} date DD:MM:YYY
 * @param {*} time HH:MM:SS
 * @returns Unix time in seconds
 */
function convertTimeToUnix(date, time) {
  //converts time to UNIX
  const dateStringToParse = `${date} ${time}:00 UTC`;
  const unixTimeMS = roundToNearestHour(Date.parse(dateStringToParse));
  const unixTimeSeconds = unixTimeMS / 1000;

  return Math.floor(unixTimeSeconds);
}


/**
 * Make a histogram url given the baseurl and url parameters
 * @param {string} baseURL 
 * @param {*} urlParams Query parameters for the request
 */
function makeFullHistogramUrl(baseURL, { coin, fiat, timeUnixSec }) {
  return `${baseURL}&fsym=${coin}&tsym=${fiat}&toTs=${timeUnixSec}&limit=1`;
}

function sendFetchRequest(url) {
  return fetch(url)
    .then(response => response.json)
}

function averageHistogramValues(jsonResponsePromise) {
  return jsonResponsePromise.then(histogram => {
    const totalValue = histogram.Data.reduce(
      (prev, next) => {
        Object.keys(prev).forEach(key => {
          prev[key] += next[key]
        })
        return prev;
      },
      {
        close: 0,
        high: 0,
        low: 0,
        open: 0,
        volumefrom: 0,
        volumeto: 0
      }
    );

    const averagedValues = {}
    Object.keys(totalValue).forEach(key => {
      averagedValues[key] = totalValue[key] / histogram.Data.length;
    })

    return averagedValues;
  })
}

function displayHistogram(averagedValuesPromise) {
  averagedValuesPromise.then(averagedValues => {
    const closeResultNode = document.getElementById("closeResult");
    const highResultNode = document.getElementById("highResult");
    const lowResultNode = document.getElementById("lowResult");
    const openResultNode = document.getElementById("openResult");

    const { close, high, low, open } = averagedValues
    closeResultNode.textContent = `Close: ${close}`;
    highResultNode.textContent = `High: ${high}`;
    lowResultNode.textContent = `Low: ${low}`;
    openResultNode.textContent = `Open: ${open}`;
  });
}