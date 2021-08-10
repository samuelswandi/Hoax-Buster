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

const getData = async (Google_URL) => {
  try {
    const response = await fetch(Google_URL);
    const data = await response.json();
    const rating = data.claims[0].claimReview[0].textualRating;
    const url = data.claims[0].claimReview[0].url;
    // const rating2 = data.claims[1].claimReview[0].textualRating;
    // const url2 = data.claims[1].claimReview[0].url;
    // const rating3 = data.claims[2].claimReview[0].textualRating;
    // const url3 = data.claims[2].claimReview[0].url;
    return { rating,url };
  } catch (err) {
    return { rating: "Kata kunci anda tidak dapat ditemukan", url: ""};
  }
};

app.get("/", (req, res) => {
  res.sendStatus(200);
});


app.post("/webhook", async function (req, res) {
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

    // let { rating1, rating2, rating3, url1, url2, url3 } = await getData(Google_URL)
    let { rating, url } = await getData(Google_URL)

    // console.log(rating1, rating2, rating3, url1, url2, url3)

    // Message data, must be stringified
    const dataString = JSON.stringify({
      replyToken: req.body.events[0].replyToken,
      messages: [
        {
          type: "text",
          text: rating + " " + url
            // ? rating1 +
            //   " " +
            //   url1 +
            //   "\n" +
            //   rating2 +
            //   " " +
            //   url2 +
            //   "\n" +
            //   rating3 +
            //   " " +
            //   url3 +
            //   "\n"
            // : "Kata kunci anda tidak dapat ditemukan.",
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