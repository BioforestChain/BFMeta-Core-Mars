import {
  GiftAssetTransaction,
  GiftAssetTransactionFactory,
  GIFT_DISTRIBUTION_RULE,
  RANGE_TYPE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  AccountModel,
  getGenesisAccount,
  getBfchainCoreEntry,
} from "../include";

const bfchainCore = getBfchainCoreEntry();

async function getGiftAssetTransaction(
  sender: AccountModel,
  recipient?: AccountModel[],
  cipher?: boolean,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.GIFT_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "80000080000", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
    lns: bfchainCore.config.genesisBlock.remark.genesisNodeAddress,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "assetType",
      value: "ZEK",
    },
  };
  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = await bfchainCore.accountBaseHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey = await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
      sender.secret,
      sender.secondSecret,
    );
  }
  const giftAsset: BFChainCore.GiftAssetJSON = {
    cipherPublicKeys: [],
    sourceChainName: "bfchain",
    sourceChainMagic: bfchainCore.config.magic,
    assetType: "ZEK", // 交易的资产类型
    amount: "100000", // 交易资产数量
    /* unitReserveFee: "1000", */
    totalGrabableTimes: 1000000,
    beginUnfrozenBlockHeight: 99,
    giftDistributionRule: GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM,
  };
  if (recipient && recipient.length > 0) {
    data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
    data.range = recipient.map(r => r.address);
    if (cipher) {
      giftAsset.cipherPublicKeys = recipient.map(r => r.publicKey);
    }
  }
  const trs = await bfchainCore.transaction.createTransaction<GiftAssetTransaction>(
    GiftAssetTransactionFactory,
    data,
    {
      giftAsset,
    },
    keypair,
    secondKeypair,
  );
  const xx = await bfchainCore.transaction.recombineTransaction(trs.toJSON());

  const yy = bfchainCore.transactionLogicVerifier.getTransactionLogicVerifierFromType<
    GiftAssetTransaction
  >(trs.type);

  console.log(trs.getBytes().length);
  console.log(bfchainCore.config.maxTransactionSize);

  const result = yy.checkTrsFeeAndWebFee(trs, trs.getBytes().length);

  const result2 = yy.checkTrsFeeAndMiningMachineFeeAndWebFee(trs, trs.getBytes().length, {
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
  // const recipient: AccountModel[] = [];
  // for (let i = 0; i < 6000; i++) {
  //   const secret = `secret ${i}`;
  //   recipient[recipient.length] = {
  //     secret,
  //     address: await bfchainCore.accountBaseHelper.getAddressFromSecret(secret),
  //     publicKey: await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(secret),
  //   };
  // }
  await getGiftAssetTransaction(getSenderWithSecondSecret(), [getGenesisAccount()], true);
  await getGiftAssetTransaction(getSenderWithoutSecondSecret(), [getGenesisAccount()]);
})();
