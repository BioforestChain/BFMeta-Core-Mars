import "./@types";

export * from "./_blockbase";
export * from "./commonBlock";
export * from "./genesisBlock";
export * from "./roundLastBlock";
export * from "./blockGeneratorCalculator";
export * from "./pickNextRoundDelegates";
export * from "./blockForkCheck";

import { CommonBlockFactory } from "./commonBlock";
import { GenesisBlockFactory } from "./genesisBlock";
import { RoundLastBlockFactory } from "./roundLastBlock";

export type SomeBlockFactoryConstructor =
  | typeof CommonBlockFactory
  | typeof GenesisBlockFactory
  | typeof RoundLastBlockFactory;

export type SomeBlockFactory = CommonBlockFactory | GenesisBlockFactory | RoundLastBlockFactory;
