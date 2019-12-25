import { Message } from "@bfchain/protobuf";
import { StringKeyMap } from "@bfchain/core-model-common";
import { RANGE_TYPE } from "@bfchain/core-model-constants";
export declare class TemplateRemark extends Message {
    /**交易的备注信息 */
    remark: {
        [key: string]: string;
    };
    private _remarkMap?;
    get remarkMap(): StringKeyMap<string>;
    toJSON(): {
        remark: {
            [key: string]: string;
        };
    };
    getBytes(): Uint8Array;
}
export declare class TransactionBaseStorageModel extends Message<TransactionBaseStorageModel> implements BFChainCore.TransactionStorageJSON, BFChainUtil.JSONAble<BFChainCore.TransactionStorageJSON> {
    static INC: number;
    key: string;
    value: string;
    toJSON(): {
        key: string;
        value: string;
    };
}
export declare class Transaction<AJ extends object = object> extends Message<Transaction<AJ>> implements BFChainCore.TransactionJSON<AJ> {
    static INC: number;
    ASSET_MODEL_TYPE: BFChainCore.AssetJSONToModelType<AJ>;
    ASSET_JSON_TYPE: AJ;
    asset: BFChainCore.AssetJSONToModelType<AJ>;
    version: number;
    type: string;
    /**交易的 id */
    get id(): string;
    /**交易的发起账户地址 */
    senderId: string;
    /**交易的发起账户公钥 */
    senderPublicKeyBuffer: Uint8Array;
    get senderPublicKey(): string;
    set senderPublicKey(value: string);
    /**交易的发起账户公钥 */
    senderSecondPublicKeyBuffer?: Uint8Array;
    get senderSecondPublicKey(): string | undefined;
    set senderSecondPublicKey(value: string | undefined);
    /**交易的接收账户地址 */
    recipientId?: string;
    /**交易的接收类型 */
    rangeType: RANGE_TYPE;
    /**交易的接收账户地址 */
    range: string[];
    /**交易的手续费 */
    fee: string;
    /**交易的时间戳 */
    timestamp: number;
    /**交易所属的 dapp id */
    dappid?: string;
    /**交易所属的 域 */
    lns?: string;
    /**交易的来源 ip */
    sourceIP?: string;
    /**交易来源链的网络标识符 */
    fromMagic: string;
    /**交易去往链的网络标识符 */
    toMagic: string;
    /**交易的发起高度 */
    applyBlockHeight: number;
    /**有效区块数量 */
    numberOfEffectiveBlocks?: number;
    /**交易POW的随机数
     * 放在`signature`的前面，方便同时修改二者 */
    nonce: number;
    /**交易的发起者签名 */
    signatureBuffer: Uint8Array;
    get signature(): string;
    set signature(value: string);
    /**查询用的索引存储 */
    storage?: TransactionBaseStorageModel;
    get storageKey(): string | undefined;
    get storageValue(): string | undefined;
    /**交易的发起者二次签名 */
    signSignatureBuffer?: Uint8Array;
    get signSignature(): string | undefined;
    set signSignature(value: string | undefined);
    /**交易的备注信息 */
    remark: {
        [key: string]: string;
    };
    private _remarkMap?;
    get remarkMap(): StringKeyMap<string>;
    getBytes(skipSignature?: boolean, skipSignSignature?: boolean): Uint8Array;
    toJSON(): BFChainCore.TransactionJSON<AJ>;
    static fromObject<M extends Message>(this: BFChainProtobuf.Constructor<M>, object: BFChainProtobuf.ObjectFromType<BFChainCore.TransactionJSON<BFChainCore.GetMessageAssetModel<M>>>): M;
}
//# sourceMappingURL=transaction.d.ts.map