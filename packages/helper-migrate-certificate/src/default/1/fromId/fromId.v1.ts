import { KEY_SPLITTER } from "../../../constants";
import { Injectable } from "@bfchain/util-dep-inject";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
const { ArgumentIllegalException } = CoreExceptionGenerator("HELPER", "transactionHelper");

@Injectable()
export class FromIdV1Converter implements BFChainCore.CrossChain.IdConverter {
  readonly version = "1" as const;

  checkEncodeArgs(address: string) {
    if (!address) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `address ${address}`,
        target: "encodeArgs",
      });
    }
    if (typeof address !== "string") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `address ${address}`,
        target: "encodeArgs",
      });
    }
  }

  checkDecodeArgs(fromId: unknown) {
    if (!fromId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `fromId ${fromId}`,
        target: "decodeArgs",
      });
    }

    if (typeof fromId !== "string") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `fromId ${fromId}`,
        target: "decodeArgs",
      });
    }

    if (fromId.split(KEY_SPLITTER).length !== 2) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `fromId ${fromId}`,
        target: "decodeArgs",
      });
    }
  }

  encode(address: string, skipVerify = false) {
    if (!skipVerify) {
      this.checkEncodeArgs(address);
    }
    return `${this.version}${KEY_SPLITTER}${address}`;
  }

  decode(fromId: string, skipVerify = false) {
    if (!skipVerify) {
      this.checkDecodeArgs(fromId);
    }
    const items = fromId.split(KEY_SPLITTER);
    return items[1];
  }
}
