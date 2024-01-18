import { parseHexToArrayBuffer } from "@bfchain/util";
import {
  TransferAssetTransaction,
  TransferAssetTransactionFactory,
  RANGE_TYPE,
  Transaction,
  BFChainCore,
  AcceptVoteTransaction,
  AcceptVoteTransactionFactory,
  MultipleTransaction,
  MultipleTransactionFactory,
  GrabAssetTransactionFactory,
  GrabAssetTransaction,
  GIFT_DISTRIBUTION_RULE,
  GiftAssetTransaction,
  GiftAssetTransactionFactory,
  GrabAnyTransaction,
  GrabAnyTransactionFactory,
  GiftAnyTransaction,
  GiftAnyTransactionFactory,
  PARENT_ASSET_TYPE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppId,
  getRecipientWithoutSecondSecret,
  getFullBfchainCoreEntry,
} from "../include";

async function getTransferAssetTransaction(sender: AccountModel, bfchainCore: BFChainCore) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.TRANSFER_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: getGenesisAccount().address,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 770880, // 生成交易时间戳
    fee: "10", // 交易手续费
    remark: {
      blobSeed1:
        "blob+sha256+hex://1b21dd8a2e42b5c742e0f4f7437cec25e636942c40038881cfdd462a2b5a7336?size=10",
    }, // 交易备注，任意信息
    dappid: getRandomDAppId(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
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
    data.senderSecondPublicKey =
      await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
        sender.secret,
        sender.secondSecret,
      );
  }
  let trs = await bfchainCore.transaction.createTransaction<TransferAssetTransaction>(
    TransferAssetTransactionFactory,
    data,
    {
      transferAsset: {
        sourceChainName: bfchainCore.config.chainName,
        sourceChainMagic: bfchainCore.config.magic,
        assetType: bfchainCore.config.assetType,
        amount: "1000",
      },
    },
    keypair,
    secondKeypair,
    undefined,
  );
  return trs.toJSON();
}

async function getAcceptVoteTransaction(sender: AccountModel, bfchainCore: BFChainCore) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.ACCEPT_VOTE, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "10", // 交易手续费
    remark: {
      blobSeed1:
        "blob+sha256+hex://1b21dd8a2e42b5c742e0f4f7437cec25e636942c40038881cfdd462a2b5a7336?size=10",
    }, // 交易备注，任意信息
    dappid: getRandomDAppId(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
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
    data.senderSecondPublicKey =
      await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
        sender.secret,
        sender.secondSecret,
      );
  }
  const trs = await bfchainCore.transaction.createTransaction<AcceptVoteTransaction>(
    AcceptVoteTransactionFactory,
    data,
    {},
    keypair,
    secondKeypair,
  );
  return trs.toJSON();
}

async function getGiftAssetTransaction(
  sender: AccountModel,
  bfchainCore: BFChainCore,
  recipient?: AccountModel[],
  cipher?: boolean,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.GIFT_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "440001", // 交易手续费
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
  const giftAsset: BFChainCore.GiftAssetJSON = {
    cipherPublicKeys: [],
    sourceChainName: "bfchain",
    sourceChainMagic: bfchainCore.config.magic,
    assetType: "ZEK", // 交易的资产类型
    amount: "1000", // 交易资产数量
    /* unitReserveFee: "1000", */
    totalGrabableTimes: 10,
    giftDistributionRule: GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM,
  };
  const trs = await bfchainCore.transaction.createTransaction<GiftAssetTransaction>(
    GiftAssetTransactionFactory,
    data,
    {
      giftAsset,
    },
    keypair,
    secondKeypair,
  );
  return trs;
}

async function getGrabAssetTransaction(
  sender: AccountModel,
  giftAssetTrs: GiftAssetTransaction,
  grabAccounts: AccountModel[],
  bfchainCore: BFChainCore,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.GRAB_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: giftAssetTrs.senderId,
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "0", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppId(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "transactionSignature",
      value: giftAssetTrs.signature,
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
  const giftAsset = giftAssetTrs.asset.giftAsset;

  const grabAsset: BFChainCore.GrabAssetJSON = {
    blockSignature: bfchainCore.config.signature,
    transactionSignature: giftAssetTrs.signature,
    amount: "0", // 交易资产数量
    giftAsset,
  };

  const amount = (
    await bfchainCore.transactionHelper.calcGrabRandomGiftAssetNumber(
      data.senderId,
      parseHexToArrayBuffer(grabAsset.blockSignature),
      giftAssetTrs.signatureBuffer,
      giftAssetTrs.senderId,
      giftAsset.amount,
      giftAsset.totalGrabableTimes,
    )
  ).toString();

  if (giftAsset.cipherPublicKeys.length > 0) {
    const index = Math.floor(Math.random() * grabAccounts.length);
    const signature = (
      await bfchainCore.transactionHelper.getCiphertextSignature({
        secret: grabAccounts[index].secret,
        transactionSignatureBuffer: parseHexToArrayBuffer(giftAssetTrs.signature),
        senderId: sender.address,
      })
    ).toString("hex");
    grabAsset.ciphertextSignature = {
      publicKey: grabAccounts[index].publicKey,
      signature,
    };
  }

  grabAsset.amount = amount;

  const trs = await bfchainCore.transaction.createTransaction<GrabAssetTransaction>(
    GrabAssetTransactionFactory,
    data,
    {
      grabAsset,
    },
    keypair,
    secondKeypair,
  );
  return trs.toJSON();
}

async function getGiftAnyTransaction(
  sender: AccountModel,
  bfchainCore: BFChainCore,
  recipient?: AccountModel[],
  cipher?: boolean,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.GIFT_ANY, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "440001", // 交易手续费
    remark: { remark: `body.remark ${Math.random().toString(32).split(".")[1]}` }, // 交易备注，任意信息
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
  const giftAny: BFChainCore.GiftAnyJSON = {
    cipherPublicKeys: [],
    sourceChainName: "bfchain",
    sourceChainMagic: bfchainCore.config.magic,
    parentAssetType: PARENT_ASSET_TYPE.ASSETS,
    assetType: "ZEK", // 交易的资产类型
    amount: "1", // 交易资产数量
    totalGrabableTimes: 1,
    beginUnfrozenBlockHeight: 99,
    giftDistributionRule: GIFT_DISTRIBUTION_RULE.RANDOM,
  };
  const trs = await bfchainCore.transaction.createTransaction<GiftAnyTransaction>(
    GiftAnyTransactionFactory,
    data,
    {
      giftAny,
    },
    keypair,
    secondKeypair,
  );
  return trs;
}

async function getGrabAnyTransaction(
  sender: AccountModel,
  giftAnyTrs: GiftAnyTransaction,
  grabAccounts: AccountModel[],
  bfchainCore: BFChainCore,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.GRAB_ANY, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: giftAnyTrs.senderId,
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "0", // 交易手续费
    remark: { remark: `body.remark ${Math.random().toString(32).split(".")[1]}` }, // 交易备注，任意信息
    dappid: getRandomDAppId(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "transactionSignature",
      value: giftAnyTrs.signature,
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
  const giftAny = giftAnyTrs.asset.giftAny;

  const grabAny: BFChainCore.GrabAnyJSON = {
    blockSignature: bfchainCore.config.signature,
    transactionSignature: giftAnyTrs.signature,
    amount: "0", // 交易资产数量
    giftAny,
  };

  const amount = (
    await bfchainCore.transactionHelper.calcGrabRandomGiftAssetNumber(
      data.senderId,
      parseHexToArrayBuffer(grabAny.blockSignature),
      giftAnyTrs.signatureBuffer,
      giftAnyTrs.senderId,
      giftAny.amount,
      giftAny.totalGrabableTimes,
    )
  ).toString();

  if (giftAny.cipherPublicKeys.length > 0) {
    const index = Math.floor(Math.random() * grabAccounts.length);
    const signature = (
      await bfchainCore.transactionHelper.getCiphertextSignature({
        secret: grabAccounts[index].secret,
        transactionSignatureBuffer: parseHexToArrayBuffer(giftAnyTrs.signature),
        senderId: sender.address,
      })
    ).toString("hex");
    grabAny.ciphertextSignature = {
      publicKey: grabAccounts[index].publicKey,
      signature,
    };
  }

  grabAny.amount = amount;

  const trs = await bfchainCore.transaction.createTransaction<GrabAnyTransaction>(
    GrabAnyTransactionFactory,
    data,
    {
      grabAny,
    },
    keypair,
    secondKeypair,
  );
  return trs.toJSON();
}

async function getMultipleTransaction(
  sender: AccountModel,
  transactions: BFChainCore.TransactionJSON[],
  bfchainCore: BFChainCore,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.MULTIPLE, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "10000", // 交易手续费
    remark: {
      blobSeed1:
        "blob+sha256+hex://1b21dd8a2e42b5c742e0f4f7437cec25e636942c40038881cfdd462a2b5a7336?size=10",
    }, // 交易备注，任意信息
    dappid: getRandomDAppId(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
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
    data.senderSecondPublicKey =
      await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
        sender.secret,
        sender.secondSecret,
      );
  }
  const trs = await bfchainCore.transaction.createTransaction<MultipleTransaction>(
    MultipleTransactionFactory,
    data,
    {
      multiple: { transactions },
    },
    keypair,
    secondKeypair,
  );

  console.log(trs.getBlobSize());

  const trsJson = trs.toJSON();
  const xx = await bfchainCore.transaction.recombineTransaction<MultipleTransaction>(trsJson);

  const factory = bfchainCore.transaction.getTransactionFactoryFromType(xx.type);

  await factory.verifySignature(xx);

  return trsJson;
}

(async () => {
  try {
    const bfchainCore = await getFullBfchainCoreEntry(5, 10);
    const trs1 = await getTransferAssetTransaction(getSenderWithoutSecondSecret(), bfchainCore);
    const trs2 = await getAcceptVoteTransaction(getSenderWithoutSecondSecret(), bfchainCore);
    const transactions = [trs1, trs2];
    const trs3 = await getMultipleTransaction(
      getSenderWithoutSecondSecret(),
      transactions,
      bfchainCore,
    );
    const trs4 = await getMultipleTransaction(
      getSenderWithoutSecondSecret(),
      [trs3, await getAcceptVoteTransaction(getSenderWithoutSecondSecret(), bfchainCore)],
      bfchainCore,
    );
    const trs5 = await getMultipleTransaction(getSenderWithoutSecondSecret(), [trs4], bfchainCore);
    const trs6 = await getMultipleTransaction(getSenderWithoutSecondSecret(), [trs5], bfchainCore);
    // console.log(JSON.stringify(trs6, null, 4));
    const s1 = getSenderWithoutSecondSecret();
    const s2 = getRecipientWithoutSecondSecret();
    const trs7 = await getGiftAnyTransaction(s1, bfchainCore);
    const trs8 = await getGrabAnyTransaction(s2, trs7, [], bfchainCore);
    const trs9 = await getGrabAnyTransaction(s2, trs7, [], bfchainCore);
    const trs10 = await getMultipleTransaction(
      getSenderWithoutSecondSecret(),
      [trs8, trs9],
      bfchainCore,
    );
    console.log(JSON.stringify(trs10, null, 4));
  } catch (error) {
    console.log(error);
  }
})();
