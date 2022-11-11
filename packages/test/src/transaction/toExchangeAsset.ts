import {
  ToExchangeAssetTransaction,
  ToExchangeAssetTransactionFactory,
  RANGE_TYPE,
  BFChainCore,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppid,
} from "../include";

async function getToExchangeAssetTransaction(
  sender: AccountModel,
  recipientId: any,
  bfchainCore: BFChainCore,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    subEnvParams: {},

    type: bfchainCore.transactionHelper.TO_EXCHANGE_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    maxFee: "100000000",
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收者账户
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic

    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
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

  const info: BFChainCore.ToExchangeAssetAssetJSON = {
    toExchangeAsset: {
      cipherPublicKeys: [],
      toExchangeSource: bfchainCore.config.magic,
      beExchangeSource: bfchainCore.config.magic,
      toExchangeChainName: "bfchain",
      beExchangeChainName: "bfchain",
      toExchangeAsset: "BFT",
      beExchangeAsset: "BFT",
      toExchangeNumber: "100",
      exchangeRate: {
        prevWeight: "1",
        nextWeight: "100",
      },
    },
  };
  if (recipientId) {
    data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
    data.range = [recipientId];
  }

  const trs = await bfchainCore.transaction.createTransaction<ToExchangeAssetTransaction>(
    ToExchangeAssetTransactionFactory,
    data,
    info,
    keypair,
    secondKeypair,
  );
  console.log(trs.toJSON());
}
(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  await getToExchangeAssetTransaction(getSenderWithSecondSecret(), "", bfchainCore);
  await getToExchangeAssetTransaction(
    getSenderWithoutSecondSecret(),
    getGenesisAccount().address,
    bfchainCore,
  );
})();
