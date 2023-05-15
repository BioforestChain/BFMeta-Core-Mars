import type {} from "@bfchain/core-helper-account";

export * from "./promiseLogicVerifier";
export * from "./promiseResolveLogicVerifier";
export * from "./macroLogicVerifier";
export * from "./macroCallLogicVerifier";
export * from "./multipleLogicVerifier";

import { TRANSACTION_TYPES_BASE } from "@bfchain/core-model-transaction";
import { TRANSACTION_LOGIC_VERIFIER_TYPES_MAP } from "@bfchain/core-transaction-logic-verifier";

import { PromiseLogicVerifier } from "./promiseLogicVerifier";
import { PromiseResolveLogicVerifier } from "./promiseResolveLogicVerifier";
import { MacroLogicVerifier } from "./macroLogicVerifier";
import { MacroCallLogicVerifier } from "./macroCallLogicVerifier";
import { MultipleLogicVerifier } from "./multipleLogicVerifier";

TRANSACTION_LOGIC_VERIFIER_TYPES_MAP.KLV.set(TRANSACTION_TYPES_BASE.PROMISE, PromiseLogicVerifier);
TRANSACTION_LOGIC_VERIFIER_TYPES_MAP.LVK.set(PromiseLogicVerifier, TRANSACTION_TYPES_BASE.PROMISE);
TRANSACTION_LOGIC_VERIFIER_TYPES_MAP.KLV.set(
  TRANSACTION_TYPES_BASE.PROMISE_RESOLVE,
  PromiseResolveLogicVerifier,
);
TRANSACTION_LOGIC_VERIFIER_TYPES_MAP.LVK.set(
  PromiseResolveLogicVerifier,
  TRANSACTION_TYPES_BASE.PROMISE_RESOLVE,
);

TRANSACTION_LOGIC_VERIFIER_TYPES_MAP.KLV.set(TRANSACTION_TYPES_BASE.MACRO, MacroLogicVerifier);
TRANSACTION_LOGIC_VERIFIER_TYPES_MAP.LVK.set(MacroLogicVerifier, TRANSACTION_TYPES_BASE.MACRO);
TRANSACTION_LOGIC_VERIFIER_TYPES_MAP.KLV.set(
  TRANSACTION_TYPES_BASE.MACRO_CALL,
  MacroCallLogicVerifier,
);
TRANSACTION_LOGIC_VERIFIER_TYPES_MAP.LVK.set(
  MacroCallLogicVerifier,
  TRANSACTION_TYPES_BASE.MACRO_CALL,
);

TRANSACTION_LOGIC_VERIFIER_TYPES_MAP.KLV.set(
  TRANSACTION_TYPES_BASE.MULTIPLE,
  MultipleLogicVerifier,
);
TRANSACTION_LOGIC_VERIFIER_TYPES_MAP.LVK.set(
  MultipleLogicVerifier,
  TRANSACTION_TYPES_BASE.MULTIPLE,
);
