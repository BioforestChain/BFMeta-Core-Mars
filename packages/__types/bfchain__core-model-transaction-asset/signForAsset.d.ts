import { Message } from "@bfchain/protobuf";
import { TrustAssetModel } from "./trustAsset";
import { AccountSignatureModel } from "./accountSignature";
export declare class SignForAssetModel extends Message<SignForAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.SignForAssetJSON> {
    static INC: number;
    transactionSignatureBuffer: Uint8Array;
    get transactionSignature(): string;
    set transactionSignature(value: string);
    signatureBufferList: Uint8Array[];
    get thirdPartySignatures(): AccountSignatureModel[];
    set thirdPartySignatures(signatureList: AccountSignatureModel[]);
    trustSenderId: string;
    trustRecipientId: string;
    trustNumberOfSignFor: number;
    applyBlockHeight: number;
    numberOfEffectiveBlocks: number;
    trustAsset: TrustAssetModel;
    getBytes(): Uint8Array;
    toJSON(): BFChainCore.SignForAssetJSON;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<SignForAssetModel>): T;
}
export declare class SignForAssetAssetModel extends Message<SignForAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.SignForAssetAssetJSON> {
    signForAsset: SignForAssetModel;
    toJSON(): {
        signForAsset: BFChainCore.SignForAssetJSON;
    };
}
