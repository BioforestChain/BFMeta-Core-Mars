1. 改文件夹的名字
   `_`分割级别,`-`辅助语义
1. 树立依赖关系,在 tsconfig 中书写兄弟项目的依赖,在 package.json 中书写其它项目的依赖
1. 执行 `bdk-mono` 梳理 package.json 与 tsconfig.json 的内容
1. 执行 `yarn lsts` 梳理 tsconfig.json
1. 执行 `yarn dev` 进行开发修复，这里确保`build`文件夹生成成功，使得模块可用
1. 进行下一个模块之前，执行`yarn[ install]`，确保模块出现在顶层的`node_modules`里
