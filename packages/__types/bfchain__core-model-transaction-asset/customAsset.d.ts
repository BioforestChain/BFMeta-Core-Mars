import { Message } from "@bfchain/protobuf";
export declare class CustomModel extends Message<CustomModel> implements BFChainUtil.JSONAble<BFChainCore.CustomJSON> {
    type: string;
    data: string;
    toJSON(): {
        type: string;
        data: string;
    };
}
export declare class CustomAssetModel extends Message<CustomAssetModel> implements BFChainUtil.JSONAble<BFChainCore.CustomAssetJSON> {
    custom: CustomModel;
    toJSON(): {
        custom: {
            type: string;
            data: string;
        };
    };
}
