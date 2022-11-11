import {
  ToExchangeAnyMultiTransaction,
  ToExchangeAnyMultiTransactionFactory,
  RANGE_TYPE,
  PARENT_ASSET_TYPE,
  BFChainCore,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppid,
} from "../include";

async function getToExchangeAnyMultiTransaction(
  sender: AccountModel,
  recipientId: any,
  toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiJSON,
  bfchainCore: BFChainCore,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    subEnvParams: {},

    type: bfchainCore.transactionHelper.TO_EXCHANGE_ANY_MULTI, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    maxFee: "100000000",
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收者账户
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic

    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    sourceIP: "127.0.0.1", // 交易来源 ip
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

  if (recipientId) {
    data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
    data.range = [recipientId];
  }

  const trs = await bfchainCore.transaction.createTransaction<ToExchangeAnyMultiTransaction>(
    ToExchangeAnyMultiTransactionFactory,
    data,
    { toExchangeAnyMulti },
    keypair,
    secondKeypair,
  );
  console.log(trs.toJSON());
}

(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  const aa = getSenderWithSecondSecret();
  const aaa = getSenderWithoutSecondSecret();
  const recipientId = getGenesisAccount().address;

  const test0 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: "bfchain",
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
          toExchangeChainName: "bfchain",
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          toExchangeAssetType: "CCC",
          toExchangeAssetPrealnum: "100",
          assetExchangeWeightRatio: {
            toExchangeAssetWeight: "1",
            beExchangeAssetWeight: "100",
          },
        },
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: "bfchain",
          toExchangeParentAssetType: PARENT_ASSET_TYPE.DAPP,
          toExchangeAssetType: getRandomDAppid(),
          toExchangeAssetPrealnum: "1",
        },
      ],
      beExchangeAsset: {
        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: "bfchain",
        beExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
        beExchangeAssetType: "BFT",
        beExchangeAssetPrealnum: "1000",

        // beExchangeSource: bfchainCore.config.magic,
        // beExchangeChainName: "bfchain",
        // beExchangeParentAssetType: PARENT_ASSET_TYPE.LOCATION_NAME,
        // beExchangeAssetType: `hylq.${bfchainCore.config.chainName}`,
        // beExchangeAssetPrealnum: "1",

        //   beExchangeSource: bfchainCore.config.magic,
        //   beExchangeChainName: "bfchain",
        //   beExchangeParentAssetType: PARENT_ASSET_TYPE.ENTITY,
        //   beExchangeAssetType: "skyrim_hylq",
        //   beExchangeAssetPrealnum: "1",
        //   taxInformation: {
        //     taxCollector: aa.address,
        //     taxAssetPrealnum: "10000",
        //   },
      },
    };
    await getToExchangeAnyMultiTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  const test1 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: "bfchain",
          toExchangeParentAssetType: PARENT_ASSET_TYPE.DAPP,
          toExchangeAssetType: getRandomDAppid(),
          toExchangeAssetPrealnum: "1",
        },
      ],
      beExchangeAsset: {
        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: "bfchain",
        beExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
        beExchangeAssetType: "BFT",
        beExchangeAssetPrealnum: "100",
      },
    };
    await getToExchangeAnyMultiTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  const test2 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: "bfchain",
          toExchangeParentAssetType: PARENT_ASSET_TYPE.LOCATION_NAME,
          toExchangeAssetType: `hylq.${bfchainCore.config.chainName}`,
          toExchangeAssetPrealnum: "1",
        },
      ],
      beExchangeAsset: {
        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: "bfchain",
        beExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
        beExchangeAssetType: "BFT",
        beExchangeAssetPrealnum: "100",
      },
    };
    await getToExchangeAnyMultiTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  const test3 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: "bfchain",
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ENTITY,
          toExchangeAssetType: `skyrim_hylq`,
          toExchangeAssetPrealnum: "1",
          taxInformation: {
            taxCollector: recipientId,
            taxAssetPrealnum: "1000",
          },
        },
      ],
      beExchangeAsset: {
        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: "bfchain",
        beExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
        beExchangeAssetType: "BFT",
        beExchangeAssetPrealnum: "100",
      },
    };
    await getToExchangeAnyMultiTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  const test4 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: "bfchain",
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          toExchangeAssetType: "BFT",
          toExchangeAssetPrealnum: "100",
        },
      ],
      beExchangeAsset: {
        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: "bfchain",
        beExchangeParentAssetType: PARENT_ASSET_TYPE.DAPP,
        beExchangeAssetType: getRandomDAppid(),
        beExchangeAssetPrealnum: "1",
      },
    };
    await getToExchangeAnyMultiTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  const test5 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: "bfchain",
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          toExchangeAssetType: "BFT",
          toExchangeAssetPrealnum: "100",
        },
      ],
      beExchangeAsset: {
        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: "bfchain",
        beExchangeParentAssetType: PARENT_ASSET_TYPE.LOCATION_NAME,
        beExchangeAssetType: `hylq.${bfchainCore.config.chainName}`,
        beExchangeAssetPrealnum: "1",
      },
    };
    await getToExchangeAnyMultiTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  const test6 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: "bfchain",
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          toExchangeAssetType: "BFT",
          toExchangeAssetPrealnum: "100",
        },
      ],
      beExchangeAsset: {
        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: "bfchain",
        beExchangeParentAssetType: PARENT_ASSET_TYPE.ENTITY,
        beExchangeAssetType: "skyrim_hylq",
        beExchangeAssetPrealnum: "1",
        taxInformation: {
          taxCollector: aa.address,
          taxAssetPrealnum: "10000",
        },
      },
    };
    await getToExchangeAnyMultiTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  const test7 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: "bfchain",
          toExchangeParentAssetType: PARENT_ASSET_TYPE.DAPP,
          toExchangeAssetType: getRandomDAppid(),
          toExchangeAssetPrealnum: "1",
        },
      ],
      beExchangeAsset: {
        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: "bfchain",
        beExchangeParentAssetType: PARENT_ASSET_TYPE.ENTITY,
        beExchangeAssetType: "skyrim_hylq",
        beExchangeAssetPrealnum: "1",
        taxInformation: {
          taxCollector: aa.address,
          taxAssetPrealnum: "10000",
        },
      },
    };
    await getToExchangeAnyMultiTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  const test8 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: "bfchain",
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ASSETS,
          toExchangeAssetType: "BFT",
          toExchangeAssetPrealnum: "100",
        },
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: "bfchain",
          toExchangeParentAssetType: PARENT_ASSET_TYPE.DAPP,
          toExchangeAssetType: getRandomDAppid(),
          toExchangeAssetPrealnum: "1",
        },
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: "bfchain",
          toExchangeParentAssetType: PARENT_ASSET_TYPE.LOCATION_NAME,
          toExchangeAssetType: `llq.${bfchainCore.config.chainName}`,
          toExchangeAssetPrealnum: "1",
        },
      ],
      beExchangeAsset: {
        beExchangeSource: bfchainCore.config.magic,
        beExchangeChainName: "bfchain",
        beExchangeParentAssetType: PARENT_ASSET_TYPE.ENTITY,
        beExchangeAssetType: "skyrim_hylq",
        beExchangeAssetPrealnum: "1",
        taxInformation: {
          taxCollector: aa.address,
          taxAssetPrealnum: "10000",
        },
      },
    };
    await getToExchangeAnyMultiTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  await test0();
  await test1();
  await test2();
  await test3();
  await test4();
  await test5();
  await test6();
  await test7();
  await test8();
})();
