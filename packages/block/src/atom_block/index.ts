import "@bfchain/core-typings";
export * from "./_blockbase";
export * from "./commonBlock";
export * from "./genesisBlock";
export * from "./roundLastBlock";
export * from "./blockGeneratorCalculator";
export * from "./pickNextRoundGenerators";
export * from "./blockForkCheck";

import type { CommonBlockFactory } from "./commonBlock";
import type { GenesisBlockFactory } from "./genesisBlock";
import type { RoundLastBlockFactory } from "./roundLastBlock";

export type SomeBlockFactoryConstructor =
  | typeof CommonBlockFactory
  | typeof GenesisBlockFactory
  | typeof RoundLastBlockFactory;

export type SomeBlockFactory = CommonBlockFactory | GenesisBlockFactory | RoundLastBlockFactory;
