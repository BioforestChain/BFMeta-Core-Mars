import { DAppTransaction, DAppTransactionFactory, DAPP_TYPE, RANGE_TYPE } from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  AccountModel,
  getBfchainCoreEntry,
  getGenesisAccount,
  getRandomDAppid,
} from "../include";

const bfchainCore = getBfchainCoreEntry();

const genesisAddress = getGenesisAccount().address;
async function getDappTransaction(sender: AccountModel, dapp: BFChainCore.DAppJSON) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.DAPP, // 交易类型
    senderId: sender.address, // 发起者地址
    recipientId: "cP2kxhREzSCNE36mqUrQCMyesw4LKEJ67M",
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: genesisAddress,
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
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
  const trs = await bfchainCore.transaction.createTransaction<DAppTransaction>(
    DAppTransactionFactory,
    data,
    {
      dapp,
    },
    keypair,
    secondKeypair,
  );
  console.log(trs.toJSON());
}
(async () => {
  const xx = getSenderWithSecondSecret();
  await getDappTransaction(xx, {
    dappid: getRandomDAppid(),
    sourceChainName: "bfchain",
    sourceChainMagic: bfchainCore.config.magic,
    type: DAPP_TYPE.PAID_APP,
    purchaseAsset: {
      sourceChainName: bfchainCore.config.chainName,
      sourceChainMagic: bfchainCore.config.magic,
      assetType: bfchainCore.config.assetType,
      amount: "1000",
    },
  });
  const xxx = getSenderWithoutSecondSecret();
  await getDappTransaction(xxx, {
    dappid: getRandomDAppid(),
    sourceChainName: "bfchain",
    sourceChainMagic: bfchainCore.config.magic,
    type: DAPP_TYPE.FREE_APP,
  });
})();
