import { errorCode } from "@bfchain/core-util-exception-errorcode";
import { UtilExceptionGenerator } from "@bfchain/util-exception";

export function CoreExceptionGenerator(MODULE: string, FILE: string) {
  return UtilExceptionGenerator(MODULE, FILE, {
    errorCodeMap: errorCode,
    businessName: "core",
  });
}
