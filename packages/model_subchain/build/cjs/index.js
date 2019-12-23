"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./@types");
__export(require("./issueSubchain.asset"));
__export(require("./issueSubchain.transaction"));
/// 注册发行子链交易
const core_model_transaction_1 = require("@bfchain/core-model-transaction");
const issueSubchain_transaction_1 = require("./issueSubchain.transaction");
core_model_transaction_1.TRANSACTION_TYPES_MAP.VM.set(core_model_transaction_1.TRANSACTION_TYPES_BASE.ISSUE_SUBCHAIN, issueSubchain_transaction_1.IssueSubchainTransaction);
core_model_transaction_1.TRANSACTION_TYPES_MAP.MV.set(issueSubchain_transaction_1.IssueSubchainTransaction, core_model_transaction_1.TRANSACTION_TYPES_BASE.ISSUE_SUBCHAIN);
//# sourceMappingURL=index.js.map