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
  TransferAssetTransactionFactory,
  TransferAssetTransaction,
  ConfigHelper,
  BFChainCoreFactory,
  RANGE_TYPE,
  LocationNameTransactionFactory,
  LOCATION_NAME_OPERATION_TYPE,
  getRandomMagic,
  ed2curveHelper,
  mainChainAssetData,
  DelegateTransaction,
  LocationNameTransaction,
} from "../include";
import { QueneEventEmitter, Resolve } from "@bfchain/util";
import optimist from "optimist";
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
  .default("b", 5)
  .default("f", 10)
  .default("ri", false)
  .default("rm", false).argv;
console.log(argv);
const blockPerRound = argv.b;
const forgeInterval = argv.f;
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
  genesisSecondSecret: "genesisSecondSecret",
  delegatesSecret: require(defaultSecretPath).delegates as string[],
};
mainChainAssetData.blockPerRound = blockPerRound;
mainChainAssetData.tpowOfWorkExemptionBlocks = blockPerRound;
mainChainAssetData.delegates = blockPerRound * 2;
mainChainAssetData.forgeInterval = forgeInterval;
mainChainAssetData.maxVotesPerBlock =
  mainChainAssetData.maxTPSPerBlock * mainChainAssetData.forgeInterval;
// mainChainAssetData.tpowOfWorkExemptionBlocks = 0;
// mainChainAssetData.tpowDiffFormula = mainChainAssetData.tpowDiffFormula
//   .trim()
//   .replace(/\s+/gi, " ");

if (randomMagic) {
  mainChainAssetData.magic = getRandomMagic();
}

const core = BFChainCoreFactory({
  config: new ConfigHelper(
    GenesisBlock.fromObject({ version: 1, asset: { genesisAsset: mainChainAssetData } }),
    "genesisBlock",
  ),
  Buffer: Buffer as any,
  cryptoHelper: NodeJsCryptoHelper,
  keypairHelper: NodeJsKeypairHelper,
  ed2curveHelper,
});

// if (!core.transaction.tpowHelper.isValidTpowDiffFormula(mainChainAssetData.tpowDiffFormula)) {
//   throw new Error(`tpowDiffFormula 不合法`);
// }

const statistics = Resolve(BlockBaseStatisticsHelper, core.moduleMap);

type DelegateInfo = {
  username: string;
  address: string;
  secret: string;
  publicKey: string;
  secondSecret?: string;
};

const _powCount: { [add: string]: number } = {};
function getPOWInfo<T extends Transaction>(address: string) {
  const count = _powCount[address] || 0;
  _powCount[address] = count + 1;
  // const res: BFChainCore.TransactionPoWOptions<T> = {
  //   accountNumberOfTransactionInBlock: count,
  //   accountParticipation: "0",
  // };
  const res: BFChainCore.TransactionPoWOptions<T> = {
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

const accountsAssets: BFChainCore.AccountsAssetsChange = {};
function setAccountAsset(magic: string, address: string, assetType: string, amount: string) {
  if (!accountsAssets[magic]) {
    accountsAssets[magic] = {};
  }
  if (!accountsAssets[magic][address]) {
    accountsAssets[magic][address] = {};
  }
  if (accountsAssets[magic][address][assetType]) {
    accountsAssets[magic][address][assetType] = (
      BigInt(accountsAssets[magic][address][assetType]) + BigInt(amount)
    ).toString();
  } else {
    accountsAssets[magic][address][assetType] = amount;
  }
}

(async () => {
  const genesisAccountKeypair = await core.accountBaseHelper.createSecretKeypair(
    config.genesisSecret,
  );
  const genesisAccountSecondKeypair = await core.accountBaseHelper.createSecondSecretKeypair(
    config.genesisSecret,
    config.genesisSecondSecret,
  );
  const genesisAccountInfo = {
    address: await core.accountBaseHelper.getAddressFromPublicKey(genesisAccountKeypair.publicKey),
    publicKey: genesisAccountKeypair.publicKey.toString("hex"),
    publicKeyBuffer: genesisAccountKeypair.publicKey,

    secondPublicKey: genesisAccountSecondKeypair.publicKey.toString("hex"),
    secondPublicKeyBuffer: genesisAccountSecondKeypair.publicKey,
  };

  // #region 交易
  async function getLocationNameTransaction() {
    const pow =
      1 > core.config.tpowOfWorkExemptionBlocks
        ? getPOWInfo<LocationNameTransaction>(genesisAccountInfo.address)
        : undefined;
    const createTrs = (fee = "AUTO") => {
      return core.transaction.createTransaction(
        LocationNameTransactionFactory,
        {
          version: core.config.version,
          type: core.transactionHelper.LOCATION_NAME, // 交易类型
          senderId: genesisAccountInfo.address, // 发起者地址
          senderPublicKey: genesisAccountInfo.publicKey, // 发起者公钥
          recipientId: genesisAccountInfo.address,
          rangeType: RANGE_TYPE.EMPTY,
          range: [], // 接收范围
          timestamp: 0, // 生成交易时间戳
          fee: fee === "AUTO" ? "1" : fee, // 交易手续费
          fromMagic: core.config.magic, // 交易来源链的 magic
          toMagic: core.config.magic, // 交易去往链的 magic
          applyBlockHeight: 1, // 交易发起高度
          effectiveBlockHeight: 1,
          remark: {},
          storage: {
            key: "name",
            value: core.config.genesisLocationName,
          },
        },
        {
          locationName: {
            sourceChainName: core.config.chainName,
            sourceChainMagic: core.config.magic,
            name: core.config.genesisLocationName,
            operationType: LOCATION_NAME_OPERATION_TYPE.REGISTRATION,
          },
        },
        genesisAccountKeypair,
        undefined,
        undefined,
        undefined,
      );
    };
    let trs = await createTrs();
    if (pow) {
      trs = await core.transaction.transactionPowCalculator(
        trs,
        pow,
        genesisAccountKeypair,
        undefined,
      );
    }
    trs = await createTrs(
      core.transactionHelper.calcTransactionFee(trs, core.config.minTransactionFeePerByte),
    );
    if (pow) {
      trs = await core.transaction.transactionPowCalculator(
        trs,
        pow,
        genesisAccountKeypair,
        undefined,
      );
    }
    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }
  async function getTransferAssetTransaction(recipient: DelegateInfo, amount: string) {
    const pow =
      1 > core.config.tpowOfWorkExemptionBlocks
        ? getPOWInfo<TransferAssetTransaction>(genesisAccountInfo.address)
        : undefined;
    const createTrs = (fee = "AUTO", nonce = 0) => {
      return core.transaction.createTransaction(
        TransferAssetTransactionFactory,
        {
          version: core.config.version,
          type: core.transactionHelper.TRANSFER_ASSET, // 交易类型
          senderId: genesisAccountInfo.address, // 发起者地址
          senderPublicKey: genesisAccountInfo.publicKey, // 发起者公钥
          recipientId: recipient.address,
          rangeType: RANGE_TYPE.EMPTY,
          range: [], // 接收范围
          timestamp: 0, // 生成交易时间戳
          fee: fee === "AUTO" ? "1" : fee, // 交易手续费
          fromMagic: core.config.magic, // 交易来源链的 magic
          toMagic: core.config.magic, // 交易去往链的 magic
          applyBlockHeight: 1, // 交易发起高度
          effectiveBlockHeight: 1,
          remark: {},
          storage: {
            key: "assetType",
            value: core.config.assetType,
          },
          nonce,
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
    let trs = await createTrs();
    if (pow) {
      trs = await core.transaction.transactionPowCalculator(
        trs,
        pow,
        genesisAccountKeypair,
        undefined,
      );
    }
    trs = await createTrs(
      core.transactionHelper.calcTransactionFee(trs, core.config.minTransactionFeePerByte),
      trs.nonce,
    );
    if (pow) {
      trs = await core.transaction.transactionPowCalculator(
        trs,
        pow,
        genesisAccountKeypair,
        undefined,
      );
    }
    const { magic, assetType } = core.config;
    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }
  async function getUsernameTransaction(sender: DelegateInfo) {
    const keypair = await core.accountBaseHelper.createSecretKeypair(sender.secret);
    const secondKeypair =
      (sender.secondSecret &&
        (await core.accountBaseHelper.createSecondSecretKeypair(
          sender.secret,
          sender.secondSecret,
        ))) ||
      undefined;
    const pow =
      1 > core.config.tpowOfWorkExemptionBlocks
        ? getPOWInfo<UsernameTransaction>(sender.address)
        : undefined;
    const createTrs = (fee = "AUTO") => {
      return core.transaction.createTransaction<UsernameTransaction>(
        UsernameTransactionFactory,
        {
          version: core.config.version,
          type: core.transactionHelper.USERNAME, // 交易类型
          senderId: sender.address, // 发起者地址
          senderPublicKey: sender.publicKey, // 发起者公钥
          senderSecondPublicKey: secondKeypair && secondKeypair.publicKey.toString("hex"), // 发起者二次公钥
          rangeType: RANGE_TYPE.EMPTY,
          range: [],
          timestamp: 0, // 生成交易时间戳
          fee: fee === "AUTO" ? "1" : fee, // 交易手续费
          fromMagic: core.config.magic, // 交易来源链的 magic
          toMagic: core.config.magic, // 交易去往链的 magic
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
          },
        },
        keypair,
        secondKeypair,
        undefined,
        undefined,
      );
    };
    let trs = await createTrs();
    if (pow) {
      trs = await core.transaction.transactionPowCalculator<UsernameTransaction>(
        trs,
        pow,
        keypair,
        secondKeypair,
      );
    }
    trs = await createTrs(
      core.transactionHelper.calcTransactionFee(trs, core.config.minTransactionFeePerByte),
    );
    if (pow) {
      trs = await core.transaction.transactionPowCalculator<UsernameTransaction>(
        trs,
        pow,
        keypair,
        secondKeypair,
      );
    }
    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }
  async function getDelegateTransaction(sender: DelegateInfo) {
    const keypair = await core.accountBaseHelper.createSecretKeypair(sender.secret);
    const secondKeypair =
      (sender.secondSecret &&
        (await core.accountBaseHelper.createSecondSecretKeypair(
          sender.secret,
          sender.secondSecret,
        ))) ||
      undefined;
    const pow =
      1 > core.config.tpowOfWorkExemptionBlocks
        ? getPOWInfo<DelegateTransaction>(sender.address)
        : undefined;
    const createTrs = (fee = "AUTO") => {
      return core.transaction.createTransaction(
        DelegateTransactionFactory,
        {
          version: core.config.version,
          type: core.transactionHelper.DELEGATE, // 交易类型
          senderId: sender.address, // 发起者地址
          senderPublicKey: sender.publicKey, // 发起者公钥
          senderSecondPublicKey: secondKeypair && secondKeypair.publicKey.toString("hex"), // 发起者二次公钥
          rangeType: RANGE_TYPE.EMPTY,
          range: [],
          timestamp: 0, // 生成交易时间戳
          fee: fee === "AUTO" ? "1" : fee, // 交易手续费
          fromMagic: core.config.magic, // 交易来源链的 magic
          toMagic: core.config.magic, // 交易去往链的 magic
          applyBlockHeight: 1, // 交易发起高度
          effectiveBlockHeight: 1,
          remark: {},
        },
        {},
        keypair,
        secondKeypair,
        undefined,
        undefined,
      );
    };
    let trs = await createTrs();
    if (pow) {
      trs = await core.transaction.transactionPowCalculator(trs, pow, keypair, secondKeypair);
    }
    trs = await createTrs(
      core.transactionHelper.calcTransactionFee(trs, core.config.minTransactionFeePerByte),
    );
    if (pow) {
      trs = await core.transaction.transactionPowCalculator(trs, pow, keypair, secondKeypair);
    }
    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }
  async function getAcceptVoteTransaction(sender: DelegateInfo) {
    const keypair = await core.accountBaseHelper.createSecretKeypair(sender.secret);
    const secondKeypair =
      (sender.secondSecret &&
        (await core.accountBaseHelper.createSecondSecretKeypair(
          sender.secret,
          sender.secondSecret,
        ))) ||
      undefined;
    const pow =
      1 > core.config.tpowOfWorkExemptionBlocks
        ? getPOWInfo<AcceptVoteTransaction>(sender.address)
        : undefined;
    const createTrs = (fee = "AUTO") => {
      return core.transaction.createTransaction<AcceptVoteTransaction>(
        AcceptVoteTransactionFactory,
        {
          version: core.config.version,
          type: core.transactionHelper.ACCEPT_VOTE, // 交易类型
          senderId: sender.address, // 发起者地址
          senderPublicKey: sender.publicKey, // 发起者公钥
          senderSecondPublicKey: secondKeypair && secondKeypair.publicKey.toString("hex"), // 发起者二次公钥
          rangeType: RANGE_TYPE.EMPTY,
          range: [], // 接收账户地址
          timestamp: 0, // 生成交易时间戳
          fee: fee === "AUTO" ? "1" : fee, // 交易手续费
          remark: {}, // 交易备注，任意信息
          fromMagic: core.config.magic, // 交易来源链的 magic
          toMagic: core.config.magic, // 交易去往链的 magic
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
    let trs = await createTrs();
    if (pow) {
      trs = await core.transaction.transactionPowCalculator(trs, pow, keypair, secondKeypair);
    }
    trs = await createTrs(
      core.transactionHelper.calcTransactionFee(trs, core.config.minTransactionFeePerByte),
    );
    if (pow) {
      trs = await core.transaction.transactionPowCalculator(trs, pow, keypair, secondKeypair);
    }
    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }
  // #endregion

  async function getGenesisBlockAsync() {
    await core.patchInstaller.changeHeight(3);
    const txWithIndexList: { index: number; trs: Transaction }[] = [];
    txWithIndexList.push(await getLocationNameTransaction());
    const totalDelegates = core.config.delegates;
    let ips: string[] = [];
    if (inputIpsPath) {
      ips = require(path.join(process.cwd(), inputIpsPath));
    } else {
      ips = getIps(totalDelegates, randomIps, defaultIpsPath);
    }
    if (!ips) {
      throw new Error("Failed to get ips");
    }
    if (!core.baseHelper.isArray(ips)) {
      throw new Error("Require ips should be array");
    }
    if (ips.length < totalDelegates) {
      throw new Error(`Ips too short min ${totalDelegates}`);
    }
    const delegatesSecret = config.delegatesSecret.slice(0, totalDelegates);
    const eventEmitter: BFChainCore.ApplyTransactionEventEmitter<any> =
      new QueneEventEmitter<any>();
    for (let i = 0; i < delegatesSecret.length; i++) {
      const secret = delegatesSecret[i];
      const address = await core.accountBaseHelper.getAddressFromSecret(secret);
      mainChainAssetData.newDelegates.push(address);
      if (mainChainAssetData.nextRoundDelegates.length < core.config.blockPerRound) {
        mainChainAssetData.nextRoundDelegates.push({
          address,
          equity: "0",
        });
      }
      const publicKey = await core.accountBaseHelper.getPublicKeyStringFromSecret(secret);
      const delegate: DelegateInfo = {
        secret,
        address,
        publicKey,
        username: `${core.config.chainName}${i + 1}`,
      };
      // 要在创始块中实施的交易
      const tempTrsWithIndexList = [
        await getUsernameTransaction(delegate),
        await getDelegateTransaction(delegate),
        await getAcceptVoteTransaction(delegate),
      ];
      // 实施这些交易需要的手续费由创始账户给予
      const total_fee = tempTrsWithIndexList.reduce(
        (acc_fee, twi) => (BigInt(twi.trs.fee) + BigInt(acc_fee)).toString(),
        "0",
      );

      if (total_fee !== "0") {
        txWithIndexList.push(await getTransferAssetTransaction(delegate, total_fee));
      }
      txWithIndexList.push(...tempTrsWithIndexList);
      console.log(`第 ${i} 组交易创建完成`);
      console.groupEnd();
    }

    for (const txWithIndex of txWithIndexList) {
      const trs = txWithIndex.trs;
      const yy =
        core.transactionLogicVerifier.getTransactionLogicVerifierFromType<TransferAssetTransaction>(
          trs.type,
        );
      const result = yy.checkTrsFeeAndWebFee(
        trs as TransferAssetTransaction,
        trs.getBytes().length,
      );
      if (!result.isFeeEnough) {
        console.log(trs.toJSON());
        throw new Error(`Tx fee not enough, minFee ${result.minFee}`);
      }
    }

    const height = 1;
    const blockTrsItems: TransactionInBlock[] = [];

    const taskname = (eventEmitter.taskname = `test-getGenesisBlock-${height}`);
    const statisticsInfo = statistics.forceGetStatisticsInfoByBlock(taskname, "getGenesisBlock");
    statistics.bindApplyTransactionEventEmiter(eventEmitter, statisticsInfo);
    const { magic, assetType } = core.config;
    setAccountAsset(magic, genesisAccountInfo.address, assetType, mainChainAssetData.genesisAmount);
    const transactionHelper = core.transactionHelper;
    for (let i = 0; i < txWithIndexList.length; i++) {
      const { trs } = txWithIndexList[i];
      const trsInBlock = TransactionInBlock.fromObject({
        tIndex: i,
        height,
        transaction: trs,
      });
      blockTrsItems.push(trsInBlock);
      const { type, senderId, recipientId, fee } = trs;
      setAccountAsset(magic, senderId, assetType, `-${fee}`);
      if (type === transactionHelper.TRANSFER_ASSET) {
        const amount = (trs as TransferAssetTransaction).asset.transferAsset.amount;
        setAccountAsset(magic, senderId, assetType, `-${amount}`);
        setAccountAsset(magic, recipientId as string, assetType, amount);
      }
    }
    const assetChangeHash = await core.blockHelper.calcAssetChangeHash(accountsAssets);
    const genesisBlock = await core.block.generateBlock(
      GenesisBlockFactory,
      {
        version: core.config.version,
        height,
        timestamp: 0,
        generatorPublicKey: genesisAccountInfo.publicKey,
        generatorEquity: "0",
        previousBlockSignature: "",
      },
      {
        genesisAsset: { ...mainChainAssetData, assetChangeHash },
      },
      (async function* zz() {
        for (const item of blockTrsItems) {
          yield item;
        }
      })(),
      genesisAccountKeypair,
      undefined,
      eventEmitter,
    );
    statisticsInfo.unref("getGenesisBlock");
    const _genesisBlock = genesisBlock.toJSON();
    const __genesisBlock = await core.block.recombineBlock(_genesisBlock);
    await core.block.getBlockFactoryFromHeight(__genesisBlock.height).verify(__genesisBlock);
    await core.blockHelper.verifyBlockSignature(__genesisBlock, {
      taskLabel: "self genesis Block",
    });
    const blockJson = genesisBlock.toJSON();
    await core.block.recombineBlock(blockJson);
    if (out) {
      require("fs").writeFileSync(defaultGenesisBlockPath, JSON.stringify(blockJson, null, 2));
      console.log(`Genesis block save to: ${defaultGenesisBlockPath}`);
    } else {
      // dump(genesisBlock.toJSON());
    }
  }

  //#region 开始测试

  await getGenesisBlockAsync();
  //#endregion
})();
