import { parseHexToArrayBuffer } from "@bfchain/util";
import {
  ToExchangeAnyMultiAllTransaction,
  BeExchangeAnyMultiAllTransaction,
  ToExchangeAnyMultiAllTransactionFactory,
  BeExchangeAnyMultiAllTransactionFactory,
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
  getRandomDAppId,
  getRecipientWithSecondSecret,
  getRecipientWithoutSecondSecret,
} from "../include";

const jsbiHelper = new JSBIHelper();

async function getToExchangeAnyMultiAllTransaction(
  sender: AccountModel,
  toExchangeAnyMultiAll: BFChainCore.ToExchangeAnyMultiAllJSON,
  bfchainCore: BFChainCore,
  recipient?: AccountModel[],
  cipher?: boolean,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.TO_EXCHANGE_ANY_MULTI_ALL, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收者账户
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

  if (recipient && recipient.length > 0) {
    data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
    data.range = recipient.map((r) => r.address);
    if (cipher) {
      toExchangeAnyMultiAll.cipherPublicKeys = recipient.map((r) => r.publicKey);
    }
    data.range.push(sender.address);
  }

  const trs = await bfchainCore.transaction.createTransaction<ToExchangeAnyMultiAllTransaction>(
    ToExchangeAnyMultiAllTransactionFactory,
    data,
    { toExchangeAnyMultiAll },
    keypair,
    secondKeypair,
  );

  return trs.toJSON();
}

async function getBeExchangeAnyMultiAllTransaction(
  sender: AccountModel,
  toExchangeAnyMultiTrs: BFChainCore.TransactionMixJSON<BFChainCore.ToExchangeAnyMultiAllAssetJSON>,
  recipient: AccountModel[],
  bfchainCore: BFChainCore,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.BE_EXCHANGE_ANY_MULTI_ALL, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: toExchangeAnyMultiTrs.senderId,
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
      value: toExchangeAnyMultiTrs.signature,
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

  const { toExchangeAssets, beExchangeAssets, cipherPublicKeys } =
    toExchangeAnyMultiTrs.asset.toExchangeAnyMultiAll;

  const beExchangeAnyMultiAll: BFChainCore.BeExchangeAnyMultiAllJSON = {
    transactionSignature: toExchangeAnyMultiTrs.signature,
    toExchangeAssets: toExchangeAssets.map((item) => {
      return { ...item };
    }),
    beExchangeAssets,
  };
  if (data.senderId === data.recipientId) {
    beExchangeAnyMultiAll.beExchangeAssets = beExchangeAnyMultiAll.beExchangeAssets.map((item) => {
      return { ...item, beExchangeAssetPrealnum: "0" };
    });
  }
  if (cipherPublicKeys.length > 0) {
    const index = Math.floor(Math.random() * recipient.length);
    const signature = (
      await bfchainCore.transactionHelper.getCiphertextSignature({
        secret: recipient[index].secret,
        transactionSignatureBuffer: parseHexToArrayBuffer(toExchangeAnyMultiTrs.signature),
        senderId: sender.address,
      })
    ).toString("hex");
    beExchangeAnyMultiAll.ciphertextSignature = {
      publicKey: recipient[index].publicKey,
      signature,
    };
  }

  const trs = await bfchainCore.transaction.createTransaction<BeExchangeAnyMultiAllTransaction>(
    BeExchangeAnyMultiAllTransactionFactory,
    data,
    {
      beExchangeAnyMultiAll,
    },
    keypair,
    secondKeypair,
  );

  const xx = bfchainCore.transactionLogicVerifier.getTransactionLogicVerifierFromType(trs.type);

  (xx as any).isDependentTransactionMatch(trs, toExchangeAnyMultiTrs);

  console.log(`senderId ${trs.senderId}, recipientId ${trs.recipientId}`);
  console.log(trs.asset.beExchangeAnyMultiAll.toJSON());
}
(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  const aa = getSenderWithSecondSecret();
  const aaa = getSenderWithoutSecondSecret();
  const cc = getGenesisAccount();
  const dd = getRecipientWithSecondSecret();
  const ddd = getRecipientWithoutSecondSecret();

  const test0 = async () => {
    const toExchangeAnyMultiAll: BFChainCore.ToExchangeAnyMultiAllJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          toExchangeAssetType: "BFT",
          toExchangeAssetPrealnum: "100",
        },
      ],
      beExchangeAssets: [
        {
          beExchangeSource: bfchainCore.config.magic,
          beExchangeChainName: bfchainCore.config.chainName,
          beExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          beExchangeAssetType: "BFT",
          beExchangeAssetPrealnum: "1",
        },
      ],
    };
    const t1 = await getToExchangeAnyMultiAllTransaction(
      aa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiAllTransaction(dd, t1, [cc, dd], bfchainCore);
    // const t2 = await getToExchangeAnyMultiAllTransaction(
    //   aaa,
    //   { ...toExchangeAnyMultiAll },
    //   bfchainCore,
    //   [cc, dd],
    //   false,
    // );
    // await getBeExchangeAnyMultiAllTransaction(ddd, t2, [cc, dd], bfchainCore);
    // await getBeExchangeAnyMultiAllTransaction(aaa, t2, [cc, dd], bfchainCore);
  };

  const test1 = async () => {
    const toExchangeAnyMultiAll: BFChainCore.ToExchangeAnyMultiAllJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.DAPP,
          toExchangeAssetType: getRandomDAppId(),
          toExchangeAssetPrealnum: "1",
        },
      ],
      beExchangeAssets: [
        {
          beExchangeSource: bfchainCore.config.magic,
          beExchangeChainName: bfchainCore.config.chainName,
          beExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          beExchangeAssetType: "BFT",
          beExchangeAssetPrealnum: "1",
        },
      ],
    };

    const t3 = await getToExchangeAnyMultiAllTransaction(
      aa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiAllTransaction(dd, t3, [cc, dd], bfchainCore);
    const t4 = await getToExchangeAnyMultiAllTransaction(
      aaa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyMultiAllTransaction(ddd, t4, [cc, dd], bfchainCore);
    await getBeExchangeAnyMultiAllTransaction(aaa, t4, [cc, dd], bfchainCore);
  };

  const test2 = async () => {
    const toExchangeAnyMultiAll: BFChainCore.ToExchangeAnyMultiAllJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.LOCATION_NAME,
          toExchangeAssetType: `hylq.${bfchainCore.config.chainName}`,
          toExchangeAssetPrealnum: "1",
        },
      ],
      beExchangeAssets: [
        {
          beExchangeSource: bfchainCore.config.magic,
          beExchangeChainName: bfchainCore.config.chainName,
          beExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          beExchangeAssetType: "BFT",
          beExchangeAssetPrealnum: "1000",
        },
      ],
    };

    const t5 = await getToExchangeAnyMultiAllTransaction(
      aa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiAllTransaction(dd, t5, [cc, dd], bfchainCore);
    const t6 = await getToExchangeAnyMultiAllTransaction(
      aaa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyMultiAllTransaction(ddd, t6, [cc, dd], bfchainCore);
    await getBeExchangeAnyMultiAllTransaction(aaa, t6, [cc, dd], bfchainCore);
  };

  const test3 = async () => {
    const toExchangeAnyMultiAll: BFChainCore.ToExchangeAnyMultiAllJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ENTITY,
          toExchangeAssetType: `skyrim_hylq`,
          toExchangeAssetPrealnum: "1",
          taxInformation: {
            taxCollector: cc.address,
            taxAssetPrealnum: "1000",
          },
        },
      ],
      beExchangeAssets: [
        {
          beExchangeSource: bfchainCore.config.magic,
          beExchangeChainName: bfchainCore.config.chainName,
          beExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          beExchangeAssetType: "BFT",
          beExchangeAssetPrealnum: "1000",
        },
      ],
    };

    const t7 = await getToExchangeAnyMultiAllTransaction(
      aa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiAllTransaction(dd, t7, [cc, dd], bfchainCore);
    // const t8 = await getToExchangeAnyMultiAllTransaction(
    //   aaa,
    //   { ...toExchangeAnyMultiAll },
    //   bfchainCore,
    //   [cc, dd],
    //   false,
    // );
    // await getBeExchangeAnyMultiAllTransaction(ddd, t8, [cc, dd], bfchainCore);
    // await getBeExchangeAnyMultiAllTransaction(aaa, t8, [cc, dd], bfchainCore);
  };

  const test4 = async () => {
    const toExchangeAnyMultiAll: BFChainCore.ToExchangeAnyMultiAllJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          toExchangeAssetType: "BFT",
          toExchangeAssetPrealnum: "100",
        },
      ],
      beExchangeAssets: [
        {
          beExchangeSource: bfchainCore.config.magic,
          beExchangeChainName: bfchainCore.config.chainName,
          beExchangeParentAssetType: PARENT_ASSET_TYPE.DAPP,
          beExchangeAssetType: getRandomDAppId(),
          beExchangeAssetPrealnum: "1",
        },
      ],
    };

    const t9 = await getToExchangeAnyMultiAllTransaction(
      aa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiAllTransaction(dd, t9, [cc, dd], bfchainCore);
    const t10 = await getToExchangeAnyMultiAllTransaction(
      aaa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyMultiAllTransaction(ddd, t10, [cc, dd], bfchainCore);
    await getBeExchangeAnyMultiAllTransaction(aaa, t10, [cc, dd], bfchainCore);
  };

  const test5 = async () => {
    const toExchangeAnyMultiAll: BFChainCore.ToExchangeAnyMultiAllJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          toExchangeAssetType: "BFT",
          toExchangeAssetPrealnum: "100",
        },
      ],
      beExchangeAssets: [
        {
          beExchangeSource: bfchainCore.config.magic,
          beExchangeChainName: bfchainCore.config.chainName,
          beExchangeParentAssetType: PARENT_ASSET_TYPE.LOCATION_NAME,
          beExchangeAssetType: `hylq.${bfchainCore.config.chainName}`,
          beExchangeAssetPrealnum: "1",
        },
      ],
    };

    const t11 = await getToExchangeAnyMultiAllTransaction(
      aa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiAllTransaction(dd, t11, [cc, dd], bfchainCore);
    const t12 = await getToExchangeAnyMultiAllTransaction(
      aaa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyMultiAllTransaction(ddd, t12, [cc, dd], bfchainCore);
    await getBeExchangeAnyMultiAllTransaction(aaa, t12, [cc, dd], bfchainCore);
  };

  const test6 = async () => {
    const toExchangeAnyMultiAll: BFChainCore.ToExchangeAnyMultiAllJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          toExchangeAssetType: "BFT",
          toExchangeAssetPrealnum: "100",
        },
      ],
      beExchangeAssets: [
        {
          beExchangeSource: bfchainCore.config.magic,
          beExchangeChainName: bfchainCore.config.chainName,
          beExchangeParentAssetType: PARENT_ASSET_TYPE.ENTITY,
          beExchangeAssetType: `skyrim_hylq`,
          beExchangeAssetPrealnum: "1",
          taxInformation: {
            taxCollector: cc.address,
            taxAssetPrealnum: "1000",
          },
        },
      ],
    };

    const t15 = await getToExchangeAnyMultiAllTransaction(
      aa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiAllTransaction(dd, t15, [cc, dd], bfchainCore);
    const t16 = await getToExchangeAnyMultiAllTransaction(
      aaa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyMultiAllTransaction(ddd, t16, [cc, dd], bfchainCore);
    await getBeExchangeAnyMultiAllTransaction(aaa, t16, [cc, dd], bfchainCore);
  };

  const test7 = async () => {
    const toExchangeAnyMultiAll: BFChainCore.ToExchangeAnyMultiAllJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.DAPP,
          toExchangeAssetType: getRandomDAppId(),
          toExchangeAssetPrealnum: "1",
        },
      ],
      beExchangeAssets: [
        {
          beExchangeSource: bfchainCore.config.magic,
          beExchangeChainName: bfchainCore.config.chainName,
          beExchangeParentAssetType: PARENT_ASSET_TYPE.ENTITY,
          beExchangeAssetType: `skyrim_hylq`,
          beExchangeAssetPrealnum: "1",
          taxInformation: {
            taxCollector: cc.address,
            taxAssetPrealnum: "1000",
          },
        },
      ],
    };

    const t17 = await getToExchangeAnyMultiAllTransaction(
      aa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiAllTransaction(dd, t17, [cc, dd], bfchainCore);
    const t18 = await getToExchangeAnyMultiAllTransaction(
      aaa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyMultiAllTransaction(ddd, t18, [cc, dd], bfchainCore);
    await getBeExchangeAnyMultiAllTransaction(aaa, t18, [cc, dd], bfchainCore);
  };

  const test8 = async () => {
    const toExchangeAnyMultiAll: BFChainCore.ToExchangeAnyMultiAllJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.DAPP,
          toExchangeAssetType: getRandomDAppId(),
          toExchangeAssetPrealnum: "1",
        },
      ],
      beExchangeAssets: [
        {
          beExchangeSource: bfchainCore.config.magic,
          beExchangeChainName: bfchainCore.config.chainName,
          beExchangeParentAssetType: PARENT_ASSET_TYPE.LOCATION_NAME,
          beExchangeAssetType: `hylq.${bfchainCore.config.chainName}`,
          beExchangeAssetPrealnum: "1",
        },
      ],
    };

    const t19 = await getToExchangeAnyMultiAllTransaction(
      aa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiAllTransaction(dd, t19, [cc, dd], bfchainCore);
    const t20 = await getToExchangeAnyMultiAllTransaction(
      aaa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyMultiAllTransaction(ddd, t20, [cc, dd], bfchainCore);
    await getBeExchangeAnyMultiAllTransaction(aaa, t20, [cc, dd], bfchainCore);
  };

  const test9 = async () => {
    const toExchangeAnyMultiAll: BFChainCore.ToExchangeAnyMultiAllJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          toExchangeAssetType: "BFT",
          toExchangeAssetPrealnum: "100",
        },
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          toExchangeAssetType: "FTT",
          toExchangeAssetPrealnum: "100",
        },
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ENTITY,
          toExchangeAssetType: "skyrim_hylq",
          toExchangeAssetPrealnum: "1",
          taxInformation: {
            taxCollector: cc.address,
            taxAssetPrealnum: "1000",
          },
        },
      ],
      beExchangeAssets: [
        {
          beExchangeSource: bfchainCore.config.magic,
          beExchangeChainName: bfchainCore.config.chainName,
          beExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          beExchangeAssetType: "BFM",
          beExchangeAssetPrealnum: "1",
        },
      ],
    };

    const t19 = await getToExchangeAnyMultiAllTransaction(
      aa,
      { ...toExchangeAnyMultiAll },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiAllTransaction(dd, t19, [cc, dd], bfchainCore);
    await getBeExchangeAnyMultiAllTransaction(aa, t19, [cc, dd], bfchainCore);
    // const t20 = await getToExchangeAnyMultiAllTransaction(
    //   aaa,
    //   { ...toExchangeAnyMultiAll },
    //   bfchainCore,
    //   [cc, dd],
    //   false,
    // );
    // await getBeExchangeAnyMultiAllTransaction(ddd, t20, [cc, dd], bfchainCore);
    // await getBeExchangeAnyMultiAllTransaction(aaa, t20, [cc, dd], bfchainCore);
  };

  // asset => asset
  // await test0();
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
