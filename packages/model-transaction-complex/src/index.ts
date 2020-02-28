import type {}  from '@bfchain/util';
import type {} from '@bfchain/core-typings';
import "./@types";
export * from "./custom.asset";
export * from "./custom.transaction";
export * from "./registerChain.asset";
export * from "./registerChain.transaction";

/// 注册链交易
import { TRANSACTION_TYPES_MAP, TRANSACTION_TYPES_BASE } from "@bfchain/core-model-transaction";
import { CustomTransaction } from "./custom.transaction";
import { RegisterChainTransaction } from "./registerChain.transaction";
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
