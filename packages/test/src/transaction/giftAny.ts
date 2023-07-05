import {
  GiftAnyTransaction,
  GiftAnyTransactionFactory,
  GIFT_DISTRIBUTION_RULE,
  RANGE_TYPE,
  BFChainCore,
  PARENT_ASSET_TYPE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  AccountModel,
  getGenesisAccount,
  getBfchainCoreEntry,
  getRandomDAppId,
} from "../include";

async function getGiftAnyTransaction(
  sender: AccountModel,
  bfchainCore: BFChainCore,
  recipient?: AccountModel[],
  cipher?: boolean,
) {
  const assetType = "skyrim_dragonborn";

  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.GIFT_ANY, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "80000080000", // 交易手续费
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
    sourceChainName: "bfchain",
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
    data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
    data.range = recipient.map((r) => r.address);
    if (cipher) {
      giftAny.cipherPublicKeys = recipient.map((r) => r.publicKey);
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
  const xx = await bfchainCore.transaction.recombineTransaction(trs.toJSON());

  const yy =
    bfchainCore.transactionLogicVerifier.getTransactionLogicVerifierFromType<GiftAnyTransaction>(
      trs.type,
    );

  console.log(trs.getBytes().length);
  console.log(bfchainCore.config.maxTransactionSize);

  const result = await yy.checkTrsFeeAndWebFee(trs, trs.getBytes().length);

  const result2 = await yy.checkTrsFeeAndMiningMachineFeeAndWebFee(trs, trs.getBytes().length, {
    numerator: 200,
    denominator: 1024,
  });

  if (result.isFeeEnough) {
    if (result2.isFeeEnough) {
      console.log((xx.asset as any).giftAsset);
    } else {
      throw new Error(JSON.stringify(result2));
    }
  } else {
    throw new Error(JSON.stringify(result));
  }
}

(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  // const recipient: AccountModel[] = [];
  // for (let i = 0; i < 6000; i++) {
  //   const secret = `secret ${i}`;
  //   recipient[recipient.length] = {
  //     secret,
  //     address: await bfchainCore.accountBaseHelper.getAddressFromSecret(secret),
  //     publicKey: await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(secret),
  //   };
  // }
  await getGiftAnyTransaction(
    getSenderWithSecondSecret(),
    bfchainCore,
    [getGenesisAccount()],
    true,
  );
  await getGiftAnyTransaction(getSenderWithoutSecondSecret(), bfchainCore, [getGenesisAccount()]);
})();
