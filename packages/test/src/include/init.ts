import { BFChainCoreFactory, ConfigHelper, NetType, GenesisBlock } from "../../src";
import { NodeJsCryptoHelper, NodeJsKeypairHelper, Ed2curveHelper } from "./helper";
import { ModuleStroge } from "./@bfchain/util";
import { subchainRemarkData, mainChainRemarkData } from "./utils";
import * as path from "path";
const rootPath = path.resolve(__dirname, "../../../assets");
const genesisBlock: BFChainCore.BlockJSON<
  BFChainCore.GenesisBlockRemarkJSON
> = require(`${rootPath}/genesisBlock.json`);

const subGenesisBlock: BFChainCore.BlockJSON<
  BFChainCore.GenesisBlockRemarkJSON
> = require(`${rootPath}/subGenesisBlock.json`);

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

const fullBfchainCore = BFChainCoreFactory({
  config: new ConfigHelper(GenesisBlock.fromObject(genesisBlock), "genesisBlock"),
  Buffer: Buffer as any,
  cryptoHelper: NodeJsCryptoHelper,
  keypairHelper: NodeJsKeypairHelper,
  ed2curveHelper: Ed2curveHelper,
});

const subBfchainCore = BFChainCoreFactory({
  config: new ConfigHelper(GenesisBlock.fromObject({ remark: subchainRemarkData }), "genesisBlock"),
  Buffer: Buffer as any,
  cryptoHelper: NodeJsCryptoHelper,
  keypairHelper: NodeJsKeypairHelper,
  ed2curveHelper: Ed2curveHelper,
});

const fullSubBfchainCore = BFChainCoreFactory({
  config: new ConfigHelper(GenesisBlock.fromObject(subGenesisBlock), "genesisBlock"),
  Buffer: Buffer as any,
  cryptoHelper: NodeJsCryptoHelper,
  keypairHelper: NodeJsKeypairHelper,
  ed2curveHelper: Ed2curveHelper,
});

export type AccountModel = {
  secret: string;
  publicKey: string;
  address: string;
  secondSecret?: string;
};

export { bfchainCore, fullBfchainCore, subBfchainCore, fullSubBfchainCore };

// console.log("256", bfchainCore.accountBaseHelper.getAddressFromSecret("1"));
// console.log(
//   "256",
//   NodeJsCryptoHelper.sha256()
//     .update("1", "utf8")
//     .digest(),
// );
// console.log("256", bfchainCore.accountBaseHelper.createSecretKeypair("1"));

// NodeJsKeypairHelper.create = secret => {
//   const hash = NodeJsCryptoHelper.sha512()
//     .update(secret, "utf8")
//     .digest();
//   const keypair = tweetnacl.sign.keyPair.fromSecretKey(hash);
//   return {
//     secretKey: Buffer.from(keypair.secretKey),
//     publicKey: Buffer.from(keypair.publicKey),
//   };
// };

// console.log("512", bfchainCore.accountBaseHelper.getAddressFromSecret("1"));
// console.log("512", bfchainCore.accountBaseHelper.createSecretKeypair("1"));
