import type {} from '@bfchain/core-typings';
import "./@types";
export * from "./issueSubchain.asset";
export * from "./issueSubchain.transaction";

/// 注册发行子链交易
import { TRANSACTION_TYPES_MAP, TRANSACTION_TYPES_BASE } from "@bfchain/core-model-transaction";
import { IssueSubchainTransaction } from "./issueSubchain.transaction";
import type { Transaction } from "@bfchain/core-model-transaction-base";
TRANSACTION_TYPES_MAP.VM.set(
  TRANSACTION_TYPES_BASE.ISSUE_SUBCHAIN,
  IssueSubchainTransaction as typeof Transaction,
);
TRANSACTION_TYPES_MAP.MV.set(
  IssueSubchainTransaction as typeof Transaction,
  TRANSACTION_TYPES_BASE.ISSUE_SUBCHAIN,
);
