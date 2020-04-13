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
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppid,
} from "../include";

const bfchainCore = getBfchainCoreEntry();

async function getDappTransaction(sender: AccountModel) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const dappid = getRandomDAppid();
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.DAPP, // 交易类型
    senderId: sender.address, // 发起者地址
    recipientId: "cP2kxhREzSCNE36mqUrQCMyesw4LKEJ67M",
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid, // 交易所属的 dappid
    lns: bfchainCore.config.genesisBlock.asset.genesisBlock.genesisNodeAddress,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "dappid",
      value: dappid,
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
        dappid,
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

async function getDappPurchasingTransaction(sender: AccountModel, dappTrs: DAppTransaction) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const dapp = dappTrs.asset.dapp;
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.DAPP_PURCHASING, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: dappTrs.recipientId,
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: dapp.dappid, // 交易所属的 dappid
    lns: bfchainCore.config.genesisBlock.asset.genesisBlock.genesisNodeAddress,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "dappid",
      value: dapp.dappid,
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
  const trs = await bfchainCore.transaction.createTransaction<DAppPurchasingTransaction>(
    DAppPurchasingTransactionFactory,
    data,
    {
      dappPurchasing: {
        dappAsset: dappTrs.asset.dapp,
      },
    },
    keypair,
    secondKeypair,
  );
  console.log(trs.toJSON());
}

(async () => {
  const dappWithSecondSecretTrs = await getDappTransaction(getRecipientWithSecondSecret());
  const dappWithoutSecondSecretTrs = await getDappTransaction(getRecipientWithSecondSecret());

  await getDappPurchasingTransaction(getSenderWithSecondSecret(), dappWithSecondSecretTrs);
  await getDappPurchasingTransaction(getSenderWithoutSecondSecret(), dappWithoutSecondSecretTrs);
})();
