const express = require("express");
const config = require("easy-config");
console.log("config:", config);

const app = express();
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("index", {});
});

app.listen(config.listen, () => {
  console.log(`mdnotes listening on http://localhost:${config.listen}`);
});
