const filepath = require("path");
const moment = require("moment");
const fs = require("fs");

function* getFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  console.log("getting files...", dirents);
  for (const dirent of dirents) {
    const res = filepath.resolve(dir, dirent.name);

    if (dirent.isDirectory()) {
      yield { name: dirent.name, type: 'dir', entries: [...getFiles(res)] };
    } else {
      yield { name: dirent.name, type: 'file', path: res };
    }
  }
}

class Files {
  constructor(storagePath) {
    this.storagePath = storagePath;
  }

  tree() {
    return [...getFiles(this.storagePath)];
  }

  read(path) {
    try {
      return { result: fs.readFileSync(path, "utf-8") };
    } catch (error) {
      return { error };
    }
  }

  save(path, content) {
    try {
      fs.writeFileSync(path, content);
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
    if (!this.cached || this.cachedTime.isBefore(this.cacheInvalidAfter)) {
      this.cached = createAction();
      // console.log("no cache. creating:", this.cached);
      this.cachedTime = moment();
      this.cacheInvalidAfter = moment(this.cachedTime).add(this.cacheTTL);
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
  constructor(storagePath, ttl) {
    super(storagePath);
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
}

const storagePath = filepath.join(__dirname, "storage");
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath);
}

module.exports = new FilesCached(storagePath, moment.duration({ minutes: 5 }));
