import { ConfigHelper, ChainTimeHelper, BlockHelper, JSBIHelper } from "@bfchain/core-helper";
import { Transaction } from "@bfchain/core-model";
export declare abstract class TransactionLogicVerifier<T extends Transaction<any> = Transaction<any>> {
    protected configHelper: ConfigHelper;
    protected timeHelper: ChainTimeHelper;
    protected blockHelper: BlockHelper;
    protected jsbiHelper: JSBIHelper;
    protected transactionCore: import("@bfchain/core-transaction").TransactionCore;
    protected transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface;
    protected accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any>;
    customTransactionCenter?: BFChainCore.CustomTrCenterInterface;
    abstract verify(transaction: T, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any>, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface, customTransactionCenter?: BFChainCore.CustomTrCenterInterface): Promise<boolean>;
    logicVerify(transaction: T, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined): Promise<BFChainCore.AccountInfoAndAssets>;
    /**
     * 校验发起账户状态
     *
     * @param accountInfo
     */
    checkSenderAccountStatus(accountInfo: BFChainCore.AccountInfo | undefined): void;
    /**
     * 校验接收账户的状态
     *
     * @param accountInfo
     */
    checkRecipientAccountStatus(accountInfo: BFChainCore.AccountInfo | undefined): void;
    /**
     * 校验二次密码
     *
     * @param accountInfo
     * @param tr
     */
    checkSecondPublicKey(accountInfo: BFChainCore.AccountInfo, tr: T): void;
    /**
     * 校验交易的发起高度是否已经大于最大区块间隔
     *
     * @param tr
     * @param currentBlockHeight
     */
    checkApplyBlockHeight(tr: T, currentBlockHeight: number): void;
    /**
     * 校验 fromMagic、toMagic
     *
     * @param tr
     */
    checkTransactionMagic(tr: T, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 校验交易的时间戳
     *
     * @param tr
     */
    checkTransactionTimestamp(tr: T): void;
    /**
     * 校验交易的接收范围
     *
     * @param tr
     * @param currentBlockHeight
     * @param accountGetterHelper
     */
    checkTransactionRange(tr: T, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    private deepClone;
    /**
     * 校验账户资产是否充足
     *
     * @param tr
     * @param sender
     * @param recipient
     * @param currentBlockHeight
     */
    checkAccountAssetsEnough(tr: T, sender: BFChainCore.AccountInfoAndAssets, recipient: BFChainCore.AccountInfoAndAssets | undefined, currentBlockHeight: number): Promise<bigint>;
    /**
     * 校验交易的最大字节数
     *
     * @param trs
     * @param byteLength
     */
    checkTrsMaxBytes(byteLength: number): void;
    /**
     * 校验 dappid
     *
     * @param trs
     * @param currentBlockHeight
     */
    checkDAppId(trs: T, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined): Promise<void>;
    /**
     * 校验 location name
     *
     * @param tr
     * @param currentBlockHeight
     */
    checkLocationName(tr: T, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 账户是否持有除链资产外其他资产
     *
     * @param assets
     */
    isPossessAssetExceptForChainAsset(assets: BFChainCore.AccountAssets): void;
    /**
     * 校验交易的手续费是否大于等于网络手续费
     *
     * @param transaction
     */
    checkTrsFeeAndWebFee(transaction: BFChainCore.Transaction, byteLength: number): string;
    /**
     * 检验交易的手续费是否大于等于矿机手续费
     *
     * @param transaction
     */
    checkTrsFeeAndMiningMachineFee(transaction: BFChainCore.Transaction, byteLength: number, minFeePerByte: BFChainCore.FractionJSON): string;
    /**
     * 查询交易是否已经在未处理交易中
     *
     * @param senderId
     * @param id
     */
    checkRepeatInUntreatedTransaction(senderId: string, id: string, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined): Promise<void>;
    /**
     * 查询交易是否已经在链上
     *
     * @param senderId
     * @param id
     */
    checkRepeatInBlockChainTransaction(id: string, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined): Promise<void>;
    /**
     * 不能二次操作同一笔交易(红包/资产交换/委托资产)
     *
     * @param tr
     */
    checkSecondaryTransaction(transaction: T, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined): Promise<void>;
}
//# sourceMappingURL=_txbaseLogicVerifier.d.ts.map