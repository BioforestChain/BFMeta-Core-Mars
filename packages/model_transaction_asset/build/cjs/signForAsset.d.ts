import { Message } from "@bfchain/protobuf";
import { TrustAssetModel } from "./trustAsset";
import { AccountSignatureModel } from "./accountSignature";
/**
 * signForAsset 交易 asset 模型
 *
 */
export declare class SignForAssetModel extends Message<SignForAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.SignForAssetJSON> {
    static INC: number;
    /**要签收的委托交易的签名 */
    transactionSignatureBuffer: Uint8Array;
    get transactionSignature(): string;
    set transactionSignature(value: string);
    /**第三方账户签名 */
    signatureBufferList: Uint8Array[];
    get thirdPartySignatures(): AccountSignatureModel[];
    set thirdPartySignatures(signatureList: AccountSignatureModel[]);
    /**委托交易的发起账户地址 */
    trustSenderId: string;
    /**委托交易的接收账户地址 */
    trustRecipientId: string;
    /**交易有效签名数 */
    trustNumberOfSignFor: number;
    /**委托交易发起高度 */
    applyBlockHeight: number;
    /**委托交易的有效区块高度 */
    numberOfEffectiveBlocks?: number;
    /**红包的配置信息 */
    trustAsset: TrustAssetModel;
    getBytes(): Uint8Array;
    toJSON(): BFChainCore.SignForAssetJSON;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<SignForAssetModel>): T;
}
/**
 * signForAsset 交易 asset 外层模型
 *
 */
export declare class SignForAssetAssetModel extends Message<SignForAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.SignForAssetAssetJSON> {
    signForAsset: SignForAssetModel;
    toJSON(): {
        signForAsset: BFChainCore.SignForAssetJSON;
    };
}
//# sourceMappingURL=signForAsset.d.ts.map