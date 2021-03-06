const filepath = require("path");
const moment = require("moment");
const fs = require("fs");
const config = require("easy-config");

const storagePath = filepath.resolve(config.storage);

function* getFilesInner(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });

  for (const dirent of dirents) {
    const res = filepath.resolve(dir, dirent.name);

    if (dirent.isDirectory()) {
      const name = dirent.name;
      const type = "dir";
      const path = res
        .substring(storagePath.length + 1) // trim prefix
        .replace(new RegExp("\\" + filepath.sep, "g"), "/"); // replace windows \ to normal web /
      const entries = [...getFilesInner(res)];
      yield { name, type, path, entries };
    } else if (dirent.name.endsWith(".md")) {
      const name = filepath.parse(dirent.name).name;
      const type = "file";
      const path = res
        .substring(storagePath.length + 1) // trim prefix
        .replace(new RegExp("\\" + filepath.sep, "g"), "/"); // replace windows \ to normal web /
      yield { name, type, path };
    }
  }
}

function* getFiles(dir) {
  const name = "/";
  const type = "dir";
  const entries = [...getFilesInner(dir)];
  yield { name, type, entries, path: "./" };
}

class Files {
  tree() {
    return [...getFiles(storagePath)];
  }

  read(path) {
    try {
      const fullPath = filepath.join(storagePath, path);
      return { result: fs.readFileSync(fullPath, "utf-8") };
    } catch (error) {
      return { error };
    }
  }

  save(path, content) {
    try {
      const fullPath = filepath.join(storagePath, path);
      fs.writeFileSync(fullPath, content);
      return { result: "ok" };
    } catch (error) {
      return { error };
    }
  }

  createDir(path, name) {
    try {
      const fullPath = filepath.join(storagePath, path, name);
      fs.mkdirSync(fullPath);
      return { result: "ok" };
    } catch (error) {
      return { error };
    }
  }

  createFile(path, name) {
    try {
      const realName = name.endsWith(".md") ? name : name + ".md";
      const fullPath = filepath.join(storagePath, path, realName);
      const content = `# ${name}\n\n`;
      fs.writeFileSync(fullPath, content);
      return { result: "ok" };
    } catch (error) {
      return { error };
    }
  }
}

class Cached {
  constructor(ttl) {
    this.ttl = ttl;
  }

  get(createAction) {
    const now = moment();
    if (!this.cached || now.isAfter(this.cacheInvalidAfter)) {
      this.cached = createAction();
      console.log("refreshing cache");
      this.cachedTime = now;
      this.cacheInvalidAfter = moment(this.cachedTime).add(this.ttl);
    } else {
      // console.log("retriving value from cache:", this.cached);
    }
    return this.cached;
  }

  clear() {
    this.cached = null;
  }
}

class FilesCached extends Files {
  constructor(ttl) {
    super();
    this.cachedTree = new Cached(ttl);
  }

  tree() {
    return this.cachedTree.get(() => super.tree());
  }

  save(path, content) {
    const res = super.save(path, content);
    this.cachedTree.clear();
    return res;
  }

  createDir(path, name) {
    const res = super.createDir(path, name);
    this.cachedTree.clear();
    return res;
  }

  createFile(path, name) {
    const res = super.createFile(path, name);
    this.cachedTree.clear();
    return res;
  }
}

if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath);
}

module.exports = new FilesCached(moment.duration({ minutes: 5 }));
