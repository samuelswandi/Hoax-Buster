const https = require("https");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.LINE_ACCESS_TOKEN;
const fetch = require("node-fetch");
const mongoose = require('mongoose');
const connection_url = "mongodb+srv://admin:admin@cluster0.obsor.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const dbInit = require('./dbModel.js')


app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

mongoose.connect(connection_url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
})

mongoose.connection.once('open', () => { console.log('MongoDB Connected'); });
mongoose.connection.on('error', (err) => { console.log('MongoDB connection error: ', err); });


const getData = async (Google_URL) => {
  try {
    const response = await fetch(Google_URL);
    const data = await response.json();
    const rating = data.claims[0].claimReview[0].textualRating;
    const url = data.claims[0].claimReview[0].url;
    const claimant = data.claims[0].claimant;
    const text = data.claims[0].text
    return { rating, url, claimant, text };
  } catch (err) {
    return { rating: "", url: "", claimant: "", text: "" };
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
    var reply = ""

    if (textInput.slice(0, 8) === "/cekhoax") {

      var sendToGoogle = {
        query: textInput.slice(9),
        key: "AIzaSyAEiE1lYgFP5ZZ_vDba0moCJ_5v8hrvSe8",
      };

      var esc = encodeURIComponent;
      var query = Object.keys(sendToGoogle)
        .map((k) => esc(k) + "=" + esc(sendToGoogle[k]))
        .join("&");

      const URL = "https://factchecktools.googleapis.com/v1alpha1/claims:search?";
      var Google_URL = URL + query;

      let { rating, url, claimant, text } = await getData(Google_URL)
      if (rating === "") {
        reply = "Maaf, kata kunci yang anda masukkan tidak dapat ditemukan"
      } else {
        reply = `|| Hasil Pengecekan ||
Claim dari : ${claimant}
Topik : ${text}
Keputusan : ${rating}
Link : ${url}`
      }

    } else if (textInput === "/help") {
      reply = `HELP
"/initstatus [NIM]"
Untuk mengetahui data mahasiswa Init, status covid dan status vaksin
contoh: "/initstatus 13520134"

"/cekhoax [Informasi]"
Untuk memeriksa fakta suatu informasi, silakan langsung ketik "/cekhoax" serta informasi yang ingin diperiksa menggunakan bahasa inggris
      
contoh: "/cekhoax covid is human-made"`
    } else if (textInput === "/grace") {

      reply = "I LOVE U GRACEEEEE -sem" // mmf ya gais bucin :D

    } else if (textInput === '/eagan') {

      reply = 'bernigen doppleganger + orang tolol' // maaf ya gais

    } else if (textInput.slice(0, 11) === '/initstatus') {

      var nim = textInput.splice(12)
      
      await dbInit.find((err, data) => {
        var index = data.findIndex( (element) => element.Nim == nim)
        if (index == -1) { return null }
        if (err) {
            reply = "NIM yang anda masukkan salah"
        } else {
            reply = (data[index]);
        }
      });

    } else if (textInput[0] === "/") {

      reply = "Command yang anda masukkan salah, silahkan ketik '/help' untuk mengetahui command yang tersedia"

    } else {
      reply = `Halo, Hoax Buster adalah bot yang siap memeriksa kebenaran dari informasi yang ingin anda periksa.

Saat ini, mohon untuk mencari fakta yang berhubungn dengan covid agar hasil yang didapatkan lebih relevan

Untuk mengetahui cara penggunaan bot ini, silakan ketik "/help" `
    }

    // Message data, must be stringified
    const dataString = JSON.stringify({
      replyToken: req.body.events[0].replyToken,
      messages: [
        {
          type: "text",
          text: reply
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
