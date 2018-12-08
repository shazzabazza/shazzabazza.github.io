// ETH DATE TIME FIAT
const baseURL = "https://min-api.cryptocompare.com/data/histohour?";

// listens for click on submit, then starts to assembleQueryURL for api request
document.addEventListener("submit", assembleQueryURL);

function assembleQueryURL(x) {
  //event(e) not x

  x.preventDefault(); //stops default action of submit form

  //calls function getValues(), assigns all values to neededValues forAPI object to be used for makeQueryURL function
  const dateValue = getValues();
  const finalTimeValue = convertTimeUNIX(dateValue.rawDate, dateValue.rawTime);
  const finalQueryURL = makeQueryURL(
    baseURL,
    dateValue.coin,
    dateValue.fiat,
    finalTimeValue
  );
  const URLandValues = {
    dateTimeValue: dateValue, 
    UNIXTimeValue: finalTimeValue, 
    masterURL: finalQueryURL
  }

  sendFetchRequest(finalQueryURL);

  return URLandValues;
}

function getValues() {
  //gets all values needed from form to make API URL and returns
  let allValues = {
    rawTime: document.getElementById("timeSelect").value,
    coin: document.getElementById("coinSelect").value,
    rawDate: document.getElementById("dateSelect").value,
    fiat: document.getElementById("fiatSelect").value
  };

  console.log(allValues);
  return allValues;
}

// rounding time to nearest hour better naming
function roundingToNearestHour(timeMs) {
  console.log("roundingToNearestHour - start", new Date(timeMs));
  let oneSecond = 1000;
  let oneMinute = 60 * oneSecond;
  let oneHour = 60 * oneMinute;
  let date = new Date(timeMs);

  if (date.getMinutes() >= 30) {
    const convertedTime = timeMs + oneHour;
    console.log(
      "roundingToNearestHour - end - rounded",
      new Date(convertedTime)
    );

    return convertedTime;
  } else {
    console.log("roundingToNearestHour - end", new Date(timeMs));

    return timeMs;
  }
}

function convertTimeUNIX(date, time) {
  //converts time to UNIX
  const dateStringToParse = `${date} ${time}:00 UTC`;
  console.log("dateStringToParse", dateStringToParse);

  let unixTimeMS = roundingToNearestHour(Date.parse(dateStringToParse));
  let unixTimeSeconds = unixTimeMS / 1000;

  console.log(unixTimeSeconds);
  return Math.floor(unixTimeSeconds);
}

function makeQueryURL(baseURL, coin, fiat, time) {
  //pass in an object with properties that refelct arg
  //assemble the full URL
  //base URL for api
    const queryURL =
    baseURL + "&fsym=" + coin + "&tsym=" + fiat + "&toTs=" + time + "&limit=1";
  
  console.log(queryURL);
  return queryURL;
}

function sendFetchRequest(URL) {
  fetch(URL)
    .then(function(response) {
      //default to arrow function
      return response.json();
    })

    .then(function(acculmulate) {
      const acculmulatedValue = acculmulate.Data.reduce(
        function (prev, next) {
          prev.close += next.close;
          prev.high += next.high;
          prev.low += next.low;
          prev.open += next.open;
          prev.volumefrom += next.volumefrom;
          prev.volumeto += next.volumeto;

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
      // Read up on Array.prototype. (map, filter, reduce)

      //imperative -> make declarative
      // for (let i = 0; i < acculmulate.Data.length; i++) {
      //   const item = acculmulate.Data[i];
      //   acculmulatedValue.close += item.close;
      //   acculmulatedValue.high += item.high;
      //   acculmulatedValue.low += item.low;
      //   acculmulatedValue.open += item.open;
      //   acculmulatedValue.volumefrom += item.volumefrom;
      //   acculmulatedValue.volumeto += item.volumeto;
      // }
      //explain why you're dividing by 2
      acculmulatedValue.close = acculmulatedValue.close / 2;
      acculmulatedValue.high = acculmulatedValue.high / 2;
      acculmulatedValue.low = acculmulatedValue.low / 2;
      acculmulatedValue.open = acculmulatedValue.open / 2;
      acculmulatedValue.volumefrom = acculmulatedValue.volumefrom / 2;
      acculmulatedValue.volumeto = acculmulatedValue.volumeto / 2;

      console.log(acculmulatedValue);
      return acculmulatedValue;
    })
    .then(function(display) {
      const resultClose = document.getElementById("closeResult");
      const resultHigh = document.getElementById("highResult");
      const resultLow = document.getElementById("lowResult");
      const resultOpen = document.getElementById("openResult");

      resultClose.textContent = "Close: " + display.close;
      resultHigh.textContent = "High: " + display.high;
      resultLow.textContent = "Low: " + display.low;
      resultOpen.textContent = "Open: " + display.open;
    });
}
