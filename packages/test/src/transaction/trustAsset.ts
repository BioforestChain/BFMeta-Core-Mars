import { TrustAssetTransaction, TrustAssetTransactionFactory, RANGE_TYPE } from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  getRecipientWithSecondSecret,
  getRecipientWithoutSecondSecret,
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppid,
} from "../include";

const bfchainCore = getBfchainCoreEntry();

async function getTrustAssetTransaction(
  sender: AccountModel,
  recipientId: string,
  trustees: string[],
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.TRUST_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisBlock.asset.genesisAsset.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "assetType",
      value: "QQQ",
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
  trustees.push(sender.address);
  trustees.push(recipientId);
  const trs = await bfchainCore.transaction.createTransaction<TrustAssetTransaction>(
    TrustAssetTransactionFactory,
    data,
    {
      trustAsset: {
        trustees,
        numberOfSignFor: 2,
        sourceChainName: "xxxxxxx",
        sourceChainMagic: bfchainCore.config.magic,
        assetType: "QQQ",
        amount: "1000",
      },
    },
    keypair,
    secondKeypair,
  );
  const trsJson = trs.toJSON();
  const xx = await bfchainCore.transaction.recombineTransaction(trsJson);
  await bfchainCore.transactionHelper.verifyTransactionSignature(xx);

  const yy = bfchainCore.transactionLogicVerifier.getTransactionLogicVerifierFromType<
    TrustAssetTransaction
  >(trs.type);

  await yy.verify(trs, 10, {} as any, {} as any, {} as any);

  console.log(xx);
}
(async () => {
  const trustees = [getGenesisAccount().address];
  await getTrustAssetTransaction(
    getSenderWithSecondSecret(),
    getRecipientWithSecondSecret().address,
    [...trustees],
  );
  await getTrustAssetTransaction(
    getSenderWithoutSecondSecret(),
    getRecipientWithoutSecondSecret().address,
    [...trustees],
  );
})();
