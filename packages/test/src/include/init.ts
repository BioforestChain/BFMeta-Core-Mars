import { BFChainCoreFactory, ConfigHelper, GenesisBlock, BNID_TYPE } from "@bfchain/core";
import { NodeJsCryptoHelper, NodeJsKeypairHelper, Ed2curveHelper } from "./helper";
import { ModuleStroge } from "@bfchain/util";
import { registerchainRemarkData, mainChainRemarkData } from "./utils";
import * as path from "path";
const rootPath = path.resolve(__dirname, "../../../../../assets");

export const moduleMap = new ModuleStroge();

function getBfchainCoreEntry(bnid = BNID_TYPE.TESTNET) {
  mainChainRemarkData.bnid = bnid;
  return BFChainCoreFactory(
    {
      config: new ConfigHelper(
        GenesisBlock.fromObject({ remark: mainChainRemarkData }),
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
  registerchainRemarkData.bnid = bnid;
  return BFChainCoreFactory({
    config: new ConfigHelper(
      GenesisBlock.fromObject({ remark: registerchainRemarkData }),
      "genesisBlock",
    ),
    Buffer: Buffer as any,
    cryptoHelper: NodeJsCryptoHelper,
    keypairHelper: NodeJsKeypairHelper,
    ed2curveHelper: Ed2curveHelper,
  });
}

function getFullRegisterBfchainCoreEntry() {
  const registerGenesisBlock: BFChainCore.BlockJSON<BFChainCore.GenesisBlockRemarkJSON> = require(`${rootPath}/registerGenesisBlock.json`);
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
