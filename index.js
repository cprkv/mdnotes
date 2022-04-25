#!/usr/bin/env node

const express = require("express");
const filepath = require("path");
const config = require("easy-config");
const files = require("./files");
console.log("config:", config);

const app = express();

app.set("view engine", "pug");
app.set("views", filepath.join(__dirname, "views"));

app.use(express.static(filepath.join(__dirname, "static")));

app.get("/", (req, res) => {
  const params = { tree: files.tree() };
  if (req.query.p) {
    params.content = files.read(req.query.p);
  }
  res.render("view-note", params);
});

app.get("/edit", (req, res) => {
  const params = { tree: files.tree() };
  if (req.query.p) {
    params.content = files.read(req.query.p);
    params.path = req.query.p;
  }
  res.render("view-editor", params);
});

app.listen(config.listen, () => {
  console.log(`mdnotes listening on http://localhost:${config.listen}`);
});
