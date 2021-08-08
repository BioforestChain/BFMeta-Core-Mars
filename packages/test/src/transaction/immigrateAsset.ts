import {
  EmigrateAssetTransaction,
  EmigrateAssetTransactionFactory,
  ImmigrateAssetTransactionFactory,
  ImmigrateAssetTransaction,
  RANGE_TYPE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getFullBfchainCoreEntry,
  getFullRegisterBfchainCoreEntry,
  AccountModel,
  getDelegateWithoutSecondSecret,
  getDelegateWithSecondSecret,
  getRandomDAppid,
} from "../include";
import { parseHexToArrayBuffer } from "@bfchain/util";

const fullBfchainCore = getFullBfchainCoreEntry(57, 128);
const fullRegisterBfchainCore = getFullRegisterBfchainCoreEntry();

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
    lns: fullBfchainCore.config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: fullBfchainCore.config.magic, // 交易来源链的 magic
    toMagic: fullRegisterBfchainCore.config.magic, // 交易去往链的 magic
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
      magic: fullRegisterBfchainCore.config.magic,
      chainName: fullRegisterBfchainCore.config.chainName,
      genesisBlockSignature: fullRegisterBfchainCore.config.signature,
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

  return trs;
}

async function getImmigrateAssetTransaction(
  sender: AccountModel,
  recipientId: string,
  genesisDelegate: AccountModel,
  migrateCertificateModel: BFChainCore.MigrateCertificateModel,
) {
  const keypair = await fullRegisterBfchainCore.accountBaseHelper.createSecretKeypair(
    sender.secret,
  );
  const data: BFChainCore.TxBodyJSON = {
    version: fullRegisterBfchainCore.config.version,
    type: fullRegisterBfchainCore.transactionHelper.IMMIGRATE_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 10000, // 生成交易时间戳
    fee: "1000", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: fullRegisterBfchainCore.config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: fullBfchainCore.config.magic, // 交易来源链的 magic
    toMagic: fullRegisterBfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10, // 交易发起高度
    effectiveBlockHeight: 57,
    storage: {
      key: "assetType",
      value: migrateCertificateModel.body.assetType,
    },
  };
  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = await fullRegisterBfchainCore.accountBaseHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey =
      await fullRegisterBfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
        sender.secret,
        sender.secondSecret,
      );
  }

  migrateCertificateModel =
    await fullRegisterBfchainCore.migrateCertificateHelper.toAuthSignMigrateCertificate({
      authSecret: genesisDelegate.secret,
      authSecondSecret: genesisDelegate.secondSecret,
      migrateCertificate: migrateCertificateModel,
    });

  fullRegisterBfchainCore.configMap.set(fullBfchainCore.config.magic, fullBfchainCore.config);

  const trs =
    await fullRegisterBfchainCore.transaction.createTransaction<ImmigrateAssetTransaction>(
      ImmigrateAssetTransactionFactory,
      data,
      {
        immigrateAsset: migrateCertificateModel.toJSON(),
      },
      keypair,
      secondKeypair,
    );

  const trsJson = trs.toJSON();
  const xx = await fullBfchainCore.transaction.recombineTransaction(trsJson);
  await fullBfchainCore.transactionHelper.verifyTransactionSignature(xx);
  console.log(xx);

  return trs;
}
(async () => {
  const senderWithSecondSecret = getSenderWithSecondSecret();
  const senderWithoutSecondSecret = getSenderWithoutSecondSecret();
  const genesisDelegateWithSecondSecret = getDelegateWithSecondSecret();
  const genesisDelegateWithoutSecondSecret = getDelegateWithoutSecondSecret();
  const emigrateAssetTrsWithSecondSecret = await getEmigrateAssetTransaction(
    senderWithSecondSecret,
    genesisDelegateWithSecondSecret,
  );
  const emigrateAssetTrsWithoutSecondSecret = await getEmigrateAssetTransaction(
    senderWithoutSecondSecret,
    genesisDelegateWithoutSecondSecret,
  );
  await getImmigrateAssetTransaction(
    senderWithSecondSecret,
    emigrateAssetTrsWithSecondSecret.recipientId,
    genesisDelegateWithSecondSecret,
    emigrateAssetTrsWithSecondSecret.asset.emigrateAsset,
  );
  await getImmigrateAssetTransaction(
    senderWithoutSecondSecret,
    emigrateAssetTrsWithSecondSecret.recipientId,
    genesisDelegateWithoutSecondSecret,
    emigrateAssetTrsWithoutSecondSecret.asset.emigrateAsset,
  );
})();
