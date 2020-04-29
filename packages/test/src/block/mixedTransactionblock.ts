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
  DestoryAssetTransaction,
  DestoryAssetTransactionFactory,
  EXCHANGE_DIRECTION,
  BlockBaseStatisticsHelper,
  TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE,
  TransactionAssetChangeModel,
  StatisticsInfo,
  JSBIHelper,
  SPECIAL_ASSET_TYPE,
  ToExchangeSpecialAssetTransaction,
  ToExchangeSpecialAssetTransactionFactory,
  BeExchangeSpecialAssetTransaction,
  BeExchangeSpecialAssetTransactionFactory,
  RANGE_TYPE,
} from "@bfchain/core";
import { QueneEventEmitter, Resolve } from "@bfchain/util";
import { AccountModel, getBfchainCoreEntry } from "../include";

const bfchainCore = getBfchainCoreEntry();

const jsbiHelper = new JSBIHelper();

const statistics = Resolve(BlockBaseStatisticsHelper, bfchainCore.moduleMap);

const genesisSecret = require(require("path").join(process.cwd(), "././assets/secret.json"))
  .genesis as string;
const delegatesSecret = require(require("path").join(process.cwd(), "./assets/secret.json"))
  .delegates as string[];

(async () => {
  async function getTransferAssetTransaction(
    sender: AccountModel,
    recipientId: any,
    sourceChainMagic: string,
    sourceChainName: string,
    assetType: string,
  ) {
    const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const data: BFChainCore.TxBodyJSON = {
      version: 1,
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
      lns: bfchainCore.config.genesisBlock.remark.genesisNodeAddress,
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
      data.senderSecondPublicKey = await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
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

  async function getDestoryAssetTransaction(sender: AccountModel) {
    const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const data: BFChainCore.TxBodyJSON = {
      version: 1,
      type: bfchainCore.transactionHelper.DESTORY_ASSET, // 交易类型
      senderId: sender.address, // 发起者地址
      senderPublicKey: sender.publicKey, // 发起者公钥
      senderSecondPublicKey: "", // 发起者二次公钥
      rangeType: RANGE_TYPE.EMPTY,
      range: [],
      timestamp: 770880, // 生成交易时间戳
      fee: "100", // 交易手续费
      remark: { remark: "body.remark" }, // 交易备注，任意信息
      dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
      lns: bfchainCore.config.genesisBlock.remark.genesisNodeAddress,
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
      data.senderSecondPublicKey = await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
        sender.secret,
        sender.secondSecret,
      );
    }
    const destoryAsset = {
      sourceChainName: "bfchain",
      sourceChainMagic: "5F720C81E82CFC99",
      assetType: "ZEK",
      amount: "1000",
    };
    const trs = await bfchainCore.transaction.createTransaction<DestoryAssetTransaction>(
      DestoryAssetTransactionFactory,
      data,
      {
        destoryAsset,
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
          magic: destoryAsset.sourceChainMagic,
          assetType: destoryAsset.assetType,
          assetNumber: BigInt("-" + destoryAsset.amount),
        },
      ],
    };
  }

  async function getToExchangeAssetTransaction(
    sender: AccountModel,
    recipientId: any,
    toExchangeAsset: any,
  ) {
    const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const data: BFChainCore.TxBodyJSON = {
      version: 1,
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
      lns: bfchainCore.config.genesisBlock.remark.genesisNodeAddress,
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
      data.senderSecondPublicKey = await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
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
  ) {
    const toExchangeAsset = toExchangeAssetTrs.asset.toExchangeAsset;
    const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const data: BFChainCore.TxBodyJSON = {
      version: 1,
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
      lns: bfchainCore.config.genesisBlock.remark.genesisNodeAddress,
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
      data.senderSecondPublicKey = await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
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

  async function getToExchangeSpecialAssetTransaction(sender: AccountModel, recipientId: string) {
    const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const data: BFChainCore.TxBodyJSON = {
      version: 1,
      type: bfchainCore.transactionHelper.TO_EXCHANGE_SPECIAL_ASSET, // 交易类型
      senderId: sender.address, // 发起者地址
      senderPublicKey: sender.publicKey, // 发起者公钥
      senderSecondPublicKey: "", // 发起者二次公钥
      rangeType: RANGE_TYPE.EMPTY,
      range: [],
      timestamp: 770880, // 生成交易时间戳
      fee: "78622", // 交易手续费
      remark: { remark: "body.remark" }, // 交易备注，任意信息
      dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
      lns: bfchainCore.config.genesisBlock.remark.genesisNodeAddress,
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
      data.senderSecondPublicKey = await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
        sender.secret,
        sender.secondSecret,
      );
    }
    const info: BFChainCore.ToExchangeSpecialAssetAssetJSON = {
      toExchangeSpecialAsset: {
        cipherPublicKeys: [],
        toExchangeSource: bfchainCore.config.magic,
        beExchangeSource: bfchainCore.config.magic,
        toExchangeChainName: "bfchain",
        beExchangeChainName: "bfchain",
        toExchangeAsset: "CAPCOM123456789QWQQAQ",
        beExchangeAsset: "BFT",
        exchangeNumber: "1000000",
        exchangeAssetType: SPECIAL_ASSET_TYPE.DAPP_ID,
        exchangeDirection: EXCHANGE_DIRECTION.ASSET_FROM_SENDER,
      },
    };
    const trs = await bfchainCore.transaction.createTransaction<ToExchangeSpecialAssetTransaction>(
      ToExchangeSpecialAssetTransactionFactory,
      data,
      info,
      keypair,
      secondKeypair,
    );

    return trs;
  }

  async function getBeExchangeSpecialAssetTransaction(
    sender: AccountModel,
    toExchangeSpecialAssetTrs: BFChainCore.TransactionMixJSON<
      BFChainCore.ToExchangeSpecialAssetAssetJSON
    >,
  ) {
    const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const data: BFChainCore.TxBodyJSON = {
      version: 1,
      type: bfchainCore.transactionHelper.BE_EXCHANGE_SPECIAL_ASSET, // 交易类型
      senderId: sender.address, // 发起者地址
      senderPublicKey: sender.publicKey, // 发起者公钥
      senderSecondPublicKey: "", // 发起者二次公钥
      recipientId: toExchangeSpecialAssetTrs.senderId,
      rangeType: RANGE_TYPE.EMPTY,
      range: [],
      timestamp: 770880, // 生成交易时间戳
      fee: "78622", // 交易手续费
      remark: { remark: "body.remark" }, // 交易备注，任意信息
      dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
      lns: bfchainCore.config.genesisBlock.remark.genesisNodeAddress,
      sourceIP: "127.0.0.1", // 交易来源 ip
      fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
      toMagic: bfchainCore.config.magic, // 交易去往链的 magic
      applyBlockHeight: 10086, // 交易发起高度
      effectiveBlockHeight: 10100,
      storage: {
        key: "transactionSignature",
        value: toExchangeSpecialAssetTrs.signature,
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
    const info: BFChainCore.BeExchangeSpecialAssetAssetJSON = {
      beExchangeSpecialAsset: {
        transactionSignature: toExchangeSpecialAssetTrs.signature,
        exchangeSpecialAsset: toExchangeSpecialAssetTrs.asset.toExchangeSpecialAsset,
      },
    };
    const trs = await bfchainCore.transaction.createTransaction<BeExchangeSpecialAssetTransaction>(
      BeExchangeSpecialAssetTransactionFactory,
      data,
      info,
      keypair,
      secondKeypair,
    );

    return { trs, applyResult: [] };
  }

  async function getAddressFromSecret(secret: string) {
    return bfchainCore.accountBaseHelper.getAddressFromSecret(secret);
  }

  async function getPublicKeyFromSecret(secret: string) {
    return bfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(secret);
  }

  async function getAccountWithSecret(secret: string) {
    return {
      secret,
      address: await getAddressFromSecret(secret),
      publicKey: await getPublicKeyFromSecret(secret),
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
  async function getTrsInBlock(height: number, statisticsInfo: StatisticsInfo) {
    //#region
    const accountAssetMap = new Map<string, bigint>();
    accountAssetMap.set(
      `${bfchainCore.accountBaseHelper.getAddressFromPublicKeyString(
        bfchainCore.config.genesisBlock.generatorPublicKey,
      )}_${bfchainCore.config.magic}_${bfchainCore.config.assetType}`,
      BigInt(bfchainCore.config.genesisBlock.remark.generateTotalAmount),
    );

    function setAccountAsset(key: string, assetNumber: bigint) {
      const remainAsset = accountAssetMap.get(key);
      if (remainAsset) {
        accountAssetMap.set(key, remainAsset + assetNumber);
      } else {
        accountAssetMap.set(key, assetNumber);
      }
    }

    function getAccountAsset(key: string) {
      const assetNumber = accountAssetMap.get(key);
      return assetNumber ? assetNumber.toString() : "0";
    }

    const assetInBlock: {
      [magicAndAssetType: string]: number;
    } = {};
    const assetIndexInBlock = 0;

    //#endregion
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
    const sender0 = await getAccountWithSecret(delegatesSecret[0]);
    const sender1 = await getAccountWithSecret(delegatesSecret[1]);
    const sender2 = await getAccountWithSecret(delegatesSecret[2]);
    const sender3 = await getAccountWithSecret(delegatesSecret[3]);
    const sender4 = await getAccountWithSecret(delegatesSecret[4]);
    const sender5 = await getAccountWithSecret(delegatesSecret[5]);
    const sender6 = await getAccountWithSecret(delegatesSecret[6]);
    const sender7 = await getAccountWithSecret(delegatesSecret[7]);
    const sender8 = await getAccountWithSecret(delegatesSecret[8]);
    txs[txs.length] = await getTransferAssetTransaction(
      sender2,
      sender3.address,
      "FUCK",
      "fucking",
      "FUCK",
    );
    const recipient: string[] = [];
    txs[txs.length] = await getDestoryAssetTransaction(sender4);
    const toExchangeAsset: BFChainCore.ToExchangeAssetJSON = {
      cipherPublicKeys: [],
      toExchangeSource: "5F720C81E82CFC99",
      beExchangeSource: "RICH",
      toExchangeChainName: "bfchain",
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
    //   toExchangeChainName: "bfchain",
    //   beExchangeChainName: "bfchain",
    //   toExchangeAsset: "BFT",
    //   beExchangeAsset: "BFT",
    //   toExchangeNumber: "1000",
    //   exchangeRate: {
    //     prevWeight: 1,
    //     nextWeight: 100,
    //   },
    // };
    const data = await getToExchangeAssetTransaction(sender6, sender5.address, toExchangeAsset);
    txs[txs.length] = data;
    txs[txs.length] = await getBeExchangeAssetTransaction(sender5, sender6, data.trs);
    //#endregion
    const toExchangeAssetSpecialAssetTrs = await getToExchangeSpecialAssetTransaction(
      sender8,
      sender7.address,
    );
    txs[txs.length] = await getBeExchangeSpecialAssetTransaction(
      sender7,
      toExchangeAssetSpecialAssetTrs,
    );
    const blockTrsItems: TransactionInBlock[] = [];
    for (let i = 0; i < txs.length; i++) {
      const { trs, applyResult } = txs[i];
      const transactionAssetChanges: BFChainCore.TransactionAssetChangeJSON[] = [];
      for (const result of applyResult) {
        const { address, magic, assetType, assetNumber } = result;
        const chainAssetInfo = bfchainCore.chainAssetInfoHelper.getAssetInfo(
          magic.toLowerCase(),
          assetType,
        );
        const assetStatistic = statisticsInfo.initAssetStatistic(chainAssetInfo);
        const key = `${address}_${magic}_${assetType}`;
        setAccountAsset(key, assetNumber);
        if (trs.senderId === address) {
          transactionAssetChanges[
            transactionAssetChanges.length
          ] = TransactionAssetChangeModel.fromObject<TransactionAssetChangeModel>({
            accountType: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE.SENDER,
            assetTypes: assetStatistic.index,
            assetBalance: getAccountAsset(key),
          });
        } else {
          transactionAssetChanges[
            transactionAssetChanges.length
          ] = TransactionAssetChangeModel.fromObject<TransactionAssetChangeModel>({
            accountType: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE.RECIPIENT,
            assetTypes: assetStatistic.index,
            assetBalance: getAccountAsset(key),
          });
        }
      }
      const trsInBlock = TransactionInBlock.fromObject({
        index: i,
        height,
        transactionAssetChanges,
      });
      trsInBlock.transaction = trs;
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
    const eventEmitter: BFChainCore.ApplyTransactionEventEmitter<any> = new QueneEventEmitter<
      any
    >();
    const statisticsInfo = statistics.forceGetStatisticsInfoByBlock(height, "generateBlock");
    statistics.bindApplyTransactionEventEmiter(eventEmitter, statisticsInfo);

    const blockTrsItems = await getTrsInBlock(height, statisticsInfo);

    eventEmitter.on("verifyTransactionProfOfWork", ({ transaction, count }) => {
      return bfchainCore.transactionHelper.checkTransactionProfOfWork(
        transaction.signatureBuffer,
        count,
        "0",
      );
    });
    const commonBlock: BFChainCore.Block = await bfchainCore.block.generateBlock<CommonBlock>(
      CommonBlockFactory,
      {
        version: 1,
        height,
        timestamp: 0,
        generatorPublicKey,
        previousBlockSignature: "6ed38b5fd642f79689ade7cff598bdf9548de56182c85f05b244c66b17a89dc1",
      },
      {
        debug: "debug",
        info: "info",
        blockParticipation: "0",
      },
      (async function* zz() {
        for (const item of blockTrsItems) {
          yield item;
        }
      })(),
      generatorKeypair,
      eventEmitter,
    );
    statisticsInfo.unref("generateBlock");
    return commonBlock;
  }

  //#region 开始测试

  const sender = await getAccountWithSecret(delegatesSecret[9]);
  const commonBlockJSON = (await getCommonBlockAsync(sender)).toJSON();
  const xx = bfchainCore.block.recombineBlock(commonBlockJSON);
  commonBlockJSON.transactions.map(transaction => {
    // console.log(transaction.signature);
    // console.log(transaction.transactionAssetChanges);
  });
  // console.log(commonBlockJSON.statisticInfo.assetStatisticHashMap);
  // console.log(commonBlockJSON.remark);
  //#endregion
})();
