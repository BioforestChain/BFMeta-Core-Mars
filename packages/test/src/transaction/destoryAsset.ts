import { DestoryAssetTransaction, DestoryAssetTransactionFactory, RANGE_TYPE } from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  bfchainCore,
  AccountModel,
} from "../include";

function getDestoryAssetTransaction(sender: AccountModel) {
  const keypair = bfchainCore.accountHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.DESTORY_ASSET, // 交易类型
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
      key: "assetType",
      value: "ZEK",
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
  const trs = bfchainCore.transaction.createTransaction<DestoryAssetTransaction>(
    DestoryAssetTransactionFactory,
    data,
    {
      destoryAsset: {
        sourceChainName: "bfchain",
        sourceChainMagic: bfchainCore.config.magic,
        assetType: "ZEK", // 交易的资产类型
        amount: "10", // 交易资产数量
      },
    },
    keypair,
    secondKeypair,
  );
  console.log(trs.toJSON());
}

getDestoryAssetTransaction(getSenderWithSecondSecret());
getDestoryAssetTransaction(getSenderWithoutSecondSecret());
