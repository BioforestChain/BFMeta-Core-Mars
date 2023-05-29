import "@bfchain/core-typings";
import type {} from "@bfchain/core-helper-account";
import type {} from "@bfchain/core-transaction-logic-verifier";

export * from "./customLogicVerifier";
export * from "./registerChainLogicVerifier";

import { TRANSACTION_TYPES_BASE } from "@bfchain/core-model-transaction";
import { TRANSACTION_LOGIC_VERIFIER_TYPES_MAP } from "@bfchain/core-transaction-logic-verifier";

import { RegisterChainLogicVerifier } from "./registerChainLogicVerifier";
import { CustomLogicVerifier } from "./customLogicVerifier";

TRANSACTION_LOGIC_VERIFIER_TYPES_MAP.KLV.set(
  TRANSACTION_TYPES_BASE.REGISTER_CHAIN,
  RegisterChainLogicVerifier,
);
TRANSACTION_LOGIC_VERIFIER_TYPES_MAP.LVK.set(
  RegisterChainLogicVerifier,
  TRANSACTION_TYPES_BASE.REGISTER_CHAIN,
);

TRANSACTION_LOGIC_VERIFIER_TYPES_MAP.KLV.set(TRANSACTION_TYPES_BASE.CUSTOM, CustomLogicVerifier);
TRANSACTION_LOGIC_VERIFIER_TYPES_MAP.LVK.set(CustomLogicVerifier, TRANSACTION_TYPES_BASE.CUSTOM);
