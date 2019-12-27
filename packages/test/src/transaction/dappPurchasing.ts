import {
  DAppPurchasingTransaction,
  DAppPurchasingTransactionFactory,
  DAppTransaction,
  DAppTransactionFactory,
  DAPP_TYPE,
  RANGE_TYPE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getRecipientWithSecondSecret,
  bfchainCore,
  AccountModel,
} from "../include";

function getDappTransaction(sender: AccountModel) {
  const keypair = bfchainCore.accountHelper.createSecretKeypair(sender.secret);
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
    storage: {
      key: "dappid",
      value: "CAPCOM123456789QWQQAQ",
    },
  };
  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = bfchainCore.accountHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey = bfchainCore.accountHelper.getPublicKeyStringFromSecondSecret(
      sender.secret,
      sender.secondSecret,
    );
  }
  const trs = bfchainCore.transaction.createTransaction<DAppTransaction>(
    DAppTransactionFactory,
    data,
    {
      dapp: {
        dappid: "CAPCOM123456789QWQQAQ",
        sourceChainName: "bfchain",
        sourceChainMagic: bfchainCore.config.magic,
        type: DAPP_TYPE.PAID_APP,
        purchaseAsset: {
          sourceChainName: bfchainCore.config.chainName,
          sourceChainMagic: bfchainCore.config.magic,
          assetType: bfchainCore.config.assetType,
          amount: "1000",
        },
      },
    },
    keypair,
    secondKeypair,
  );
  return trs;
}

function getDappPurchasingTransaction(sender: AccountModel, dappTrs: DAppTransaction) {
  const keypair = bfchainCore.accountHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.DAPP_PURCHASING, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: dappTrs.senderId,
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
    storage: {
      key: "dappid",
      value: "CAPCOM123456789QWQQAQ",
    },
  };
  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = bfchainCore.accountHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey = bfchainCore.accountHelper.getPublicKeyStringFromSecondSecret(
      sender.secret,
      sender.secondSecret,
    );
  }
  const trs = bfchainCore.transaction.createTransaction<DAppPurchasingTransaction>(
    DAppPurchasingTransactionFactory,
    data,
    {
      dappPurchasing: {
        dappPossessor: dappTrs.senderId,
        dappAsset: dappTrs.asset.dapp,
      },
    },
    keypair,
    secondKeypair,
  );
  console.log(trs.toJSON());
}

const dappWithSecondSecretTrs = getDappTransaction(getRecipientWithSecondSecret());
const dappWithoutSecondSecretTrs = getDappTransaction(getRecipientWithSecondSecret());

getDappPurchasingTransaction(getSenderWithSecondSecret(), dappWithSecondSecretTrs);
getDappPurchasingTransaction(getSenderWithoutSecondSecret(), dappWithoutSecondSecretTrs);
