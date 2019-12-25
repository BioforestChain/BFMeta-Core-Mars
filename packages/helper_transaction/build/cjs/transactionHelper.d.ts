/// <reference types="node" />
import { ConfigHelper } from "@bfchain/core-helper-config";
import { BaseHelper } from "@bfchain/core-helper-type";
import { TRANSACTION_TYPES_BASE, GiftAssetTransaction, GrabAssetModel } from "@bfchain/core-model-transaction";
import { JSBIHelper } from "@bfchain/core-helper-bigint";
import { AsymmetricHelper } from "@bfchain/core-helper-asymmetric";
import { AccountBaseHelper } from "@bfchain/core-helper-account";
declare type Transaction = import("@bfchain/core-model-transaction").Transaction;
export declare class TransactionHelper {
    config: ConfigHelper;
    baseHelper: BaseHelper;
    jsbiHelper: JSBIHelper;
    cryptoHelper: BFChainCore.CryptoHelperInterface;
    keypairHelper: BFChainCore.KeypairHelperInterface;
    Buffer: BFChainUtil.BufferConstructor;
    private asymmetricHelper;
    private accountBaseHelper;
    constructor(config: ConfigHelper, baseHelper: BaseHelper, jsbiHelper: JSBIHelper, cryptoHelper: BFChainCore.CryptoHelperInterface, keypairHelper: BFChainCore.KeypairHelperInterface, Buffer: BFChainUtil.BufferConstructor, asymmetricHelper: AsymmetricHelper, accountBaseHelper: AccountBaseHelper);
    get _ASSETTYPE(): string;
    get _CHAIN_NAME(): string;
    parseType(type: string): {
        assetType: string;
        chainName: string;
        baseType: TRANSACTION_TYPES_BASE;
    };
    resolveType(arg: ReturnType<TransactionHelper["parseType"]>): string;
    getTypeName(type: string): string | undefined;
    getTypeNameByBaseType(baseType: TRANSACTION_TYPES_BASE): string | undefined;
    getTransactionType(base_type: TRANSACTION_TYPES_BASE): string;
    /**
     * 交易类型是否合法
     *
     * @param type
     */
    isValidType(type: string): boolean;
    /**
     * 获取交易 id
     *
     * @param trs
     */
    generateId(trs: Transaction): string;
    /**是否是合法的交易 ID */
    isValidId(id: string): boolean;
    /** BSE: 基础交易 */
    /** SIGNATURE: “签名”交易 */
    get SIGNATURE(): string;
    /** DELEGATE: 注册为受托人 */
    get DELEGATE(): string;
    /** VOTE: 投票 */
    get VOTE(): string;
    /** USERNAME: 注册用户别名地址 */
    get USERNAME(): string;
    /** ACCEPT_VOTE: 接收投票 */
    get ACCEPT_VOTE(): string;
    /** REJECT_VOTE: 拒绝投票 */
    get REJECT_VOTE(): string;
    /** WOD: 拓展交易 */
    /** CUSTOM: 自定义交易 */
    get CUSTOM(): string;
    /** DAPP: 侧链应用 */
    get DAPP(): string;
    /**DAPPPURCHASING 侧链购买应用 */
    get DAPP_PURCHASING(): string;
    /** ISSUE_SUBCHAIN: 发行子链 */
    get ISSUE_SUBCHAIN(): string;
    /** EXT: 存证交易 */
    /** MARK: 本能理财收益 */
    get MARK(): string;
    /** SOC */
    /** AST: 数字资产交易 */
    /** ISSUE_ASSET: 发行数字资产 */
    get ISSUE_ASSET(): string;
    /** DESTORY_ASSET: 销毁数字资产 */
    get DESTORY_ASSET(): string;
    /** TRANSFER_ASSET: 数字资产转账 */
    get TRANSFER_ASSET(): string;
    /** TO_EXCHANGE_ASSET: 发起数字资产转换 */
    get TO_EXCHANGE_ASSET(): string;
    /** BE_EXCHANGE_ASSET: 接收数字资产转换 */
    get BE_EXCHANGE_ASSET(): string;
    /**GIFT_ASSET: 资产赠送 */
    get GIFT_ASSET(): string;
    /**GRAB_ASSET: 抢资产(红包) */
    get GRAB_ASSET(): string;
    /**TRUST_ASSET: 委托资产 */
    get TRUST_ASSET(): string;
    /**SIGN_FOR_ASSET: 签收资产 */
    get SIGN_FOR_ASSET(): string;
    /**EMIGRATE_ASSET: 资产迁出 */
    get EMIGRATE_ASSET(): string;
    /**IMMIGRATE_ASSET: 资产迁出 */
    get IMMIGRATE_ASSET(): string;
    /**TO_EXCHANGE_SPECIAL_ASSET: 特殊资产交换 */
    get TO_EXCHANGE_SPECIAL_ASSET(): string;
    /**BE_EXCHANGE_SPECIAL_ASSET: 特殊资产交换 */
    get BE_EXCHANGE_SPECIAL_ASSET(): string;
    /** LNS: 未知名称系统/Location Name System */
    /**
     * TOP_LEVEL_CHAIN: 一级链名(根：链名称)
     * bnqkl.bfchain(1 级)
     * app.bnqkl.bfchain(2 级)
     * ark.app.bnqkl.bfchain(3 级)
     */
    get LOCATION_NAME(): string;
    /** SET_RECORD_VALUE_LNS: 设置解析 */
    get SET_LNS_RECORD_VALUE(): string;
    /** SET_MANAGER_LNS: 设置管理员 */
    get SET_LNS_MANAGER(): string;
    ALL_TRANSACTION_TYPES: string[];
    /**获取创世块里所有的受托人 */
    genesisDelegates(config?: ConfigHelper): string[];
    /**
     * 校验交易的签名是否合法
     */
    verifyTransactionSignature<SOME_TRS extends BFChainCore.Transaction>(transaction: SOME_TRS, opts?: {
        taskLabel?: string;
    }): void;
    /**
     * 校验交易的 remark 大小
     *
     * @param transaction
     */
    verifyTransactionRemarkSize<SOME_TRS extends BFChainCore.Transaction>(transaction: SOME_TRS): void;
    /**计算交易手续费 */
    calcTransactionFee(trs: Transaction, minTransactionFeePerByte?: BFChainCore.FractionJSON<number> | import("@bfchain/core-model-common").Fraction): string;
    private _cache_of_diff_numerator_BI;
    private _cache_of_diff_BI;
    /**
     * 计算交易POW的难度
     */
    calcDiffOfTransactionProfOfWork(num: number, participation: string): bigint;
    /**
     * 校验交易POW
     * DIFF = (E ^ N) * N / (1 + B + P * R)
     * @param transaction 交易体
     * @param num 在一个区块中用户的第N比交易
     */
    checkTransactionProfOfWork(signatureBuffer: Uint8Array, num: number, participation: string, diff_BI?: bigint): boolean;
    /**交易的噪点生成器 */
    nonceWriter<T extends Transaction>(trs: T): Generator<{
        uint8array: Uint8Array;
        nonce: number;
    }, void, unknown>;
    hashCode(str: string): number;
    /**
     * 计算抢到的`Random`资产数量
     * @param grabId
     * @param blockSignatureBuffer
     * @param giftTransactionSignatureBuffer
     * @param gifterId
     * @param totalGiftAssetNumber
     * @param totalGrabableTimes
     */
    calcGrabRandomGiftAssetNumber(grabId: string, blockSignatureBuffer: Uint8Array, giftTransactionSignatureBuffer: Uint8Array, gifterId: string, totalGiftAssetNumber: string, totalGrabableTimes: number): bigint;
    /**
     * 计算抢到的`RecipientRandom`的资产数量
     * @param grabId
     * @param blockSignatureBuffer
     * @param giftTransactionSignatureBuffer
     * @param gifterId
     * @param giftTransactionRecipient
     * @param totalGiftAssetNumber
     * @param totalGrabableTimes
     */
    calcGrabRecipientRandomGiftAssetNumber(grabId: string, blockSignatureBuffer: Uint8Array, giftTransactionSignatureBuffer: Uint8Array, gifterId: string, giftTransactionRecipient: string[], totalGiftAssetNumber: string): bigint;
    /**
     * 计算抢到的`Average`的资产数量
     * @param totalGiftAssetNumber
     * @param totalGrabableTimes
     */
    calcGrabAverageGiftAssetNumber(totalGiftAssetNumber: string, totalGrabableTimes: number): bigint;
    /**
     * 通用的红包交易金额计算器
     * @param grabId
     * @param giftTransactionInBlock
     */
    calcGrabGiftAssetNumber(grabId: string, giftTransactionInBlock: BFChainCore.TransactionInBlock<GiftAssetTransaction>): bigint;
    /**基于gift交易以及要生成grab交易的账户信息，生成grabAsset */
    generateGrabAsset(giftTransactionInBlock: BFChainCore.TransactionInBlock<GiftAssetTransaction>, opts: BFChainCore.TransactionHelper.GenerateGrabAssetOptions): GrabAssetModel;
    /**
     * 获取使用密文的交易的身份校验签名信息
     *
     * @param args `密文``gift 交易签名``发起账户地址`
     */
    getCiphertextSignature(args: {
        secret: string;
        transactionSignatureBuffer: Uint8Array;
        senderId: string;
    }): Buffer;
    /**
     * 校验使用密文的交易的身份校验签名信息
     *
     * @param args `密文公钥``密文签名``gift 交易签名``发起账户地址`
     */
    verifyCiphertextSignature(args: {
        secretPublicKey: Uint8Array;
        ciphertextSignatureBuffer: Uint8Array;
        transactionSignatureBuffer: Uint8Array;
        senderId: string;
    }): boolean;
    /**
     * 资产迁出交易创世账户签名
     *
     * @param args `所属链名称``网络标识符``资产名称``发起账户地址`
     */
    getEmigrateAssetGenesisSignature(args: {
        secret: string;
        chainName: string;
        magic: string;
        assetType: string;
        senderId: string;
        genesisSignatureBuffer?: Uint8Array;
    }): Buffer;
    emigrateAssetGenesisSignature(args: {
        secretKeyBuffer: Uint8Array;
        chainName: string;
        magic: string;
        assetType: string;
        senderId: string;
        genesisSignatureBuffer?: Uint8Array;
    }): Buffer;
    /**
     * 资产迁出交易创世账户签名验证
     *
     * @param args `创世账户公钥``密文签名``所属链名称``网络标识符``资产名称``发起账户地址`
     */
    verifyEmigrateAssetGenesisSignature(args: {
        secretPublicKey: Uint8Array;
        signatureBuffer: Uint8Array;
        chainName: string;
        magic: string;
        assetType: string;
        senderId: string;
        genesisSignatureBuffer?: Uint8Array;
    }): boolean;
    /**
     * 资产迁入交易创世账户签名
     *
     * @param args `密文``to 交易签名`
     */
    getImmigrateAssetGenesisSignature(args: {
        secret: string;
        transactionSignatureBuffer: Uint8Array;
        genesisSignatureBuffer?: Uint8Array;
    }): Buffer;
    immigrateAssetGenesisSignature(args: {
        secretKeyBuffer: Uint8Array;
        transactionSignatureBuffer: Uint8Array;
        genesisSignatureBuffer?: Uint8Array;
    }): Buffer;
    /**
     * 资产迁入交易创世账户签名验证
     *
     * @param args `密文公钥``密文签名``交易签名``to 交易签名`
     */
    verifyImmigrateAssetGenesisSignature(args: {
        secretPublicKey: Uint8Array;
        signatureBuffer: Uint8Array;
        transactionSignatureBuffer: Uint8Array;
        genesisSignatureBuffer?: Uint8Array;
    }): boolean;
    /**
     * 第三方签名
     *
     * @param args `密文``trust 交易签名``trust 交易 senderId``trust 交易 recipientId`
     */
    getThirdPartySignature(args: {
        secret: string;
        transactionSignatureBuffer: Uint8Array;
        senderId: string;
        recipientId: string;
        thirdPartySignatureBuffer?: Uint8Array;
    }): Buffer;
    thirdPartySignature(args: {
        secretKeyBuffer: Uint8Array;
        transactionSignatureBuffer: Uint8Array;
        senderId: string;
        recipientId: string;
        thirdPartySignatureBuffer?: Uint8Array;
    }): Buffer;
    /**
     * 第三方签名验证
     *
     * @param args `密文公钥``密文签名``trust 交易签名``trust 交易 senderId``trust 交易 recipientId`
     */
    verifyThirdPartySignature(args: {
        secretPublicKey: Uint8Array;
        signatureBuffer: Uint8Array;
        transactionSignatureBuffer: Uint8Array;
        senderId: string;
        recipientId: string;
        thirdPartySignatureBuffer?: Uint8Array;
    }): boolean;
    /**
     * 获取交易的最大有效区块高度
     * @param transaction
     */
    getTransactionMaxEffectiveHeight(transaction: Transaction): number;
    /**
     * 获取交易的最小有效区块高度
     * @param transaction
     */
    getTransactionMinEffectiveHeight(transaction: Transaction): number;
}
export {};
//# sourceMappingURL=transactionHelper.d.ts.map