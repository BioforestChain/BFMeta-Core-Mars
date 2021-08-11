import { KEY_SPLITTER } from "../../../constants";
import { Injectable } from "@bfchain/util-dep-inject";
import {
  CoreExceptionGenerator,
  PROP_IS_INVALID,
  PROP_IS_REQUIRE,
} from "@bfchain/core-util-exception";
const { ArgumentIllegalException } = CoreExceptionGenerator("HELPER", "transactionHelper");

@Injectable()
export class ToChainIdV1Converter implements BFChainCore.CrossChain.ChainIdConverter {
  readonly version = "1" as const;

  checkEncodeArgs(chainInfo: BFChainCore.CrossChain.ChainBaseInfo) {
    const { chainName, magic, genesisBlockSignature } = chainInfo;
    if (!chainName) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: `chainName ${chainName}`,
        target: "encodeArgs",
        function: "checkEncodeArgs",
      });
    }
    if (typeof chainName !== "string") {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `chainName ${chainName}`,
        target: "encodeArgs",
        function: "checkEncodeArgs",
      });
    }

    if (!magic) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: `magic ${magic}`,
        target: "encodeArgs",
        function: "checkEncodeArgs",
      });
    }
    if (typeof magic !== "string") {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `magic ${magic}`,
        target: "encodeArgs",
        function: "checkEncodeArgs",
      });
    }

    if (!genesisBlockSignature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: `genesisBlockSignature ${genesisBlockSignature}`,
        target: "encodeArgs",
        function: "checkEncodeArgs",
      });
    }
    if (typeof genesisBlockSignature !== "string") {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `genesisBlockSignature ${genesisBlockSignature}`,
        target: "encodeArgs",
        function: "checkEncodeArgs",
      });
    }
  }

  checkDecodeArgs(toChainId: unknown) {
    if (!toChainId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: `toChainId ${toChainId}`,
        target: "decodeArgs",
        function: "checkDecodeArgs",
      });
    }

    if (typeof toChainId !== "string") {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `toChainId ${toChainId}`,
        target: "decodeArgs",
        function: "checkDecodeArgs",
      });
    }

    if (toChainId.split(KEY_SPLITTER).length !== 4) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `toChainId ${toChainId}`,
        target: "decodeArgs",
        function: "checkDecodeArgs",
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
