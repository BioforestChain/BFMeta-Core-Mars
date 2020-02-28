import { TRANSACTION_FACTORY_TYPES_MAP } from "@bfchain/core-transaction";
import { TRANSACTION_TYPES_BASE } from "@bfchain/core-model";
import { CustomTransactionFactory } from "./custom";
import { RegisterChainTransactionFactory } from "./registerChain";

TRANSACTION_FACTORY_TYPES_MAP.VF.set(
  TRANSACTION_TYPES_BASE.CUSTOM,
  CustomTransactionFactory as BFChainCore.TransactionFactoryConstructor<any>,
);
TRANSACTION_FACTORY_TYPES_MAP.FV.set(
  CustomTransactionFactory as BFChainCore.TransactionFactoryConstructor<any>,
  TRANSACTION_TYPES_BASE.CUSTOM,
);

TRANSACTION_FACTORY_TYPES_MAP.VF.set(
  TRANSACTION_TYPES_BASE.REGISTER_CHAIN,
  RegisterChainTransactionFactory as BFChainCore.TransactionFactoryConstructor<any>,
);
TRANSACTION_FACTORY_TYPES_MAP.FV.set(
  RegisterChainTransactionFactory as BFChainCore.TransactionFactoryConstructor<any>,
  TRANSACTION_TYPES_BASE.REGISTER_CHAIN,
);

export * from "./custom";
export * from "./registerChain";
