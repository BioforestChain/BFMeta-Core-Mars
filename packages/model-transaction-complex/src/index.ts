import type {} from "@bfchain/util";
import "@bfchain/core-typings";
import "./@types";
export * from "./custom.asset";
export * from "./custom.transaction";
export * from "./registerChain.asset";
export * from "./registerChain.transaction";

export * from "./multiple.asset";
export * from "./multiple.transaction";

export * from "./promise.asset";
export * from "./promise.transaction";

export * from "./promiseResolve.asset";
export * from "./promiseResolve.transaction";

import { TRANSACTION_TYPES_MAP, TRANSACTION_TYPES_BASE } from "@bfchain/core-model-transaction";
import { CustomTransaction } from "./custom.transaction";
/// 注册链交易
import { RegisterChainTransaction } from "./registerChain.transaction";
/// 组合交易
import { MultipleTransaction } from "./multiple.transaction";
/// 承诺交易
import { PromiseTransaction } from "./promise.transaction";
/// 承诺兑现交易
import { PromiseResolveTransaction } from "./promiseResolve.transaction";
import type { Transaction } from "@bfchain/core-model-transaction-base";
TRANSACTION_TYPES_MAP.VM.set(
  TRANSACTION_TYPES_BASE.CUSTOM,
  CustomTransaction as typeof Transaction,
);
TRANSACTION_TYPES_MAP.MV.set(
  CustomTransaction as typeof Transaction,
  TRANSACTION_TYPES_BASE.CUSTOM,
);

TRANSACTION_TYPES_MAP.VM.set(
  TRANSACTION_TYPES_BASE.REGISTER_CHAIN,
  RegisterChainTransaction as typeof Transaction,
);
TRANSACTION_TYPES_MAP.MV.set(
  RegisterChainTransaction as typeof Transaction,
  TRANSACTION_TYPES_BASE.REGISTER_CHAIN,
);

TRANSACTION_TYPES_MAP.VM.set(
  TRANSACTION_TYPES_BASE.MULTIPLE,
  MultipleTransaction as typeof Transaction,
);
TRANSACTION_TYPES_MAP.MV.set(
  MultipleTransaction as typeof Transaction,
  TRANSACTION_TYPES_BASE.MULTIPLE,
);

TRANSACTION_TYPES_MAP.VM.set(
  TRANSACTION_TYPES_BASE.PROMISE,
  PromiseTransaction as typeof Transaction,
);
TRANSACTION_TYPES_MAP.MV.set(
  PromiseTransaction as typeof Transaction,
  TRANSACTION_TYPES_BASE.PROMISE,
);

TRANSACTION_TYPES_MAP.VM.set(
  TRANSACTION_TYPES_BASE.PROMISE_RESOLVE,
  PromiseResolveTransaction as typeof Transaction,
);
TRANSACTION_TYPES_MAP.MV.set(
  PromiseResolveTransaction as typeof Transaction,
  TRANSACTION_TYPES_BASE.PROMISE_RESOLVE,
);
