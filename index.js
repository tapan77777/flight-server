const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

let token = null;

async function getAccessToken() {
  const response = await axios.post("https://test.api.amadeus.com/v1/security/oauth2/token", new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.AMADEUS_CLIENT_ID,
    client_secret: process.env.AMADEUS_CLIENT_SECRET
  }));

  token = response.data.access_token;
}

app.get("/", async (req, res) => {
  const { from, to, date } = req.query;

  if (!token) await getAccessToken();

  try {
    const response = await axios.get("https://test.api.amadeus.com/v2/shopping/flight-offers", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        originLocationCode: from,
        destinationLocationCode: to,
        departureDate: date,
        adults: 1,
        max: 1
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Error fetching flights" });
  }
});

app.listen(3001, () => console.log("✅ Backend running on port 3001"));
//connected
module.exports = app;
