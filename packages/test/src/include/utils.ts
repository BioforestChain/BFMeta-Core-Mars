import { NodeJsCryptoHelper, NodeJsKeypairHelper, Ed2curveHelper } from "./helper";
import { BFChainCoreFactory, ConfigHelper, GenesisBlock, BNID_TYPE } from "@bfchain/core";

export function getBfchainCore(genesisBlock: GenesisBlock) {
  return BFChainCoreFactory({
    config: new ConfigHelper(genesisBlock, "TEST"),
    Buffer: Buffer as any,
    cryptoHelper: NodeJsCryptoHelper,
    keypairHelper: NodeJsKeypairHelper,
    ed2curveHelper: Ed2curveHelper,
  });
}

export const config = {
  url: "http://localhost:19002",
  genesisSecret: require(require("path").join(process.cwd(), "./assets/secret.json"))
    .genesis as string,
  generatorsSecret: require(require("path").join(process.cwd(), "./assets/secret.json"))
    .genesisGenerators as string[],
};

export const mainChainAssetData: BFChainCore.GenesisAssetJSON = {
  chainName: "bfmetatest",
  assetType: "BFMTEST",
  magic: "00F0Y",
  bnid: BNID_TYPE.TESTNET,
  maxSupply: "10000000000000000",
  basicRewards: "100000000",
  beginEpochTime: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
  // beginEpochTime: new Date(new Date("2022-11-1").setHours(22, 10, 0, 0)).getTime(),
  genesisLocationName: "bfmtest.bfmetatest",
  genesisAmount: "100000000000000",
  minTransactionFeePerByte: {
    numerator: 3,
    denominator: 1,
  },
  maxTPSPerBlock: 1000,
  maxTransactionSize: 409600,
  maxTransactionBlobSize: 1024 * 1024 * 1024,
  maxBlockSize: 838860800,
  maxBlockBlobSize: 4 * 1024 * 1024 * 1024,
  consessusBeforeSyncBlockDiff: 7,
  maxGrabTimesOfGiftAsset: 1000000,
  issueAssetMinChainAsset: "100000000",
  maxMultipleOfAssetAndMainAsset: {
    numerator: "100000",
    denominator: "1",
  },
  issueEntityFactoryMinChainAsset: "100000",
  maxMultipleOfEntityAndMainAsset: {
    numerator: "1000",
    denominator: "1",
  },
  registerChainMinChainAsset: "1000000000000",
  maxApplyAndConfirmedBlockHeightDiff: 5760,
  blockPerRound: 50,
  whetherToAllowGeneratorContinusElections: false,
  forgeInterval: 15,
  ports: {
    port: 19000,
  },
  nextRoundGenerators: [],
  assetChangeHash: "",
};

export const registerchainAssetData: BFChainCore.GenesisAssetJSON = {
  chainName: "qawaq",
  assetType: "QAWAQ",
  magic: "NMQX0",
  bnid: BNID_TYPE.TESTNET,
  beginEpochTime: new Date(new Date("2020-01-01").setHours(0, 0, 0, 0)).getTime(),
  genesisLocationName: "qawaq.qawaq",
  genesisAmount: "10000000000000000",
  maxSupply: "4000000000000000000",
  minTransactionFeePerByte: {
    numerator: 88,
    denominator: 100,
  },
  maxTPSPerBlock: 1000,
  maxTransactionSize: 409600,
  maxTransactionBlobSize: 1024 * 1024 * 1024,
  maxBlockSize: 838860800,
  maxBlockBlobSize: 4 * 1024 * 1024 * 1024,
  consessusBeforeSyncBlockDiff: 7,
  maxGrabTimesOfGiftAsset: 1000000,
  issueAssetMinChainAsset: "10000000000000",
  maxMultipleOfAssetAndMainAsset: {
    numerator: "100000",
    denominator: "1",
  },
  maxMultipleOfEntityAndMainAsset: {
    numerator: "100000",
    denominator: "1",
  },
  issueEntityFactoryMinChainAsset: "50000000000000",
  registerChainMinChainAsset: "10000000000000",
  maxApplyAndConfirmedBlockHeightDiff: 57,
  whetherToAllowGeneratorContinusElections: false,
  blockPerRound: 10,
  forgeInterval: 15,
  basicRewards: "100000000",
  ports: {
    port: 19000,
  },
  nextRoundGenerators: [] as BFChainCore.NextRoundGeneratorJSON[],
  assetChangeHash: "",
};
