export * from "./ed2curve";
import { convertPublicKey, convertSecretKey } from "./ed2curve";
typeof import("@bfchain/core-typings");

export const ed2curveHelper: BFChainCore.Ed2curveHelperInterface = {
  convertPublicKey,
  convertSecretKey,
};
