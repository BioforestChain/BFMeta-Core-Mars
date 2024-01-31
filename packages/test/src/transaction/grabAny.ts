import {
  GiftAnyTransaction,
  GiftAnyTransactionFactory,
  GrabAnyTransaction,
  GrabAnyTransactionFactory,
  GIFT_DISTRIBUTION_RULE,
  RANGE_TYPE,
  BFChainCore,
  PARENT_ASSET_TYPE,
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

const assetType = "skyrim_dragonborn";

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
      value: assetType,
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
    sourceChainName: bfchainCore.config.chainName,
    sourceChainMagic: bfchainCore.config.magic,
    parentAssetType: PARENT_ASSET_TYPE.ENTITY,
    assetType, // 交易的资产类型
    amount: "1", // 交易资产数量
    totalGrabableTimes: 1,
    beginUnfrozenBlockHeight: 99,
    taxInformation: {
      taxCollector: sender.address,
      taxAssetPrealnum: "100",
    },
  };
  if (recipient && recipient.length > 0) {
    if (cipher) {
      giftAny.cipherPublicKeys = recipient.map((r) => r.publicKey);
      data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
      data.range = recipient.map((r) => r.address);
    } else {
      data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
      data.range = recipient.map((r) => r.address);
    }
  }
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

  const x = await getGiftAnyTransaction(rr, bfchainCore, [gg, ss], false);
  await getGrabAnyTransaction(ss, x, [gg, ss], bfchainCore);
  const o = await getGiftAnyTransaction(rrr, bfchainCore, [gg, ss]);
  await getGrabAnyTransaction(gg, o, [gg], bfchainCore);

  const xx = await getGiftAnyTransaction(rr, bfchainCore, [gg, ss], true);
  await getGrabAnyTransaction(ss, xx, [gg, ss], bfchainCore);
  const oo = await getGiftAnyTransaction(rrr, bfchainCore, [gg, ss]);
  await getGrabAnyTransaction(gg, oo, [gg], bfchainCore);
})();
