import { Message } from "@bfchain/protobuf";
/**
 * CustomAsset 类型
 *
 */
export declare class CustomModel extends Message<CustomModel> implements BFChainUtil.JSONAble<BFChainCore.CustomJSON> {
    type: string;
    data: string;
    toJSON(): {
        type: string;
        data: string;
    };
}
/**
 * 自定义 交易 asset 外层模型
 *
 */
export declare class CustomAssetModel extends Message<CustomAssetModel> implements BFChainUtil.JSONAble<BFChainCore.CustomAssetJSON> {
    custom: CustomModel;
    toJSON(): {
        custom: {
            type: string;
            data: string;
        };
    };
}
//# sourceMappingURL=customAsset.d.ts.map