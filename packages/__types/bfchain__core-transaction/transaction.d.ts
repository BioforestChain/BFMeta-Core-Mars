import * as ATOM_TRSFAC from "./atom_transaction";
import { AccountBaseHelper, ConfigHelper, TransactionHelper, AsymmetricHelper } from "@bfchain/core-helper";
import { ModuleStroge } from "@bfchain/util";
import { Transaction } from "@bfchain/core-model";
import { TRANSACTION_TYPES_BASE } from "@bfchain/core-model-transaction";
export declare class TransactionCore {
    transactionHelper: TransactionHelper;
    accountBaseHelper: AccountBaseHelper;
    asymmetricHelper: AsymmetricHelper;
    keypairHelper: BFChainCore.KeypairHelperInterface;
    Buffer: BFChainUtil.BufferConstructor;
    config: ConfigHelper;
    moduleMap: ModuleStroge;
    constructor(transactionHelper: TransactionHelper, accountBaseHelper: AccountBaseHelper, asymmetricHelper: AsymmetricHelper, keypairHelper: BFChainCore.KeypairHelperInterface, Buffer: BFChainUtil.BufferConstructor, config: ConfigHelper, moduleMap: ModuleStroge);
    private _txFactoryCache;
    getTransactionFactory<T extends Transaction>(TxFactory: BFChainCore.TransactionFactoryConstructor<T>): ATOM_TRSFAC.TransactionFactory<T>;
    getTransactionFactoryFromType<T extends Transaction>(type: string): ATOM_TRSFAC.TransactionFactory<T>;
    getTransactionFactoryFromBaseType<T extends Transaction>(base_type: TRANSACTION_TYPES_BASE): ATOM_TRSFAC.TransactionFactory<T>;
    createTransaction<T extends Transaction>(TxFactory: BFChainCore.TransactionFactoryConstructor<T>, body: BFChainCore.TxBodyJSON, asset: BFChainCore.GetTransactionAssetJSON<T>, keypair: BFChainCore.Keypair, secondKeypair?: BFChainCore.Keypair, config?: ConfigHelper, pow?: BFChainCore.TransactonPoWOptions<T>): T;
    transactionPowCalculator<T extends Transaction>(trs: T, pow: BFChainCore.TransactonPoWOptions, keypair: BFChainCore.Keypair, secondKeypair?: BFChainCore.Keypair): Promise<T>;
    recombineTransaction<T extends Transaction>(trs: BFChainCore.TransactionJSON<BFChainCore.GetTransactionAssetJSON<T>>): T;
    fromJSON: <T extends Transaction<object>>(trs: BFChainCore.TransactionJSON<T["ASSET_JSON_TYPE"]>) => T;
    recombineTransactionInBlock<T extends BFChainCore.TransactionInBlock>(trsInBlock: BFChainCore.TransactionInBlockJSON<BFChainCore.TransactionJSON<any>>): T;
    parseBytesToTransaction(bytes: Uint8Array): Transaction<any>;
    parseBytesToSomeTransaction<T extends BFChainCore.Transaction = BFChainCore.Transaction>(bytes: Uint8Array): T;
    getTransactionModelConstructorFromType(type: string): typeof Transaction;
    getTransactionModelConstructorFromBaseType(base_type: TRANSACTION_TYPES_BASE): typeof Transaction;
    getTransactionTypeFromTransactionFactoryConstructor(TxFactory: BFChainCore.TransactionFactoryConstructor<any>): string;
}
export declare const TRANSACTION_FACTORY_TYPES_MAP: {
    VK: Map<TRANSACTION_TYPES_BASE, string>;
    KV: Map<string, TRANSACTION_TYPES_BASE>;
    VF: Map<TRANSACTION_TYPES_BASE, BFChainCore.TransactionFactoryConstructor<any>>;
    FV: Map<BFChainCore.TransactionFactoryConstructor<any>, TRANSACTION_TYPES_BASE>;
    trsTypeToV(type: string): TRANSACTION_TYPES_BASE;
};
