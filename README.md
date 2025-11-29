# BFMeta-Core-Mars (English)

## Overview
TypeScript monorepo for BFMeta core chain logic (blocks, transactions, crypto, helpers) managed with Lerna + Yarn workspaces and bdk tooling. Provides reusable building blocks for nodes, SDKs, and tooling.

## Architecture
- `packages/model-*` / `transaction*`: block & transaction models, serialization, validation pipelines.
- `packages/crypto*`, `helper-*`, `util-*`: key/signature utilities, time/config/migration helpers.
- `packages/core`, `transaction_logic_verifier`: core verification/forging composition layer.
- `scripts/`: cleanup, publishing, and tsconfig generation (`bdk-mono`, `bdk-tsc`).

## Getting Started
1) `yarn install`
2) Sync tsconfig: `yarn mono && yarn lsts`
3) Dev build: `yarn dev` or `yarn dev:all`
4) Prod build: `yarn rebuild`

## Contribution Guide
- Node 16+; Yarn only. Keep TS strict, avoid `any` / `@ts-ignore`.
- SRP/DRY: place shared logic in `helper-*`/`util-*`; evaluate reuse before creating new packages.
- Document API/type changes with comments or examples; leave contextual `TODO`/`FIXME` for known gaps.
- Run `yarn build` (or targeted `bdk-tsc --build`) before committing to ensure `build/` artifacts.
- Branches: `feature/<scope>`, `fix/<issue>`; concise verb-based commits.
