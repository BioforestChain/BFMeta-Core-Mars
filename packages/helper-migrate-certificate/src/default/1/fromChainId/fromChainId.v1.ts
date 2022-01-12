import { KEY_SPLITTER } from "../../../constants";
import { Injectable } from "@bfchain/util-dep-inject";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
const { ArgumentIllegalException } = CoreExceptionGenerator("HELPER", "transactionHelper");

@Injectable()
export class FromChainIdV1Converter implements BFChainCore.CrossChain.ChainIdConverter {
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

  checkDecodeArgs(fromChainId: unknown) {
    if (!fromChainId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `fromChainId ${fromChainId}`,
        target: "decodeArgs",
      });
    }

    if (typeof fromChainId !== "string") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `fromChainId ${fromChainId}`,
        target: "decodeArgs",
      });
    }

    if (fromChainId.split(KEY_SPLITTER).length !== 4) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `fromChainId ${fromChainId}`,
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

  decode(fromChainId: string, skipVerify = false) {
    if (!skipVerify) {
      this.checkDecodeArgs(fromChainId);
    }
    const items = fromChainId.split(KEY_SPLITTER);
    return {
      magic: items[1],
      chainName: items[2],
      genesisBlockSignature: items[3],
    };
  }
}
