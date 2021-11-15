import {
  ToExchangeAnyTransaction,
  ToExchangeAnyTransactionFactory,
  RANGE_TYPE,
  PARENT_ASSET_TYPE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppid,
} from "../include";

const bfchainCore = getBfchainCoreEntry();

async function getToExchangeAnyTransaction(
  sender: AccountModel,
  recipientId: any,
  toExchangeAny: BFChainCore.ToExchangeAnyJSON,
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

  if (recipientId) {
    data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
    data.range = [recipientId];
  }

  const trs = await bfchainCore.transaction.createTransaction<ToExchangeAnyTransaction>(
    ToExchangeAnyTransactionFactory,
    data,
    { toExchangeAny },
    keypair,
    secondKeypair,
  );
  console.log(trs.toJSON());
}

(async () => {
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
  const recipientId = getGenesisAccount().address;

  const test0 = async () => {
    await getToExchangeAnyTransaction(aa, "", toExchangeAny);
    await getToExchangeAnyTransaction(aaa, recipientId, toExchangeAny);
  };

  const test1 = async () => {
    const toExchangeAnyCopy = { ...toExchangeAny };
    toExchangeAnyCopy.toExchangeParentAssetType = PARENT_ASSET_TYPE.DAPP;
    toExchangeAnyCopy.beExchangeParentAssetType = PARENT_ASSET_TYPE.ASSETS;
    toExchangeAnyCopy.toExchangeAssetType = getRandomDAppid();
    toExchangeAnyCopy.toExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.beExchangeAssetPrealnum = "1000";
    toExchangeAnyCopy.assetExchangeWeightRatio = undefined;

    await getToExchangeAnyTransaction(aa, "", toExchangeAnyCopy);
    await getToExchangeAnyTransaction(aaa, recipientId, toExchangeAnyCopy);
  };

  const test2 = async () => {
    const toExchangeAnyCopy = { ...toExchangeAny };
    toExchangeAnyCopy.toExchangeParentAssetType = PARENT_ASSET_TYPE.LOCATION_NAME;
    toExchangeAnyCopy.beExchangeParentAssetType = PARENT_ASSET_TYPE.ASSETS;
    toExchangeAnyCopy.toExchangeAssetType = `hylq.${bfchainCore.config.chainName}`;
    toExchangeAnyCopy.toExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.beExchangeAssetPrealnum = "1000";
    toExchangeAnyCopy.assetExchangeWeightRatio = undefined;

    await getToExchangeAnyTransaction(aa, "", toExchangeAnyCopy);
    await getToExchangeAnyTransaction(aaa, recipientId, toExchangeAnyCopy);
  };

  const test3 = async () => {
    const toExchangeAnyCopy = { ...toExchangeAny };
    toExchangeAnyCopy.toExchangeParentAssetType = PARENT_ASSET_TYPE.ENTITY;
    toExchangeAnyCopy.beExchangeParentAssetType = PARENT_ASSET_TYPE.ASSETS;
    toExchangeAnyCopy.toExchangeAssetType = `skyrim_hylq`;
    toExchangeAnyCopy.toExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.beExchangeAssetPrealnum = "1000";
    toExchangeAnyCopy.assetExchangeWeightRatio = undefined;

    await getToExchangeAnyTransaction(aa, "", toExchangeAnyCopy);
    await getToExchangeAnyTransaction(aaa, recipientId, toExchangeAnyCopy);
  };

  const test4 = async () => {
    const toExchangeAnyCopy = { ...toExchangeAny };
    toExchangeAnyCopy.toExchangeParentAssetType = PARENT_ASSET_TYPE.ASSETS;
    toExchangeAnyCopy.beExchangeParentAssetType = PARENT_ASSET_TYPE.DAPP;
    toExchangeAnyCopy.beExchangeAssetType = getRandomDAppid();
    toExchangeAnyCopy.beExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.assetExchangeWeightRatio = undefined;

    await getToExchangeAnyTransaction(aa, "", toExchangeAnyCopy);
    await getToExchangeAnyTransaction(aaa, recipientId, toExchangeAnyCopy);
  };

  const test5 = async () => {
    const toExchangeAnyCopy = { ...toExchangeAny };
    toExchangeAnyCopy.toExchangeParentAssetType = PARENT_ASSET_TYPE.ASSETS;
    toExchangeAnyCopy.beExchangeParentAssetType = PARENT_ASSET_TYPE.LOCATION_NAME;
    toExchangeAnyCopy.beExchangeAssetType = `hylq.${bfchainCore.config.chainName}`;
    toExchangeAnyCopy.beExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.assetExchangeWeightRatio = undefined;

    await getToExchangeAnyTransaction(aa, "", toExchangeAnyCopy);
    await getToExchangeAnyTransaction(aaa, recipientId, toExchangeAnyCopy);
  };

  const test6 = async () => {
    const toExchangeAnyCopy = { ...toExchangeAny };
    toExchangeAnyCopy.toExchangeParentAssetType = PARENT_ASSET_TYPE.ASSETS;
    toExchangeAnyCopy.beExchangeParentAssetType = PARENT_ASSET_TYPE.ENTITY;
    toExchangeAnyCopy.beExchangeAssetType = "skyrim_hylq";
    toExchangeAnyCopy.beExchangeAssetPrealnum = "1";
    toExchangeAnyCopy.assetExchangeWeightRatio = undefined;

    await getToExchangeAnyTransaction(aa, "", toExchangeAnyCopy);
    await getToExchangeAnyTransaction(aaa, recipientId, toExchangeAnyCopy);
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

    await getToExchangeAnyTransaction(aa, "", toExchangeAnyCopy);
    await getToExchangeAnyTransaction(aaa, recipientId, toExchangeAnyCopy);
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

    await getToExchangeAnyTransaction(aa, "", toExchangeAnyCopy);
    await getToExchangeAnyTransaction(aaa, recipientId, toExchangeAnyCopy);
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
