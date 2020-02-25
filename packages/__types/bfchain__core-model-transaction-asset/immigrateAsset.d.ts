import { Message } from "@bfchain/protobuf";
import { AccountSignatureModel } from "./accountSignature";
export declare class ImmigrateAssetModel extends Message<ImmigrateAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.ImmigrateAssetJSON> {
    static INC: number;
    genesisDelegateSignatureBuffer: Uint8Array;
    get genesisDelegateSignature(): AccountSignatureModel;
    set genesisDelegateSignature(signature: AccountSignatureModel);
    emigrateAssetTransaction: BFChainCore.JSONToModelType<BFChainCore.EmigrateAssetTransactionJSON>;
    getBytes(): Uint8Array;
    toJSON(): {
        genesisDelegateSignature: BFChainCore.AccountSignatureJSON;
        emigrateAssetTransaction: Pick<BFChainCore.TransactionJSON<BFChainCore.EmigrateAssetAssetJSON>, "signature" | "signSignature" | "applyBlockHeight" | "numberOfEffectiveBlocks" | "type" | "dappid" | "version" | "senderId" | "senderPublicKey" | "senderSecondPublicKey" | "rangeType" | "range" | "fee" | "timestamp" | "lns" | "sourceIP" | "fromMagic" | "toMagic" | "remark" | "asset" | "storage" | "storageKey" | "storageValue" | "nonce"> & {
            recipientId: undefined;
        };
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<ImmigrateAssetModel>): T;
}
export declare class ImmigrateAssetAssetModel extends Message<ImmigrateAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.ImmigrateAssetAssetJSON> {
    immigrateAsset: ImmigrateAssetModel;
    toJSON(): {
        immigrateAsset: {
            genesisDelegateSignature: BFChainCore.AccountSignatureJSON;
            emigrateAssetTransaction: Pick<BFChainCore.TransactionJSON<BFChainCore.EmigrateAssetAssetJSON>, "signature" | "signSignature" | "applyBlockHeight" | "numberOfEffectiveBlocks" | "type" | "dappid" | "version" | "senderId" | "senderPublicKey" | "senderSecondPublicKey" | "rangeType" | "range" | "fee" | "timestamp" | "lns" | "sourceIP" | "fromMagic" | "toMagic" | "remark" | "asset" | "storage" | "storageKey" | "storageValue" | "nonce"> & {
                recipientId: undefined;
            };
        };
    };
}
