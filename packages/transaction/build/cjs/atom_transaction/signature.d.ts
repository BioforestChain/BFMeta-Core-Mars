import { TransactionFactory } from "./_txbase";
import { SignatureTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
/**
 * signature 交易工厂
 *
 */
export declare class SignatureTransactionFactory extends TransactionFactory<SignatureTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 signature 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收者账户
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * asset 是完整的 signature 信息
     * 必须携带合法的欲设置二次密码生成的公钥
     *
     * @param body
     * @param signatureAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, signatureAsset: BFChainCore.SignatureAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 signature 交易
     *
     * @param body
     * @param signatureAsset
     */
    init(body: BFChainCore.TxBodyJSON, signatureAsset: BFChainCore.SignatureAssetJSON): SignatureTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: SignatureTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=signature.d.ts.map