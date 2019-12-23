import "./@types";
export * from "./issueSubchain";
export * from "./issueSubchain.transaction";

/// 注册发行子链交易
import { TRANSACTION_TYPES_MAP, TRANSACTION_TYPES_BASE } from "@bfchain/core-model-transaction";
import { IssueSubchainTransaction } from "./issueSubchain.transaction";
TRANSACTION_TYPES_MAP.VM.set(TRANSACTION_TYPES_BASE.ISSUE_SUBCHAIN, IssueSubchainTransaction);
TRANSACTION_TYPES_MAP.MV.set(IssueSubchainTransaction, TRANSACTION_TYPES_BASE.ISSUE_SUBCHAIN);
