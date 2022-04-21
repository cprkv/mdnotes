#!/usr/bin/env node

const express = require("express");
const filepath = require("path");
const config = require("easy-config");
const files = require("./files");
console.log("config:", config);

const app = express();
app.set("view engine", "pug");
app.set("views", filepath.join(__dirname, "views"));

app.get("/", (req, res) => {
  const params = { tree: files.tree() };
  if (req.query.p) {
    params.content = files.read(req.query.p);
  }
  res.render("index", params);
});

app.listen(config.listen, () => {
  console.log(`mdnotes listening on http://localhost:${config.listen}`);
});
