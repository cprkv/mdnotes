#!/usr/bin/env node

const express = require("express");
const bodyParser = require("body-parser");
const filepath = require("path");
const config = require("easy-config");
const files = require("./files");
console.log("config:", config);

const app = express();

app.use(bodyParser.json());
app.use(express.static(filepath.join(__dirname, "static")));

app.set("view engine", "pug");
app.set("views", filepath.join(__dirname, "views"));

app.get("/", (req, res) => {
  const path = req.query.p;
  const params = { tree: files.tree() };
  if (path) {
    params.content = files.read(path);
    params.path = path;
  }
  res.render("view-note", params);
});

app.get("/edit", (req, res) => {
  const path = req.query.p;
  const params = { tree: files.tree() };
  if (path) {
    params.content = files.read(path);
    params.path = path;
  }
  res.render("view-editor", params);
});

app.put("/edit", (req, res) => {
  console.log("saving request");
  const content = req.body.content;
  const path = req.query.p;
  if (!content) {
    return res.status(400).json({ error: "content missing in request body" });
  }
  if (!path) {
    return res.status(400).json({ error: "path missing in request query" });
  }
  const { error } = files.save(path, content);
  if (error) {
    return res.status(500).json({ error });
  }
  res.status(200).json({});
});

app.post("/dirs", (req, res) => {
  console.log("creating dir");
  const name = req.body.name;
  const path = req.query.p;
  if (!name) {
    return res.status(400).json({ error: "name missing in request body" });
  }
  if (!path) {
    return res.status(400).json({ error: "path missing in request query" });
  }
  const { error } = files.createDir(path, name);
  if (error) {
    return res.status(500).json({ error });
  }
  res.status(200).json({});
});

app.post("/files", (req, res) => {
  console.log("creating file");
  const name = req.body.name;
  const path = req.query.p;
  if (!name) {
    return res.status(400).json({ error: "name missing in request body" });
  }
  if (!path) {
    return res.status(400).json({ error: "path missing in request query" });
  }
  const { error } = files.createFile(path, name);
  if (error) {
    return res.status(500).json({ error });
  }
  res.status(200).json({});
});


app.listen(config.listen, () => {
  console.log(`mdnotes listening on http://localhost:${config.listen}`);
});
