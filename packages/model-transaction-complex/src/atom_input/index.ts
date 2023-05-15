export * from "./constants";

export * from "./_baseInput";

export * from "./numberInput";
export * from "./calcInput";

export * from "./textInput";
export * from "./addressInput";
export * from "./signatureInput";

import type { BaseInputModel } from "./_baseInput";
import { NumberInputModel } from "./numberInput";
import { CalcInputModel } from "./calcInput";
import { TextInputModel } from "./textInput";
import { AddressInputModel } from "./addressInput";
import { SignatureInputModel } from "./signatureInput";
import { MACRO_INPUT_TYPE } from "./constants";

/**
 * K : MACRO_INPUT_TYPE KEY
 * V : MACRO_INPUT_TYPE VALUE
 * M : InputModelConstructror
 */
export const MACRO_INPUT_TYPES_MAP = (() => {
  const BASE_MODEL = new Map<MACRO_INPUT_TYPE, typeof BaseInputModel>();
  const MODEL_BASE = new Map<typeof BaseInputModel, MACRO_INPUT_TYPE>();
  (
    [
      [MACRO_INPUT_TYPE.NUMBER, NumberInputModel],
      [MACRO_INPUT_TYPE.CALC, CalcInputModel],
      [MACRO_INPUT_TYPE.TEXT, TextInputModel],
      [MACRO_INPUT_TYPE.ADDRESS, AddressInputModel],
      [MACRO_INPUT_TYPE.SIGNATURE, SignatureInputModel],
    ] as [MACRO_INPUT_TYPE, typeof BaseInputModel][]
  ).forEach(([K, M]) => {
    BASE_MODEL.set(K, M);
    MODEL_BASE.set(M, K);
  });

  return {
    VM: BASE_MODEL,
    MV: MODEL_BASE,
  };
})();
