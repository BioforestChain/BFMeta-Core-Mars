import { Message } from "@bfchain/protobuf";
import { ToExchangeAssetModel } from "./toExchangeAsset";
import { RANGE_TYPE } from "@bfchain/core-model-constants";
import { AccountSignatureModel } from "./accountSignature";
/**
 * exchangeAsset 交易 asset 模型
 *
 */
export declare class BeExchangeAssetModel extends Message<BeExchangeAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeAssetJSON> {
    static INC: number;
    /**要兑换的交易签名 */
    transactionSignatureBuffer: Uint8Array;
    get transactionSignature(): string;
    set transactionSignature(value: string);
    /**用于校验身份的密文签名，如果需要的话 */
    ciphertextSignatureBuffer: Uint8Array;
    get ciphertextSignature(): AccountSignatureModel;
    set ciphertextSignature(signature: AccountSignatureModel);
    /**希望交换得到的资产数量 */
    toExchangeNumber: string;
    /**用于交换的资产数量 */
    beExchangeNumber: string;
    /**to 交易有效期 */
    applyBlockHeight: number;
    numberOfEffectiveBlocks?: number;
    /**to 交易的接收者列表 */
    transactionRangeType: RANGE_TYPE;
    transactionRange: string[];
    /**交换的配置信息 */
    exchangeAsset: ToExchangeAssetModel;
    get to(): {
        magic: string;
        chainName: string;
        assetType: string;
        amount: string;
    };
    get be(): {
        magic: string;
        chainName: string;
        assetType: string;
        amount: string;
    };
    get exchangeRate(): import("@bfchain/core-model-common").RateModel;
    get toInfo(): {
        applyBlockHeight: number;
        numberOfEffectiveBlocks?: number | undefined;
    };
    toJSON(): BFChainCore.BeExchangeAssetJSON;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<BeExchangeAssetModel>): T;
}
/**
 * exchangeAsset 交易 asset 外层模型
 *
 */
export declare class BeExchangeAssetAssetModel extends Message<BeExchangeAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeAssetAssetJSON> {
    beExchangeAsset: BeExchangeAssetModel;
    toJSON(): {
        beExchangeAsset: BFChainCore.BeExchangeAssetJSON;
    };
}
//# sourceMappingURL=beExchangeAsset.d.ts.map