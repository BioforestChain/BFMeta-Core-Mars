import {
  GiftAssetTransaction,
  GiftAssetTransactionFactory,
  GrabAssetTransaction,
  GrabAssetTransactionFactory,
  GIFT_DISTRIBUTION_RULE,
  RANGE_TYPE,
  BFChainCore,
} from "@bfchain/core";
import { parseHexToArrayBuffer } from "@bfchain/util";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getRecipientWithSecondSecret,
  getRecipientWithoutSecondSecret,
  AccountModel,
  getGenesisAccount,
  getRandomDAppId,
  getFullBfchainCoreEntry,
} from "../include";

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
    rangeType: RANGE_TYPE.MULTI_ADDRESS,
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
    sourceChainName: bfchainCore.config.chainName,
    sourceChainMagic: bfchainCore.config.magic,
    assetType: "ZEK", // 交易的资产类型
    amount: "1000", // 交易资产数量
    /* unitReserveFee: "1000", */
    totalGrabableTimes: 10,
    giftDistributionRule: GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM,
  };
  if (recipient && recipient.length > 0) {
    if (cipher) {
      giftAsset.cipherPublicKeys = recipient.map((r) => r.publicKey);
      data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
      data.range = recipient.map((r) => r.address);
    } else {
      data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
      data.range = recipient.map((r) => r.address);
    }
  }
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
  const xx = await bfchainCore.transaction.recombineTransaction(trs.toJSON());
  console.log(xx.toJSON().asset);
}

(async () => {
  const bfchainCore = await getFullBfchainCoreEntry(5, 10);

  const ss = getSenderWithSecondSecret();
  const sss = getSenderWithoutSecondSecret();
  const rr = getRecipientWithSecondSecret();
  const rrr = getRecipientWithoutSecondSecret();

  const gg = getGenesisAccount();

  const x = await getGiftAssetTransaction(rr, bfchainCore, [gg, ss], false);
  await getGrabAssetTransaction(ss, x, [gg, ss], bfchainCore);
  const o = await getGiftAssetTransaction(rrr, bfchainCore, [gg, ss]);
  await getGrabAssetTransaction(gg, o, [gg], bfchainCore);

  const xx = await getGiftAssetTransaction(rr, bfchainCore, [gg, ss], true);
  await getGrabAssetTransaction(ss, xx, [gg, ss], bfchainCore);
  const oo = await getGiftAssetTransaction(rrr, bfchainCore, [gg, ss]);
  await getGrabAssetTransaction(gg, oo, [gg], bfchainCore);
})();
