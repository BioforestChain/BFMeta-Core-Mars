import {
  TransferAnyTransaction,
  TransferAnyTransactionFactory,
  RANGE_TYPE,
  Transaction,
  BFChainCore,
  PARENT_ASSET_TYPE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppId,
} from "../include";

async function getTransferAnyTransaction(sender: AccountModel, bfchainCore: BFChainCore) {
  const assetType = "skyrim_dragonborn";

  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.TRANSFER_ANY, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: getGenesisAccount().address,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 770880, // 生成交易时间戳
    fee: "666", // 交易手续费
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
  let trs = await bfchainCore.transaction.createTransaction<TransferAnyTransaction>(
    TransferAnyTransactionFactory,
    data,
    {
      transferAny: {
        sourceChainName: bfchainCore.config.chainName,
        sourceChainMagic: bfchainCore.config.magic,
        parentAssetType: PARENT_ASSET_TYPE.ENTITY,
        assetType,
        amount: "1",
        taxInformation: {
          taxCollector: sender.address,
          taxAssetPrealnum: "1000",
        },
      },
    },
    keypair,
    secondKeypair,
    undefined,
  );
  const trsJson = trs.toJSON();
  const xx = await bfchainCore.transaction.recombineTransaction(trsJson);

  const yy =
    bfchainCore.transactionLogicVerifier.getTransactionLogicVerifierFromType<TransferAnyTransaction>(
      trs.type,
    );

  const result = await yy.checkTrsFeeAndWebFee(trs, trs.getBytes().length);
  if (result.isFeeEnough) {
    const result2 = await yy.checkTrsFeeAndMiningMachineFeeAndWebFee(trs, trs.getBytes().length, {
      numerator: 1000,
      denominator: 1024,
    });
    if (result2.isFeeEnough) {
      console.log(xx.toJSON());
    } else {
      throw new Error(JSON.stringify(result2));
    }
  } else {
    throw new Error(JSON.stringify(result));
  }
}

(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  console.log(
    bfchainCore.jsbiHelper.minusFraction(
      { numerator: "1", denominator: "4" },
      { numerator: "1", denominator: "5" },
    ),
  );
  console.log(
    bfchainCore.jsbiHelper.minusFraction(
      { numerator: "3", denominator: "10" },
      { numerator: "2", denominator: "4" },
    ),
  );
  console.log(
    bfchainCore.jsbiHelper.minusFraction(
      { numerator: "0", denominator: "10" },
      { numerator: "1", denominator: "4" },
    ),
  );

  // await getTransferAnyTransaction(getSenderWithoutSecondSecret(), bfchainCore);
  // await getTransferAnyTransaction(getSenderWithSecondSecret(), bfchainCore);

  // console.log(bfchainCore.config.version);

  // bfchainCore.patchInstaller.changeHeight(50000000);

  // await sleep(1000);

  // console.log(bfchainCore.config.version);
})();
