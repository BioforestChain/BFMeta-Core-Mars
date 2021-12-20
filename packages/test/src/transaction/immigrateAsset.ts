import {
  EmigrateAssetTransaction,
  EmigrateAssetTransactionFactory,
  ImmigrateAssetTransactionFactory,
  ImmigrateAssetTransaction,
  RANGE_TYPE,
  BFChainCore,
  PARENT_ASSET_TYPE,
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

async function getEmigrateAssetTransaction(
  sender: AccountModel,
  genesisDelegate: AccountModel,
  fullBfchainCore: BFChainCore,
  fullRegisterBfchainCore: BFChainCore,
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

  const args: BFChainCore.CrossChain.GenerateMigrateCertificateArgs = {
    senderSecret: sender.secret,
    senderSecondSecret: sender.secondSecret,
    recipientId: recipientId || sender.address,
    toChainInfo: {
      magic: fullRegisterBfchainCore.config.magic,
      chainName: fullRegisterBfchainCore.config.chainName,
      genesisBlockSignature: fullRegisterBfchainCore.config.signature,
    },
    assetInfo: {
      parentAssetType: PARENT_ASSET_TYPE.ASSETS,
      assetType: fullBfchainCore.config.assetType,
    },
    assetPrealnum: "10000",
  };
  let migrateCertificate =
    await fullBfchainCore.migrateCertificateHelper.generateMigrateCertificate(args);
  migrateCertificate =
    await fullBfchainCore.migrateCertificateHelper.fromAuthSignMigrateCertificate({
      authSecret: genesisDelegate.secret,
      authSecondSecret: genesisDelegate.secondSecret,
      migrateCertificate: migrateCertificate,
    });

  const trs = await fullBfchainCore.transaction.createTransaction<EmigrateAssetTransaction>(
    EmigrateAssetTransactionFactory,
    data,
    {
      emigrateAsset: { migrateCertificate: JSON.stringify(migrateCertificate) },
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
  migrateCertificate: BFChainCore.CrossChain.MigrateCertificateJSON,
  fullBfchainCore: BFChainCore,
  fullRegisterBfchainCore: BFChainCore,
) {
  const keypair = await fullRegisterBfchainCore.accountBaseHelper.createSecretKeypair(
    sender.secret,
  );

  const converter =
    fullBfchainCore.migrateCertificateHelper.getMigrateCertificateConverter(migrateCertificate);

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
      value: converter.assetId.decode(migrateCertificate.body.assetId).assetType,
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

  migrateCertificate =
    await fullRegisterBfchainCore.migrateCertificateHelper.toAuthSignMigrateCertificate({
      authSecret: genesisDelegate.secret,
      authSecondSecret: genesisDelegate.secondSecret,
      migrateCertificate,
    });

  fullRegisterBfchainCore.configMap.set(fullBfchainCore.config.magic, fullBfchainCore.config);

  const trs =
    await fullRegisterBfchainCore.transaction.createTransaction<ImmigrateAssetTransaction>(
      ImmigrateAssetTransactionFactory,
      data,
      {
        immigrateAsset: { migrateCertificate: JSON.stringify(migrateCertificate) },
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
  const fullBfchainCore = await getFullBfchainCoreEntry(57, 128);
  const fullRegisterBfchainCore = await getFullRegisterBfchainCoreEntry();

  const senderWithSecondSecret = getSenderWithSecondSecret();
  const senderWithoutSecondSecret = getSenderWithoutSecondSecret();
  const genesisDelegateWithSecondSecret = getDelegateWithSecondSecret();
  const genesisDelegateWithoutSecondSecret = getDelegateWithoutSecondSecret();
  const emigrateAssetTrsWithSecondSecret = await getEmigrateAssetTransaction(
    senderWithSecondSecret,
    genesisDelegateWithSecondSecret,
    fullBfchainCore,
    fullRegisterBfchainCore,
  );
  const emigrateAssetTrsWithoutSecondSecret = await getEmigrateAssetTransaction(
    senderWithoutSecondSecret,
    genesisDelegateWithoutSecondSecret,
    fullBfchainCore,
    fullRegisterBfchainCore,
  );
  await getImmigrateAssetTransaction(
    senderWithSecondSecret,
    emigrateAssetTrsWithSecondSecret.recipientId,
    genesisDelegateWithSecondSecret,
    JSON.parse(emigrateAssetTrsWithSecondSecret.asset.emigrateAsset.migrateCertificate),
    fullBfchainCore,
    fullRegisterBfchainCore,
  );
  await getImmigrateAssetTransaction(
    senderWithoutSecondSecret,
    emigrateAssetTrsWithSecondSecret.recipientId,
    genesisDelegateWithoutSecondSecret,
    JSON.parse(emigrateAssetTrsWithSecondSecret.asset.emigrateAsset.migrateCertificate),
    fullBfchainCore,
    fullRegisterBfchainCore,
  );
})();
