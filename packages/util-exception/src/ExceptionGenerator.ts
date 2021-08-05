import { errorCode } from "@bfchain/core-util-exception-errorcode";
import { UtilExceptionGenerator, Exception } from "@bfchain/util-exception";

class IdempotentException extends Exception {
  static TYPE = "IdempotentException";
}

export function CoreExceptionGenerator(MODULE: string, FILE: string) {
  const res = UtilExceptionGenerator(MODULE, FILE, {
    errorCodeMap: errorCode,
    businessName: "core",
  });
  let _IdempotentException: undefined | typeof IdempotentException;
  return Object.create(res, {
    IdempotentException: {
      get() {
        return (_IdempotentException ??= res.getException(IdempotentException));
      },
    },
  }) as typeof res & {
    IdempotentException: typeof IdempotentException;
  };
}
