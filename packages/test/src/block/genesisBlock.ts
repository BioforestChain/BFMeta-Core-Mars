require("source-map-support").install();
import {
  NodeJsCryptoHelper,
  NodeJsKeypairHelper,
  TransactionInBlock,
  GenesisBlockFactory,
  GenesisBlock,
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
  IssueEntityFactoryTransactionFactoryV1,
  IssueEntityFactoryModel,
  IssueEntityTransactionFactory,
  IssueEntityFactoryTransactionV1,
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
  .default("b", 50)
  .default("f", 15)
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
  generatorsSecret: (require(defaultSecretPath).genesisGenerators as string[]).slice(0, 100),
};
mainChainAssetData.blockPerRound = blockPerRound;
mainChainAssetData.forgeInterval = forgeInterval;

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
core.moduleMap.set("transactionGetterHelper", {});

const statistics = Resolve(BlockBaseStatisticsHelper, core.moduleMap);

type GeneratorInfo = {
  address: string;
  secret: string;
  publicKey: string;
  secondSecret?: string;
};

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
      );
    };
    let trs = await createTrs();
    trs = await createTrs(
      core.transactionHelper.calcTransactionMinFee(trs, trs.getBytes().length).toString(),
    );
    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }
  async function getTransferAssetTransaction(recipient: GeneratorInfo, amount: string) {
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
      );
    };
    let trs = await createTrs();
    trs = await createTrs(
      core.transactionHelper.calcTransactionMinFee(trs, trs.getBytes().length).toString(),
    );
    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }
  async function getIssueEntityFactoryTransaction(factoryId: string, entityPrealnum: string) {
    const createTrs = (fee = "AUTO") => {
      return core.transaction.createTransaction(
        IssueEntityFactoryTransactionFactoryV1,
        {
          version: core.config.version,
          type: core.transactionHelper.ISSUE_ENTITY_FACTORY_V1, // 交易类型
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
            key: "factoryId",
            value: factoryId,
          },
        },
        {
          issueEntityFactory: {
            sourceChainName: core.config.chainName,
            sourceChainMagic: core.config.magic,
            factoryId: factoryId,
            entityPrealnum,
            entityFrozenAssetPrealnum: "0",
            purchaseAssetPrealnum: "0",
          },
        },
        genesisAccountKeypair,
        undefined,
        undefined,
      );
    };
    let trs = await createTrs();
    trs = await createTrs(
      core.transactionHelper.calcTransactionMinFee(trs, trs.getBytes().length).toString(),
    );
    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }
  async function getIssueEntityTransaction(
    generator: GeneratorInfo,
    factory: IssueEntityFactoryModel,
    index: string,
  ) {
    const entityId = `${factory.factoryId}_${factory.factoryId}${index}`;
    const createTrs = (fee = "AUTO") => {
      return core.transaction.createTransaction(
        IssueEntityTransactionFactory,
        {
          version: core.config.version,
          type: core.transactionHelper.ISSUE_ENTITY, // 交易类型
          senderId: generator.address, // 发起者地址
          senderPublicKey: generator.publicKey, // 发起者公钥
          recipientId: generator.address,
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
            key: "entityId",
            value: entityId,
          },
        },
        {
          issueEntity: {
            sourceChainName: core.config.chainName,
            sourceChainMagic: core.config.magic,
            entityId,
            entityFactoryPossessor: genesisAccountInfo.address,
            entityFactory: factory,
            taxAssetPrealnum: "0",
          },
        },
        genesisAccountKeypair,
        undefined,
        undefined,
      );
    };
    let trs = await createTrs();
    trs = await createTrs(
      core.transactionHelper.calcTransactionMinFee(trs, trs.getBytes().length).toString(),
    );
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
    const forgingEntityFactory = await getIssueEntityFactoryTransaction("forge", "1000");
    txWithIndexList.push(forgingEntityFactory);
    txWithIndexList.push(await getIssueEntityFactoryTransaction("share", "10000"));
    const generatorsSecret = config.generatorsSecret.slice(0, core.config.blockPerRound * 2);
    const eventEmitter: BFChainCore.ApplyTransactionEventEmitter<any> =
      new QueneEventEmitter<any>();
    eventEmitter.blockRewardsGetter = async (height: number) => {
      return core.config.basicRewards;
    };
    let entityIndex = 0;
    const getEntityIndex = () => {
      entityIndex++;
      return "0".repeat(4 - entityIndex.toString().length) + entityIndex;
    };
    for (let i = 0; i < generatorsSecret.length; i++) {
      const secret = generatorsSecret[i];
      const address = await core.accountBaseHelper.getAddressFromSecret(secret);
      if (mainChainAssetData.nextRoundGenerators.length < core.config.blockPerRound) {
        mainChainAssetData.nextRoundGenerators.push({
          address,
          numberOfForgeEntities: 0,
        });
      }
      const publicKey = await core.accountBaseHelper.getPublicKeyStringFromSecret(secret);
      const generator: GeneratorInfo = {
        secret,
        address,
        publicKey,
      };
      // 要在创始块中实施的交易
      const tempTrsWithIndexList: {
        index: number;
        trs: Transaction;
      }[] = [];
      for (let i = 0; i < 4; i++) {
        tempTrsWithIndexList.push(
          await getIssueEntityTransaction(
            generator,
            forgingEntityFactory.trs.asset.issueEntityFactory,
            getEntityIndex(),
          ),
        );
      }
      // 实施这些交易需要的手续费由创始账户给予
      const total_fee = tempTrsWithIndexList.reduce(
        (acc_fee, twi) => (BigInt(twi.trs.fee) + BigInt(acc_fee)).toString(),
        "0",
      );
      if (total_fee !== "0") {
        txWithIndexList.push(await getTransferAssetTransaction(generator, total_fee));
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
      const result = await yy.checkTrsFeeAndWebFee(
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
    let totalRewards = BigInt(core.config.basicRewards);
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
      totalRewards += BigInt(fee);
      if (type === transactionHelper.TRANSFER_ASSET) {
        const amount = (trs as TransferAssetTransaction).asset.transferAsset.amount;
        setAccountAsset(magic, senderId, assetType, `-${amount}`);
        setAccountAsset(magic, recipientId as string, assetType, amount);
      }
      if (type === transactionHelper.ISSUE_ENTITY_FACTORY_V1) {
        const destoryAmount = core.transactionHelper.calcDestroyMainAssetsOfIsseuEntityFactory(
          (trs as IssueEntityFactoryTransactionV1).asset.issueEntityFactory.entityPrealnum,
        );
        setAccountAsset(magic, senderId, assetType, `-${destoryAmount}`);
      }
    }
    setAccountAsset(magic, genesisAccountInfo.address, assetType, totalRewards.toString());
    const assetChangeHash = await core.blockHelper.calcAssetChangeHash(accountsAssets);
    const genesisBlock = await core.block.generateBlock(
      GenesisBlockFactory,
      {
        version: core.config.version,
        height,
        timestamp: 0,
        generatorPublicKey: genesisAccountInfo.publicKey,
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
    const factory = core.block.getBlockFactoryFromHeight(__genesisBlock.height);
    factory.commonBlockVerify.verifyBlockSize(__genesisBlock);
    await factory.verify(__genesisBlock);
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
