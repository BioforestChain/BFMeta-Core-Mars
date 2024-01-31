import { parseHexToArrayBuffer } from "@bfchain/util";
import {
  ToExchangeAnyMultiTransaction,
  BeExchangeAnyMultiTransaction,
  ToExchangeAnyMultiTransactionFactory,
  BeExchangeAnyMultiTransactionFactory,
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

async function getToExchangeAnyMultiTransaction(
  sender: AccountModel,
  toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiJSON,
  bfchainCore: BFChainCore,
  recipient?: AccountModel[],
  cipher?: boolean,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.TO_EXCHANGE_ANY_MULTI, // 交易类型
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
      toExchangeAnyMulti.cipherPublicKeys = recipient.map((r) => r.publicKey);
    }
    data.range.push(sender.address);
  }

  const trs = await bfchainCore.transaction.createTransaction<ToExchangeAnyMultiTransaction>(
    ToExchangeAnyMultiTransactionFactory,
    data,
    { toExchangeAnyMulti },
    keypair,
    secondKeypair,
  );

  return trs.toJSON();
}

async function getBeExchangeAnyMultiTransaction(
  sender: AccountModel,
  toExchangeAnyMultiTrs: BFChainCore.TransactionMixJSON<BFChainCore.ToExchangeAnyMultiAssetJSON>,
  recipient: AccountModel[],
  bfchainCore: BFChainCore,
  toExchangeAssetPrealnum?: string,
  beExchangeAssetPrealnum?: string,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.BE_EXCHANGE_ANY_MULTI, // 交易类型
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

  const { toExchangeAssets, beExchangeAsset, cipherPublicKeys } =
    toExchangeAnyMultiTrs.asset.toExchangeAnyMulti;

  let assetPrealnum = BigInt(1);
  const results: BFChainCore.ToExchangeAssetV1JSON[] = [];
  for (const toExchangeAsset of toExchangeAssets) {
    const { toExchangeParentAssetType, assetExchangeWeightRatio } = toExchangeAsset;
    if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS && assetExchangeWeightRatio) {
      const beExchangeAssetPrealnum = jsbiHelper.multiplyRoundFraction(
        toExchangeAsset.toExchangeAssetPrealnum,
        {
          numerator: assetExchangeWeightRatio.beExchangeAssetWeight,
          denominator: assetExchangeWeightRatio.toExchangeAssetWeight,
        },
      );
      if (assetPrealnum < beExchangeAssetPrealnum) {
        assetPrealnum = beExchangeAssetPrealnum;
      }
    }
    results.push({
      ...toExchangeAsset,
      toExchangeAssetPrealnum: toExchangeAssetPrealnum || toExchangeAsset.toExchangeAssetPrealnum,
    });
  }
  results[2].toExchangeAssetPrealnum = "0";

  const beExchangeAnyMulti: BFChainCore.BeExchangeAnyMultiJSON = {
    transactionSignature: toExchangeAnyMultiTrs.signature,
    toExchangeAssets: results.slice(0, 3),
    beExchangeAsset: {
      ...beExchangeAsset,
      beExchangeAssetPrealnum:
        assetPrealnum > BigInt(1)
          ? assetPrealnum.toString()
          : (BigInt(beExchangeAsset.beExchangeAssetPrealnum) * BigInt(results.length)).toString(),
    },
  };

  if (beExchangeAsset.beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
    beExchangeAnyMulti.beExchangeAsset.taxInformation = {
      taxCollector: toExchangeAnyMultiTrs.senderId,
      taxAssetPrealnum: "1000",
    };
  }
  if (beExchangeAsset.beExchangeParentAssetType !== PARENT_ASSET_TYPE.ASSETS) {
    beExchangeAnyMulti.beExchangeAsset.beExchangeAssetPrealnum = "1";
  }
  if (data.senderId === data.recipientId) {
    beExchangeAnyMulti.beExchangeAsset.beExchangeAssetPrealnum = "0";
  }
  if (beExchangeAssetPrealnum) {
    beExchangeAnyMulti.beExchangeAsset.beExchangeAssetPrealnum = beExchangeAssetPrealnum;
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
    beExchangeAnyMulti.ciphertextSignature = {
      publicKey: recipient[index].publicKey,
      signature,
    };
  }

  const trs = await bfchainCore.transaction.createTransaction<BeExchangeAnyMultiTransaction>(
    BeExchangeAnyMultiTransactionFactory,
    data,
    {
      beExchangeAnyMulti,
    },
    keypair,
    secondKeypair,
  );

  const xx = bfchainCore.transactionLogicVerifier.getTransactionLogicVerifierFromType(trs.type);

  (xx as any).isDependentTransactionMatch(trs, toExchangeAnyMultiTrs);

  console.log(`senderId ${trs.senderId}, recipientId ${trs.recipientId}`);
  console.log(trs.asset.beExchangeAnyMulti.toJSON());
}
(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  const aa = getSenderWithSecondSecret();
  const aaa = getSenderWithoutSecondSecret();
  const cc = getGenesisAccount();
  const dd = getRecipientWithSecondSecret();
  const ddd = getRecipientWithoutSecondSecret();

  const test0 = async () => {
    const toExchangeAny: BFChainCore.ToExchangeAnyMultiJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          toExchangeAssetType: "BFT",
          toExchangeAssetPrealnum: "100",
          assetExchangeWeightRatio: {
            toExchangeAssetWeight: "1",
            beExchangeAssetWeight: "100",
          },
        },
        // {
        //   toExchangeSource: bfchainCore.config.magic,
        //   toExchangeChainName: bfchainCore.config.chainName,
        //   toExchangeParentAssetType: PARENT_ASSET_TYPE.DAPP,
        //   toExchangeAssetType: getRandomDAppId(),
        //   toExchangeAssetPrealnum: "1",
        // },
        // {
        //   toExchangeSource: bfchainCore.config.magic,
        //   toExchangeChainName: bfchainCore.config.chainName,
        //   toExchangeParentAssetType: PARENT_ASSET_TYPE.LOCATION_NAME,
        //   toExchangeAssetType: `hylq.${bfchainCore.config.chainName}`,
        //   toExchangeAssetPrealnum: "1",
        // },
        // {
        //   toExchangeSource: bfchainCore.config.magic,
        //   toExchangeChainName: bfchainCore.config.chainName,
        //   toExchangeParentAssetType: PARENT_ASSET_TYPE.ENTITY,
        //   toExchangeAssetType: `skyrim_hylq`,
        //   toExchangeAssetPrealnum: "1",
        //   taxInformation: {
        //     taxCollector: cc.address,
        //     taxAssetPrealnum: "1000",
        //   },
        // },
      ],
      beExchangeAsset: {
        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: bfchainCore.config.chainName,
        beExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
        beExchangeAssetType: "BFT",
        // beExchangeAssetPrealnum: "1",

        // beExchangeSource: bfchainCore.config.magic,
        // beExchangeChainName: bfchainCore.config.chainName,
        // beExchangeParentAssetType: PARENT_ASSET_TYPE.ENTITY,
        // beExchangeAssetType: `skyrim_llq`,
        // beExchangeAssetPrealnum: "1",
        // taxInformation: {
        //   taxCollector: cc.address,
        //   taxAssetPrealnum: "1000",
        // },
      },
    };
    const t1 = await getToExchangeAnyMultiTransaction(
      aa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiTransaction(dd, t1, [cc, dd], bfchainCore);
    // const t2 = await getToExchangeAnyMultiTransaction(
    //   aaa,
    //   { ...toExchangeAny },
    //   bfchainCore,
    //   [cc, dd],
    //   false,
    // );
    // await getBeExchangeAnyMultiTransaction(ddd, t2, [cc, dd], bfchainCore);
    // await getBeExchangeAnyMultiTransaction(aaa, t2, [cc, dd], bfchainCore);
  };

  const test1 = async () => {
    const toExchangeAny: BFChainCore.ToExchangeAnyMultiJSON = {
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
      beExchangeAsset: {
        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: bfchainCore.config.chainName,
        beExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
        beExchangeAssetType: "BFT",
        beExchangeAssetPrealnum: "1",
      },
    };

    const t3 = await getToExchangeAnyMultiTransaction(
      aa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiTransaction(dd, t3, [cc, dd], bfchainCore);
    const t4 = await getToExchangeAnyMultiTransaction(
      aaa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyMultiTransaction(ddd, t4, [cc, dd], bfchainCore);
    await getBeExchangeAnyMultiTransaction(aaa, t4, [cc, dd], bfchainCore);
  };

  const test2 = async () => {
    const toExchangeAny: BFChainCore.ToExchangeAnyMultiJSON = {
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
      beExchangeAsset: {
        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: bfchainCore.config.chainName,
        beExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
        beExchangeAssetType: "BFT",
        beExchangeAssetPrealnum: "1000",
      },
    };

    const t5 = await getToExchangeAnyMultiTransaction(
      aa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiTransaction(dd, t5, [cc, dd], bfchainCore);
    const t6 = await getToExchangeAnyMultiTransaction(
      aaa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyMultiTransaction(ddd, t6, [cc, dd], bfchainCore);
    await getBeExchangeAnyMultiTransaction(aaa, t6, [cc, dd], bfchainCore);
  };

  const test3 = async () => {
    const toExchangeAny: BFChainCore.ToExchangeAnyMultiJSON = {
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
      beExchangeAsset: {
        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: bfchainCore.config.chainName,
        beExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
        beExchangeAssetType: "BFT",
        beExchangeAssetPrealnum: "1000",
      },
    };

    const t7 = await getToExchangeAnyMultiTransaction(
      aa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiTransaction(dd, t7, [cc, dd], bfchainCore);
    // const t8 = await getToExchangeAnyMultiTransaction(
    //   aaa,
    //   { ...toExchangeAny },
    //   bfchainCore,
    //   [cc, dd],
    //   false,
    // );
    // await getBeExchangeAnyMultiTransaction(ddd, t8, [cc, dd], bfchainCore);
    // await getBeExchangeAnyMultiTransaction(aaa, t8, [cc, dd], bfchainCore);
  };

  const test4 = async () => {
    const toExchangeAny: BFChainCore.ToExchangeAnyMultiJSON = {
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
      beExchangeAsset: {
        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: bfchainCore.config.chainName,
        beExchangeParentAssetType: PARENT_ASSET_TYPE.DAPP,
        beExchangeAssetType: getRandomDAppId(),
        beExchangeAssetPrealnum: "1",
      },
    };

    const t9 = await getToExchangeAnyMultiTransaction(
      aa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiTransaction(dd, t9, [cc, dd], bfchainCore);
    const t10 = await getToExchangeAnyMultiTransaction(
      aaa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyMultiTransaction(ddd, t10, [cc, dd], bfchainCore);
    await getBeExchangeAnyMultiTransaction(aaa, t10, [cc, dd], bfchainCore);
  };

  const test5 = async () => {
    const toExchangeAny: BFChainCore.ToExchangeAnyMultiJSON = {
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
      beExchangeAsset: {
        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: bfchainCore.config.chainName,
        beExchangeParentAssetType: PARENT_ASSET_TYPE.LOCATION_NAME,
        beExchangeAssetType: `hylq.${bfchainCore.config.chainName}`,
        beExchangeAssetPrealnum: "1",
      },
    };

    const t11 = await getToExchangeAnyMultiTransaction(
      aa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiTransaction(dd, t11, [cc, dd], bfchainCore);
    const t12 = await getToExchangeAnyMultiTransaction(
      aaa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyMultiTransaction(ddd, t12, [cc, dd], bfchainCore);
    await getBeExchangeAnyMultiTransaction(aaa, t12, [cc, dd], bfchainCore);
  };

  const test6 = async () => {
    const toExchangeAny: BFChainCore.ToExchangeAnyMultiJSON = {
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
      beExchangeAsset: {
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
    };

    const t15 = await getToExchangeAnyMultiTransaction(
      aa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiTransaction(dd, t15, [cc, dd], bfchainCore);
    const t16 = await getToExchangeAnyMultiTransaction(
      aaa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyMultiTransaction(ddd, t16, [cc, dd], bfchainCore);
    await getBeExchangeAnyMultiTransaction(aaa, t16, [cc, dd], bfchainCore);
  };

  const test7 = async () => {
    const toExchangeAny: BFChainCore.ToExchangeAnyMultiJSON = {
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
      beExchangeAsset: {
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
    };

    const t17 = await getToExchangeAnyMultiTransaction(
      aa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiTransaction(dd, t17, [cc, dd], bfchainCore);
    const t18 = await getToExchangeAnyMultiTransaction(
      aaa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyMultiTransaction(ddd, t18, [cc, dd], bfchainCore);
    await getBeExchangeAnyMultiTransaction(aaa, t18, [cc, dd], bfchainCore);
  };

  const test8 = async () => {
    const toExchangeAny: BFChainCore.ToExchangeAnyMultiJSON = {
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
      beExchangeAsset: {
        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: bfchainCore.config.chainName,
        beExchangeParentAssetType: PARENT_ASSET_TYPE.LOCATION_NAME,
        beExchangeAssetType: `hylq.${bfchainCore.config.chainName}`,
        beExchangeAssetPrealnum: "1",
      },
    };

    const t19 = await getToExchangeAnyMultiTransaction(
      aa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiTransaction(dd, t19, [cc, dd], bfchainCore);
    const t20 = await getToExchangeAnyMultiTransaction(
      aaa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      false,
    );
    await getBeExchangeAnyMultiTransaction(ddd, t20, [cc, dd], bfchainCore);
    await getBeExchangeAnyMultiTransaction(aaa, t20, [cc, dd], bfchainCore);
  };

  const test9 = async () => {
    const toExchangeAny: BFChainCore.ToExchangeAnyMultiJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          toExchangeAssetType: "BFT",
          toExchangeAssetPrealnum: "100",
          assetExchangeWeightRatio: {
            toExchangeAssetWeight: "1",
            beExchangeAssetWeight: "100",
          },
        },
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          toExchangeAssetType: "FTT",
          toExchangeAssetPrealnum: "100",
          assetExchangeWeightRatio: {
            toExchangeAssetWeight: "1",
            beExchangeAssetWeight: "3",
          },
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
        // {
        //   toExchangeSource: bfchainCore.config.magic,
        //   toExchangeChainName: bfchainCore.config.chainName,
        //   toExchangeParentAssetType: PARENT_ASSET_TYPE.LOCATION_NAME,
        //   toExchangeAssetType: `hylq.${bfchainCore.config.chainName}`,
        //   toExchangeAssetPrealnum: "1",
        // },
      ],
      beExchangeAsset: {
        // beExchangeSource: bfchainCore.config.magic,
        // beExchangeChainName: bfchainCore.config.chainName,
        // beExchangeParentAssetType: PARENT_ASSET_TYPE.LOCATION_NAME,
        // beExchangeAssetType: `hylq.${bfchainCore.config.chainName}`,
        // beExchangeAssetPrealnum: "1",

        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: bfchainCore.config.chainName,
        beExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
        beExchangeAssetType: "BFT",
        beExchangeAssetPrealnum: "100",
      },
    };

    const t19 = await getToExchangeAnyMultiTransaction(
      aa,
      { ...toExchangeAny },
      bfchainCore,
      [cc, dd],
      true,
    );
    await getBeExchangeAnyMultiTransaction(dd, t19, [cc, dd], bfchainCore, "10", "100");
    // const t20 = await getToExchangeAnyMultiTransaction(
    //   aaa,
    //   { ...toExchangeAny },
    //   bfchainCore,
    //   [cc, dd],
    //   false,
    // );
    // await getBeExchangeAnyMultiTransaction(ddd, t20, [cc, dd], bfchainCore);
    // await getBeExchangeAnyMultiTransaction(aaa, t20, [cc, dd], bfchainCore);
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
