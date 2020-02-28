import { BFChainCoreFactory, ConfigHelper, NetType, GenesisBlock } from "@bfchain/core";
import { NodeJsCryptoHelper, NodeJsKeypairHelper, Ed2curveHelper } from "./helper";
import { ModuleStroge } from "@bfchain/util";
import { registerchainRemarkData, mainChainRemarkData } from "./utils";
import * as path from "path";
const rootPath = path.resolve(__dirname, "../../../../../assets");

export const moduleMap = new ModuleStroge();
const bfchainCore = BFChainCoreFactory(
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

function getFullBfchainCore(blockPerRound: number, forgeInterval: number) {
  const genesisBlock = require(`${rootPath}/genesisBlock-${blockPerRound}b-${forgeInterval}s.json`);
  return BFChainCoreFactory({
    config: new ConfigHelper(GenesisBlock.fromObject(genesisBlock), "genesisBlock"),
    Buffer: Buffer as any,
    cryptoHelper: NodeJsCryptoHelper,
    keypairHelper: NodeJsKeypairHelper,
    ed2curveHelper: Ed2curveHelper,
  });
}

const registerBfchainCore = BFChainCoreFactory({
  config: new ConfigHelper(
    GenesisBlock.fromObject({ remark: registerchainRemarkData }),
    "genesisBlock",
  ),
  Buffer: Buffer as any,
  cryptoHelper: NodeJsCryptoHelper,
  keypairHelper: NodeJsKeypairHelper,
  ed2curveHelper: Ed2curveHelper,
});

function getFullRegisterBfchainCore() {
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

export { bfchainCore, getFullBfchainCore, registerBfchainCore, getFullRegisterBfchainCore };
