const filepath = require("path");
const moment = require("moment");
const fs = require("fs");

function* getFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = filepath.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

class Files {
  constructor(storagePath) {
    self.storagePath = storagePath;
  }

  files() {
    return getFiles(self.storagePath);
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
      this.cachedTime = moment();
      this.cacheInvalidAfter = moment(this.cachedTime).add(this.cacheTTL);
    }
    return this.cached;
  }
}

class FilesCached extends Files {
  constructor(storagePath, ttl) {
    super(storagePath);
    this.cachedFiled = new Cached(ttl);
  }

  files() {
    return this.cachedFiled.get(() => super.files());
  }
}

const storagePath = filepath.join(__dirname, "storage");
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath);
}

module.exports = new FilesCached(storagePath, moment.duration({ minutes: 5 }));
