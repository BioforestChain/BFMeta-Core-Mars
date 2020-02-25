import * as ATOM_TRSLGCVFR from "./atom_transactionLogicVerifier";
import { TRANSACTION_TYPES_BASE, Transaction } from "@bfchain/core-model-transaction";
import { AccountBaseHelper, ConfigHelper, TransactionHelper, AsymmetricHelper } from "@bfchain/core-helper";
import { ModuleStroge } from "@bfchain/util";
export declare class TransactionLogicVerifierCore {
    transactionHelper: TransactionHelper;
    accountBaseHelper: AccountBaseHelper;
    asymmetricHelper: AsymmetricHelper;
    keypairHelper: BFChainCore.KeypairHelperInterface;
    Buffer: BFChainUtil.BufferConstructor;
    config: ConfigHelper;
    moduleMap: ModuleStroge;
    constructor(transactionHelper: TransactionHelper, accountBaseHelper: AccountBaseHelper, asymmetricHelper: AsymmetricHelper, keypairHelper: BFChainCore.KeypairHelperInterface, Buffer: BFChainUtil.BufferConstructor, config: ConfigHelper, moduleMap: ModuleStroge);
    private _txLogicVerifierCache;
    getTransactionLogicVerifier<T extends Transaction>(LogicVerifier: BFChainCore.TransactionLogicVerifierConstructor<T>): ATOM_TRSLGCVFR.TransactionLogicVerifier<T>;
    getTransactionLogicVerifierFromType<T extends Transaction>(type: string): ATOM_TRSLGCVFR.TransactionLogicVerifier<T>;
    getTransactionLogicVerifierFromBaseType<T extends Transaction>(base_type: TRANSACTION_TYPES_BASE): ATOM_TRSLGCVFR.TransactionLogicVerifier<T>;
}
export declare const TRANSACTION_LOGIC_VERIFIER_TYPES_MAP: {
    KLV: Map<TRANSACTION_TYPES_BASE, BFChainCore.TransactionLogicVerifierConstructor<any>>;
    LVK: Map<BFChainCore.TransactionLogicVerifierConstructor<any>, TRANSACTION_TYPES_BASE>;
    trsTypeToV(type: string): TRANSACTION_TYPES_BASE;
};
