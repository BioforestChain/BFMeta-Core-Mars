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
  bfchainCore,
  getFullBfchainCore,
  AccountModel,
  getGenesisAccount,
} from "../include";

const fullBfchainCore = getFullBfchainCore(57, 128);

function getGiftAssetTransaction(
  sender: AccountModel,
  recipient?: AccountModel[],
  cipher?: boolean,
) {
  const keypair = bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.GIFT_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
    lns: `bnqkl.${bfchainCore.config.chainName}`,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    numberOfEffectiveBlocks: 100,
    storage: {
      key: "assetType",
      value: "ZEK",
    },
  };
  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = bfchainCore.accountBaseHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey = bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
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
    giftDistributionRule: GIFT_DISTRIBUTION_RULE.RANDOM,
  };
  if (recipient && recipient.length > 0) {
    if (cipher) {
      giftAsset.cipherPublicKeys = recipient.map(r => r.publicKey);
    } else {
      data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
      data.range = recipient.map(r => r.address);
    }
  }
  const trs = bfchainCore.transaction.createTransaction<GiftAssetTransaction>(
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

function getGrabAssetTransaction(
  sender: AccountModel,
  giftAssetTrs: GiftAssetTransaction,
  grabAccounts: AccountModel[],
) {
  const keypair = bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
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
    dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
    lns: `bnqkl.${bfchainCore.config.chainName}`,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    numberOfEffectiveBlocks: 100,
    storage: {
      key: "transactionSignature",
      value: giftAssetTrs.signature,
    },
  };
  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = bfchainCore.accountBaseHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey = bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
      sender.secret,
      sender.secondSecret,
    );
  }
  const giftAsset = giftAssetTrs.asset.giftAsset;

  const grabAsset: BFChainCore.GrabAssetJSON = {
    blockSignature: fullBfchainCore.config.genesisBlock.signature,
    transactionSignature: giftAssetTrs.signature,
    amount: "0", // 交易资产数量
    transactionRangeType: giftAssetTrs.rangeType,
    transactionRange: giftAssetTrs.range,
    applyBlockHeight: giftAssetTrs.applyBlockHeight,
    numberOfBeginUnfrozenBlocks: giftAsset.numberOfBeginUnfrozenBlocks,
    numberOfEffectiveBlocks: 300,
    giftAsset,
  };

  const amount = bfchainCore.transactionHelper
    .calcGrabRandomGiftAssetNumber(
      data.senderId,
      parseHexToArrayBuffer(grabAsset.blockSignature),
      giftAssetTrs.signatureBuffer,
      giftAssetTrs.senderId,
      giftAsset.amount,
      giftAsset.totalGrabableTimes,
    )
    .toString();

  if (giftAsset.cipherPublicKeys.length > 0) {
    const index = Math.floor(Math.random() * grabAccounts.length);
    const signature = bfchainCore.transactionHelper
      .getCiphertextSignature({
        secret: grabAccounts[index].secret,
        transactionSignatureBuffer: parseHexToArrayBuffer(giftAssetTrs.signature),
        senderId: sender.address,
      })
      .toString("hex");
    grabAsset.ciphertextSignature = {
      publicKey: grabAccounts[index].publicKey,
      signature,
    };
  }

  grabAsset.amount = amount;

  const trs = bfchainCore.transaction.createTransaction<GrabAssetTransaction>(
    GrabAssetTransactionFactory,
    data,
    {
      grabAsset,
    },
    keypair,
    secondKeypair,
  );
  const xx = bfchainCore.transaction.recombineTransaction(trs.toJSON());
  console.log(xx.toJSON().asset);
}

const ss = getSenderWithSecondSecret();
const sss = getSenderWithoutSecondSecret();
const rr = getRecipientWithSecondSecret();
const rrr = getRecipientWithoutSecondSecret();

const gg = getGenesisAccount();

const x = getGiftAssetTransaction(rr, [gg, ss], false);
getGrabAssetTransaction(ss, x, [gg, ss]);
const o = getGiftAssetTransaction(rrr, [gg, ss]);
getGrabAssetTransaction(gg, o, [gg]);

const xx = getGiftAssetTransaction(rr, [gg, ss], true);
getGrabAssetTransaction(ss, xx, [gg, ss]);
const oo = getGiftAssetTransaction(rrr, [gg, ss]);
getGrabAssetTransaction(gg, oo, [gg]);
