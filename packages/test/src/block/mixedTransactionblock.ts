import {
  CommonBlock,
  CommonBlockFactory,
  TransactionInBlock,
  TransferAssetTransaction,
  TransferAssetTransactionFactory,
  ToExchangeAssetTransaction,
  ToExchangeAssetTransactionFactory,
  BeExchangeAssetTransaction,
  BeExchangeAssetTransactionFactory,
  DestroyAssetTransaction,
  DestroyAssetTransactionFactory,
  BlockBaseStatisticsHelper,
  StatisticsInfo,
  JSBIHelper,
  RANGE_TYPE,
  BFChainCore,
} from "@bfchain/core";
import { QueneEventEmitter, Resolve } from "@bfchain/util";
import { AccountModel, getBfchainCoreEntry } from "../include";

const jsbiHelper = new JSBIHelper();

const genesisSecret = require(require("path").join(process.cwd(), "././assets/secret.json"))
  .genesis as string;
const generatorsSecret = require(require("path").join(process.cwd(), "./assets/secret.json"))
  .genesisGenerators as string[];

(async () => {
  const bfchainCore = await getBfchainCoreEntry();
  const statistics = Resolve(BlockBaseStatisticsHelper, bfchainCore.moduleMap);

  async function getTransferAssetTransaction(
    sender: AccountModel,
    recipientId: any,
    sourceChainMagic: string,
    sourceChainName: string,
    assetType: string,
    bfchainCore: BFChainCore,
  ) {
    const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const data: BFChainCore.TxBodyJSON = {
      version: bfchainCore.config.version,
      type: bfchainCore.transactionHelper.TRANSFER_ASSET, // 交易类型
      senderId: sender.address, // 发起者地址
      senderPublicKey: sender.publicKey, // 发起者公钥
      senderSecondPublicKey: "", // 发起者二次公钥
      recipientId,
      rangeType: RANGE_TYPE.EMPTY,
      range: [], // 接收资产账户地址
      timestamp: 770880, // 生成交易时间戳
      fee: "100", // 交易手续费
      remark: {}, // 交易备注，任意信息
      dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
      lns: bfchainCore.config.genesisLocationName,
      sourceIP: "127.0.0.1", // 交易来源 ip
      fromMagic: "5F720C81E82CFC99", // 交易来源链的 magic
      toMagic: "5F720C81E82CFC99", // 交易去往链的 magic
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
    const transferAsset = {
      sourceChainName,
      sourceChainMagic,
      assetType,
      amount: "1000",
    };
    const trs = await bfchainCore.transaction.createTransaction<TransferAssetTransaction>(
      TransferAssetTransactionFactory,
      data,
      {
        transferAsset,
      },
      keypair,
      secondKeypair,
    );
    return {
      trs,
      applyResult: [
        {
          address: sender.address,
          magic: data.fromMagic,
          assetType: bfchainCore.config.assetType,
          assetNumber: BigInt("-" + data.fee),
        },
        {
          address: sender.address,
          magic: sourceChainMagic,
          assetType,
          assetNumber: BigInt("-" + transferAsset.amount),
        },
        {
          address: recipientId,
          magic: sourceChainMagic,
          assetType,
          assetNumber: BigInt(transferAsset.amount),
        },
      ],
    };
  }

  async function getDestroyAssetTransaction(sender: AccountModel, bfchainCore: BFChainCore) {
    const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const data: BFChainCore.TxBodyJSON = {
      version: bfchainCore.config.version,
      type: bfchainCore.transactionHelper.DESTROY_ASSET, // 交易类型
      senderId: sender.address, // 发起者地址
      senderPublicKey: sender.publicKey, // 发起者公钥
      senderSecondPublicKey: "", // 发起者二次公钥
      rangeType: RANGE_TYPE.EMPTY,
      range: [],
      timestamp: 770880, // 生成交易时间戳
      fee: "100", // 交易手续费
      remark: { remark: "body.remark" }, // 交易备注，任意信息
      dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
      lns: bfchainCore.config.genesisLocationName,
      sourceIP: "127.0.0.1", // 交易来源 ip
      fromMagic: "5F720C81E82CFC99", // 交易来源链的 magic
      toMagic: "5F720C81E82CFC99", // 交易去往链的 magic
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
      data.senderSecondPublicKey =
        await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
          sender.secret,
          sender.secondSecret,
        );
    }
    const destroyAsset = {
      sourceChainName: bfchainCore.config.chainName,
      sourceChainMagic: "5F720C81E82CFC99",
      assetType: "ZEK",
      amount: "1000",
    };
    const trs = await bfchainCore.transaction.createTransaction<DestroyAssetTransaction>(
      DestroyAssetTransactionFactory,
      data,
      {
        destroyAsset,
      },
      keypair,
      secondKeypair,
    );
    return {
      trs,
      applyResult: [
        {
          address: sender.address,
          magic: trs.fromMagic,
          assetType: bfchainCore.config.assetType,
          assetNumber: BigInt("-" + data.fee),
        },
        {
          address: sender.address,
          magic: destroyAsset.sourceChainMagic,
          assetType: destroyAsset.assetType,
          assetNumber: BigInt("-" + destroyAsset.amount),
        },
      ],
    };
  }

  async function getToExchangeAssetTransaction(
    sender: AccountModel,
    recipientId: any,
    toExchangeAsset: any,
    bfchainCore: BFChainCore,
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
      fee: "100", // 交易手续费
      remark: { remark: "body.remark" }, // 交易备注，任意信息
      dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
      lns: bfchainCore.config.genesisLocationName,
      sourceIP: "127.0.0.1", // 交易来源 ip
      fromMagic: "5F720C81E82CFC99", // 交易来源链的 magic
      toMagic: "5F720C81E82CFC99", // 交易去往链的 magic
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
    const info = {
      toExchangeAsset,
    };
    const trs = await bfchainCore.transaction.createTransaction<ToExchangeAssetTransaction>(
      ToExchangeAssetTransactionFactory,
      data,
      info,
      keypair,
      secondKeypair,
    );
    return {
      trs,
      applyResult: [
        {
          address: toExchangeAsset.senderId,
          magic: data.fromMagic,
          assetType: bfchainCore.config.assetType,
          assetNumber: BigInt("-" + data.fee),
        },
        {
          address: toExchangeAsset.senderId,
          magic: toExchangeAsset.toExchangeSource,
          assetType: toExchangeAsset.toExchangeAsset,
          assetNumber: BigInt("-" + toExchangeAsset.toExchangeNumber),
        },
      ],
    };
  }

  async function getBeExchangeAssetTransaction(
    sender: AccountModel,
    recipient: any,
    toExchangeAssetTrs: ToExchangeAssetTransaction,
    bfchainCore: BFChainCore,
  ) {
    const toExchangeAsset = toExchangeAssetTrs.asset.toExchangeAsset;
    const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const data: BFChainCore.TxBodyJSON = {
      version: bfchainCore.config.version,
      type: bfchainCore.transactionHelper.BE_EXCHANGE_ASSET, // 交易类型
      senderId: sender.address, // 发起者地址
      senderPublicKey: sender.publicKey, // 发起者公钥
      senderSecondPublicKey: "", // 发起者二次公钥
      recipientId: toExchangeAssetTrs.senderId,
      rangeType: RANGE_TYPE.EMPTY,
      range: [],
      timestamp: 770880, // 生成交易时间戳
      fee: "100", // 交易手续费
      remark: { remark: "body.remark" }, // 交易备注，任意信息
      dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
      lns: bfchainCore.config.genesisLocationName,
      sourceIP: "127.0.0.1", // 交易来源 ip
      fromMagic: "5F720C81E82CFC99", // 交易来源链的 magic
      toMagic: "5F720C81E82CFC99", // 交易去往链的 magic
      applyBlockHeight: 10086, // 交易发起高度
      effectiveBlockHeight: 10100,
      storage: {
        key: "transactionSignature",
        value: toExchangeAssetTrs.signature,
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
    const exchangeRate = toExchangeAsset.exchangeRate;
    const trs = await bfchainCore.transaction.createTransaction<BeExchangeAssetTransaction>(
      BeExchangeAssetTransactionFactory,
      data,
      {
        beExchangeAsset: {
          transactionSignature: toExchangeAssetTrs.signature,
          toExchangeNumber: jsbiHelper
            .multiplyRoundFraction("50", {
              numerator: exchangeRate.nextWeight,
              denominator: exchangeRate.prevWeight,
            })
            .toString(),
          beExchangeNumber: "50",
          exchangeAsset: toExchangeAsset,
        },
      },
      keypair,
      secondKeypair,
    );
    return {
      trs,
      applyResult: [
        {
          address: toExchangeAssetTrs.senderId,
          magic: data.fromMagic,
          assetType: bfchainCore.config.assetType,
          assetNumber: BigInt("-" + data.fee),
        },
        {
          address: toExchangeAssetTrs.senderId,
          magic: toExchangeAsset.toExchangeSource,
          assetType: toExchangeAsset.toExchangeAsset,
          assetNumber: BigInt("-" + toExchangeAsset.toExchangeNumber),
        },
        {
          address: trs.senderId,
          magic: toExchangeAsset.toExchangeSource,
          assetType: toExchangeAsset.toExchangeAsset,
          assetNumber: BigInt(toExchangeAsset.toExchangeNumber),
        },
      ],
    };
  }

  async function getAddressFromSecret(secret: string, bfchainCore: BFChainCore) {
    return bfchainCore.accountBaseHelper.getAddressFromSecret(secret);
  }

  async function getPublicKeyFromSecret(secret: string, bfchainCore: BFChainCore) {
    return bfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(secret);
  }

  async function getAccountWithSecret(secret: string, bfchainCore: BFChainCore) {
    return {
      secret,
      address: await getAddressFromSecret(secret, bfchainCore),
      publicKey: await getPublicKeyFromSecret(secret, bfchainCore),
    };
  }
  const genesisAccountKeypair = await bfchainCore.accountBaseHelper.createSecretKeypair(
    genesisSecret,
  );
  const genesisAccountInfo = {
    address: bfchainCore.accountBaseHelper.getAddressFromPublicKey(genesisAccountKeypair.publicKey),
    publicKey: genesisAccountKeypair.publicKey.toString("hex"),
    publicKeyBuffer: genesisAccountKeypair.publicKey,
  };
  async function getTrsInBlock(
    height: number,
    statisticsInfo: StatisticsInfo,
    bfchainCore: BFChainCore,
  ) {
    //#region
    const txs: {
      trs: BFChainCore.Transaction<any>;
      applyResult: {
        address: string;
        magic: string;
        assetType: string;
        assetNumber: bigint;
      }[];
    }[] = [];
    const sender0 = await getAccountWithSecret(generatorsSecret[0], bfchainCore);
    const sender1 = await getAccountWithSecret(generatorsSecret[1], bfchainCore);
    const sender2 = await getAccountWithSecret(generatorsSecret[2], bfchainCore);
    const sender3 = await getAccountWithSecret(generatorsSecret[3], bfchainCore);
    const sender4 = await getAccountWithSecret(generatorsSecret[4], bfchainCore);
    const sender5 = await getAccountWithSecret(generatorsSecret[5], bfchainCore);
    const sender6 = await getAccountWithSecret(generatorsSecret[6], bfchainCore);
    const sender7 = await getAccountWithSecret(generatorsSecret[7], bfchainCore);
    const sender8 = await getAccountWithSecret(generatorsSecret[8], bfchainCore);
    txs[txs.length] = await getTransferAssetTransaction(
      sender2,
      sender3.address,
      "FUCK",
      "fucking",
      "FUCK",
      bfchainCore,
    );
    const recipient: string[] = [];
    txs[txs.length] = await getDestroyAssetTransaction(sender4, bfchainCore);
    const toExchangeAsset: BFChainCore.ToExchangeAssetJSON = {
      cipherPublicKeys: [],
      toExchangeSource: "5F720C81E82CFC99",
      beExchangeSource: "RICH",
      toExchangeChainName: bfchainCore.config.chainName,
      beExchangeChainName: "fucking",
      toExchangeAsset: "BFT",
      beExchangeAsset: "FUCK",
      toExchangeNumber: "1000",
      exchangeRate: {
        prevWeight: "2",
        nextWeight: "3",
      },
    };
    // const toExchangeAsset: BFChainCore.ToExchangeAssetJSON = {
    //   senderId: sender6.address,
    //   recipient,
    //   toExchangeSource: "5F720C81E82CFC99",
    //   beExchangeSource: "5F720C81E82CFC99",
    //   toExchangeChainName: bfchainCore.config.chainName,
    //   beExchangeChainName: bfchainCore.config.chainName,
    //   toExchangeAsset: "BFT",
    //   beExchangeAsset: "BFT",
    //   toExchangeNumber: "1000",
    //   exchangeRate: {
    //     prevWeight: 1,
    //     nextWeight: 100,
    //   },
    // };
    const data = await getToExchangeAssetTransaction(
      sender6,
      sender5.address,
      toExchangeAsset,
      bfchainCore,
    );
    txs[txs.length] = data;
    txs[txs.length] = await getBeExchangeAssetTransaction(sender5, sender6, data.trs, bfchainCore);
    //#endregion
    const blockTrsItems: TransactionInBlock[] = [];
    for (let i = 0; i < txs.length; i++) {
      const { trs, applyResult } = txs[i];
      const trsInBlock = TransactionInBlock.fromObject({
        tIndex: i,
        height,
        transaction: trs,
      });
      blockTrsItems[blockTrsItems.length] = trsInBlock;
    }
    return blockTrsItems;
  }

  async function getCommonBlockAsync(sender: AccountModel) {
    const height = 2;
    const generatorPublicKey = await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(
      sender.secret,
    );
    const generatorKeypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const eventEmitter: BFChainCore.ApplyTransactionEventEmitter<any> =
      new QueneEventEmitter<any>();
    const taskname = (eventEmitter.taskname = `test-generateBlock-${height}`);
    const statisticsInfo = statistics.forceGetStatisticsInfoByBlock(taskname, "generateBlock");
    statistics.bindApplyTransactionEventEmiter(eventEmitter, statisticsInfo);

    const blockTrsItems = await getTrsInBlock(height, statisticsInfo, bfchainCore);

    const commonBlock: BFChainCore.Block = await bfchainCore.block.generateBlock<CommonBlock>(
      CommonBlockFactory,
      {
        version: bfchainCore.config.version,
        height,
        timestamp: 0,
        generatorPublicKey,
        previousBlockSignature: "6ed38b5fd642f79689ade7cff598bdf9548de56182c85f05b244c66b17a89dc1",
      },
      {
        commonAsset: {
          assetChangeHash: "",
        },
      },
      (async function* zz() {
        for (const item of blockTrsItems) {
          yield item;
        }
      })(),
      generatorKeypair,
      undefined,
      eventEmitter,
    );
    statisticsInfo.unref("generateBlock");
    return commonBlock;
  }

  //#region 开始测试

  const sender = await getAccountWithSecret(generatorsSecret[9], bfchainCore);
  const commonBlockJSON = (await getCommonBlockAsync(sender)).toJSON();
  const xx = bfchainCore.block.recombineBlock(commonBlockJSON);
  commonBlockJSON.transactionInfo.transactionInBlocks.map((transaction) => {
    // console.log(transaction.signature);
  });
  // console.log(commonBlockJSON.statisticInfo.assetStatisticHashMap);
  // console.log(commonBlockJSON.remark);
  //#endregion
})();
