import { KEY_SPLITTER } from "../../../constants";
import { Injectable } from "@bfchain/util-dep-inject";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
const { ArgumentIllegalException } = CoreExceptionGenerator("HELPER", "transactionHelper");

@Injectable()
export class ToIdV1Converter implements BFChainCore.CrossChain.IdConverter {
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

  checkDecodeArgs(toId: unknown) {
    if (!toId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `toId ${toId}`,
        target: "decodeArgs",
      });
    }

    if (typeof toId !== "string") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `toId ${toId}`,
        target: "decodeArgs",
      });
    }

    if (toId.split(KEY_SPLITTER).length !== 2) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `toId ${toId}`,
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

  decode(toId: string, skipVerify = false) {
    if (!skipVerify) {
      this.checkDecodeArgs(toId);
    }
    const items = toId.split(KEY_SPLITTER);
    return items[1];
  }
}
