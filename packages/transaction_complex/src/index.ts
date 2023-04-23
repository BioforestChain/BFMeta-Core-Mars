import { TRANSACTION_FACTORY_TYPES_MAP } from "@bfchain/core-transaction";
import { TRANSACTION_TYPES_BASE } from "@bfchain/core-model";
import { CustomTransactionFactory } from "./custom";
import { RegisterChainTransactionFactory } from "./registerChain";
import { MultipleTransactionFactory } from "./multiple";

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

TRANSACTION_FACTORY_TYPES_MAP.VF.set(
  TRANSACTION_TYPES_BASE.MULTIPLE,
  MultipleTransactionFactory as BFChainCore.TransactionFactoryConstructor<any>,
);
TRANSACTION_FACTORY_TYPES_MAP.FV.set(
  MultipleTransactionFactory as BFChainCore.TransactionFactoryConstructor<any>,
  TRANSACTION_TYPES_BASE.MULTIPLE,
);

export * from "./custom";
export * from "./registerChain";

export * from "./multiple";
