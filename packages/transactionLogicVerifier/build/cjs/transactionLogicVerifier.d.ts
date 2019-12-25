import { TRANSACTION_TYPES_BASE } from "@bfchain/core-model-transaction";
/**
 * K : TRANSACTION_TYPES_BASE KEY
 * V : TRANSACTION_TYPES_BASE VALUE
 * F : LogicVerifierConstructror
 */
export declare const TLogicVerifier_TYPES_MAP: {
    VK: Map<TRANSACTION_TYPES_BASE, string>;
    KV: Map<string, TRANSACTION_TYPES_BASE>;
    VF: Map<TRANSACTION_TYPES_BASE, BFChainCore.TransactionLogicVerifierConstructor<any>>;
    FV: Map<BFChainCore.TransactionLogicVerifierConstructor<any>, TRANSACTION_TYPES_BASE>;
    trsTypeToV(type: string): TRANSACTION_TYPES_BASE;
};
//# sourceMappingURL=transactionLogicVerifier.d.ts.map