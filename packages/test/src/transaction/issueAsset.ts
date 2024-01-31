import {
  IssueAssetTransaction,
  IssueAssetTransactionFactory,
  RANGE_TYPE,
  BFChainCore,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppId,
} from "../include";

const genesisAddress = getGenesisAccount().address;
async function getIssueAssetTransaction(sender: AccountModel, bfchainCore: BFChainCore) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.ISSUE_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: genesisAddress,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 资产创世账户地址
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppId(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "assetType",
      value: "ZEK",
    },
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
  const trs = await bfchainCore.transaction.createTransaction<IssueAssetTransaction>(
    IssueAssetTransactionFactory,
    data,
    {
      issueAsset: {
        sourceChainName: bfchainCore.config.chainName,
        sourceChainMagic: bfchainCore.config.magic,
        assetType: "ZEK",
        expectedIssuedAssets: "100000000000000",
      },
    },
    keypair,
    secondKeypair,
  );
  await bfchainCore.transaction.getTransactionFactoryFromType(trs.type).verify(trs);
  console.log(trs.toJSON());
}
(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  await getIssueAssetTransaction(getSenderWithSecondSecret(), bfchainCore);
  await getIssueAssetTransaction(getSenderWithoutSecondSecret(), bfchainCore);
})();
