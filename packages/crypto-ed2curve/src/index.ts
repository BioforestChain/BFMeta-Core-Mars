import type {} from "@bfchain/core-typings";
export * from "./ed2curve";
import { convertPublicKey, convertSecretKey } from "./ed2curve";

export const ed2curveHelper: BFChainCore.Ed2curveHelperInterface = {
  convertPublicKey,
  convertSecretKey,
};
