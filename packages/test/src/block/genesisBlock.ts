require("source-map-support").install();
import {
  NodeJsCryptoHelper,
  NodeJsKeypairHelper,
  getIps,
  TransactionInBlock,
  UsernameTransaction,
  UsernameTransactionFactory,
  DelegateTransactionFactory,
  GenesisBlockFactory,
  GenesisBlock,
  AcceptVoteTransaction,
  AcceptVoteTransactionFactory,
  Transaction,
  BlockBaseStatisticsHelper,
  TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE,
  TransferAssetTransactionFactory,
  TransferAssetTransaction,
  ConfigHelper,
  BFChainCoreFactory,
  RANGE_TYPE,
  LocationNameTransactionFactory,
  SetLnsRecordValueTransactionFactory,
  RECORD_OPERATION_TYPE,
  LOCATION_NAME_OPERATION_TYPE,
  getRandomMagic,
  ed2curveHelper,
  mainChainRemarkData,
  getFullBfchainCore,
} from "../include";
import { QueneEventEmitter, Resolve } from "@bfchain/util";
import * as optimist from "optimist";
import * as path from "path";
// const { dump } = require("dumper.js");
const argv = optimist
  .usage("Usage: -b [num] -f [num] [num] -i -o [string] -p")
  .alias("b", "blockPerRound")
  .alias("f", "forgeInterval")
  .alias("i", "ip path")
  .alias("ri", "random ips")
  .alias("rm", "random magic")
  .alias("o", "out")
  .alias("p", "genesisblock out path")
  .default("b", 57)
  .default("f", 128)
  .default("ri", false)
  .default("rm", false).argv;
console.log(argv);
const blockPerRound = argv.b;
const forgeInterval = argv.f;
const bfchainCore = getFullBfchainCore(blockPerRound, forgeInterval);
const filename = `genesisBlock-${blockPerRound}b-${forgeInterval}s`;
const out = argv.o;
const outPath = argv.p;
const randomIps = argv.ri;
const randomMagic = argv.rm;

const defaultSecretPath = path.join(process.cwd(), "./assets/secret.json");
const inputIpsPath = argv.i;
const defaultIpsPath = path.join(process.cwd(), "./assets/defaultIps.json");
const defaultGenesisBlockPath =
  out === true
    ? outPath
      ? path.join(process.cwd(), outPath)
      : path.join(process.cwd(), `./assets/${filename}.json`)
    : path.join(process.cwd(), "./asset");

const config = {
  url: "http://localhost:19002",
  genesisSecret: require(defaultSecretPath).genesis as string,
  delegatesSecret: require(defaultSecretPath).delegates as string[],
};
mainChainRemarkData.blockPerRound = blockPerRound;
mainChainRemarkData.powOfWorkExemptionBlocks = blockPerRound;
mainChainRemarkData.delegates = blockPerRound * 2;
mainChainRemarkData.forgeInterval = forgeInterval;

if (randomMagic) {
  mainChainRemarkData.magic = getRandomMagic();
}

const core = BFChainCoreFactory({
  config: new ConfigHelper(
    GenesisBlock.fromObject({ remark: mainChainRemarkData }),
    "genesisBlock",
  ),
  Buffer: Buffer as any,
  cryptoHelper: NodeJsCryptoHelper,
  keypairHelper: NodeJsKeypairHelper,
  ed2curveHelper: ed2curveHelper,
});
const statistics = Resolve(BlockBaseStatisticsHelper, core.moduleMap);

type DelegateInfo = {
  username: string;
  address: string;
  secret: string;
  publicKey: string;
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
  const keypair = core.accountBaseHelper.createSecretKeypair(sender.secret);
  const secondKeypair =
    (sender.secondSecret &&
      core.accountBaseHelper.createSecondSecretKeypair(sender.secret, sender.secondSecret)) ||
    undefined;
  const pow =
    1 > bfchainCore.config.powOfWorkExemptionBlocks ? getPOWInfo(sender.address) : undefined;
  const createTrs = (fee = "AUTO") => {
    return core.transaction.createTransaction<UsernameTransaction>(
      UsernameTransactionFactory,
      {
        version: 1,
        type: core.transactionHelper.USERNAME, // 交易类型
        senderId: sender.address, // 发起者地址
        senderPublicKey: sender.publicKey, // 发起者公钥
        senderSecondPublicKey: secondKeypair && secondKeypair.publicKey.toString("hex"), // 发起者二次公钥
        rangeType: RANGE_TYPE.EMPTY,
        range: [],
        timestamp: 0, // 生成交易时间戳
        fee: fee === "AUTO" ? "1" : fee, // 交易手续费
        dappid: "", // 交易所属的 dappid
        lns: "",
        sourceIP: "", // 交易来源 ip
        fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
        toMagic: bfchainCore.config.magic, // 交易去往链的 magic
        applyBlockHeight: 1, // 交易发起高度
        effectiveBlockHeight: 1,
        remark: {},
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
      undefined,
      undefined,
    );
  };
  let trs = createTrs();
  if (pow) {
    trs = await bfchainCore.transaction.transactionPowCalculator(trs, pow, keypair, secondKeypair);
  }
  return createTrs(
    core.transactionHelper.calcTransactionFee(trs, bfchainCore.config.minTransactionFeePerByte),
  );
}

async function getDelegateTransaction(sender: DelegateInfo) {
  const keypair = core.accountBaseHelper.createSecretKeypair(sender.secret);
  const secondKeypair =
    (sender.secondSecret &&
      core.accountBaseHelper.createSecondSecretKeypair(sender.secret, sender.secondSecret)) ||
    undefined;
  const pow =
    1 > bfchainCore.config.powOfWorkExemptionBlocks ? getPOWInfo(sender.address) : undefined;
  const createTrs = (fee = "AUTO") => {
    return core.transaction.createTransaction(
      DelegateTransactionFactory,
      {
        version: 1,
        type: core.transactionHelper.DELEGATE, // 交易类型
        senderId: sender.address, // 发起者地址
        senderPublicKey: sender.publicKey, // 发起者公钥
        senderSecondPublicKey: secondKeypair && secondKeypair.publicKey.toString("hex"), // 发起者二次公钥
        rangeType: RANGE_TYPE.EMPTY,
        range: [],
        timestamp: 0, // 生成交易时间戳
        fee: fee === "AUTO" ? "1" : fee, // 交易手续费
        dappid: "", // 交易所属的 dappid
        lns: "",
        sourceIP: "", // 交易来源 ip
        fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
        toMagic: bfchainCore.config.magic, // 交易去往链的 magic
        applyBlockHeight: 1, // 交易发起高度
        effectiveBlockHeight: 1,
        remark: {},
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
      undefined,
      undefined,
    );
  };
  let trs = createTrs();
  if (pow) {
    trs = await bfchainCore.transaction.transactionPowCalculator(trs, pow, keypair, secondKeypair);
  }
  trs = createTrs(
    core.transactionHelper.calcTransactionFee(trs, bfchainCore.config.minTransactionFeePerByte),
  );
  return trs;
}

async function getAcceptVoteTransaction(sender: DelegateInfo) {
  const keypair = core.accountBaseHelper.createSecretKeypair(sender.secret);
  const secondKeypair =
    (sender.secondSecret &&
      core.accountBaseHelper.createSecondSecretKeypair(sender.secret, sender.secondSecret)) ||
    undefined;
  const pow =
    1 > bfchainCore.config.powOfWorkExemptionBlocks ? getPOWInfo(sender.address) : undefined;
  const createTrs = (fee = "AUTO") => {
    return core.transaction.createTransaction<AcceptVoteTransaction>(
      AcceptVoteTransactionFactory,
      {
        version: 1,
        type: core.transactionHelper.ACCEPT_VOTE, // 交易类型
        senderId: sender.address, // 发起者地址
        senderPublicKey: sender.publicKey, // 发起者公钥
        senderSecondPublicKey: secondKeypair && secondKeypair.publicKey.toString("hex"), // 发起者二次公钥
        rangeType: RANGE_TYPE.EMPTY,
        range: [], // 接收账户地址
        timestamp: 0, // 生成交易时间戳
        fee: fee === "AUTO" ? "1" : fee, // 交易手续费
        remark: {}, // 交易备注，任意信息
        dappid: "", // 交易所属的 dappid
        lns: "",
        sourceIP: "", // 交易来源 ip
        fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
        toMagic: bfchainCore.config.magic, // 交易去往链的 magic
        applyBlockHeight: 1, // 交易发起高度
        effectiveBlockHeight: 1,
      },
      {},
      keypair,
      secondKeypair,
      undefined,
      undefined,
    );
  };
  let trs = createTrs();
  if (pow) {
    trs = await bfchainCore.transaction.transactionPowCalculator(trs, pow, keypair, secondKeypair);
  }
  trs = createTrs(
    core.transactionHelper.calcTransactionFee(trs, bfchainCore.config.minTransactionFeePerByte),
  );
  return trs;
}
const genesisAccountKeypair = core.accountBaseHelper.createSecretKeypair(config.genesisSecret);
const genesisAccountInfo = {
  address: core.accountBaseHelper.getAddressFromPublicKey(genesisAccountKeypair.publicKey),
  publicKey: genesisAccountKeypair.publicKey.toString("hex"),
  publicKeyBuffer: genesisAccountKeypair.publicKey,
};

async function getTransferAssetTransaction(recipient: DelegateInfo, amount: string) {
  const pow =
    1 > bfchainCore.config.powOfWorkExemptionBlocks
      ? getPOWInfo(genesisAccountInfo.address)
      : undefined;
  const createTrs = (fee = "AUTO") => {
    return core.transaction.createTransaction(
      TransferAssetTransactionFactory,
      {
        version: 1,
        type: core.transactionHelper.TRANSFER_ASSET, // 交易类型
        senderId: genesisAccountInfo.address, // 发起者地址
        senderPublicKey: genesisAccountInfo.publicKey, // 发起者公钥
        recipientId: recipient.address,
        rangeType: RANGE_TYPE.EMPTY,
        range: [], // 接收范围
        timestamp: 0, // 生成交易时间戳
        fee: fee === "AUTO" ? "1" : fee, // 交易手续费
        dappid: "", // 交易所属的 dappid
        lns: "",
        sourceIP: "", // 交易来源 ip
        fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
        toMagic: bfchainCore.config.magic, // 交易去往链的 magic
        applyBlockHeight: 1, // 交易发起高度
        effectiveBlockHeight: 1,
        remark: {},
        storage: {
          key: "assetType",
          value: core.config.assetType,
        },
      },
      {
        transferAsset: {
          sourceChainName: core.config.chainName,
          sourceChainMagic: core.config.magic,
          assetType: core.config.assetType,
          amount,
        },
      },
      genesisAccountKeypair,
      undefined,
      undefined,
      undefined,
    );
  };
  let trs = createTrs();
  if (pow) {
    trs = await bfchainCore.transaction.transactionPowCalculator(
      trs,
      pow,
      genesisAccountKeypair,
      undefined,
    );
  }
  trs = createTrs(
    core.transactionHelper.calcTransactionFee(trs, bfchainCore.config.minTransactionFeePerByte),
  );
  return trs;
}

async function getLocationNameTransaction() {
  const pow =
    1 > bfchainCore.config.powOfWorkExemptionBlocks
      ? getPOWInfo(genesisAccountInfo.address)
      : undefined;
  const createTrs = (fee = "AUTO") => {
    return core.transaction.createTransaction(
      LocationNameTransactionFactory,
      {
        version: 1,
        type: core.transactionHelper.LOCATION_NAME, // 交易类型
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
        fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
        toMagic: bfchainCore.config.magic, // 交易去往链的 magic
        applyBlockHeight: 1, // 交易发起高度
        effectiveBlockHeight: 1,
        remark: {},
        storage: {
          key: "name",
          value: `bnqkl.${core.config.chainName}`,
        },
      },
      {
        locationName: {
          sourceChainName: core.config.chainName,
          sourceChainMagic: core.config.magic,
          name: `bnqkl.${core.config.chainName}`,
          operationType: LOCATION_NAME_OPERATION_TYPE.REGISTRATION,
        },
      },
      genesisAccountKeypair,
      undefined,
      undefined,
      undefined,
    );
  };
  let trs = createTrs();
  if (pow) {
    trs = await bfchainCore.transaction.transactionPowCalculator(
      trs,
      pow,
      genesisAccountKeypair,
      undefined,
    );
  }
  trs = createTrs(
    core.transactionHelper.calcTransactionFee(trs, bfchainCore.config.minTransactionFeePerByte),
  );
  return trs;
}

async function getSetLnsRecordValueTransaction(
  sender: DelegateInfo,
  record: BFChainCore.LocationNameRecordJSON,
) {
  const keypair = core.accountBaseHelper.createSecretKeypair(sender.secret);
  const secondKeypair =
    (sender.secondSecret &&
      core.accountBaseHelper.createSecondSecretKeypair(sender.secret, sender.secondSecret)) ||
    undefined;
  const pow =
    0 > bfchainCore.config.powOfWorkExemptionBlocks ? getPOWInfo(sender.address) : undefined;
  const createTrs = (fee = "AUTO") => {
    return core.transaction.createTransaction(
      SetLnsRecordValueTransactionFactory,
      {
        version: 1,
        type: core.transactionHelper.SET_LNS_RECORD_VALUE, // 交易类型
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
        fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
        toMagic: bfchainCore.config.magic, // 交易去往链的 magic
        applyBlockHeight: 1, // 交易发起高度
        effectiveBlockHeight: 1,
        remark: {},
        storage: {
          key: "name",
          value: `bnqkl.${core.config.chainName}`,
        },
      },
      {
        lnsRecordValue: {
          sourceChainName: core.config.chainName,
          sourceChainMagic: core.config.magic,
          name: `bnqkl.${core.config.chainName}`,
          operationType: RECORD_OPERATION_TYPE.ADD,
          addRecord: record,
        },
      },
      keypair,
      secondKeypair,
      undefined,
      undefined,
    );
  };
  let trs = createTrs();
  if (pow) {
    await bfchainCore.transaction.transactionPowCalculator(trs, pow, keypair, secondKeypair);
  }
  trs = createTrs(
    core.transactionHelper.calcTransactionFee(trs, bfchainCore.config.minTransactionFeePerByte),
  );
  return trs;
}

async function getGenesisBlockAsync() {
  //#region 模拟账户表的变更
  const accountAssetMap = new Map<string, bigint>();
  accountAssetMap.set(
    `${genesisAccountInfo.address}_${core.config.magic}_${core.config.assetType}`,
    BigInt(core.config.genesisBlock.remark.generateTotalAmount),
  );

  function getAccountAssetKey(address: string, magic: string, assetType: string) {
    return `${address}_${magic}_${assetType}`;
  }

  function setAccountAsset(key: string, assetNumber: bigint) {
    const remainAsset = accountAssetMap.get(key);
    if (remainAsset) {
      accountAssetMap.set(key, remainAsset + assetNumber);
    } else {
      accountAssetMap.set(key, assetNumber);
    }
  }

  function getAccountAsset(key: string): string {
    const assetNumber = accountAssetMap.get(key);
    return assetNumber ? assetNumber.toString() : "0";
  }
  //#endregion

  const txs: Transaction[] = [];
  txs.push(await getLocationNameTransaction());
  const totalDelegates = core.config.genesisBlock.remark.delegates;
  let ips: string[] = [];
  if (inputIpsPath) {
    ips = require(path.join(process.cwd(), inputIpsPath));
  } else {
    ips = getIps(totalDelegates, randomIps, defaultIpsPath);
  }
  if (!ips) {
    throw new Error("Failed to get ips");
  }
  if (!bfchainCore.baseHelper.isArray(ips)) {
    throw new Error("Require ips should be array");
  }
  if (ips.length < totalDelegates) {
    throw new Error(`Ips too short min ${totalDelegates}`);
  }
  const delegatesSecret = config.delegatesSecret.slice(0, totalDelegates);
  for (let i = 0; i < delegatesSecret.length; i++) {
    const secret = delegatesSecret[i];
    const address = core.accountBaseHelper.getAddressFromSecret(secret);
    // console.group(address, index);
    // bfchainCore.config.newDelegates.push(address);
    if (mainChainRemarkData.nextRoundDelegates.length < bfchainCore.config.blockPerRound) {
      mainChainRemarkData.nextRoundDelegates.push({
        address,
        equity: "0",
      });
    }
    const publicKey = core.accountBaseHelper.getPublicKeyStringFromSecret(secret);
    const delegate: DelegateInfo = {
      secret,
      address,
      publicKey,
      username: `${bfchainCore.config.chainName}${i + 1}`,
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
    console.log(`第 ${i} 组交易创建完成`);
    // 实施这些交易需要的手续费由创始账户给予
    const total_fee = trsList.reduce(
      (acc_fee, trs) => (BigInt(trs.fee) + BigInt(acc_fee)).toString(),
      "0",
    );

    if (total_fee !== "0") {
      txs.push(await getTransferAssetTransaction(delegate, total_fee));
    }
    txs.push(...trsList);
    console.groupEnd();
  }

  const height = 1;
  const blockTrsItems: TransactionInBlock[] = [];
  const eventEmitter: BFChainCore.ApplyTransactionEventEmitter<any> = new QueneEventEmitter<any>();
  const statisticsInfo = statistics.forceGetStatisticsInfoByBlock(height, "getGenesisBlock");
  statistics.bindApplyTransactionEventEmiter(eventEmitter, statisticsInfo);
  for (let i = 0; i < txs.length; i++) {
    const { senderId, recipientId, type, fee, fromMagic } = txs[i];
    const assetType = core.config.assetType;
    let amount = "0";
    if (type === core.transactionHelper.TRANSFER_ASSET) {
      amount = (txs[i] as TransferAssetTransaction).asset.transferAsset.amount;
    }
    const chainAssetInfo = core.chainAssetInfoHelper.getAssetInfo(fromMagic, assetType);
    statisticsInfo.initAssetStatistic(chainAssetInfo, statisticsInfo.assetStatisticCount);
    const assetChanges: {
      accountType: number;
      magic: string;
      assetType: string;
      assetNumber: string;
    }[] = [];
    const key = getAccountAssetKey(senderId, fromMagic, assetType);
    const totalSpend = BigInt("-" + amount) + BigInt("-" + fee);
    setAccountAsset(key, totalSpend);
    assetChanges[assetChanges.length] = {
      accountType: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE.SENDER,
      magic: fromMagic,
      assetType,
      assetNumber: getAccountAsset(key),
    };
    if (recipientId) {
      const rkey = getAccountAssetKey(recipientId, fromMagic, assetType);
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
      index: i,
      height,
      transactionAssetChanges,
      transaction: txs[i],
    });
    blockTrsItems.push(trsInBlock);
  }
  const generatorPublicKey = core.accountBaseHelper.getPublicKeyStringFromSecret(
    config.genesisSecret,
  );
  const generatorKeypair = core.accountBaseHelper.createSecretKeypair(config.genesisSecret);
  //#region 处理账户余额与交易pow
  // /**执行中的账户余额管理器 */
  // const accountBalanceManager = {
  //   _cache: new Map<string, JSBI>(),
  //   get(address: string) {
  //     return this.getBigInt(address).toString();
  //   },
  //   getBigInt(address: string) {
  //     return this._cache.get(address) || JSBI.BigInt(0);
  //   },
  //   modify(address: string, amount: string) {
  //     const balance_BI = this.getBigInt(address);
  //     const amount_BI = JSBI.BigInt(amount);
  //     this._cache.set(address, JSBI.add(amount_BI, balance_BI));
  //   },
  // };
  // eventEmitter.on("asset", v => {
  //   accountBalanceManager.modify(v.applyInfo.address, v.applyInfo.amount);
  // });
  // eventEmitter.on("fee", v => {
  //   accountBalanceManager.modify(v.applyInfo.address, v.applyInfo.amount);
  // });
  eventEmitter.on("verifyTransactionProfOfWork", ({ transaction, count }) => {
    return core.transactionHelper.checkTransactionProfOfWork(
      transaction.signatureBuffer,
      count,
      "0",
    );
  });
  //#endregion
  const genesisBlock = await core.block.generateBlock(
    GenesisBlockFactory,
    {
      version: 1,
      height,
      timestamp: 0,
      generatorPublicKey,
      previousBlockSignature: "",
    },
    mainChainRemarkData,
    (async function* zz() {
      for (let item of blockTrsItems) {
        yield item;
      }
    })(),
    generatorKeypair,
    eventEmitter,
  );
  statisticsInfo.unref("getGenesisBlock");
  const _genesisBlock = genesisBlock.toJSON();
  const __genesisBlock = core.block.recombineBlock(_genesisBlock);
  core.block.getBlockFactoryFromHeight(__genesisBlock.height).verify(__genesisBlock);
  core.blockHelper.verifyBlockSignature(__genesisBlock, {
    taskLabel: "self genesis Block",
  });
  if (out) {
    require("fs").writeFileSync(
      defaultGenesisBlockPath,
      JSON.stringify(genesisBlock.toJSON(), null, 2),
    );
    console.log(`Genesis block save to: ${defaultGenesisBlockPath}`);
  } else {
    // dump(genesisBlock.toJSON());
  }
}

(async () => {
  try {
    await getGenesisBlockAsync();
  } catch (e) {
    console.error(e);
  }
})();
