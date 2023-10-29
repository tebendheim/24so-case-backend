const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 3000;

const origins = ["http://localhost:3001"];

app.use(
  cors({
    origin: origins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);
app.use(bodyParser.json());

const db = require("./db/db");

function log(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

const attendee = require("./services/attendee");
const participate = require("./services/participate");
const event = require("./services/event");

app.use(log);

app.get("/test", (req, res) => {
  res.json({ "dette funker fjell": "ja" });
});

app.use("/attendee", attendee);
app.use("/participate", participate);
app.use("/event", event);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => console.log(`Server listening on ${port}`));
