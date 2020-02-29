import {
  CommonBlock,
  CommonBlockFactory,
  AcceptVoteTransaction,
  AcceptVoteTransactionFactory,
  TransactionInBlock,
  RANGE_TYPE,
} from "@bfchain/core";
const { dump } = require("dumper.js");

import { getSenderWithoutSecondSecret, bfchainCore, AccountModel } from "../include";

const delegatesSecret = require("../../../assets/secret.json").delegates as string[];

async function getAcceptVoteTransaction(sender: AccountModel) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.ACCEPT_VOTE, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收账户地址
    timestamp: 770880, // 生成交易时间戳
    fee: "10", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: "", // 交易所属的 dappid
    lns: "",
    sourceIP: "", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 1, // 交易发起高度
    effectiveBlockHeight: 10100,
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
  const trs = await bfchainCore.transaction.createTransaction<AcceptVoteTransaction>(
    AcceptVoteTransactionFactory,
    data,
    {},
    keypair,
    secondKeypair,
  );
  return trs;
}

async function getTrsInBlock() {
  const txs = [];
  for (const secret of delegatesSecret) {
    const address = await bfchainCore.accountBaseHelper.getAddressFromSecret(secret);
    const publicKey = await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(secret);
    const delegate = {
      secret,
      address,
      publicKey,
    };
    txs[txs.length] = getAcceptVoteTransaction(delegate);
  }
  const blockTrsItems: TransactionInBlock[] = [];
  for (let i = 0; i < txs.length; i++) {
    const trsInBlock = TransactionInBlock.fromObject({
      index: i,
    });
    trsInBlock.transaction = txs[i];
    blockTrsItems[blockTrsItems.length] = trsInBlock;
  }
  return blockTrsItems;
}

async function getCommonBlockAsync(sender: AccountModel) {
  const blockTrsItems = await getTrsInBlock();
  const generatorPublicKey = await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(
    sender.secret,
  );
  const generatorKeypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const commonBlock = await bfchainCore.block.generateBlock<CommonBlock>(
    CommonBlockFactory,
    {
      version: 1,
      height: 1,
      timestamp: 0,
      generatorPublicKey,
      previousBlockSignature: "",
    },
    {
      debug: "debug",
      info: "info",
      blockParticipation: "0",
    },
    (async function* zz() {
      for (let item of blockTrsItems) {
        yield item;
      }
    })(),
    generatorKeypair,
  );
  return commonBlock;
}

(async () => {
  try {
    const commonBlockJSON = (await getCommonBlockAsync(getSenderWithoutSecondSecret())).toJSON();
    commonBlockJSON.transactions.length = 0;
    dump(commonBlockJSON);
  } catch (e) {
    console.log(e);
  }
})();
