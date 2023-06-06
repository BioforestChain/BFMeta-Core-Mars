import { NodeJsCryptoHelper, NodeJsKeypairHelper, Ed2curveHelper } from "./helper";
import {
  BFChainCoreFactory,
  ConfigHelper,
  GenesisBlock,
  BNID_TYPE,
  TPOW_AUXILIARY_SYMBOL,
  TPOW_AUXILIARY_SYMBOL_LIST,
  TPOW_PARAMETER,
  TPOW_OPERATOR,
  TPOW_OPERATOR_LIST,
} from "@bfchain/core";

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
  genesisAmount: "244645364561314071",
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
  maxDelegateTxsPerRound: 10,
  maxGrabTimesOfGiftAsset: 1000000,
  maxVotesPerBlock: 0,
  voteMinChainAsset: "0",
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
  tpowOfWorkExemptionBlocks: 57,
  delegates: 114,
  whetherToAllowDelegateContinusElections: false,
  forgeInterval: 128,
  rewardPercent: {
    votePercent: {
      numerator: 7,
      denominator: 10,
    },
    forgePercent: {
      numerator: 3,
      denominator: 10,
    },
  },
  ports: {
    port: 19000,
    scan_peer_port: 19006,
  },
  rewardPerBlock: {
    heights: [48712, 9806288, 40193712],
    rewards: ["0", "4000000000", "2000000000", "0"],
  },
  accountParticipationWeightRatio: {
    balanceWeight: 5000,
    numberOfTransactionsWeight: 1,
  },
  blockParticipationWeightRatio: {
    balanceWeight: 5000,
    numberOfTransactionsWeight: 1,
  },
  // tpowDiffFormula: `( accountParticipation + 10 * accountNumberOfTransactionInBlock ) / 2 ** 3`,
  averageComputingPower: 125,
  transactionPowOfWorkConfig: {
    growthFactor: { numerator: "2718281828459045", denominator: "1000000000000000" },
    participationRatio: { numerator: 1, denominator: 1 },
  },
  maxBeginBalance: "0",
  maxTxCount: 0,
  nextRoundDelegates: [] as BFChainCore.NextRoundDelegateJSON[],
  newDelegates: [] as string[],
  rate: "0",
  assetChangeHash: "",
};

export const registerchainAssetData: BFChainCore.GenesisAssetJSON = {
  chainName: "qawaq",
  assetType: "QAWAQ",
  magic: "NMQX0",
  bnid: BNID_TYPE.TESTNET,
  beginEpochTime: new Date(new Date("2020-01-01").setHours(0, 0, 0, 0)).getTime(),
  genesisLocationName: "qawaq.qawaq",
  genesisAmount: "100000000000000",
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
  maxDelegateTxsPerRound: 10,
  maxGrabTimesOfGiftAsset: 1000000,
  maxVotesPerBlock: 0,
  voteMinChainAsset: "0",
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
  tpowOfWorkExemptionBlocks: 57,
  blockPerRound: 57,
  delegates: 114,
  whetherToAllowDelegateContinusElections: false,
  forgeInterval: 128,
  rewardPercent: {
    votePercent: {
      numerator: 1,
      denominator: 2,
    },
    forgePercent: {
      numerator: 1,
      denominator: 2,
    },
  },
  ports: {
    port: 19000,
    scan_peer_port: 19006,
  },
  rewardPerBlock: {
    heights: [48712, 9806288, 40193712],
    rewards: ["0", "4000000000", "2000000000", "0"],
  },
  accountParticipationWeightRatio: {
    balanceWeight: 5000,
    numberOfTransactionsWeight: 1,
  },
  blockParticipationWeightRatio: {
    balanceWeight: 5000,
    numberOfTransactionsWeight: 1,
  },
  // tpowDiffFormula: `${TPOW_AUXILIARY_SYMBOL.LEFT_BRACKET} ${TPOW_PARAMETER.ACCOUNT_PARTICIPATION} ${TPOW_OPERATOR.MULTIPLY} ${TPOW_PARAMETER.ACCOUNT_NUMBER_OF_TRANSACTION_IN_BLOCK} ${TPOW_AUXILIARY_SYMBOL.RIGHT_BRACKET}`,
  averageComputingPower: 125,
  transactionPowOfWorkConfig: {
    growthFactor: { numerator: "2718281828459045", denominator: "1000000000000000" },
    participationRatio: { numerator: 1, denominator: 1 },
  },
  maxBeginBalance: "0",
  maxTxCount: 0,
  nextRoundDelegates: [] as BFChainCore.NextRoundDelegateJSON[],
  newDelegates: [] as string[],
  rate: "0",
  assetChangeHash: "",
};
