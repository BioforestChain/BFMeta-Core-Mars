import {
  DAppTransaction,
  DAppTransactionFactory,
  DAPP_TYPE,
  RANGE_TYPE,
  MarkTransaction,
  MarkTransactionFactory,
  BFChainCore,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  AccountModel,
  getRecipientWithSecondSecret,
  getRecipientWithoutSecondSecret,
  getBfchainCoreEntry,
  getRandomDAppid,
} from "../include";

async function getDappTransaction(sender: AccountModel, bfchainCore: BFChainCore) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const dappid = getRandomDAppid();
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,

    subEnvParams: {},
    type: bfchainCore.transactionHelper.DAPP, // 交易类型
    senderId: sender.address, // 发起者地址
    recipientId: sender.address,
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    maxFee: "100000000",
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid, // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    storage: {
      key: "dappid",
      value: dappid,
    },

    fee: "78622", // 交易手续费
    timestamp: 770880, // 生成交易时间戳
    sourceIP: "127.0.0.1", // 交易来源 ip
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
  };
  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = await bfchainCore.accountBaseHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey =
      await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
        sender.secret,
        sender.secondSecret,
      );
  }
  const trs = await bfchainCore.transaction.createTransaction<DAppTransaction>(
    DAppTransactionFactory,
    data,
    {
      dapp: {
        dappid,
        sourceChainName: "bfchain",
        sourceChainMagic: bfchainCore.config.magic,
        type: DAPP_TYPE.FREE_APP,
      },
    },
    keypair,
    secondKeypair,
  );

  return trs;
}

async function getMarkTransaction(
  sender: AccountModel,
  dappTrs: DAppTransaction,
  possessor: AccountModel,
  bfchainCore: BFChainCore,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const dapp = dappTrs.asset.dapp;
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,

    subEnvParams: {},
    type: bfchainCore.transactionHelper.DAPP, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    maxFee: "100000000",
    recipientId: possessor.address,
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: dapp.dappid, // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    storage: {
      key: "dappid",
      value: dapp.dappid,
    },

    fee: "78622", // 交易手续费
    timestamp: 770880, // 生成交易时间戳
    sourceIP: "127.0.0.1", // 交易来源 ip
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
  };
  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = await bfchainCore.accountBaseHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey =
      await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
        sender.secret,
        sender.secondSecret,
      );
  }
  const trs = await bfchainCore.transaction.createTransaction<MarkTransaction>(
    MarkTransactionFactory,
    data,
    {
      mark: {
        content: "xxxxxxxxxxxxyyyyyyyyyyyyyyyyy",
        action: "put",
        dapp,
      },
    },
    keypair,
    secondKeypair,
  );
  console.log(trs.toJSON().asset.mark);
}

(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  const ss = getSenderWithSecondSecret();
  const sss = getSenderWithoutSecondSecret();
  const yy = getRecipientWithSecondSecret();
  const yyy = getRecipientWithoutSecondSecret();

  const tx1 = await getDappTransaction(ss, bfchainCore);
  await getMarkTransaction(ss, tx1, ss, bfchainCore);
  const tx2 = await getDappTransaction(sss, bfchainCore);
  await getMarkTransaction(sss, tx1, yyy, bfchainCore);
})();
