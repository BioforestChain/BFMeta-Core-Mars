// @ts-check

function generateJsonConfigFile(args) {
  const { packageJson, env, toJson } = args;
  if (!toJson.extends) {
    toJson.extends = "./tsconfig";
  }
  if (!toJson.minin) {
    toJson.minin = [
      "./tsconfig.json",
      "../../config/tsconfig_base/base.tsconfig.@types.json"
    ];
  }
  const compilerOptions =
    toJson.compilerOptions || (toJson.compilerOptions = {});

  /// 初始化配置declarationDir
  if (!compilerOptions.declarationDir) {
    const packageName = packageJson.name;
    /**@type {string} */
    let typesPackageName = packageName;

    if (packageName.startsWith("@") && packageName.includes("/")) {
      typesPackageName = typesPackageName.slice(1).replace(/\//g, "__");
    }
    compilerOptions.declarationDir = `../@types/${typesPackageName}`;
    compilerOptions.declarations = true;
  }

  /// 如果没有默认的ourDir路径，或者没有 noEmitJs 的声明，那么默认不去生成 js文件
  if (!compilerOptions.ourDir && compilerOptions.noEmitJs === undefined) {
    compilerOptions.noEmitJs = true;
  }
  return toJson;
}

exports.generateJsonConfigFile = generateJsonConfigFile;
