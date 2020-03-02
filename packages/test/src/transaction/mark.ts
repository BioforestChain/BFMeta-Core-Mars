import {
  DAppTransaction,
  DAppTransactionFactory,
  DAPP_TYPE,
  RANGE_TYPE,
  MarkTransaction,
  MarkTransactionFactory,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  bfchainCore,
  AccountModel,
  getRecipientWithSecondSecret,
  getRecipientWithoutSecondSecret,
} from "../include";

async function getDappTransaction(sender: AccountModel) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.DAPP, // 交易类型
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
    effectiveBlockHeight: 10100,
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
  const trs = await bfchainCore.transaction.createTransaction<DAppTransaction>(
    DAppTransactionFactory,
    data,
    {
      dapp: {
        dappid: "CAPCOM123456789QWQQAQ",
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
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.DAPP, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: possessor.address,
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
    effectiveBlockHeight: 10100,
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
  const trs = await bfchainCore.transaction.createTransaction<MarkTransaction>(
    MarkTransactionFactory,
    data,
    {
      mark: {
        markPossessor: possessor.address,
        content: "xxxxxxxxxxxxyyyyyyyyyyyyyyyyy",
        action: "put",
        dapp: dappTrs.asset.dapp,
      },
    },
    keypair,
    secondKeypair,
  );
  console.log(trs.toJSON());
}

(async () => {
  const ss = getSenderWithSecondSecret();
  const sss = getSenderWithoutSecondSecret();
  const yy = getRecipientWithSecondSecret();
  const yyy = getRecipientWithoutSecondSecret();

  const tx1 = await getDappTransaction(ss);
  await getMarkTransaction(ss, tx1, ss);
  const tx2 = await getDappTransaction(sss);
  await getMarkTransaction(sss, tx1, yyy);
})();
