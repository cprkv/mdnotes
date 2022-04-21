const express = require("express");
const config = require("easy-config");
const files = require("./files");
console.log("config:", config);

const app = express();
app.set("view engine", "pug");

app.get("/", (req, res) => {
  const tree = files.tree();
  console.log("tree:", tree);
  res.render("index", { tree });
});

app.listen(config.listen, () => {
  console.log(`mdnotes listening on http://localhost:${config.listen}`);
});
