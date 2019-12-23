declare namespace BFChainCore {
  type ToJSONReturnType<T extends BFChainUtil.JSONAble> = ReturnType<T["toJSON"]>;
  type JSONToModelType<J extends object = object> = J & BFChainUtil.JSONAble<J>;
  type AssetJSONToModelType<J extends object = object> = JSONToModelType<J>;
  type AssetInfoJSON = {
    magic: string;
    assetType: string;
  };
}
