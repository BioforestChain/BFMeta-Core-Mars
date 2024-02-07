import {
  StakeAssetTransaction,
  StakeAssetTransactionFactory,
  UnstakeAssetTransaction,
  UnstakeAssetTransactionFactory,
  RANGE_TYPE,
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getRecipientWithSecondSecret,
  getRecipientWithoutSecondSecret,
  AccountModel,
  getGeneratorWithSecondSecret,
  getBfchainCoreEntry,
  getRandomDAppId,
  BFChainCore,
  getGenesisAccount,
} from "../include";

async function getStakeAssetTransaction(sender: AccountModel, bfchainCore: BFChainCore) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.STAKE_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 10000, // 生成交易时间戳
    fee: "1000", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppId(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "stakeId",
      value: "dragonborn",
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
  const trs = await bfchainCore.transaction.createTransaction<StakeAssetTransaction>(
    StakeAssetTransactionFactory,
    data,
    {
      stakeAsset: {
        stakeId: "dragonborn",
        sourceChainName: bfchainCore.config.chainName,
        sourceChainMagic: bfchainCore.config.magic,
        assetType: bfchainCore.config.assetType,
        assetPrealnum: "1000",
        unstakeHeight: 10086 + 10,
      },
    },
    keypair,
    secondKeypair,
  );
  return trs;
}

async function getUnstakeAssetTransaction(
  sender: AccountModel,
  stakeAssetTrs: StakeAssetTransaction,
  bfchainCore: BFChainCore,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.UNSTAKE_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 20000, // 生成交易时间戳
    fee: "1000", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppId(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10088, // 交易发起高度
    effectiveBlockHeight: 10200,
    storage: {
      key: "stakeId",
      value: "dragonborn",
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

  const { stakeAsset } = stakeAssetTrs.asset;

  const unstakeAsset: BFChainCore.UnstakeAssetJSON = {
    stakeId: stakeAsset.stakeId,
    sourceChainName: stakeAsset.sourceChainName,
    sourceChainMagic: stakeAsset.sourceChainMagic,
    assetType: stakeAsset.assetType,
    assetPrealnum: "1000",
  };

  const trs = await bfchainCore.transaction.createTransaction<UnstakeAssetTransaction>(
    UnstakeAssetTransactionFactory,
    data,
    { unstakeAsset },
    keypair,
    secondKeypair,
  );
  const trsJson = trs.toJSON();
  const xx = await bfchainCore.transaction.recombineTransaction(trsJson);
  await bfchainCore.transactionHelper.verifyTransactionSignature(xx);
  console.log(xx);
  return trs;
}

(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  const trusAssetTrsWithSecret = await getStakeAssetTransaction(
    getSenderWithSecondSecret(),
    bfchainCore,
  );
  const trusAssetTrsWithoutSecret = await getStakeAssetTransaction(
    getSenderWithoutSecondSecret(),
    bfchainCore,
  );

  await getUnstakeAssetTransaction(
    getRecipientWithSecondSecret(),
    trusAssetTrsWithSecret,
    bfchainCore,
  );
  await getUnstakeAssetTransaction(
    getRecipientWithoutSecondSecret(),
    trusAssetTrsWithoutSecret,
    bfchainCore,
  );
})();
