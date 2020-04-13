import { SignatureTransaction, SignatureTransactionFactory, RANGE_TYPE } from "@bfchain/core";
import {
  getRandomDAppid,
  getSenderWithoutSecondSecret,
  AccountModel,
  getBfchainCoreEntry,
} from "../include";

const bfchainCore = getBfchainCoreEntry();

async function getSignatureTransaction(sender: AccountModel) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const publicKey = await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
    sender.secret,
    "",
  );
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.SIGNATURE, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisBlock.asset.genesisBlock.genesisNodeAddress,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
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
  const trs = await bfchainCore.transaction.createTransaction<SignatureTransaction>(
    SignatureTransactionFactory,
    data,
    {
      signature: {
        publicKey,
      },
    },
    keypair,
    secondKeypair,
  );
  console.log(trs.toJSON());
}
(async () => {
  // getSignatureTransaction(getSenderWithSecondSecret());
  await getSignatureTransaction(getSenderWithoutSecondSecret());
})();
