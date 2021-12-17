import { parseHexToArrayBuffer } from "@bfchain/util";
import {
  ToExchangeAnyTransaction,
  BeExchangeAnyTransaction,
  ToExchangeAnyTransactionFactory,
  BeExchangeAnyTransactionFactory,
  RANGE_TYPE,
  PARENT_ASSET_TYPE,
  JSBIHelper,
  BFChainCore,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppid,
  getRecipientWithSecondSecret,
  getRecipientWithoutSecondSecret,
} from "../include";

const jsbiHelper = new JSBIHelper();

async function getToExchangeAnyTransaction(
  sender: AccountModel,
  toExchangeAny: BFChainCore.ToExchangeAnyJSON,
  bfchainCore: BFChainCore,
  recipient?: AccountModel[],
  cipher?: boolean,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.TO_EXCHANGE_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收者账户
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
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

  if (recipient && recipient.length > 0) {
    data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
    data.range = recipient.map((r) => r.address);
    if (cipher) {
      toExchangeAny.cipherPublicKeys = recipient.map((r) => r.publicKey);
    }
  }

  const trs = await bfchainCore.transaction.createTransaction<ToExchangeAnyTransaction>(
    ToExchangeAnyTransactionFactory,
    data,
    { toExchangeAny },
    keypair,
    secondKeypair,
  );

  return trs.toJSON();
}

async function getBeExchangeAnyTransaction(
  sender: AccountModel,
  toExchangeAnyTrs: BFChainCore.TransactionMixJSON<BFChainCore.ToExchangeAnyAssetJSON>,
  recipient: AccountModel[],
  bfchainCore: BFChainCore,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const toExchangeAny = toExchangeAnyTrs.asset.toExchangeAny;
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.BE_EXCHANGE_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: toExchangeAnyTrs.senderId,
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "transactionSignature",
      value: toExchangeAnyTrs.signature,
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

  const beExchangeAny: BFChainCore.BeExchangeAnyJSON = {
    transactionSignature: toExchangeAnyTrs.signature,
    toExchangeAssetPrealnum: toExchangeAny.toExchangeAssetPrealnum,
    beExchangeAssetPrealnum: toExchangeAny.beExchangeAssetPrealnum || "0",
    exchangeAny: toExchangeAny,
  };

  const assetExchangeWeightRatio = toExchangeAny.assetExchangeWeightRatio;
  if (assetExchangeWeightRatio) {
    const beExchangeAssetPrealnum = jsbiHelper.multiplyRoundFraction(
      toExchangeAny.toExchangeAssetPrealnum,
      {
        numerator: assetExchangeWeightRatio.beExchangeAssetWeight,
        denominator: assetExchangeWeightRatio.toExchangeAssetWeight,
      },
    );
    beExchangeAny.beExchangeAssetPrealnum = beExchangeAssetPrealnum.toString();
  }
  if (beExchangeAny.exchangeAny.beExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
    beExchangeAny.beExchangeAssetPrealnum = "2000000000";
  }

  if (data.senderId === data.recipientId) {
    beExchangeAny.beExchangeAssetPrealnum = "0";
  }
  if (toExchangeAny.cipherPublicKeys.length > 0) {
    const index = Math.floor(Math.random() * recipient.length);
    const signature = (
      await bfchainCore.transactionHelper.getCiphertextSignature({
        secret: recipient[index].secret,
        transactionSignatureBuffer: parseHexToArrayBuffer(toExchangeAnyTrs.signature),
        senderId: sender.address,
      })
    ).toString("hex");
    beExchangeAny.ciphertextSignature = {
      publicKey: recipient[index].publicKey,
      signature,
    };
  }

  const trs = await bfchainCore.transaction.createTransaction<BeExchangeAnyTransaction>(
    BeExchangeAnyTransactionFactory,
    data,
    {
      beExchangeAny,
    },
    keypair,
    secondKeypair,
  );

  console.log(trs.asset.beExchangeAny.toJSON());
}
(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  const toExchangeAny: BFChainCore.ToExchangeAnyJSON = {
    cipherPublicKeys: [],
    toExchangeSource: bfchainCore.config.magic,
    beExchangeSource: bfchainCore.config.magic,
    toExchangeChainName: "bfchain",
    beExchangeChainName: "bfchain",
    toExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
    beExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
    toExchangeAssetType: "BFT",
    beExchangeAssetType: "BFT",
    toExchangeAssetPrealnum: "100",
    assetExchangeWeightRatio: {
      toExchangeAssetWeight: "1",
      beExchangeAssetWeight: "100",
    },
  };

  const aa = getSenderWithSecondSecret();
  const aaa = getSenderWithoutSecondSecret();
  const cc = getGenesisAccount();
  const dd = getRecipientWithSecondSecret();
  const ddd = getRecipientWithoutSecondSecret();

  const test0 = async () => {
    const t1 = await getToExchangeAnyTransaction(
      aa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyTransaction(dd, t1, [cc, dd], bfchainCore);
    const t2 = await getToExchangeAnyTransaction(
      aaa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyTransaction(ddd, t2, [cc, dd], bfchainCore);
    await getBeExchangeAnyTransaction(aaa, t2, [cc, dd], bfchainCore);
  };

  const test1 = async () => {
    const toExchangeAnyCopy = { ...toExchangeAny };
    toExchangeAnyCopy.toExchangeParentAssetType = PARENT_ASSET_TYPE.DAPP;
    toExchangeAnyCopy.beExchangeParentAssetType = PARENT_ASSET_TYPE.ASSETS;
    toExchangeAnyCopy.toExchangeAssetType = getRandomDAppid();
    toExchangeAnyCopy.toExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.beExchangeAssetPrealnum = "1000";
    toExchangeAnyCopy.assetExchangeWeightRatio = undefined;

    const t3 = await getToExchangeAnyTransaction(
      aa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyTransaction(dd, t3, [cc, dd], bfchainCore);
    const t4 = await getToExchangeAnyTransaction(
      aaa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyTransaction(ddd, t4, [cc, dd], bfchainCore);
    await getBeExchangeAnyTransaction(aaa, t4, [cc, dd], bfchainCore);
  };

  const test2 = async () => {
    const toExchangeAnyCopy = { ...toExchangeAny };
    toExchangeAnyCopy.toExchangeParentAssetType = PARENT_ASSET_TYPE.LOCATION_NAME;
    toExchangeAnyCopy.beExchangeParentAssetType = PARENT_ASSET_TYPE.ASSETS;
    toExchangeAnyCopy.toExchangeAssetType = `hylq.${bfchainCore.config.chainName}`;
    toExchangeAnyCopy.toExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.beExchangeAssetPrealnum = "1000";
    toExchangeAnyCopy.assetExchangeWeightRatio = undefined;

    const t5 = await getToExchangeAnyTransaction(
      aa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyTransaction(dd, t5, [cc, dd], bfchainCore);
    const t6 = await getToExchangeAnyTransaction(
      aaa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyTransaction(ddd, t6, [cc, dd], bfchainCore);
    await getBeExchangeAnyTransaction(aaa, t6, [cc, dd], bfchainCore);
  };

  const test3 = async () => {
    const toExchangeAnyCopy = { ...toExchangeAny };
    toExchangeAnyCopy.toExchangeParentAssetType = PARENT_ASSET_TYPE.ENTITY;
    toExchangeAnyCopy.beExchangeParentAssetType = PARENT_ASSET_TYPE.ASSETS;
    toExchangeAnyCopy.toExchangeAssetType = `skyrim_hylq`;
    toExchangeAnyCopy.toExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.beExchangeAssetPrealnum = "1000";
    toExchangeAnyCopy.assetExchangeWeightRatio = undefined;

    const t7 = await getToExchangeAnyTransaction(
      aa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyTransaction(dd, t7, [cc, dd], bfchainCore);
    const t8 = await getToExchangeAnyTransaction(
      aaa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyTransaction(ddd, t8, [cc, dd], bfchainCore);
    await getBeExchangeAnyTransaction(aaa, t8, [cc, dd], bfchainCore);
  };

  const test4 = async () => {
    const toExchangeAnyCopy = { ...toExchangeAny };
    toExchangeAnyCopy.toExchangeParentAssetType = PARENT_ASSET_TYPE.ASSETS;
    toExchangeAnyCopy.beExchangeParentAssetType = PARENT_ASSET_TYPE.DAPP;
    toExchangeAnyCopy.beExchangeAssetType = getRandomDAppid();
    toExchangeAnyCopy.beExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.assetExchangeWeightRatio = undefined;

    const t9 = await getToExchangeAnyTransaction(
      aa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyTransaction(dd, t9, [cc, dd], bfchainCore);
    const t10 = await getToExchangeAnyTransaction(
      aaa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyTransaction(ddd, t10, [cc, dd], bfchainCore);
    await getBeExchangeAnyTransaction(aaa, t10, [cc, dd], bfchainCore);
  };

  const test5 = async () => {
    const toExchangeAnyCopy = { ...toExchangeAny };
    toExchangeAnyCopy.toExchangeParentAssetType = PARENT_ASSET_TYPE.ASSETS;
    toExchangeAnyCopy.beExchangeParentAssetType = PARENT_ASSET_TYPE.LOCATION_NAME;
    toExchangeAnyCopy.beExchangeAssetType = `hylq.${bfchainCore.config.chainName}`;
    toExchangeAnyCopy.beExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.assetExchangeWeightRatio = undefined;

    const t11 = await getToExchangeAnyTransaction(
      aa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyTransaction(dd, t11, [cc, dd], bfchainCore);
    const t12 = await getToExchangeAnyTransaction(
      aaa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyTransaction(ddd, t12, [cc, dd], bfchainCore);
    await getBeExchangeAnyTransaction(aaa, t12, [cc, dd], bfchainCore);
  };

  const test6 = async () => {
    const toExchangeAnyCopy = { ...toExchangeAny };
    toExchangeAnyCopy.toExchangeParentAssetType = PARENT_ASSET_TYPE.ASSETS;
    toExchangeAnyCopy.beExchangeParentAssetType = PARENT_ASSET_TYPE.ENTITY;
    toExchangeAnyCopy.beExchangeAssetType = "skyrim_hylq";
    toExchangeAnyCopy.beExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.assetExchangeWeightRatio = undefined;

    const t15 = await getToExchangeAnyTransaction(
      aa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyTransaction(dd, t15, [cc, dd], bfchainCore);
    const t16 = await getToExchangeAnyTransaction(
      aaa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyTransaction(ddd, t16, [cc, dd], bfchainCore);
    await getBeExchangeAnyTransaction(aaa, t16, [cc, dd], bfchainCore);
  };

  const test7 = async () => {
    const toExchangeAnyCopy = { ...toExchangeAny };
    toExchangeAnyCopy.toExchangeParentAssetType = PARENT_ASSET_TYPE.DAPP;
    toExchangeAnyCopy.beExchangeParentAssetType = PARENT_ASSET_TYPE.ENTITY;
    toExchangeAnyCopy.toExchangeAssetType = getRandomDAppid();
    toExchangeAnyCopy.beExchangeAssetType = "skyrim_hylq";
    toExchangeAnyCopy.toExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.beExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.assetExchangeWeightRatio = undefined;

    const t17 = await getToExchangeAnyTransaction(
      aa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyTransaction(dd, t17, [cc, dd], bfchainCore);
    const t18 = await getToExchangeAnyTransaction(
      aaa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyTransaction(ddd, t18, [cc, dd], bfchainCore);
    await getBeExchangeAnyTransaction(aaa, t18, [cc, dd], bfchainCore);
  };

  const test8 = async () => {
    const toExchangeAnyCopy = { ...toExchangeAny };
    toExchangeAnyCopy.toExchangeParentAssetType = PARENT_ASSET_TYPE.DAPP;
    toExchangeAnyCopy.beExchangeParentAssetType = PARENT_ASSET_TYPE.LOCATION_NAME;
    toExchangeAnyCopy.toExchangeAssetType = getRandomDAppid();
    toExchangeAnyCopy.beExchangeAssetType = `hylq.${bfchainCore.config.chainName}`;
    toExchangeAnyCopy.toExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.beExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.assetExchangeWeightRatio = undefined;

    const t19 = await getToExchangeAnyTransaction(
      aa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyTransaction(dd, t19, [cc, dd], bfchainCore);
    const t20 = await getToExchangeAnyTransaction(
      aaa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyTransaction(ddd, t20, [cc, dd], bfchainCore);
    await getBeExchangeAnyTransaction(aaa, t20, [cc, dd], bfchainCore);
  };

  const test9 = async () => {
    const toExchangeAnyCopy = { ...toExchangeAny };
    toExchangeAnyCopy.toExchangeParentAssetType = PARENT_ASSET_TYPE.ENTITY;
    toExchangeAnyCopy.beExchangeParentAssetType = PARENT_ASSET_TYPE.LOCATION_NAME;
    toExchangeAnyCopy.toExchangeAssetType = "skyrim_hylq";
    toExchangeAnyCopy.beExchangeAssetType = `hylq.${bfchainCore.config.chainName}`;
    toExchangeAnyCopy.toExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.beExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.assetExchangeWeightRatio = undefined;

    const t19 = await getToExchangeAnyTransaction(
      aa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyTransaction(dd, t19, [cc, dd], bfchainCore);
    const t20 = await getToExchangeAnyTransaction(
      aaa,
      { ...toExchangeAnyCopy },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyTransaction(ddd, t20, [cc, dd], bfchainCore);
    await getBeExchangeAnyTransaction(aaa, t20, [cc, dd], bfchainCore);
  };

  // asset => asset
  await test0();
  // dappid => asset
  // await test1();
  // lns => asset
  // await test2();
  // entityId => asset
  // await test3();
  // asset => dappid
  // await test4();
  // asset => lns
  // await test5();
  // asset => entityId
  // await test6();
  // dapp => entityId
  // await test7();
  // dappid => lns
  // await test8();
  // entityId => lns
  await test9();
})();
