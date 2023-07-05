import {
  ToExchangeSpecialAssetTransaction,
  ToExchangeSpecialAssetTransactionFactory,
  EXCHANGE_DIRECTION,
  SPECIAL_ASSET_TYPE,
  BeExchangeSpecialAssetTransaction,
  BeExchangeSpecialAssetTransactionFactory,
  RANGE_TYPE,
  BFChainCore,
} from "@bfchain/core";
import { parseHexToArrayBuffer } from "@bfchain/util";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  AccountModel,
  getRecipientWithSecondSecret,
  getRecipientWithoutSecondSecret,
  getBfchainCoreEntry,
  getRandomDAppId,
} from "../include";

async function getToExchangeSpecialAssetTransaction(
  sender: AccountModel,
  bfchainCore: BFChainCore,
  recipient?: AccountModel[],
  cipher?: boolean,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.TO_EXCHANGE_SPECIAL_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
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
  const toExchangeSpecialAsset: BFChainCore.ToExchangeSpecialAssetJSON = {
    cipherPublicKeys: [],
    toExchangeSource: bfchainCore.config.magic,
    beExchangeSource: bfchainCore.config.magic,
    toExchangeChainName: bfchainCore.config.chainName,
    beExchangeChainName: bfchainCore.config.chainName,
    // toExchangeAsset: getRandomDAppId(),
    toExchangeAsset: "skyrim_dragonborn",
    beExchangeAsset: "BFT",
    exchangeNumber: "1000000",
    exchangeAssetType: SPECIAL_ASSET_TYPE.ENTITY,
    exchangeDirection: EXCHANGE_DIRECTION.ASSET_FROM_SENDER,
  };
  if (recipient && recipient.length > 0) {
    data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
    data.range = recipient.map((r) => r.address);
    if (cipher) {
      toExchangeSpecialAsset.cipherPublicKeys = recipient.map((r) => r.publicKey);
    }
  }
  const trs = await bfchainCore.transaction.createTransaction<ToExchangeSpecialAssetTransaction>(
    ToExchangeSpecialAssetTransactionFactory,
    data,
    { toExchangeSpecialAsset },
    keypair,
    secondKeypair,
  );
  return trs;
}

async function getBeExchangeSpecialAssetTransaction(
  sender: AccountModel,
  toExchangeSpecialAssetTrs: BFChainCore.TransactionMixJSON<BFChainCore.ToExchangeSpecialAssetAssetJSON>,
  recipient: AccountModel[],
  bfchainCore: BFChainCore,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.BE_EXCHANGE_SPECIAL_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: toExchangeSpecialAssetTrs.senderId,
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
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
      key: "transactionSignature",
      value: toExchangeSpecialAssetTrs.signature,
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
  const toExchangeSpecialAsset = toExchangeSpecialAssetTrs.asset.toExchangeSpecialAsset;
  const beExchangeSpecialAsset: BFChainCore.BeExchangeSpecialAssetJSON = {
    transactionSignature: toExchangeSpecialAssetTrs.signature,
    exchangeSpecialAsset: toExchangeSpecialAsset,
  };

  if (toExchangeSpecialAsset.cipherPublicKeys.length > 0) {
    const index = Math.floor(Math.random() * recipient.length);
    const signature = (
      await bfchainCore.transactionHelper.getCiphertextSignature({
        secret: recipient[index].secret,
        transactionSignatureBuffer: parseHexToArrayBuffer(toExchangeSpecialAssetTrs.signature),
        senderId: sender.address,
      })
    ).toString("hex");
    beExchangeSpecialAsset.ciphertextSignature = {
      publicKey: recipient[index].publicKey,
      signature,
    };
  }

  const trs = await bfchainCore.transaction.createTransaction<BeExchangeSpecialAssetTransaction>(
    BeExchangeSpecialAssetTransactionFactory,
    data,
    { beExchangeSpecialAsset },
    keypair,
    secondKeypair,
  );
  const trsJson = trs.toJSON();
  const oo = await bfchainCore.transaction.recombineTransaction(trsJson);
  await bfchainCore.transactionHelper.verifyTransactionSignature(oo);
  console.log(oo.asset);
}
(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  const aa = getSenderWithSecondSecret();
  const aaa = getSenderWithoutSecondSecret();
  const cc = getGenesisAccount();
  const dd = getRecipientWithSecondSecret();
  const ddd = getRecipientWithoutSecondSecret();

  const xx = await getToExchangeSpecialAssetTransaction(aa, bfchainCore, [cc, dd], true);
  await getBeExchangeSpecialAssetTransaction(dd, xx, [cc, dd], bfchainCore);
  // const yy = await getToExchangeSpecialAssetTransaction(aaa, [cc, dd], false);
  // getBeExchangeSpecialAssetTransaction(cc, yy, []);
})();
