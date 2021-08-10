const https = require("https");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.LINE_ACCESS_TOKEN;
const fetch = require("node-fetch");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.sendStatus(200);
});

const getData = async (Google_URL) => {
  console.log(Google_URL)
  try {
    const response = await fetch(Google_URL);
    const data = await response.json();
    console.log(data)
    console.log(typeof(data))
    const rating = data.claims[0].claimReview[0].textualRating;
    const url = data.claims[0].claimsReview[0].url;
    return { rating, url };
  } catch (err) {
    console.log(err)
    console.log("MASUK ERROR")
    return { rating: "Error", url: "Error" };
  }
};

app.post("/webhook", function (req, res) {
  res.send("HTTP POST request sent to the webhook URL!");
  // If the user sends a message to your bot, send a reply message
  if (req.body.events[0].type === "message") {
    var textInput = req.body.events[0].message.text;

    var sendToGoogle = {
      query: textInput,
      key: "AIzaSyAEiE1lYgFP5ZZ_vDba0moCJ_5v8hrvSe8",
    };

    var esc = encodeURIComponent;
    var query = Object.keys(sendToGoogle)
      .map((k) => esc(k) + "=" + esc(sendToGoogle[k]))
      .join("&");

    const URL = "https://factchecktools.googleapis.com/v1alpha1/claims:search?";
    var Google_URL = URL + query;

    let { rating, url } = getData(Google_URL);

    console.log('MASUK SINI')
    console.log(rating,url)


    // Message data, must be stringified
    const dataString = JSON.stringify({
      replyToken: req.body.events[0].replyToken,
      messages: [
        {
          type: "text",
          text: "HALOOW"
        },
      ],
    });

    // Request header
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    };

    // Options to pass into the request
    const webhookOptions = {
      hostname: "api.line.me",
      path: "/v2/bot/message/reply",
      method: "POST",
      headers: headers,
      body: dataString,
    };

    // Define request
    const request = https.request(webhookOptions, (res) => {
      res.on("data", (d) => {
        process.stdout.write(d);
      });
    });

    // Handle error
    request.on("error", (err) => {
      console.error(err);
    });

    // Send data
    request.write(dataString);
    request.end();
  }
});

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});