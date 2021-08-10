import { KEY_SPLITTER } from "../../../constants";
import { Injectable } from "@bfchain/util-dep-inject";
import {
  CoreExceptionGenerator,
  PROP_IS_INVALID,
  PROP_IS_REQUIRE,
} from "@bfchain/core-util-exception";
const { ArgumentIllegalException } = CoreExceptionGenerator("HELPER", "transactionHelper");

@Injectable()
export class AssetTypeIdV1Converter implements BFChainCore.CrossChain.AssetTypeIdConverter {
  readonly version = "1" as const;

  checkEncodeArgs(assetType: string) {
    if (!assetType) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "assetType",
        target: "encodeArgs",
        function: "checkEncodeArgs",
      });
    }
    if (typeof assetType !== "string") {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "assetType",
        target: "encodeArgs",
        function: "checkEncodeArgs",
      });
    }
  }

  checkDecodeArgs(assetTypeId: unknown) {
    if (!assetTypeId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "decodeArgs",
        function: "checkDecodeArgs",
      });
    }

    if (typeof assetTypeId !== "string") {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "decodeArgs",
        function: "checkDecodeArgs",
      });
    }

    if (assetTypeId.split(KEY_SPLITTER).length !== 2) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "decodeArgs",
        function: "checkDecodeArgs",
      });
    }
  }

  encode(assetType: string, skipVerify = false) {
    if (!skipVerify) {
      this.checkEncodeArgs(assetType);
    }
    return `${this.version}${KEY_SPLITTER}${assetType}`;
  }

  decode(assetTypeId: string, skipVerify = false) {
    if (!skipVerify) {
      this.checkDecodeArgs(assetTypeId);
    }
    const items = assetTypeId.split(KEY_SPLITTER);
    return items[1];
  }
}
