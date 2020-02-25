import { Message } from "@bfchain/protobuf";
export declare class SetLnsManagerModel extends Message<SetLnsManagerModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.SetLnsManagerJSON> {
    name: string;
    sourceChainName: string;
    sourceChainMagic: string;
    manager: string;
    toJSON(): {
        name: string;
        sourceChainName: string;
        sourceChainMagic: string;
        manager: string;
    };
}
export declare class SetLnsManagerAssetModel extends Message<SetLnsManagerAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.SetLnsManagerAssetJSON> {
    lnsManager: SetLnsManagerModel;
    toJSON(): {
        lnsManager: {
            name: string;
            sourceChainName: string;
            sourceChainMagic: string;
            manager: string;
        };
    };
}
