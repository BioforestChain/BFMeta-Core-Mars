import {
  ToExchangeAssetTransaction,
  ToExchangeAssetTransactionFactory,
  BeExchangeAssetTransaction,
  BeExchangeAssetTransactionFactory,
  JSBIHelper,
  RANGE_TYPE,
} from "@bfchain/core";
import { QueneEventEmitter, parseHexToArrayBuffer } from "@bfchain/util";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  getRecipientWithSecondSecret,
  getRecipientWithoutSecondSecret,
  bfchainCore,
  AccountModel,
} from "../include";

const jsbiHelper = new JSBIHelper();

function getToExchangeAssetTransaction(
  sender: AccountModel,
  recipient?: AccountModel[],
  cipher?: boolean,
) {
  const keypair = bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.TO_EXCHANGE_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收者账户
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
    lns: `bnqkl.${bfchainCore.config.chainName}`,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    numberOfEffectiveBlocks: 30,
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

  const toExchangeAsset: BFChainCore.ToExchangeAssetJSON = {
    cipherPublicKeys: [],
    toExchangeSource: bfchainCore.config.magic,
    beExchangeSource: bfchainCore.config.magic,
    toExchangeChainName: "bfchain",
    beExchangeChainName: "bfchain",
    toExchangeAsset: "ZEK",
    beExchangeAsset: "WZX",
    toExchangeNumber: "1000",
    exchangeRate: {
      prevWeight: "2",
      nextWeight: "3",
    },
    // numberOfBeginUnfrozenBlocks: 10,
  };
  if (recipient && recipient.length > 0) {
    data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
    data.range = recipient.map(r => r.address);
    if (cipher) {
      toExchangeAsset.cipherPublicKeys = recipient.map(r => r.publicKey);
    }
  }
  const trs = bfchainCore.transaction.createTransaction<ToExchangeAssetTransaction>(
    ToExchangeAssetTransactionFactory,
    data,
    { toExchangeAsset },
    keypair,
    secondKeypair,
  );
  return trs.toJSON();
}

function getBeExchangeAssetTransaction(
  sender: AccountModel,
  toExchangeAssetTrs: BFChainCore.TransactionMixJSON<BFChainCore.ToExchangeAssetAssetJSON>,
  recipient: AccountModel[],
) {
  const keypair = bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const toExchangeAsset = toExchangeAssetTrs.asset.toExchangeAsset;
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.BE_EXCHANGE_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: toExchangeAssetTrs.senderId,
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
      key: "transactionSignature",
      value: toExchangeAssetTrs.signature,
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
  const exchangeRate = toExchangeAsset.exchangeRate;
  const beExchangeAsset: BFChainCore.BeExchangeAssetJSON = {
    transactionSignature: toExchangeAssetTrs.signature,
    toExchangeNumber: jsbiHelper
      .multiplyRoundFraction("50", {
        numerator: exchangeRate.nextWeight,
        denominator: exchangeRate.prevWeight,
      })
      .toString(),
    beExchangeNumber: "50",
    applyBlockHeight: toExchangeAssetTrs.applyBlockHeight,
    numberOfEffectiveBlocks: toExchangeAssetTrs.numberOfEffectiveBlocks,
    transactionRangeType: toExchangeAssetTrs.rangeType,
    transactionRange: toExchangeAssetTrs.range,
    exchangeAsset: toExchangeAsset,
  };
  if (toExchangeAsset.cipherPublicKeys.length > 0) {
    const index = Math.floor(Math.random() * recipient.length);
    const signature = bfchainCore.transactionHelper
      .getCiphertextSignature({
        secret: recipient[index].secret,
        transactionSignatureBuffer: parseHexToArrayBuffer(toExchangeAssetTrs.signature),
        senderId: sender.address,
      })
      .toString("hex");
    beExchangeAsset.ciphertextSignature = {
      publicKey: recipient[index].publicKey,
      signature,
    };
  }

  const trs = bfchainCore.transaction.createTransaction<BeExchangeAssetTransaction>(
    BeExchangeAssetTransactionFactory,
    data,
    {
      beExchangeAsset,
    },
    keypair,
    secondKeypair,
  );
  return trs;
}

async function client(transaction: BFChainCore.Transaction) {
  const accountAssets: {
    [address: string]: {
      [magic: string]: {
        [assetType: string]: {
          amount: bigint;
          paidFee: bigint;
        };
      };
    };
  } = {};
  const event = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter<{}>;
  // 扣除交易的手续费
  event.on("fee", async ({ applyInfo }, next) => {
    // 手续费扣除的只能是链资产
    const { magic, assetType } = bfchainCore.config;
    const address = applyInfo.address;
    accountAssets[address] = accountAssets[address] || {};
    accountAssets[address][magic] = accountAssets[address][magic] || {};
    accountAssets[address][magic][assetType] = accountAssets[address][magic][assetType] || {
      amount: BigInt(0),
      paidFee: BigInt(0),
    };
    const bigIntAmount = BigInt(applyInfo.amount);
    const asset = accountAssets[address][magic][assetType];
    asset.amount = asset.amount + bigIntAmount;
    asset.paidFee = asset.paidFee - bigIntAmount;
    next();
  });

  // 扣除交易的资产数量
  event.on("asset", async ({ applyInfo }, next) => {
    const { magic, assetType } = applyInfo.assetInfo;
    const address = applyInfo.address;
    accountAssets[address] = accountAssets[address] || {};
    accountAssets[address][magic] = accountAssets[address][magic] || {};
    accountAssets[address][magic][assetType] = accountAssets[address][magic][assetType] || {
      amount: BigInt(0),
      paidFee: BigInt(0),
    };
    const asset = accountAssets[address][magic][assetType];
    asset.amount = asset.amount + BigInt(applyInfo.amount);
    next();
  });

  // 冻结交易的资产数量
  event.on("frozenAsset", async ({ applyInfo }, next) => {
    const { magic, assetType } = applyInfo.assetInfo;
    const address = applyInfo.address;
    accountAssets[address] = accountAssets[address] || {};
    accountAssets[address][magic] = accountAssets[address][magic] || {};
    accountAssets[address][magic][assetType] = accountAssets[address][magic][assetType] || {
      amount: BigInt(0),
      paidFee: BigInt(0),
    };
    const asset = accountAssets[address][magic][assetType];
    asset.amount = asset.amount + BigInt(applyInfo.amount);
    next();
  });

  // 解冻交易的资产数量
  event.on("unfrozenAsset", async ({ applyInfo }, next) => {
    const { magic, assetType } = applyInfo.assetInfo;
    const address = applyInfo.address;
    accountAssets[address] = accountAssets[address] || {};
    accountAssets[address][magic] = accountAssets[address][magic] || {};
    accountAssets[address][magic][assetType] = accountAssets[address][magic][assetType] || {
      amount: BigInt(0),
      paidFee: BigInt(0),
    };
    const asset = accountAssets[address][magic][assetType];
    asset.amount = asset.amount + BigInt(applyInfo.amount);
    next();
  });

  await bfchainCore.transaction
    .getTransactionFactoryFromType(transaction.type)
    .applyTransaction(transaction, event);

  // console.log("be 的发起人" + ":" + transaction.senderId);
  // console.log("to 的发起人" + ":" + transaction.recipient);
  // for (const address in accountAssets) {
  //   for (const magic in accountAssets[address]) {
  //     console.log(address);
  //     console.log(accountAssets[address][magic]);
  //     console.log("*****************");
  //   }
  // }
}

(async () => {
  const aa = getSenderWithSecondSecret();
  const aaa = getSenderWithoutSecondSecret();
  const cc = getGenesisAccount();
  const dd = getRecipientWithSecondSecret();
  const ddd = getRecipientWithoutSecondSecret();

  const xx = getToExchangeAssetTransaction(aa, [cc, dd], true);
  const tx = getBeExchangeAssetTransaction(dd, xx, [cc, dd]);
  await client(tx);
  console.log(tx.toJSON().asset);
  const yy = getToExchangeAssetTransaction(aaa, [cc, dd], false);
  const tx2 = getBeExchangeAssetTransaction(cc, yy, []);
  await client(tx2);
  console.log(tx2.toJSON().asset);
})();
