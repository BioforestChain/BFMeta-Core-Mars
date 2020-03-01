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
  RANGE_TYPE,
  RECORD_OPERATION_TYPE,
  LocationNameTransactionFactory,
  SetLnsRecordValueTransactionFactory,
  LOCATION_NAME_OPERATION_TYPE,
} from "@bfchain/core";
import { QueneEventEmitter, Resolve } from "@bfchain/util";
import * as path from "path";
import {
  getSenderWithoutSecondSecret,
  getFullBfchainCore,
  registerBfchainCore,
  AccountModel,
  config,
  registerchainRemarkData,
  getIps,
} from "../include";
const defaultIpsPath = path.join(process.cwd(), "./assets/defaultIps.json");

const fullBfchainCore = getFullBfchainCore(57, 128);

const subStatistics = Resolve(BlockBaseStatisticsHelper, registerBfchainCore.moduleMap);
const statistics = Resolve(BlockBaseStatisticsHelper, fullBfchainCore.moduleMap);

type DelegateInfo = {
  address: string;
  secret: string;
  publicKey: string;
  username: string;
  secondSecret?: string;
};
const _powCount: { [add: string]: number } = {};
const getPOWInfo = (address: string) => {
  const count = _powCount[address] || 0;
  _powCount[address] = count + 1;
  const res: BFChainCore.TransactonPoWOptions = {
    count,
    participation: "0",
  };
  return res;
};
async function getUsernameTransaction(sender: DelegateInfo) {
  const keypair = registerBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const secondKeypair =
    (sender.secondSecret &&
      registerBfchainCore.accountBaseHelper.createSecondSecretKeypair(
        sender.secret,
        sender.secondSecret,
      )) ||
    undefined;
  const pow =
    1 > registerBfchainCore.config.powOfWorkExemptionBlocks
      ? getPOWInfo(sender.address)
      : undefined;
  const createTrs = (fee = "1") => {
    return registerBfchainCore.transaction.createTransaction<UsernameTransaction>(
      UsernameTransactionFactory,
      {
        version: 1,
        type: registerBfchainCore.transactionHelper.USERNAME, // 交易类型
        senderId: sender.address, // 发起者地址
        senderPublicKey: sender.publicKey, // 发起者公钥
        senderSecondPublicKey: secondKeypair && secondKeypair.publicKey.toString("hex"), // 发起者二次公钥
        rangeType: RANGE_TYPE.EMPTY,
        range: [],
        timestamp: 0, // 生成交易时间戳
        fee, // 交易手续费
        dappid: "", // 交易所属的 dappid
        lns: "",
        sourceIP: "", // 交易来源 ip
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
          publicKey: sender.publicKey,
        },
      },
      keypair,
      secondKeypair,
    );
  };
  let trs = createTrs();
  if (pow) {
    trs = await registerBfchainCore.transaction.transactionPowCalculator(
      trs,
      pow,
      keypair,
      secondKeypair,
    );
  }
  return createTrs(
    registerBfchainCore.transactionHelper.calcTransactionFee(
      trs,
      registerBfchainCore.config.minTransactionFeePerByte,
    ),
  );
}

async function getDelegateTransaction(sender: DelegateInfo) {
  const keypair = registerBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const secondKeypair =
    (sender.secondSecret &&
      registerBfchainCore.accountBaseHelper.createSecondSecretKeypair(
        sender.secret,
        sender.secondSecret,
      )) ||
    undefined;
  const pow =
    1 > registerBfchainCore.config.powOfWorkExemptionBlocks
      ? getPOWInfo(sender.address)
      : undefined;
  const createTrs = (fee = "1") => {
    return registerBfchainCore.transaction.createTransaction(
      DelegateTransactionFactory,
      {
        version: 1,
        type: registerBfchainCore.transactionHelper.DELEGATE, // 交易类型
        senderId: sender.address, // 发起者地址
        senderPublicKey: sender.publicKey, // 发起者公钥
        senderSecondPublicKey: secondKeypair && secondKeypair.publicKey.toString("hex"), // 发起者二次公钥
        rangeType: RANGE_TYPE.EMPTY,
        range: [],
        timestamp: 0, // 生成交易时间戳
        fee, // 交易手续费
        dappid: "", // 交易所属的 dappid
        lns: "",
        sourceIP: "", // 交易来源 ip
        fromMagic: registerBfchainCore.config.magic, // 交易来源链的 magic
        toMagic: registerBfchainCore.config.magic, // 交易去往链的 magic
        applyBlockHeight: 1, // 交易发起高度
        effectiveBlockHeight: 1,
        remark: { remark: "交易备注，任意信息，这个是注册受托人交易" }, // 交易备注，任意信息
        storage: {
          key: "username",
          value: sender.username,
        },
      },
      {
        delegate: {
          username: sender.username,
          publicKey: sender.publicKey,
        },
      },
      keypair,
      secondKeypair,
    );
  };
  let trs = createTrs();
  if (pow) {
    trs = await registerBfchainCore.transaction.transactionPowCalculator(
      trs,
      pow,
      keypair,
      secondKeypair,
    );
  }
  return createTrs(
    registerBfchainCore.transactionHelper.calcTransactionFee(
      trs,
      registerBfchainCore.config.minTransactionFeePerByte,
    ),
  );
}

async function getAcceptVoteTransaction(sender: DelegateInfo) {
  const keypair = registerBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const secondKeypair =
    (sender.secondSecret &&
      registerBfchainCore.accountBaseHelper.createSecondSecretKeypair(
        sender.secret,
        sender.secondSecret,
      )) ||
    undefined;
  const pow =
    1 > registerBfchainCore.config.powOfWorkExemptionBlocks
      ? getPOWInfo(sender.address)
      : undefined;
  const createTrs = (fee = "1") => {
    return registerBfchainCore.transaction.createTransaction<AcceptVoteTransaction>(
      AcceptVoteTransactionFactory,
      {
        version: 1,
        type: registerBfchainCore.transactionHelper.ACCEPT_VOTE, // 交易类型
        senderId: sender.address, // 发起者地址
        senderPublicKey: sender.publicKey, // 发起者公钥
        senderSecondPublicKey: secondKeypair && secondKeypair.publicKey.toString("hex"), // 发起者二次公钥
        rangeType: RANGE_TYPE.EMPTY,
        range: [],
        timestamp: 0, // 生成交易时间戳
        fee, // 交易手续费
        remark: { remark: "交易备注，任意信息，这个是接收投票交易" }, // 交易备注，任意信息
        dappid: "", // 交易所属的 dappid
        lns: "",
        sourceIP: "", // 交易来源 ip
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
  let trs = createTrs();
  if (pow) {
    trs = await registerBfchainCore.transaction.transactionPowCalculator(
      trs,
      pow,
      keypair,
      secondKeypair,
    );
  }
  return createTrs(
    registerBfchainCore.transactionHelper.calcTransactionFee(
      trs,
      registerBfchainCore.config.minTransactionFeePerByte,
    ),
  );
}

async function getLocationNameTransaction() {
  const pow =
    1 > registerBfchainCore.config.powOfWorkExemptionBlocks
      ? getPOWInfo(genesisAccountInfo.address)
      : undefined;
  const createTrs = (fee = "AUTO") => {
    return registerBfchainCore.transaction.createTransaction(
      LocationNameTransactionFactory,
      {
        version: 1,
        type: registerBfchainCore.transactionHelper.LOCATION_NAME, // 交易类型
        senderId: genesisAccountInfo.address, // 发起者地址
        senderPublicKey: genesisAccountInfo.publicKey, // 发起者公钥
        recipientId: "",
        rangeType: RANGE_TYPE.EMPTY,
        range: [], // 接收范围
        timestamp: 0, // 生成交易时间戳
        fee: fee === "AUTO" ? "1" : fee, // 交易手续费
        dappid: "", // 交易所属的 dappid
        lns: "",
        sourceIP: "", // 交易来源 ip
        fromMagic: registerBfchainCore.config.magic, // 交易来源链的 magic
        toMagic: registerBfchainCore.config.magic, // 交易去往链的 magic
        applyBlockHeight: 1, // 交易发起高度
        effectiveBlockHeight: 1,
        remark: {},
        storage: {
          key: "name",
          value: `bnqkl.${registerBfchainCore.config.chainName}`,
        },
      },
      {
        locationName: {
          sourceChainName: registerBfchainCore.config.chainName,
          sourceChainMagic: registerBfchainCore.config.magic,
          name: `bnqkl.${registerBfchainCore.config.chainName}`,
          operationType: LOCATION_NAME_OPERATION_TYPE.REGISTRATION,
        },
      },
      genesisAccountKeypair,
      undefined,
      undefined,
      // fee === "AUTO" ? undefined : getPOWInfo(genesisAccountInfo.address),
    );
  };
  let trs = createTrs();
  if (pow) {
    trs = await registerBfchainCore.transaction.transactionPowCalculator(
      trs,
      pow,
      genesisAccountKeypair,
      undefined,
    );
  }
  return createTrs(
    registerBfchainCore.transactionHelper.calcTransactionFee(
      trs,
      registerBfchainCore.config.minTransactionFeePerByte,
    ),
  );
}

async function getSetLnsRecordValueTransaction(
  sender: DelegateInfo,
  record: BFChainCore.LocationNameRecordJSON,
) {
  const keypair = registerBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const secondKeypair =
    (sender.secondSecret &&
      registerBfchainCore.accountBaseHelper.createSecondSecretKeypair(
        sender.secret,
        sender.secondSecret,
      )) ||
    undefined;
  const pow =
    1 > registerBfchainCore.config.powOfWorkExemptionBlocks
      ? getPOWInfo(sender.address)
      : undefined;
  const createTrs = (fee = "AUTO") => {
    return registerBfchainCore.transaction.createTransaction(
      SetLnsRecordValueTransactionFactory,
      {
        version: 1,
        type: registerBfchainCore.transactionHelper.SET_LNS_RECORD_VALUE, // 交易类型
        senderId: sender.address, // 发起者地址
        senderPublicKey: sender.publicKey, // 发起者公钥
        recipientId: "",
        rangeType: RANGE_TYPE.EMPTY,
        range: [], // 接收范围
        timestamp: 0, // 生成交易时间戳
        fee: fee === "AUTO" ? "1" : fee, // 交易手续费
        dappid: "", // 交易所属的 dappid
        lns: "",
        sourceIP: "", // 交易来源 ip
        fromMagic: registerBfchainCore.config.magic, // 交易来源链的 magic
        toMagic: registerBfchainCore.config.magic, // 交易去往链的 magic
        applyBlockHeight: 1, // 交易发起高度
        effectiveBlockHeight: 1,
        remark: {},
        storage: {
          key: "name",
          value: `bnqkl.${registerBfchainCore.config.chainName}`,
        },
      },
      {
        lnsRecordValue: {
          sourceChainName: registerBfchainCore.config.chainName,
          sourceChainMagic: registerBfchainCore.config.magic,
          name: `bnqkl.${registerBfchainCore.config.chainName}`,
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
  let trs = createTrs();
  if (pow) {
    trs = await registerBfchainCore.transaction.transactionPowCalculator(
      trs,
      pow,
      keypair,
      secondKeypair,
    );
  }
  return createTrs(
    registerBfchainCore.transactionHelper.calcTransactionFee(
      trs,
      registerBfchainCore.config.minTransactionFeePerByte,
    ),
  );
}

const genesisAccountKeypair = registerBfchainCore.accountBaseHelper.createSecretKeypair(
  config.genesisSecret,
);
const genesisAccountInfo = {
  address: registerBfchainCore.accountBaseHelper.getAddressFromPublicKey(
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
    1 > registerBfchainCore.config.powOfWorkExemptionBlocks
      ? getPOWInfo(genesisAccountInfo.address)
      : undefined;
  const createTrs = (fee = "1") => {
    return bfchainCore.transaction.createTransaction(
      TransferAssetTransactionFactory,
      {
        version: 1,
        type: bfchainCore.transactionHelper.TRANSFER_ASSET, // 交易类型
        senderId: genesisAccountInfo.address, // 发起者地址
        senderPublicKey: genesisAccountInfo.publicKey, // 发起者公钥
        recipientId: recipient.address,
        rangeType: RANGE_TYPE.EMPTY,
        range: [], // 接收账户地址
        timestamp: 0, // 生成交易时间戳
        fee, // 交易手续费
        dappid: "", // 交易所属的 dappid
        lns: "",
        sourceIP: "", // 交易来源 ip
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
  let trs = createTrs();
  if (pow) {
    trs = await registerBfchainCore.transaction.transactionPowCalculator(
      trs,
      pow,
      genesisAccountKeypair,
      undefined,
    );
  }
  return createTrs(
    registerBfchainCore.transactionHelper.calcTransactionFee(
      trs,
      registerBfchainCore.config.minTransactionFeePerByte,
    ),
  );
}

async function getGenesisBlockAsync() {
  const generatorPublicKey = registerBfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(
    config.genesisSecret,
  );
  //#region 模拟账户表的变更
  const registerchainAccountAssetMap = new Map<string, bigint>();
  registerchainAccountAssetMap.set(
    `${genesisAccountInfo.address}_${registerBfchainCore.config.magic}_${registerBfchainCore.config.assetType}`,
    BigInt(registerBfchainCore.config.genesisBlock.remark.generateTotalAmount),
  );

  function getChainAccountAssetKey(address: string, magic: string, assetType: string) {
    return `${address}_${magic}_${assetType}`;
  }

  function setChainAccountAsset(key: string, assetNumber: bigint) {
    const remainAsset = registerchainAccountAssetMap.get(key);
    if (remainAsset) {
      registerchainAccountAssetMap.set(key, remainAsset + assetNumber);
    } else {
      registerchainAccountAssetMap.set(key, assetNumber);
    }
  }

  function getAccountAsset(key: string) {
    const assetNumber = registerchainAccountAssetMap.get(key);
    return assetNumber ? assetNumber.toString() : "0";
  }
  //#endregion
  const txs: Transaction[] = [];
  txs.push(await getLocationNameTransaction());
  const delegatesSecret = config.delegatesSecret;
  const ips = getIps(delegatesSecret.length, false, defaultIpsPath);
  for (let i = 0; i < delegatesSecret.slice(5).length; i++) {
    const secret = delegatesSecret[i];
    const address = registerBfchainCore.accountBaseHelper.getAddressFromSecret(secret);
    registerchainRemarkData.newDelegates.push(address);
    if (
      registerchainRemarkData.nextRoundDelegates.length < registerBfchainCore.config.blockPerRound
    ) {
      registerchainRemarkData.nextRoundDelegates.push({
        address,
        equity: "0",
      });
    }
    const publicKey = registerBfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(secret);
    const delegate: DelegateInfo = {
      secret,
      address,
      publicKey,
      username: `${registerBfchainCore.config.chainName}${i + 1}`,
    };
    // 要在创始块中实施的交易
    const trsList = [
      await getUsernameTransaction(delegate),
      await getDelegateTransaction(delegate),
      await getAcceptVoteTransaction(delegate),
      // await getSetLnsRecordValueTransaction(delegate, {
      //   recordType: RECORD_TYPE.IPV4,
      //   recordValue: ips[i],
      // }),
    ];
    // 实施这些交易需要的手续费由创始账户给予
    const total_fee = trsList.reduce(
      (acc_fee, trs) => (BigInt(trs.fee) + BigInt(acc_fee)).toString(),
      "0",
    );
    if (total_fee !== "0") {
      txs.push(await getTransferAssetTransaction(registerBfchainCore, delegate, total_fee));
    }
    txs.push(...trsList);
  }

  const height = 1;
  const blockTrsItems: TransactionInBlock[] = [];
  const eventEmitter: BFChainCore.ApplyTransactionEventEmitter<any> = new QueneEventEmitter<any>();
  const statisticsInfo = subStatistics.forceGetStatisticsInfoByBlock(
    height,
    "generateRegisterChainGenesisBlock",
  );
  subStatistics.bindApplyTransactionEventEmiter(eventEmitter, statisticsInfo);
  for (let i = 0; i < txs.length; i++) {
    const { senderId, recipientId, fee, fromMagic, type } = txs[i];
    let assetType = registerBfchainCore.config.assetType;
    let amount = "0";
    if (type === registerBfchainCore.transactionHelper.TRANSFER_ASSET) {
      amount = (txs[i] as TransferAssetTransaction).asset.transferAsset.amount;
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
    const key = getChainAccountAssetKey(senderId, fromMagic, assetType);
    const totalSpend = BigInt("-" + amount) + BigInt("-" + fee);
    setChainAccountAsset(key, totalSpend);
    assetChanges[assetChanges.length] = {
      accountType: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE.SENDER,
      magic: fromMagic,
      assetType,
      assetNumber: getAccountAsset(key),
    };
    if (recipientId) {
      const rkey = getChainAccountAssetKey(recipientId, fromMagic, assetType);
      setChainAccountAsset(rkey, BigInt(amount));
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
      transactionAssetChanges,
      transaction: txs[i],
    });
    blockTrsItems[blockTrsItems.length] = trsInBlock;
  }
  const generatorKeypair = registerBfchainCore.accountBaseHelper.createSecretKeypair(
    config.genesisSecret,
  );
  eventEmitter.on("verifyTransactionProfOfWork", ({ transaction, count }) => {
    return registerBfchainCore.transactionHelper.checkTransactionProfOfWork(
      transaction.signatureBuffer,
      count,
      "0",
    );
  });
  const genesisBlock = await registerBfchainCore.block.generateBlock<GenesisBlock>(
    GenesisBlockFactory,
    {
      version: 1,
      height: 1,
      timestamp: 0,
      generatorPublicKey,
      previousBlockSignature: "",
    },
    registerchainRemarkData,
    (async function* zz() {
      for (let item of blockTrsItems) {
        yield item;
      }
    })(),
    generatorKeypair,
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
  const keypair = fullBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: fullBfchainCore.transactionHelper.REGISTER_CHAIN, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
    lns: `bnqkl.${fullBfchainCore.config.chainName}`,
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
    secondKeypair = fullBfchainCore.accountBaseHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey = fullBfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
      sender.secret,
      sender.secondSecret,
    );
  }

  const genesisBlock = await getGenesisBlockAsync();
  const trs = fullBfchainCore.transaction.createTransaction<RegisterChainTransaction>(
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
  const xx = fullBfchainCore.transaction.recombineTransaction(trsJson);
  fullBfchainCore.transactionHelper.verifyTransactionSignature(xx);

  return trs;
}

async function getCommonBlockAsync(sender: AccountModel) {
  //#region 模拟账户表的变更
  const accountAssetMap = new Map<string, bigint>();
  accountAssetMap.set(
    `${sender.address}_${fullBfchainCore.config.magic}_${fullBfchainCore.config.assetType}`,
    BigInt("1000000000"),
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
  //#endregion
  const trs = await getRegisterChainTransaction(sender);
  const height = 7;
  const blockTrsItems: TransactionInBlock[] = [];
  const eventEmitter: BFChainCore.ApplyTransactionEventEmitter<any> = new QueneEventEmitter<any>();
  const statisticsInfo = statistics.forceGetStatisticsInfoByBlock(height, "generateCommonBlock");
  statistics.bindApplyTransactionEventEmiter(eventEmitter, statisticsInfo);

  const { senderId, range: recipient, fee, fromMagic } = trs;
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
  if (recipient.length > 0) {
    const rkey = `${recipient[0]}_${fromMagic}_${assetType}`;
    setAccountAsset(rkey, BigInt(amount));
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
    index: 0,
    height,
    transactionAssetChanges,
  });
  trsInBlock.transaction = trs;
  blockTrsItems[blockTrsItems.length] = trsInBlock;
  const generatorPublicKey = fullBfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(
    sender.secret,
  );
  const generatorKeypair = fullBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  eventEmitter.on("verifyTransactionProfOfWork", ({ transaction, count }) => {
    return registerBfchainCore.transactionHelper.checkTransactionProfOfWork(
      transaction.signatureBuffer,
      count,
      "0",
    );
  });
  const commonBlock = await fullBfchainCore.block.generateBlock<CommonBlock>(
    CommonBlockFactory,
    {
      version: 1,
      height,
      timestamp: 0,
      generatorPublicKey,
      previousBlockSignature:
        "a8b6f856eae3d0cf57ace98d6d5890db6713a2356f06159a5e34e8924431895a2c0b19f1444120a632bf48442a2b033003a262fb78691bdcc4513ca255c57a11",
    },
    {
      debug: "debug",
      info: "info",
      blockParticipation: "0",
    },
    (async function* zz() {
      for (let item of blockTrsItems) {
        yield item;
      }
    })(),
    generatorKeypair,
    eventEmitter,
  );
  statisticsInfo.unref("generateCommonBlock");
  fullBfchainCore.block.getBlockFactoryFromHeight(commonBlock.height).verify(commonBlock);
  // console.log(commonBlock);
  return commonBlock;
}

(async () => {
  try {
    // await getRegisterChainTransaction(getSenderWithSecondSecret());
    // await getRegisterChainTransaction(getSenderWithoutSecondSecret());
    const xx = await getCommonBlockAsync(getSenderWithoutSecondSecret());
    console.log(xx.transactions[0].transactionAssetChanges.map(item => item.getBytes()));
  } catch (e) {
    console.log(e);
  }
})();
