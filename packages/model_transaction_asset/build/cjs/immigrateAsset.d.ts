import { Message } from "@bfchain/protobuf";
import { AccountSignatureModel } from "./accountSignature";
/**
 * immigrateAsset 交易 asset 模型
 *
 */
export declare class ImmigrateAssetModel extends Message<ImmigrateAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.ImmigrateAssetJSON> {
    static INC: number;
    genesisDelegateSignatureBuffer: Uint8Array;
    get genesisDelegateSignature(): AccountSignatureModel;
    set genesisDelegateSignature(signature: AccountSignatureModel);
    /**完整的资产迁出交易 */
    emigrateAssetTransaction: BFChainCore.JSONToModelType<BFChainCore.EmigrateAssetTransactionJSON>;
    getBytes(): Uint8Array;
    toJSON(): {
        genesisDelegateSignature: BFChainCore.AccountSignatureJSON;
        emigrateAssetTransaction: Pick<BFChainCore.TransactionJSON<BFChainCore.EmigrateAssetAssetJSON>, "applyBlockHeight" | "numberOfEffectiveBlocks" | "signature" | "signSignature" | "version" | "type" | "senderId" | "senderPublicKey" | "senderSecondPublicKey" | "rangeType" | "range" | "fee" | "timestamp" | "dappid" | "lns" | "sourceIP" | "fromMagic" | "toMagic" | "remark" | "id" | "asset" | "storage" | "storageKey" | "storageValue" | "nonce"> & {
            recipientId: undefined;
        };
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<ImmigrateAssetModel>): T;
}
/**
 * immigrateAsset 交易 asset 外层模型
 *
 */
export declare class ImmigrateAssetAssetModel extends Message<ImmigrateAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.ImmigrateAssetAssetJSON> {
    immigrateAsset: ImmigrateAssetModel;
    toJSON(): {
        immigrateAsset: {
            genesisDelegateSignature: BFChainCore.AccountSignatureJSON;
            emigrateAssetTransaction: Pick<BFChainCore.TransactionJSON<BFChainCore.EmigrateAssetAssetJSON>, "applyBlockHeight" | "numberOfEffectiveBlocks" | "signature" | "signSignature" | "version" | "type" | "senderId" | "senderPublicKey" | "senderSecondPublicKey" | "rangeType" | "range" | "fee" | "timestamp" | "dappid" | "lns" | "sourceIP" | "fromMagic" | "toMagic" | "remark" | "id" | "asset" | "storage" | "storageKey" | "storageValue" | "nonce"> & {
                recipientId: undefined;
            };
        };
    };
}
//# sourceMappingURL=immigrateAsset.d.ts.map