import { BFChainCoreFactory, ConfigHelper, GenesisBlock, BNID_TYPE } from "@bfchain/core";
import { NodeJsCryptoHelper, NodeJsKeypairHelper, Ed2curveHelper } from "./helper";
import { ModuleStroge } from "@bfchain/util";
import { registerchainAssetData, mainChainAssetData } from "./utils";
import * as path from "path";
const rootPath = path.resolve(__dirname, "../../../../../assets");

export const moduleMap = new ModuleStroge();

function getBfchainCoreEntry(bnid = BNID_TYPE.TESTNET) {
  mainChainAssetData.bnid = bnid;
  return BFChainCoreFactory(
    {
      config: new ConfigHelper(
        GenesisBlock.fromObject({ version: 1, asset: { genesisAsset: mainChainAssetData } }),
        "genesisBlock",
      ),
      Buffer: Buffer as any,
      cryptoHelper: NodeJsCryptoHelper,
      keypairHelper: NodeJsKeypairHelper,
      ed2curveHelper: Ed2curveHelper,
    },
    moduleMap,
  );
}

function getFullBfchainCoreEntry(blockPerRound: number, forgeInterval: number) {
  const genesisBlock = require(`${rootPath}/genesisBlock-${blockPerRound}b-${forgeInterval}s.json`);
  return BFChainCoreFactory({
    config: new ConfigHelper(GenesisBlock.fromObject(genesisBlock), "genesisBlock"),
    Buffer: Buffer as any,
    cryptoHelper: NodeJsCryptoHelper,
    keypairHelper: NodeJsKeypairHelper,
    ed2curveHelper: Ed2curveHelper,
  });
}

function getRegisterBfchainCoreEntry(bnid = BNID_TYPE.TESTNET) {
  registerchainAssetData.bnid = bnid;
  return BFChainCoreFactory({
    config: new ConfigHelper(
      GenesisBlock.fromObject({ version: 1, asset: { genesisAsset: registerchainAssetData } }),
      "genesisBlock",
    ),
    Buffer: Buffer as any,
    cryptoHelper: NodeJsCryptoHelper,
    keypairHelper: NodeJsKeypairHelper,
    ed2curveHelper: Ed2curveHelper,
  });
}

function getFullRegisterBfchainCoreEntry() {
  const registerGenesisBlock: BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON> = require(`${rootPath}/registerGenesisBlock.json`);
  return BFChainCoreFactory({
    config: new ConfigHelper(GenesisBlock.fromObject(registerGenesisBlock), "genesisBlock"),
    Buffer: Buffer as any,
    cryptoHelper: NodeJsCryptoHelper,
    keypairHelper: NodeJsKeypairHelper,
    ed2curveHelper: Ed2curveHelper,
  });
}

export type AccountModel = {
  secret: string;
  publicKey: string;
  address: string;
  secondSecret?: string;
};

export {
  getBfchainCoreEntry,
  getFullBfchainCoreEntry,
  getRegisterBfchainCoreEntry,
  getFullRegisterBfchainCoreEntry,
};
