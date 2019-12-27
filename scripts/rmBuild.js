const fs = require("fs");
const path = require("path");
const rootPath = path.resolve(__dirname, "../packages");

const prefix = "";

function removeFiles(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return;
  }
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
}

function rmBuild(rootPath) {
  const files = fs.readdirSync(rootPath);
  for (const file of files) {
    const curPath = rootPath + "/" + file;
    if (!fs.statSync(curPath).isDirectory()) {
      continue;
    }
    if (prefix && !curPath.includes(prefix)) {
      continue;
    }
    if (file.includes("node_modules")) {
      continue;
    }
    if (file.includes("build")) {
      removeFiles(curPath);
    } else {
      rmBuild(curPath);
    }
  }
}

rmBuild(rootPath);
