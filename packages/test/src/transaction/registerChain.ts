import {
  RegisterChainTransaction,
  RegisterChainTransactionFactory,
  TransactionInBlock,
  UsernameTransaction,
  UsernameTransactionFactory,
  DelegateTransactionFactory,
  GenesisBlockFactory,
  GenesisBlock,
  AcceptVoteTransaction,
  AcceptVoteTransactionFactory,
  Transaction,
  BFChainCore,
  BlockBaseStatisticsHelper,
  TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE,
  CommonBlock,
  CommonBlockFactory,
  TransferAssetTransaction,
  TransferAssetTransactionFactory,
  IssueEntityTransaction,
  DestoryEntityTransaction,
  RANGE_TYPE,
  RECORD_OPERATION_TYPE,
  LocationNameTransactionFactory,
  SetLnsRecordValueTransactionFactory,
  LOCATION_NAME_OPERATION_TYPE,
  DelegateTransaction,
  LocationNameTransaction,
  SetLnsRecordValueTransaction,
  BFChainCoreFactory,
  ConfigHelper,
} from "@bfchain/core";
import { QueneEventEmitter, Resolve } from "@bfchain/util";
import * as path from "path";
import {
  getSenderWithoutSecondSecret,
  getFullBfchainCoreEntry,
  AccountModel,
  config,
  registerchainAssetData,
  getIps,
  NodeJsCryptoHelper,
  NodeJsKeypairHelper,
  ed2curveHelper,
  getRandomMagic,
  getRandomDAppid,
} from "../include";

const defaultIpsPath = path.join(process.cwd(), "./assets/defaultIps.json");

const fullBfchainCore = getFullBfchainCoreEntry(57, 128);
const randomMagic = false;

if (randomMagic) {
  registerchainAssetData.magic = getRandomMagic();
}

registerchainAssetData.maxVotesPerBlock =
  registerchainAssetData.maxTPSPerBlock * registerchainAssetData.forgeInterval;

const registerBfchainCore = BFChainCoreFactory({
  config: new ConfigHelper(
    GenesisBlock.fromObject({ version: 1, asset: { genesisAsset: registerchainAssetData } }),
    "genesisBlock",
  ),
  Buffer: Buffer as any,
  cryptoHelper: NodeJsCryptoHelper,
  keypairHelper: NodeJsKeypairHelper,
  ed2curveHelper,
});

const registerStatistics = Resolve(BlockBaseStatisticsHelper, registerBfchainCore.moduleMap);
const statistics = Resolve(BlockBaseStatisticsHelper, fullBfchainCore.moduleMap);

type DelegateInfo = {
  address: string;
  secret: string;
  publicKey: string;
  username: string;
  secondSecret?: string;
};

const _powCount: { [add: string]: number } = {};
function getPOWInfo<T extends Transaction>(address: string) {
  const count = _powCount[address] || 0;
  _powCount[address] = count + 1;
  const res: BFChainCore.TransactionPoWOptions<T> = {
    // accountNumberOfTransactionInBlock: count,
    // accountParticipation: "0",
    count,
    participation: "0",
  };
  return res;
}

const _txs: { [address: string]: number } = {};
const getTxs = (address: string) => {
  const count = _txs[address] || 0;
  _txs[address] = count + 1;
  return _txs[address];
};

(async () => {
  async function getUsernameTransaction(sender: DelegateInfo) {
    const keypair = await registerBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const secondKeypair =
      (sender.secondSecret &&
        (await registerBfchainCore.accountBaseHelper.createSecondSecretKeypair(
          sender.secret,
          sender.secondSecret,
        ))) ||
      undefined;
    const pow =
      1 > registerBfchainCore.config.tpowOfWorkExemptionBlocks
        ? getPOWInfo<UsernameTransaction>(sender.address)
        : undefined;
    const createTrs = (fee = "1") => {
      return registerBfchainCore.transaction.createTransaction<UsernameTransaction>(
        UsernameTransactionFactory,
        {
          version: registerBfchainCore.config.version,
          type: registerBfchainCore.transactionHelper.USERNAME, // 交易类型
          senderId: sender.address, // 发起者地址
          senderPublicKey: sender.publicKey, // 发起者公钥
          senderSecondPublicKey: secondKeypair && secondKeypair.publicKey.toString("hex"), // 发起者二次公钥
          rangeType: RANGE_TYPE.EMPTY,
          range: [],
          timestamp: 0, // 生成交易时间戳
          fee, // 交易手续费
          fromMagic: registerBfchainCore.config.magic, // 交易来源链的 magic
          toMagic: registerBfchainCore.config.magic, // 交易去往链的 magic
          applyBlockHeight: 1, // 交易发起高度
          effectiveBlockHeight: 1,
          remark: { remark: "交易备注，任意信息，这个是设置用户名交易" }, // 交易备注，任意信息
          storage: {
            key: "alias",
            value: sender.username,
          },
        },
        {
          username: {
            alias: sender.username,
          },
        },
        keypair,
        secondKeypair,
      );
    };
    let trs = await createTrs();
    if (pow) {
      trs = await registerBfchainCore.transaction.transactionPowCalculator(
        trs,
        pow,
        keypair,
        secondKeypair,
      );
    }
    trs = await createTrs(
      registerBfchainCore.transactionHelper.calcTransactionFee(
        trs,
        registerBfchainCore.config.minTransactionFeePerByte,
      ),
    );
    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }

  async function getDelegateTransaction(sender: DelegateInfo) {
    const keypair = await registerBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const secondKeypair =
      (sender.secondSecret &&
        (await registerBfchainCore.accountBaseHelper.createSecondSecretKeypair(
          sender.secret,
          sender.secondSecret,
        ))) ||
      undefined;
    const pow =
      1 > registerBfchainCore.config.tpowOfWorkExemptionBlocks
        ? getPOWInfo<DelegateTransaction>(sender.address)
        : undefined;
    const createTrs = (fee = "1") => {
      return registerBfchainCore.transaction.createTransaction(
        DelegateTransactionFactory,
        {
          version: registerBfchainCore.config.version,
          type: registerBfchainCore.transactionHelper.DELEGATE, // 交易类型
          senderId: sender.address, // 发起者地址
          senderPublicKey: sender.publicKey, // 发起者公钥
          senderSecondPublicKey: secondKeypair && secondKeypair.publicKey.toString("hex"), // 发起者二次公钥
          rangeType: RANGE_TYPE.EMPTY,
          range: [],
          timestamp: 0, // 生成交易时间戳
          fee, // 交易手续费
          fromMagic: registerBfchainCore.config.magic, // 交易来源链的 magic
          toMagic: registerBfchainCore.config.magic, // 交易去往链的 magic
          applyBlockHeight: 1, // 交易发起高度
          effectiveBlockHeight: 1,
          remark: { remark: "交易备注，任意信息，这个是注册受托人交易" }, // 交易备注，任意信息
        },
        {},
        keypair,
        secondKeypair,
      );
    };
    let trs = await createTrs();
    if (pow) {
      trs = await registerBfchainCore.transaction.transactionPowCalculator(
        trs,
        pow,
        keypair,
        secondKeypair,
      );
    }
    trs = await createTrs(
      registerBfchainCore.transactionHelper.calcTransactionFee(
        trs,
        registerBfchainCore.config.minTransactionFeePerByte,
      ),
    );
    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }

  async function getAcceptVoteTransaction(sender: DelegateInfo) {
    const keypair = await registerBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const secondKeypair =
      (sender.secondSecret &&
        (await registerBfchainCore.accountBaseHelper.createSecondSecretKeypair(
          sender.secret,
          sender.secondSecret,
        ))) ||
      undefined;
    const pow =
      1 > registerBfchainCore.config.tpowOfWorkExemptionBlocks
        ? getPOWInfo<AcceptVoteTransaction>(sender.address)
        : undefined;
    const createTrs = (fee = "1") => {
      return registerBfchainCore.transaction.createTransaction<AcceptVoteTransaction>(
        AcceptVoteTransactionFactory,
        {
          version: registerBfchainCore.config.version,
          type: registerBfchainCore.transactionHelper.ACCEPT_VOTE, // 交易类型
          senderId: sender.address, // 发起者地址
          senderPublicKey: sender.publicKey, // 发起者公钥
          senderSecondPublicKey: secondKeypair && secondKeypair.publicKey.toString("hex"), // 发起者二次公钥
          rangeType: RANGE_TYPE.EMPTY,
          range: [],
          timestamp: 0, // 生成交易时间戳
          fee, // 交易手续费
          remark: { remark: "交易备注，任意信息，这个是接收投票交易" }, // 交易备注，任意信息
          fromMagic: registerBfchainCore.config.magic, // 交易来源链的 magic
          toMagic: registerBfchainCore.config.magic, // 交易去往链的 magic
          applyBlockHeight: 1, // 交易发起高度
          effectiveBlockHeight: 1,
        },
        {},
        keypair,
        secondKeypair,
      );
    };
    let trs = await createTrs();
    if (pow) {
      trs = await registerBfchainCore.transaction.transactionPowCalculator(
        trs,
        pow,
        keypair,
        secondKeypair,
      );
    }
    trs = await createTrs(
      registerBfchainCore.transactionHelper.calcTransactionFee(
        trs,
        registerBfchainCore.config.minTransactionFeePerByte,
      ),
    );
    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }

  async function getLocationNameTransaction() {
    const pow =
      1 > registerBfchainCore.config.tpowOfWorkExemptionBlocks
        ? getPOWInfo<LocationNameTransaction>(genesisAccountInfo.address)
        : undefined;
    const createTrs = (fee = "AUTO") => {
      return registerBfchainCore.transaction.createTransaction(
        LocationNameTransactionFactory,
        {
          version: registerBfchainCore.config.version,
          type: registerBfchainCore.transactionHelper.LOCATION_NAME, // 交易类型
          senderId: genesisAccountInfo.address, // 发起者地址
          senderPublicKey: genesisAccountInfo.publicKey, // 发起者公钥
          recipientId: genesisAccountInfo.address,
          rangeType: RANGE_TYPE.EMPTY,
          range: [], // 接收范围
          timestamp: 0, // 生成交易时间戳
          fee: fee === "AUTO" ? "1" : fee, // 交易手续费
          fromMagic: registerBfchainCore.config.magic, // 交易来源链的 magic
          toMagic: registerBfchainCore.config.magic, // 交易去往链的 magic
          applyBlockHeight: 1, // 交易发起高度
          effectiveBlockHeight: 1,
          remark: {},
          storage: {
            key: "name",
            value: registerBfchainCore.config.genesisLocationName,
          },
        },
        {
          locationName: {
            sourceChainName: registerBfchainCore.config.chainName,
            sourceChainMagic: registerBfchainCore.config.magic,
            name: registerBfchainCore.config.genesisLocationName,
            operationType: LOCATION_NAME_OPERATION_TYPE.REGISTRATION,
          },
        },
        genesisAccountKeypair,
        undefined,
        undefined,
        // fee === "AUTO" ? undefined : getPOWInfo(genesisAccountInfo.address),
      );
    };
    let trs = await createTrs();
    if (pow) {
      trs = await registerBfchainCore.transaction.transactionPowCalculator(
        trs,
        pow,
        genesisAccountKeypair,
        undefined,
      );
    }
    trs = await createTrs(
      registerBfchainCore.transactionHelper.calcTransactionFee(
        trs,
        registerBfchainCore.config.minTransactionFeePerByte,
      ),
    );
    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }

  async function getSetLnsRecordValueTransaction(
    sender: DelegateInfo,
    record: BFChainCore.LocationNameRecordJSON,
  ) {
    const keypair = await registerBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const secondKeypair =
      (sender.secondSecret &&
        (await registerBfchainCore.accountBaseHelper.createSecondSecretKeypair(
          sender.secret,
          sender.secondSecret,
        ))) ||
      undefined;
    const pow =
      1 > registerBfchainCore.config.tpowOfWorkExemptionBlocks
        ? getPOWInfo<SetLnsRecordValueTransaction>(sender.address)
        : undefined;
    const createTrs = (fee = "AUTO") => {
      return registerBfchainCore.transaction.createTransaction(
        SetLnsRecordValueTransactionFactory,
        {
          version: registerBfchainCore.config.version,
          type: registerBfchainCore.transactionHelper.SET_LNS_RECORD_VALUE, // 交易类型
          senderId: sender.address, // 发起者地址
          senderPublicKey: sender.publicKey, // 发起者公钥
          rangeType: RANGE_TYPE.EMPTY,
          range: [], // 接收范围
          timestamp: 0, // 生成交易时间戳
          fee: fee === "AUTO" ? "1" : fee, // 交易手续费
          fromMagic: registerBfchainCore.config.magic, // 交易来源链的 magic
          toMagic: registerBfchainCore.config.magic, // 交易去往链的 magic
          applyBlockHeight: 1, // 交易发起高度
          effectiveBlockHeight: 1,
          remark: {},
          storage: {
            key: "name",
            value: registerBfchainCore.config.genesisLocationName,
          },
        },
        {
          lnsRecordValue: {
            sourceChainName: registerBfchainCore.config.chainName,
            sourceChainMagic: registerBfchainCore.config.magic,
            name: registerBfchainCore.config.genesisLocationName,
            operationType: RECORD_OPERATION_TYPE.ADD,
            addRecord: record,
          },
        },
        keypair,
        secondKeypair,
        undefined,
        // fee === "AUTO" ? undefined : getPOWInfo(genesisAccountInfo.address),
      );
    };
    let trs = await createTrs();
    if (pow) {
      trs = await registerBfchainCore.transaction.transactionPowCalculator(
        trs,
        pow,
        keypair,
        secondKeypair,
      );
    }
    trs = await createTrs(
      registerBfchainCore.transactionHelper.calcTransactionFee(
        trs,
        registerBfchainCore.config.minTransactionFeePerByte,
      ),
    );
    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }

  const genesisAccountKeypair = await registerBfchainCore.accountBaseHelper.createSecretKeypair(
    config.genesisSecret,
  );
  const genesisAccountInfo = {
    address: await registerBfchainCore.accountBaseHelper.getAddressFromPublicKey(
      genesisAccountKeypair.publicKey,
    ),
    publicKey: genesisAccountKeypair.publicKey.toString("hex"),
    publicKeyBuffer: genesisAccountKeypair.publicKey,
  };
  async function getTransferAssetTransaction(
    bfchainCore: BFChainCore,
    recipient: DelegateInfo,
    amount: string,
  ) {
    const pow =
      1 > registerBfchainCore.config.tpowOfWorkExemptionBlocks
        ? getPOWInfo<TransferAssetTransaction>(genesisAccountInfo.address)
        : undefined;
    const createTrs = (fee = "1") => {
      return bfchainCore.transaction.createTransaction(
        TransferAssetTransactionFactory,
        {
          version: bfchainCore.config.version,
          type: bfchainCore.transactionHelper.TRANSFER_ASSET, // 交易类型
          senderId: genesisAccountInfo.address, // 发起者地址
          senderPublicKey: genesisAccountInfo.publicKey, // 发起者公钥
          recipientId: recipient.address,
          rangeType: RANGE_TYPE.EMPTY,
          range: [], // 接收账户地址
          timestamp: 0, // 生成交易时间戳
          fee, // 交易手续费
          fromMagic: registerBfchainCore.config.magic, // 交易来源链的 magic
          toMagic: registerBfchainCore.config.magic, // 交易去往链的 magic
          applyBlockHeight: 1, // 交易发起高度
          effectiveBlockHeight: 1,
          remark: { remark: "交易备注，任意信息，这个是转账交易" }, // 交易备注，任意信息
          storage: {
            key: "assetType",
            value: registerBfchainCore.config.assetType,
          },
        },
        {
          transferAsset: {
            sourceChainName: registerBfchainCore.config.chainName,
            sourceChainMagic: registerBfchainCore.config.magic,
            assetType: registerBfchainCore.config.assetType,
            amount,
          },
        },
        genesisAccountKeypair,
      );
    };
    let trs = await createTrs();
    if (pow) {
      trs = await registerBfchainCore.transaction.transactionPowCalculator(
        trs,
        pow,
        genesisAccountKeypair,
        undefined,
      );
    }
    trs = await createTrs(
      registerBfchainCore.transactionHelper.calcTransactionFee(
        trs,
        registerBfchainCore.config.minTransactionFeePerByte,
      ),
    );
    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }

  async function getGenesisBlockAsync() {
    const generatorPublicKey =
      await registerBfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(
        config.genesisSecret,
      );
    //#region 模拟账户表的变更
    const registerChainAccountAssetMap = new Map<string, bigint>();
    registerChainAccountAssetMap.set(
      `${genesisAccountInfo.address}_${registerBfchainCore.config.magic}_${registerBfchainCore.config.assetType}`,
      BigInt(registerBfchainCore.config.genesisAmount),
    );

    function getRegisterChainAccountAssetKey(address: string, magic: string, assetType: string) {
      return `${address}_${magic}_${assetType}`;
    }

    function setRegisterChainAccountAsset(key: string, assetNumber: bigint) {
      const remainAsset = registerChainAccountAssetMap.get(key);
      if (remainAsset) {
        registerChainAccountAssetMap.set(key, remainAsset + assetNumber);
      } else {
        registerChainAccountAssetMap.set(key, assetNumber);
      }
    }

    function getAccountAsset(key: string) {
      const assetNumber = registerChainAccountAssetMap.get(key);
      return assetNumber ? assetNumber.toString() : "0";
    }
    //#endregion
    const txWithIndexList: { index: number; trs: Transaction }[] = [];
    txWithIndexList.push(await getLocationNameTransaction());
    const delegatesSecret = config.delegatesSecret;
    const ips = getIps(delegatesSecret.length, false, defaultIpsPath);
    for (let i = 0; i < delegatesSecret.slice(5).length; i++) {
      const secret = delegatesSecret[i];
      const address = await registerBfchainCore.accountBaseHelper.getAddressFromSecret(secret);

      registerchainAssetData.newDelegates.push(address);
      if (
        registerchainAssetData.nextRoundDelegates.length < registerBfchainCore.config.blockPerRound
      ) {
        registerchainAssetData.nextRoundDelegates.push({
          address,
          equity: "0",
        });
      }
      const publicKey = await registerBfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(
        secret,
      );
      const delegate: DelegateInfo = {
        secret,
        address,
        publicKey,
        username: `${registerBfchainCore.config.chainName}${i + 1}`,
      };
      // 要在创始块中实施的交易
      const tempTrsWithIndexList = [
        await getUsernameTransaction(delegate),
        await getDelegateTransaction(delegate),
        await getAcceptVoteTransaction(delegate),
        // await getSetLnsRecordValueTransaction(delegate, {
        //   recordType: RECORD_TYPE.IPV4,
        //   recordValue: ips[i],
        // }),
      ];
      // 实施这些交易需要的手续费由创始账户给予
      const total_fee = tempTrsWithIndexList.reduce(
        (acc_fee, twi) => (BigInt(twi.trs.fee) + BigInt(acc_fee)).toString(),
        "0",
      );
      if (total_fee !== "0") {
        txWithIndexList.push(
          await getTransferAssetTransaction(registerBfchainCore, delegate, total_fee),
        );
      }
      txWithIndexList.push(...tempTrsWithIndexList);
    }

    const height = 1;
    const blockTrsItems: TransactionInBlock[] = [];
    const eventEmitter: BFChainCore.ApplyTransactionEventEmitter<any> =
      new QueneEventEmitter<any>();
    const taskname = (eventEmitter.taskname = `test-registerChainGenesisBlock-${height}`);
    const statisticsInfo = registerStatistics.forceGetStatisticsInfoByBlock(
      taskname,
      "generateRegisterChainGenesisBlock",
    );
    registerStatistics.bindApplyTransactionEventEmiter(eventEmitter, statisticsInfo);
    const transactionHelper = registerBfchainCore.transactionHelper;
    for (let i = 0; i < txWithIndexList.length; i++) {
      const { index, trs } = txWithIndexList[i];
      const { senderId, recipientId, fee, fromMagic, type } = trs;
      const assetType = registerBfchainCore.config.assetType;
      let amount = "0";
      if (type === registerBfchainCore.transactionHelper.TRANSFER_ASSET) {
        amount = (trs as TransferAssetTransaction).asset.transferAsset.amount;
      }
      const chainAssetInfo = registerBfchainCore.chainAssetInfoHelper.getAssetInfo(
        fromMagic,
        assetType,
      );
      statisticsInfo.initAssetStatistic(chainAssetInfo, statisticsInfo.assetStatisticCount);
      const assetChanges: {
        accountType: number;
        magic: string;
        assetType: string;
        assetNumber: string;
      }[] = [];
      const key = getRegisterChainAccountAssetKey(senderId, fromMagic, assetType);
      const totalSpend = BigInt("-" + amount) + BigInt("-" + fee);
      setRegisterChainAccountAsset(key, totalSpend);
      assetChanges[assetChanges.length] = {
        accountType: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE.SENDER,
        magic: fromMagic,
        assetType,
        assetNumber: getAccountAsset(key),
      };
      if (recipientId) {
        const rkey = getRegisterChainAccountAssetKey(recipientId, fromMagic, assetType);
        setRegisterChainAccountAsset(rkey, BigInt(amount));
        assetChanges[assetChanges.length] = {
          accountType: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE.RECIPIENT,
          magic: fromMagic,
          assetType,
          assetNumber: getAccountAsset(rkey),
        };
      }
      const transactionAssetChanges: BFChainCore.TransactionAssetChangeJSON[] = [];
      for (const assetChange of assetChanges) {
        const { accountType, assetNumber } = assetChange;
        const asset = statisticsInfo.getAssetStatistic(chainAssetInfo);
        if (!asset) {
          throw new Error("Statistic asset lose");
        }
        transactionAssetChanges[transactionAssetChanges.length] = {
          accountType,
          assetTypes: asset.index,
          assetBalance: assetNumber,
        };
      }
      const trsInBlock = TransactionInBlock.fromObject({
        index: i,
        height,
        numberOfSenderTransactions: index,
        transactionAssetChanges,
        transaction: trs,
      });
      blockTrsItems[blockTrsItems.length] = trsInBlock;
    }
    const generatorKeypair = await registerBfchainCore.accountBaseHelper.createSecretKeypair(
      config.genesisSecret,
    );
    eventEmitter.on("verifyTransactionProfOfWork", ({ transaction, count }) => {
      return registerBfchainCore.transactionHelper.checkTransactionProfOfWork(
        // transaction.signatureBuffer,
        // {
        //   accountParticipation: "0",
        //   accountNumberOfTransactionInBlock: count,
        // },
        transaction.signatureBuffer,
        count,
        "0",
      );
    });
    const genesisBlock = await registerBfchainCore.block.generateBlock<GenesisBlock>(
      GenesisBlockFactory,
      {
        version: registerBfchainCore.config.version,
        height: 1,
        timestamp: 0,
        generatorPublicKey,
        generatorEquity: "0",
        previousBlockSignature: "",
        remark: {
          QWQ: "人定胜天",
        },
      },
      {
        genesisAsset: registerchainAssetData,
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
    statisticsInfo.unref("generateRegisterChainGenesisBlock");

    const out = require("optimist").argv.out;
    if (out) {
      const { resolve } = require("path");
      const outFilePath =
        out === true
          ? resolve(process.cwd(), "./assets/registerGenesisBlock.json")
          : resolve(process.cwd(), out);
      require("fs").writeFileSync(outFilePath, JSON.stringify(genesisBlock.toJSON(), null, 2));
      console.log(`Genesis block save to: ${outFilePath}`);
    }

    return genesisBlock;
  }

  async function getRegisterChainTransaction(sender: AccountModel) {
    const keypair = await fullBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const data: BFChainCore.TxBodyJSON = {
      version: fullBfchainCore.config.version,
      type: fullBfchainCore.transactionHelper.REGISTER_CHAIN, // 交易类型
      senderId: sender.address, // 发起者地址
      senderPublicKey: sender.publicKey, // 发起者公钥
      senderSecondPublicKey: "", // 发起者二次公钥
      rangeType: RANGE_TYPE.EMPTY,
      range: [],
      timestamp: 770880, // 生成交易时间戳
      fee: "78622", // 交易手续费
      remark: { remark: "body.remark" }, // 交易备注，任意信息
      dappid: getRandomDAppid(), // 交易所属的 dappid
      lns: fullBfchainCore.config.genesisLocationName,
      sourceIP: "127.0.0.1", // 交易来源 ip
      fromMagic: fullBfchainCore.config.magic,
      toMagic: fullBfchainCore.config.magic,
      applyBlockHeight: 10086, // 交易发起高度
      effectiveBlockHeight: 10100,
      storage: {
        key: "magic",
        value: registerBfchainCore.config.magic,
      },
    };

    let secondKeypair;
    if (sender.secondSecret) {
      secondKeypair = await fullBfchainCore.accountBaseHelper.createSecondSecretKeypair(
        sender.secret,
        sender.secondSecret,
      );
      data.senderSecondPublicKey =
        await fullBfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
          sender.secret,
          sender.secondSecret,
        );
    }

    const genesisBlock = await getGenesisBlockAsync();
    const trs = await fullBfchainCore.transaction.createTransaction<RegisterChainTransaction>(
      RegisterChainTransactionFactory,
      data,
      {
        registerChain: {
          genesisBlock,
        },
      },
      keypair,
      secondKeypair,
    );

    const trsJson = trs.toJSON();
    console.log(trsJson.asset.registerChain.genesisBlock.transactions[0]);
    const xx = await fullBfchainCore.transaction.recombineTransaction(trsJson);
    await fullBfchainCore.transactionHelper.verifyTransactionSignature(xx);

    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }

  async function getCommonBlockAsync(sender: AccountModel) {
    //#region 模拟账户表的变更
    const accountAssetMap = new Map<string, bigint>();
    accountAssetMap.set(
      `${sender.address}_${fullBfchainCore.config.magic}_${fullBfchainCore.config.assetType}`,
      BigInt("1000000000"),
    );

    function setAccountAsset(subkey: string, assetNumber: bigint) {
      const remainAsset = accountAssetMap.get(subkey);
      if (remainAsset) {
        accountAssetMap.set(subkey, remainAsset + assetNumber);
      } else {
        accountAssetMap.set(subkey, assetNumber);
      }
    }

    function getAccountAsset(subkey: string) {
      const assetNumber = accountAssetMap.get(subkey);
      return assetNumber ? assetNumber.toString() : "0";
    }
    //#endregion
    const trsWithIndex = await getRegisterChainTransaction(sender);
    const height = 7;
    const blockTrsItems: TransactionInBlock[] = [];
    const eventEmitter: BFChainCore.ApplyTransactionEventEmitter<any> =
      new QueneEventEmitter<any>();
    const statisticsInfo = statistics.forceGetStatisticsInfoByBlock(
      `core-genesisblock-${height}`,
      "generateCommonBlock",
    );
    statistics.bindApplyTransactionEventEmiter(eventEmitter, statisticsInfo);

    const { index, trs } = trsWithIndex;
    const { senderId, fee, fromMagic } = trs;
    const assetType = fullBfchainCore.config.assetType;
    const amount = "0";
    const chainAssetInfo = fullBfchainCore.chainAssetInfoHelper.getAssetInfo(fromMagic, assetType);
    statisticsInfo.initAssetStatistic(chainAssetInfo);
    const assetChanges: {
      accountType: number;
      magic: string;
      assetType: string;
      assetNumber: string;
    }[] = [];
    const key = `${senderId}_${fromMagic}_${assetType}`;
    const totalSpend = BigInt("-" + amount) + BigInt("-" + fee);
    setAccountAsset(key, totalSpend);
    assetChanges[assetChanges.length] = {
      accountType: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE.SENDER,
      magic: fromMagic,
      assetType,
      assetNumber: getAccountAsset(key),
    };
    const transactionAssetChanges: BFChainCore.TransactionAssetChangeJSON[] = [];
    for (const assetChange of assetChanges) {
      const { accountType, assetNumber } = assetChange;
      const asset = statisticsInfo.getAssetStatistic(chainAssetInfo);
      if (!asset) {
        throw new Error("Statistic asset lose");
      }
      transactionAssetChanges[transactionAssetChanges.length] = {
        accountType,
        assetTypes: asset.index,
        assetBalance: assetNumber,
      };
    }
    const trsInBlock = TransactionInBlock.fromObject({
      index: 0,
      height,
      numberOfSenderTransactions: index,
      transactionAssetChanges,
    });
    trsInBlock.transaction = trs;
    blockTrsItems[blockTrsItems.length] = trsInBlock;
    const generatorPublicKey = await fullBfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(
      sender.secret,
    );
    const generatorKeypair = await fullBfchainCore.accountBaseHelper.createSecretKeypair(
      sender.secret,
    );
    eventEmitter.on("verifyTransactionProfOfWork", ({ transaction, count }) => {
      return registerBfchainCore.transactionHelper.checkTransactionProfOfWork(
        // transaction.signatureBuffer,
        // {
        //   accountParticipation: "0",
        //   accountNumberOfTransactionInBlock: count,
        // },
        transaction.signatureBuffer,
        count,
        "0",
      );
    });
    const commonBlock = await fullBfchainCore.block.generateBlock<CommonBlock>(
      CommonBlockFactory,
      {
        version: fullBfchainCore.config.version,
        height,
        timestamp: 0,
        generatorPublicKey,
        generatorEquity: "0",
        previousBlockSignature:
          "a8b6f856eae3d0cf57ace98d6d5890db6713a2356f06159a5e34e8924431895a2c0b19f1444120a632bf48442a2b033003a262fb78691bdcc4513ca255c57a11",
      },
      {
        debug: "debug",
        info: "info",
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
    statisticsInfo.unref("generateCommonBlock");
    await fullBfchainCore.block.getBlockFactoryFromHeight(commonBlock.height).verify(commonBlock);
    // console.log(commonBlock);
    return commonBlock;
  }

  try {
    // await getRegisterChainTransaction(getSenderWithSecondSecret());
    // await getRegisterChainTransaction(getSenderWithoutSecondSecret());
    const xx = await getCommonBlockAsync(getSenderWithoutSecondSecret());
    console.log(xx.transactions[0].transactionAssetChanges.map((item) => item.getBytes()));
  } catch (e) {
    console.log(e);
  }
})();
