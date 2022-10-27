// @ts-check

const fs = require("node:fs");

const rootPath = process.cwd() + "/packages";

const dirs = fs.readdirSync(rootPath);

for (const dir of dirs) {
  const targetPath = `${rootPath}/${dir}/package.json`;
  if (fs.existsSync(targetPath)) {
    /**
     * @type {typeof import("../package.json")}
     */
    const packageJson = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
    for (const key in packageJson.dependencies) {
      if (key.includes("@bfchain/core")) {
        delete packageJson.dependencies[key];
      }
    }
    for (const key in packageJson.devDependencies) {
      if (key.includes("@bfchain/core")) {
        delete packageJson.devDependencies[key];
      }
    }
    fs.writeFileSync(targetPath, JSON.stringify(packageJson, null, 4));
  }
}
