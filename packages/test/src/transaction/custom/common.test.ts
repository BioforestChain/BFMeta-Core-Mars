//	自定义交易
import {
  CustomTransaction,
  CustomTransactionFactory,
  RANGE_TYPE,
  BFChainCoreFactory,
  ConfigHelper,
} from "@bfchain/core";
import { NodeJsCryptoHelper, NodeJsKeypairHelper, ed2curveHelper } from "../../include";

import { SubChainCenter } from "./SubChainCenter";
import { ModuleStroge } from "@bfchain/util";

function CreateCoreWithSubCenter(demoname: string) {
  const moduleMap = new ModuleStroge();
  //  创建自定义交易处理中心（传入参数为要加载的自定义）
  const { resolve } = require("path");
  const scriptPath = resolve(
    process.cwd(),
    `./build/test/transaction/custom/scriptdemo/${demoname}`,
  );

  const center = new SubChainCenter(scriptPath);
  moduleMap.set("customTransactionCenter", center);

  return BFChainCoreFactory(
    {
      config: new ConfigHelper(
        require(require("path").join(process.cwd(), "./assets/genesisBlock.json")),
        "TEST",
      ),
      Buffer: Buffer as any,
      cryptoHelper: NodeJsCryptoHelper,
      keypairHelper: NodeJsKeypairHelper,
      ed2curveHelper: ed2curveHelper,
    },
    moduleMap,
  );
}

export function getCustomTransaction(sender: any, demoname: string, customdata: string) {
  const bfchainCore = CreateCoreWithSubCenter(demoname);

  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data = {
    version: 1,
    type: bfchainCore.transactionHelper.CUSTOM, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
    lns: `bnqkl.${bfchainCore.config.chainName}`,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    numberOfEffectiveBlocks: 100,
    storage: {
      key: "dappid",
      value: "CAPCOM123456789QWQQAQ",
    },
  };

  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = await bfchainCore.accountBaseHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey = await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
      sender.secret,
      sender.secondSecret,
    );
  }

  const trs = await bfchainCore.transaction.createTransaction<CustomTransaction>(
    CustomTransactionFactory,
    data,
    {
      custom: {
        type: "xxxxx",
        data: customdata,
      },
    },
    keypair,
    secondKeypair,
  );
  console.log(`createTransaction....${trs.toJSON()}`);
}
