// @ts-check
const fs = require("fs");
const path = require("path");
const execa = require("execa");
const { console } = require("@bfchain/devkit");
const TYPES_ROOT = path.resolve(__dirname, "../packages/@types");
function publishTypes() {
  const packages = fs.readdirSync(TYPES_ROOT);
  for (const npmPackage of packages) {
    const npmPackageDir = path.resolve(TYPES_ROOT, npmPackage);
    const npmPackageJsonPath = path.resolve(npmPackageDir, "package.json");
    if (fs.existsSync(npmPackageJsonPath)) {
      const packageJson = require(npmPackageJsonPath);
      const packageInfo = `${packageJson.name}@${packageJson.version}`;
      console.line("开始发布", packageInfo);
      execa("npm", ["publish"], { cwd: npmPackageDir }).then(
        res => {
          console.success(packageInfo, "发布成功");
        },
        err => {
          console.error(packageInfo, "发布失败");
        },
      );
    }
  }
}

exports.publishTypes = publishTypes;
if (module === process.mainModule) {
  publishTypes();
}
