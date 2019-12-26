import { TRANSACTION_FACTORY_TYPES_MAP } from "@bfchain/core-transaction";
import { TRANSACTION_TYPES_BASE } from "@bfchain/core-model";
import { IssueSubchainTransactionFactory } from "./issueSubchain";
TRANSACTION_FACTORY_TYPES_MAP.VF.set(
  TRANSACTION_TYPES_BASE.ISSUE_SUBCHAIN,
  IssueSubchainTransactionFactory as BFChainCore.TransactionFactoryConstructor<any>,
);
TRANSACTION_FACTORY_TYPES_MAP.FV.set(
  IssueSubchainTransactionFactory as BFChainCore.TransactionFactoryConstructor<any>,
  TRANSACTION_TYPES_BASE.ISSUE_SUBCHAIN,
);

export * from "./issueSubchain";
