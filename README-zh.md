# BFMeta-Core-Mars（中文）

## 简介
BFMeta 核心链逻辑的 TypeScript monorepo，涵盖区块、交易、密码学与辅助工具。采用 Lerna + Yarn workspaces 与 bdk 工具链，面向节点、SDK、工具复用。

## 架构概览
- `packages/model-*` / `transaction*`：区块、交易与资产建模、序列化、校验。
- `packages/crypto*`、`helper-*`、`util-*`：密钥、签名、时间、配置、迁移等通用工具。
- `packages/core`、`transaction_logic_verifier`：核心验证与锻造组合层，可嵌入不同运行时。
- `scripts/`：清理、发布、配置生成（`bdk-mono`、`bdk-tsc`）。

## 快速开始
1) `yarn install`
2) 对齐 tsconfig：`yarn mono && yarn lsts`
3) 开发构建：`yarn dev` / `yarn dev:all`
4) 生产构建：`yarn rebuild`

## 贡献规范
- Node 16+；统一使用 Yarn，保持 TS 严格模式，不新增 `any`/`@ts-ignore`。
- 遵循 SRP/DRY：公共逻辑放入 `helper-*`/`util-*`；新增包前先评估复用。
- 核心 API/类型变更需补充注释或示例；已知缺口用 `TODO`/`FIXME` 说明原因。
- 提交前运行 `yarn build` 或相关 `bdk-tsc --build`，确保生成 `build/`。
- 分支命名：`feature/<scope>`、`fix/<issue>`；提交信息用简短动词短语。
