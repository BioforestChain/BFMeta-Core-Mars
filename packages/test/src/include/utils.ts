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
  delegatesSecret: require(require("path").join(process.cwd(), "./assets/secret.json"))
    .delegates as string[],
};

export const mainChainAssetData: BFChainCore.GenesisAssetJSON = {
  chainName: "bfchain",
  assetType: "BFT",
  magic: "E00EI",
  bnid: BNID_TYPE.TESTNET,
  beginEpochTime: new Date(new Date("2020-01-01").setHours(0, 0, 0, 0)).getTime(),
  genesisLocationName: "ibt.bfchain",
  genesisAmount: "10000000000000000",
  maxSupply: "4000000000000000000",
  minTransactionFeePerByte: {
    numerator: 100,
    denominator: 1024,
  },
  maxTPSPerBlock: 1000,
  maxTransactionSize: 409600,
  maxTransactionBlobSize: 1024 * 1024 * 1024,
  maxBlockSize: 33554432,
  maxBlockBlobSize: 4 * 1024 * 1024 * 1024,
  consessusBeforeSyncBlockDiff: 7,
  maxGrabTimesOfGiftAsset: 1000000,
  issueAssetMinChainAsset: "50000000000000",
  maxMultipleOfAssetAndMainAsset: {
    numerator: "100000",
    denominator: "1",
  },
  issueEntityFactoryMinChainAsset: "50000000000000",
  maxMultipleOfEntityAndMainAsset: {
    numerator: "100000",
    denominator: "1",
  },
  registerChainMinChainAsset: "50000000000000",
  maxApplyAndConfirmedBlockHeightDiff: 259200,
  blockPerRound: 57,
  delegates: 114,
  whetherToAllowDelegateContinusElections: false,
  forgeInterval: 128,
  basicRewards: "100000000",
  ports: {
    port: 19000,
  },
  nextRoundDelegates: [] as BFChainCore.NextRoundDelegateJSON[],
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
  whetherToAllowDelegateContinusElections: false,
  delegates: 114,
  blockPerRound: 57,
  forgeInterval: 128,
  basicRewards: "100000000",
  ports: {
    port: 19000,
  },
  nextRoundDelegates: [] as BFChainCore.NextRoundDelegateJSON[],
  assetChangeHash: "",
};
