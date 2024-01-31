import {
  ToExchangeAnyMultiAllTransaction,
  ToExchangeAnyMultiAllTransactionFactory,
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
  getRandomDAppId,
  getRandomCertificateId,
} from "../include";

async function getToExchangeAnyMultiAllTransaction(
  sender: AccountModel,
  recipientId: any,
  toExchangeAnyMultiAll: BFChainCore.ToExchangeAnyMultiAllJSON,
  bfchainCore: BFChainCore,
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

  if (recipientId) {
    data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
    data.range = [recipientId];
  }

  const trs = await bfchainCore.transaction.createTransaction<ToExchangeAnyMultiAllTransaction>(
    ToExchangeAnyMultiAllTransactionFactory,
    data,
    { toExchangeAnyMultiAll },
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
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiAllJSON = {
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
          toExchangeAssetType: "CCC",
          toExchangeAssetPrealnum: "100",
        },
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
          beExchangeAssetType: "BFM",
          beExchangeAssetPrealnum: "1000",
        },
      ],
    };
    await getToExchangeAnyMultiAllTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiAllTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  const test1 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiAllJSON = {
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
          beExchangeAssetPrealnum: "100",
        },
      ],
    };
    await getToExchangeAnyMultiAllTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiAllTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  const test2 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiAllJSON = {
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
          beExchangeAssetPrealnum: "100",
        },
      ],
    };
    await getToExchangeAnyMultiAllTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiAllTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  const test3 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiAllJSON = {
      cipherPublicKeys: [],
      toExchangeAssets: [
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.ENTITY,
          toExchangeAssetType: `skyrim_hylq`,
          toExchangeAssetPrealnum: "1",
          taxInformation: {
            taxCollector: recipientId,
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
          beExchangeAssetPrealnum: "100",
        },
      ],
    };
    await getToExchangeAnyMultiAllTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiAllTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  const test4 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiAllJSON = {
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
    await getToExchangeAnyMultiAllTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiAllTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  const test5 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiAllJSON = {
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
    await getToExchangeAnyMultiAllTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiAllTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  const test6 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiAllJSON = {
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
          beExchangeAssetType: "skyrim_hylq",
          beExchangeAssetPrealnum: "1",
          taxInformation: {
            taxCollector: aa.address,
            taxAssetPrealnum: "10000",
          },
        },
      ],
    };
    await getToExchangeAnyMultiAllTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiAllTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  const test7 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiAllJSON = {
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
          beExchangeAssetType: "skyrim_hylq",
          beExchangeAssetPrealnum: "1",
          taxInformation: {
            taxCollector: aa.address,
            taxAssetPrealnum: "10000",
          },
        },
      ],
    };
    await getToExchangeAnyMultiAllTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiAllTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
  };

  const test8 = async () => {
    const toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiAllJSON = {
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
          toExchangeParentAssetType: PARENT_ASSET_TYPE.DAPP,
          toExchangeAssetType: getRandomDAppId(),
          toExchangeAssetPrealnum: "1",
        },
        {
          toExchangeSource: bfchainCore.config.magic,
          toExchangeChainName: bfchainCore.config.chainName,
          toExchangeParentAssetType: PARENT_ASSET_TYPE.LOCATION_NAME,
          toExchangeAssetType: `llq.${bfchainCore.config.chainName}`,
          toExchangeAssetPrealnum: "1",
        },
      ],
      beExchangeAssets: [
        {
          beExchangeSource: bfchainCore.config.magic,
          beExchangeChainName: bfchainCore.config.chainName,
          beExchangeParentAssetType: PARENT_ASSET_TYPE.ENTITY,
          beExchangeAssetType: "skyrim_hylq",
          beExchangeAssetPrealnum: "1",
          taxInformation: {
            taxCollector: aa.address,
            taxAssetPrealnum: "10000",
          },
        },
        {
          beExchangeSource: bfchainCore.config.magic,
          beExchangeChainName: bfchainCore.config.chainName,
          beExchangeParentAssetType: PARENT_ASSET_TYPE.LOCATION_NAME,
          beExchangeAssetType: `hylq.${bfchainCore.config.chainName}`,
          beExchangeAssetPrealnum: "1",
        },
        {
          beExchangeSource: bfchainCore.config.magic,
          beExchangeChainName: bfchainCore.config.chainName,
          beExchangeParentAssetType: PARENT_ASSET_TYPE.CERTIFICATE,
          beExchangeAssetType: getRandomCertificateId(),
          beExchangeAssetPrealnum: "1",
        },
      ],
    };
    await getToExchangeAnyMultiAllTransaction(aa, "", toExchangeAnyMulti, bfchainCore);
    await getToExchangeAnyMultiAllTransaction(aaa, recipientId, toExchangeAnyMulti, bfchainCore);
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
