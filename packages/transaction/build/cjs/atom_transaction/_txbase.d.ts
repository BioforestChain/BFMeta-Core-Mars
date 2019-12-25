import { TransactionHelper, AccountBaseHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
import { Transaction } from "@bfchain/core-model";
declare type FunctionExceptionDetail = {
    target: string;
    function: string;
};
/**
 * 网络标识符类型
 *
 */
export declare enum BNID_TYPE {
    /**测试网络 */
    TESTNET = "c",
    /**正式网络 */
    MAINNET = "b"
}
export declare abstract class TransactionFactory<T extends Transaction = Transaction> {
    abstract accountHelper: AccountBaseHelper;
    abstract transactionHelper: TransactionHelper;
    abstract baseHelper: BaseHelper;
    abstract configHelper: ConfigHelper;
    abstract chainAssetInfoHelper: ChainAssetInfoHelper;
    abstract init(body: BFChainCore.TxBodyJSON, asset: BFChainCore.GetTransactionAssetJSON<T>): T;
    /**
     * 从 json 转出 protobuf-message
     * JSON格式一般是进程内部通讯在使用,所以JSON格式默认不校验
     */
    fromJSON(trs: BFChainCore.TransactionJSON<BFChainCore.GetTransactionAssetJSON<T>>, opts?: {
        verify?: boolean;
        config?: ConfigHelper;
    }): T;
    /**
     * 验证主密码的密钥对是否合法
     *
     * @param keypair
     */
    verifyKeypair(keypair: BFChainCore.Keypair): void;
    /**
     * 验证二次密码的密钥对是否合法
     *
     * @param keypair
     */
    verifySecondKeypair(keypair: BFChainCore.Keypair): void;
    /**
     * 创建完交易后的校验
     *
     * @param body
     * @param asset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, asset: BFChainCore.GetTransactionAssetJSON<T>, config?: ConfigHelper): void;
    /**
     * 校验基础信息
     *
     * @param transaction
     */
    verifyBaseInfo(transaction: T, config?: ConfigHelper): void;
    /**
     * 校验签名
     *
     * @param transaction
     */
    verifySignature(transaction: T): void;
    /**
     * 校验交易 remark 大小
     *
     * @param transaction
     */
    verifyRemarkSize(transaction: T): void;
    /**
     * 校验完整交易
     *
     * @param transaction
     */
    verify(transaction: T, config?: ConfigHelper): void;
    /**
     * 校验金额
     *
     * @param amount
     * @param propName
     * @param Function_Exception_Detail
     */
    checkAssetAmount(amount: string, propName: string, Function_Exception_Detail: FunctionExceptionDetail): void;
    /**
     * 校验交易花费手续费
     *
     * @param fee
     * @param Function_Exception_Detail
     */
    checkTrsBaseFee(fee: string, Function_Exception_Detail: FunctionExceptionDetail): void;
    /**
     * 必须是不限定范围
     *
     * @param body
     * @param Function_Exception_Detail
     */
    emptyRangeType(body: BFChainCore.TxBodyJSON, Function_Exception_Detail: FunctionExceptionDetail): void;
    /**
     * 链名是否合法
     *
     * @param chainName
     * @param propName
     * @param Function_Exception_Detail
     */
    checkChainName(chainName: string, propName: string, Function_Exception_Detail: FunctionExceptionDetail): void;
    /**
     * 链名是否合法
     *
     * @param chainMagic
     * @param propName
     * @param Function_Exception_Detail
     */
    checkChainMagic(chainMagic: string, propName: string, Function_Exception_Detail: FunctionExceptionDetail): void;
    /**
     * 链名是否合法
     *
     * @param assetType
     * @param propName
     * @param Function_Exception_Detail
     */
    checkAssetType(assetType: string, propName: string, Function_Exception_Detail: FunctionExceptionDetail): void;
    /**
     * 交易生效，对账务产生影响
     *
     * @param trs
     * @param event
     */
    applyTransaction(trs: T, event: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
    /**
     * 统计交易信息
     *
     * @param trs
     * @param event
     */
    protected _beginDealTransaction(trs: T, event: BFChainCore.ApplyTransactionEventEmitter): unknown;
    protected _applyTransactionEmitAsset(event: BFChainCore.ApplyTransactionEventEmitter, transaction: T, amount: string, detail: {
        senderId: string;
        senderPublicKeyBuffer: Uint8Array;
        recipientId?: string;
        recipientPublicKeyBuffer?: Uint8Array;
        assetInfo: BFChainCore.AssetInfoJSON;
    }): any[] | Promise<any[]>;
}
export {};
//# sourceMappingURL=_txbase.d.ts.map