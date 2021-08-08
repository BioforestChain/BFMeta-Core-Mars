import {
  EmigrateAssetTransaction,
  EmigrateAssetTransactionFactory,
  RANGE_TYPE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getDelegateWithoutSecondSecret,
  getFullBfchainCoreEntry,
  AccountModel,
  getDelegateWithSecondSecret,
  getRegisterBfchainCoreEntry,
  getRandomDAppid,
} from "../include";

const fullBfchainCore = getFullBfchainCoreEntry(57, 128);

const registerBfchainCore = getRegisterBfchainCoreEntry();

async function getEmigrateAssetTransaction(
  sender: AccountModel,
  genesisDelegate: AccountModel,
  recipientId?: string,
) {
  const config = fullBfchainCore.config;
  const keypair = await fullBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: config.version,
    type: fullBfchainCore.transactionHelper.EMIGRATE_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    recipientId: recipientId || sender.address,
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 10000, // 生成交易时间戳
    fee: "1000", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: fullBfchainCore.config.magic, // 交易来源链的 magic
    toMagic: registerBfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "assetType",
      value: config.assetType,
    },
  };
  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = await fullBfchainCore.accountBaseHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey =
      await fullBfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
        sender.secret,
        sender.secondSecret,
      );
  }

  const args: BFChainCore.GenerateMigrateCertificateArgs = {
    senderSecret: sender.secret,
    senderSecondSecret: sender.secondSecret,
    recipientId: recipientId || sender.address,
    toChainInfo: {
      magic: config.magic,
      chainName: config.chainName,
      genesisBlockSignature: config.signature,
    },
    assets: "10000",
  };
  let migrateCertificateModel =
    await fullBfchainCore.migrateCertificateHelper.generateMigrateCertificate(args);
  migrateCertificateModel =
    await fullBfchainCore.migrateCertificateHelper.fromAuthSignMigrateCertificate({
      authSecret: genesisDelegate.secret,
      authSecondSecret: genesisDelegate.secondSecret,
      migrateCertificate: migrateCertificateModel,
    });

  const trs = await fullBfchainCore.transaction.createTransaction<EmigrateAssetTransaction>(
    EmigrateAssetTransactionFactory,
    data,
    {
      emigrateAsset: migrateCertificateModel.toJSON(),
    },
    keypair,
    secondKeypair,
  );

  const trsJson = trs.toJSON();
  const xx = await fullBfchainCore.transaction.recombineTransaction(trsJson);
  console.log(xx);
  await fullBfchainCore.transactionHelper.verifyTransactionSignature(xx);
  // console.log(xx.toJSON());
}
(async () => {
  try {
    await getEmigrateAssetTransaction(
      getSenderWithSecondSecret(),
      getDelegateWithoutSecondSecret(),
    );
    await getEmigrateAssetTransaction(
      getSenderWithoutSecondSecret(),
      getDelegateWithSecondSecret(),
    );
  } catch (e) {
    console.log(e);
  }
})();
