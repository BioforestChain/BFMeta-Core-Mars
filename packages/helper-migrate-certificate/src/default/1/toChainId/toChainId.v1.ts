import { KEY_SPLITTER } from "../../../constants";
import { Injectable } from "@bfchain/util-dep-inject";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
const { ArgumentIllegalException } = CoreExceptionGenerator("HELPER", "transactionHelper");

@Injectable()
export class ToChainIdV1Converter implements BFChainCore.CrossChain.ChainIdConverter {
  readonly version = "1" as const;

  checkEncodeArgs(chainInfo: BFChainCore.CrossChain.ChainBaseInfo) {
    if (!chainInfo) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `chainInfo ${chainInfo}`,
        target: "encodeArgs",
      });
    }

    const { chainName, magic, genesisBlockSignature } = chainInfo;
    if (!chainName) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `chainName ${chainName}`,
        target: "encodeArgs",
      });
    }
    if (typeof chainName !== "string") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `chainName ${chainName}`,
        target: "encodeArgs",
      });
    }

    if (!magic) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `magic ${magic}`,
        target: "encodeArgs",
      });
    }
    if (typeof magic !== "string") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `magic ${magic}`,
        target: "encodeArgs",
      });
    }

    if (!genesisBlockSignature) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `genesisBlockSignature ${genesisBlockSignature}`,
        target: "encodeArgs",
      });
    }
    if (typeof genesisBlockSignature !== "string") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `genesisBlockSignature ${genesisBlockSignature}`,
        target: "encodeArgs",
      });
    }
  }

  checkDecodeArgs(toChainId: unknown) {
    if (!toChainId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `toChainId ${toChainId}`,
        target: "decodeArgs",
      });
    }

    if (typeof toChainId !== "string") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `toChainId ${toChainId}`,
        target: "decodeArgs",
      });
    }

    if (toChainId.split(KEY_SPLITTER).length !== 4) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `toChainId ${toChainId}`,
        target: "decodeArgs",
      });
    }
  }

  encode(chainInfo: BFChainCore.CrossChain.ChainBaseInfo, skipVerify = false) {
    if (!skipVerify) {
      this.checkEncodeArgs(chainInfo);
    }
    return `${this.version}${KEY_SPLITTER}${chainInfo.magic}${KEY_SPLITTER}${chainInfo.chainName}${KEY_SPLITTER}${chainInfo.genesisBlockSignature}`;
  }

  decode(toChainId: string, skipVerify = false) {
    if (!skipVerify) {
      this.checkDecodeArgs(toChainId);
    }
    const items = toChainId.split(KEY_SPLITTER);
    return {
      magic: items[1],
      chainName: items[2],
      genesisBlockSignature: items[3],
    };
  }
}
