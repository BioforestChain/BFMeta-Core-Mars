const fs = require("fs");
const path = require("path");
const rootPath = path.resolve(__dirname, "../packages");

const prefix = "";

function removeFiles(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return;
  }
  if (fs.statSync(targetPath).isDirectory()) {
    const files = fs.readdirSync(targetPath);
    for (const file of files) {
      const curPath = targetPath + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        // 递归获取文件夹
        removeFiles(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    }
    fs.rmdirSync(targetPath);
  } else {
    fs.unlinkSync(targetPath);
  }
}

function rmBuild(rootPath, filter, maxDeep = Infinity, curDeep = 1) {
  const files = fs.readdirSync(rootPath);
  for (const file of files) {
    const curPath = rootPath + "/" + file;

    if (prefix && !curPath.includes(prefix)) {
      continue;
    }
    if (file.includes("node_modules")) {
      continue;
    }
    if (filter(file, curPath, curDeep)) {
      removeFiles(curPath);
    } else if (curDeep < maxDeep && fs.statSync(curPath).isDirectory()) {
      rmBuild(curPath, filter, maxDeep, curDeep + 1);
    }
  }
}

rmBuild(
  rootPath,
  (file, fullpath) => fs.statSync(fullpath).isDirectory() && file.includes("build"),
  1,
);
rmBuild(path.resolve(__dirname, "../.cache"), _ => true);
rmBuild(path.resolve(rootPath, "@types"), (file, _, deep) => deep > 1 && file !== "package.json");
