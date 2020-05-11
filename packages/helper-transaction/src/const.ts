/**
 * 用于注入区块链要过滤交易
 * 过滤要处理的交易
 * 过滤要接收的交易
 * 过滤区块中允许出现的交易
 */
export const TRANSACTION_FILTER_SYMBOL = Symbol("bfchain-core:TransactionFilter");
export const ABORT_FORBIDDEN_TRANSACTION_SYMBOL = Symbol("bfchain-core:AbortForbiddenTransaction");
