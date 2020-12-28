import {
  TrustAssetTransaction,
  TrustAssetTransactionFactory,
  SignForAssetTransaction,
  SignForAssetTransactionFactory,
  RANGE_TYPE,
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getRecipientWithSecondSecret,
  getRecipientWithoutSecondSecret,
  AccountModel,
  getDelegateWithSecondSecret,
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
    timestamp: 10000, // 生成交易时间戳
    fee: "1000", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisBlock.asset.genesisAsset.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10, // 交易发起高度
    effectiveBlockHeight: 1000,
    storage: {
      key: "assetType",
      value: "BFT",
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
        sourceChainName: bfchainCore.config.chainName,
        sourceChainMagic: bfchainCore.config.magic,
        assetType: bfchainCore.config.assetType,
        amount: "100000",
      },
    },
    keypair,
    secondKeypair,
  );
  return trs;
}

async function getSignForAssetTransaction(
  sender: AccountModel,
  trustAssetTrs: TrustAssetTransaction,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.SIGN_FOR_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: trustAssetTrs.recipientId,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 20000, // 生成交易时间戳
    fee: "1000", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisBlock.asset.genesisAsset.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 20, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "transactionSignature",
      value: trustAssetTrs.signature,
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

  const { trustAsset } = trustAssetTrs.asset;

  const signForAsset: BFChainCore.SignForAssetJSON = {
    transactionSignature: trustAssetTrs.signature,
    trustSenderId: trustAssetTrs.senderId,
    trustRecipientId: trustAssetTrs.recipientId,
    trustAsset,
  };

  const trs = await bfchainCore.transaction.createTransaction<SignForAssetTransaction>(
    SignForAssetTransactionFactory,
    data,
    { signForAsset },
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
  const trustee = getDelegateWithSecondSecret();
  const trusAssetTrsWithSecret = await getTrustAssetTransaction(
    getSenderWithSecondSecret(),
    getRecipientWithSecondSecret().address,
    [trustee.address],
  );
  const trusAssetTrsWithoutSecret = await getTrustAssetTransaction(
    getSenderWithoutSecondSecret(),
    getRecipientWithoutSecondSecret().address,
    [trustee.address],
  );

  await getSignForAssetTransaction(getRecipientWithSecondSecret(), trusAssetTrsWithSecret);
  await getSignForAssetTransaction(getRecipientWithoutSecondSecret(), trusAssetTrsWithoutSecret);
})();
