import { KEY_SPLITTER } from "../../../constants";
import { Injectable } from "@bfchain/util-dep-inject";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { PARENT_ASSET_TYPE } from "@bfchain/core-model-constants";
const { ArgumentIllegalException } = CoreExceptionGenerator("HELPER", "transactionHelper");

@Injectable()
export class AssetIdV1Converter implements BFChainCore.CrossChain.AssetIdConverter {
  readonly version = "1" as const;

  checkEncodeArgs(assetInfo: BFChainCore.CrossChain.AssetBaseInfo) {
    if (!assetInfo) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `assetInfo ${assetInfo}`,
        target: "encodeArgs",
      });
    }
    const { parentAssetType, assetType } = assetInfo;
    if (
      parentAssetType !== PARENT_ASSET_TYPE.DAPP &&
      parentAssetType !== PARENT_ASSET_TYPE.LOCATION_NAME &&
      parentAssetType !== PARENT_ASSET_TYPE.ENTITY &&
      parentAssetType !== PARENT_ASSET_TYPE.ASSETS
    ) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `parentAssetType ${parentAssetType}`,
        target: "encodeArgs",
      });
    }

    if (typeof assetType !== "string") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `assetType ${assetType}`,
        target: "encodeArgs",
      });
    }
  }

  checkDecodeArgs(assetId: unknown) {
    if (!assetId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `assetId ${assetId}`,
        target: "decodeArgs",
      });
    }

    if (typeof assetId !== "string") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `assetId ${assetId}`,
        target: "decodeArgs",
      });
    }

    if (assetId.split(KEY_SPLITTER).length !== 3) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `assetId ${assetId}`,
        target: "decodeArgs",
      });
    }
  }

  encode(assetInfo: BFChainCore.CrossChain.AssetBaseInfo, skipVerify = false) {
    if (!skipVerify) {
      this.checkEncodeArgs(assetInfo);
    }
    return `${this.version}${KEY_SPLITTER}${assetInfo.parentAssetType}${KEY_SPLITTER}${assetInfo.assetType}`;
  }

  decode(assetId: string, skipVerify = false) {
    if (!skipVerify) {
      this.checkDecodeArgs(assetId);
    }
    const items = assetId.split(KEY_SPLITTER);
    return {
      parentAssetType: Number(items[1]),
      assetType: items[2],
    };
  }
}
