import * as ATOM_TRSFAC from "./atom_transaction";
import { AccountBaseHelper, ConfigHelper, TransactionHelper, AsymmetricHelper } from "@bfchain/core-helper";
import { ModuleStroge } from "@bfchain/util";
import { Transaction } from "@bfchain/core-model";
import { TRANSACTION_TYPES_BASE } from "@bfchain/core-model-transaction";
export declare class TransactionCore {
    transactionHelper: TransactionHelper;
    accountHelper: AccountBaseHelper;
    asymmetricHelper: AsymmetricHelper;
    keypairHelper: BFChainCore.KeypairHelperInterface;
    Buffer: BFChainUtil.BufferConstructor;
    config: ConfigHelper;
    moduleMap: ModuleStroge;
    constructor(transactionHelper: TransactionHelper, accountHelper: AccountBaseHelper, asymmetricHelper: AsymmetricHelper, keypairHelper: BFChainCore.KeypairHelperInterface, Buffer: BFChainUtil.BufferConstructor, config: ConfigHelper, moduleMap: ModuleStroge);
    /**各种交易工厂的实例缓存 */
    private _txFactoryCache;
    /**获取交易工厂 */
    getTransactionFactory<T extends Transaction>(TxFactory: BFChainCore.TransactionFactoryConstructor<T>): ATOM_TRSFAC.TransactionFactory<T>;
    /**使用交易类型获取交易的工厂 */
    getTransactionFactoryFromType<T extends Transaction>(type: string): ATOM_TRSFAC.TransactionFactory<T>;
    /**使用交易的基础类型获取交易的工厂 */
    getTransactionFactoryFromBaseType<T extends Transaction>(base_type: TRANSACTION_TYPES_BASE): ATOM_TRSFAC.TransactionFactory<T>;
    /**
     * 创建交易
     *
     * 校验主密码生成的密钥对是否完整
     * 如果需要二次签名，校验二次密码生成的密钥对是否完整
     * 校验用于生成交易的数据是否完整
     * 生成交易主体
     * 生成交易id
     * 校验生成的交易是否合法
     * 生成交易签名
     * 如果需要二次签名，生成二次签名
     *
     * @param TxFactory
     * @param body
     * @param asset
     * @param keypair
     * @param secondKeypair
     */
    createTransaction<T extends Transaction>(TxFactory: BFChainCore.TransactionFactoryConstructor<T>, body: BFChainCore.TxBodyJSON, asset: BFChainCore.GetTransactionAssetJSON<T>, keypair: BFChainCore.Keypair, secondKeypair?: BFChainCore.Keypair, config?: ConfigHelper, pow?: BFChainCore.TransactonPoWOptions<T>): T;
    /**通用的交易POW计算器 */
    transactionPowCalculator<T extends Transaction>(trs: T, pow: BFChainCore.TransactonPoWOptions, keypair: BFChainCore.Keypair, secondKeypair?: BFChainCore.Keypair): Promise<T>;
    /**
     * transactionJson => transactionModel
     *
     * @param trs
     */
    recombineTransaction<T extends Transaction>(trs: BFChainCore.TransactionJSON<BFChainCore.GetTransactionAssetJSON<T>>): T;
    fromJSON: <T extends Transaction<object>>(trs: BFChainCore.TransactionJSON<T["ASSET_JSON_TYPE"]>) => T;
    recombineTransactionInBlock<T extends BFChainCore.TransactionInBlock>(trsInBlock: BFChainCore.TransactionInBlockJSON<BFChainCore.TransactionJSON<any>>): T;
    /**将二进制解析成交易 */
    parseBytesToTransaction(bytes: Uint8Array): Transaction<any>;
    /**将二进制解析成完整交易 */
    parseBytesToSomeTransaction<T extends BFChainCore.Transaction = BFChainCore.Transaction>(bytes: Uint8Array): T;
    /**使用交易类型获取交易构造函数 */
    getTransactionModelConstructorFromType(type: string): typeof Transaction;
    /**使用交易的基础类型获取交易的构造函数 */
    getTransactionModelConstructorFromBaseType(base_type: TRANSACTION_TYPES_BASE): typeof Transaction;
    /**根据构造函数获取交易类型 */
    getTransactionTypeFromTransactionFactoryConstructor(TxFactory: BFChainCore.TransactionFactoryConstructor<any>): string;
}
/**
 * K : TRANSACTION_TYPES_BASE KEY
 * V : TRANSACTION_TYPES_BASE VALUE
 * F : TransactionFactoryConstructror
 */
export declare const TRANSACTION_FACTORY_TYPES_MAP: {
    VK: Map<TRANSACTION_TYPES_BASE, string>;
    KV: Map<string, TRANSACTION_TYPES_BASE>;
    VF: Map<TRANSACTION_TYPES_BASE, BFChainCore.TransactionFactoryConstructor<any>>;
    FV: Map<BFChainCore.TransactionFactoryConstructor<any>, TRANSACTION_TYPES_BASE>;
    trsTypeToV(type: string): TRANSACTION_TYPES_BASE;
};
//# sourceMappingURL=transaction.d.ts.map