import { Message } from "@bfchain/protobuf";
import { ToExchangeSpecialAssetModel } from "./toExchangeSpecialAsset";
import { RANGE_TYPE } from "@bfchain/core-model-constants";
import { AccountSignatureModel } from "./accountSignature";
/**
 * exchangeSpecialAsset 交易 asset 模型
 *
 */
export declare class BeExchangeSpecialAssetModel extends Message<BeExchangeSpecialAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeSpecialAssetJSON> {
    static INC: number;
    /**要兑换的交易签名 */
    transactionSignatureBuffer: Uint8Array;
    get transactionSignature(): string;
    set transactionSignature(value: string);
    /**用于校验身份的密文签名，如果需要的话 */
    ciphertextSignatureBuffer: Uint8Array;
    get ciphertextSignature(): AccountSignatureModel;
    set ciphertextSignature(signature: AccountSignatureModel);
    /**to 交易有效期 */
    applyBlockHeight: number;
    numberOfEffectiveBlocks?: number;
    /**to 交易的接收者列表 */
    transactionRangeType: RANGE_TYPE;
    transactionRange: string[];
    /**交换的配置信息 */
    exchangeSpecialAsset: ToExchangeSpecialAssetModel;
    toJSON(): BFChainCore.BeExchangeSpecialAssetJSON;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<BeExchangeSpecialAssetModel>): T;
}
/**
 * exchangeSpecialAsset 交易 asset 外层模型
 *
 */
export declare class BeExchangeSpecialAssetAssetModel extends Message<BeExchangeSpecialAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeSpecialAssetAssetJSON> {
    beExchangeSpecialAsset: BeExchangeSpecialAssetModel;
    toJSON(): {
        beExchangeSpecialAsset: BFChainCore.BeExchangeSpecialAssetJSON;
    };
}
//# sourceMappingURL=beExchangeSpecialAsset.d.ts.map