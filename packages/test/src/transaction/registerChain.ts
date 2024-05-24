import {
  RegisterChainTransaction,
  RegisterChainTransactionFactory,
  TransactionInBlock,
  GenesisBlockFactory,
  GenesisBlock,
  Transaction,
  BFChainCore,
  BlockBaseStatisticsHelper,
  CommonBlock,
  CommonBlockFactory,
  TransferAssetTransaction,
  TransferAssetTransactionFactory,
  RANGE_TYPE,
  LocationNameTransactionFactory,
  LOCATION_NAME_OPERATION_TYPE,
  BFChainCoreFactory,
  ConfigHelper,
  IssueEntityFactoryTransactionFactoryV1,
  IssueEntityFactoryModel,
  IssueEntityTransactionFactory,
  IssueEntityFactoryTransactionV1,
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
  getRandomDAppId,
} from "../include";

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

registerchainAssetData.blockPerRound = 5;

(async () => {
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

  // #region
  async function getLocationNameTransaction(
    registerBfchainCore: BFChainCore,
    genesisAccountInfo: {
      address: string;
      publicKey: string;
      publicKeyBuffer: Buffer;
    },
    genesisAccountKeypair: BFChainCore.Keypair,
  ) {
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
      );
    };
    let trs = await createTrs();
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
  async function getTransferAssetTransaction(
    recipient: GeneratorInfo,
    amount: string,
    genesisAccountInfo: {
      address: string;
      publicKey: string;
      publicKeyBuffer: Buffer;
    },
    genesisAccountKeypair: BFChainCore.Keypair,
    registerBfchainCore: BFChainCore,
  ) {
    const createTrs = (fee = "1") => {
      return registerBfchainCore.transaction.createTransaction(
        TransferAssetTransactionFactory,
        {
          version: registerBfchainCore.config.version,
          type: registerBfchainCore.transactionHelper.TRANSFER_ASSET, // 交易类型
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
  async function getIssueEntityFactoryTransaction(
    genesisAccountInfo: {
      address: string;
      publicKey: string;
      publicKeyBuffer: Buffer;
    },
    genesisAccountKeypair: BFChainCore.Keypair,
    factoryId: string,
    entityPrealnum: string,
    registerBfchainCore: BFChainCore,
  ) {
    const createTrs = (fee = "AUTO") => {
      return registerBfchainCore.transaction.createTransaction(
        IssueEntityFactoryTransactionFactoryV1,
        {
          version: registerBfchainCore.config.version,
          type: registerBfchainCore.transactionHelper.ISSUE_ENTITY_FACTORY_V1, // 交易类型
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
            key: "factoryId",
            value: factoryId,
          },
        },
        {
          issueEntityFactory: {
            sourceChainName: registerBfchainCore.config.chainName,
            sourceChainMagic: registerBfchainCore.config.magic,
            factoryId,
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
      registerBfchainCore.transactionHelper
        .calcTransactionMinFee(trs, trs.getBytes().length)
        .toString(),
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
    genesisAccountInfo: {
      address: string;
      publicKey: string;
      publicKeyBuffer: Buffer;
    },
    genesisAccountKeypair: BFChainCore.Keypair,
    registerBfchainCore: BFChainCore,
  ) {
    const entityId = `${factory.factoryId}_${factory.factoryId}${index}`;
    const createTrs = (fee = "AUTO") => {
      return registerBfchainCore.transaction.createTransaction(
        IssueEntityTransactionFactory,
        {
          version: registerBfchainCore.config.version,
          type: registerBfchainCore.transactionHelper.ISSUE_ENTITY, // 交易类型
          senderId: generator.address, // 发起者地址
          senderPublicKey: generator.publicKey, // 发起者公钥
          recipientId: generator.address,
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
            key: "entityId",
            value: entityId,
          },
        },
        {
          issueEntity: {
            sourceChainName: registerBfchainCore.config.chainName,
            sourceChainMagic: registerBfchainCore.config.magic,
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
      registerBfchainCore.transactionHelper
        .calcTransactionMinFee(trs, trs.getBytes().length)
        .toString(),
    );
    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }
  // #endregion

  async function getGenesisBlockAsync(registerBfchainCore: BFChainCore) {
    const registerStatistics = Resolve(BlockBaseStatisticsHelper, registerBfchainCore.moduleMap);

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

    const txWithIndexList: { index: number; trs: Transaction }[] = [];
    txWithIndexList.push(
      await getLocationNameTransaction(
        registerBfchainCore,
        genesisAccountInfo,
        genesisAccountKeypair,
      ),
    );
    const entityFactory = await getIssueEntityFactoryTransaction(
      genesisAccountInfo,
      genesisAccountKeypair,
      "forge",
      "1000",
      registerBfchainCore,
    );
    txWithIndexList.push(entityFactory);
    txWithIndexList.push(
      await getIssueEntityFactoryTransaction(
        genesisAccountInfo,
        genesisAccountKeypair,
        "share",
        "10000",
        registerBfchainCore,
      ),
    );
    let entityIndex = 0;
    const getEntityIndex = () => {
      entityIndex++;
      return "0".repeat(4 - entityIndex.toString().length) + entityIndex;
    };
    const generatorsSecret = config.generatorsSecret.slice(
      0,
      registerBfchainCore.config.blockPerRound * 2,
    );
    for (let i = 0; i < generatorsSecret.length; i++) {
      const secret = generatorsSecret[i];
      const address = await registerBfchainCore.accountBaseHelper.getAddressFromSecret(secret);
      if (
        registerchainAssetData.nextRoundGenerators.length < registerBfchainCore.config.blockPerRound
      ) {
        registerchainAssetData.nextRoundGenerators.push({
          address,
          numberOfForgeEntities: 0,
        });
      }
      const publicKey = await registerBfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(
        secret,
      );
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
            entityFactory.trs.asset.issueEntityFactory,
            getEntityIndex(),
            genesisAccountInfo,
            genesisAccountKeypair,
            registerBfchainCore,
          ),
        );
      }
      // 实施这些交易需要的手续费由创始账户给予
      const total_fee = tempTrsWithIndexList.reduce(
        (acc_fee, twi) => (BigInt(twi.trs.fee) + BigInt(acc_fee)).toString(),
        "0",
      );
      if (total_fee !== "0") {
        txWithIndexList.push(
          await getTransferAssetTransaction(
            generator,
            total_fee,
            genesisAccountInfo,
            genesisAccountKeypair,
            registerBfchainCore,
          ),
        );
      }
      txWithIndexList.push(...tempTrsWithIndexList);
    }

    const height = 1;
    const blockTrsItems: TransactionInBlock[] = [];
    const eventEmitter: BFChainCore.ApplyTransactionEventEmitter<any> =
      new QueneEventEmitter<any>();
    eventEmitter.blockRewardsGetter = async (height: number) => {
      const diff =
        BigInt(registerBfchainCore.config.maxSupply) -
        BigInt(registerBfchainCore.config.genesisAmount);
      const basicRewards = BigInt(registerBfchainCore.config.basicRewards);
      return diff > BigInt(0)
        ? diff >= basicRewards
          ? basicRewards.toString()
          : diff.toString()
        : "0";
    };
    const taskname = (eventEmitter.taskname = `test-registerChainGenesisBlock-${height}`);
    const statisticsInfo = registerStatistics.forceGetStatisticsInfoByBlock(
      taskname,
      "generateRegisterChainGenesisBlock",
    );
    registerStatistics.bindApplyTransactionEventEmiter(eventEmitter, statisticsInfo);
    const { magic, assetType, basicRewards } = registerBfchainCore.config;
    let totalRewards = BigInt(basicRewards);
    setAccountAsset(
      magic,
      genesisAccountInfo.address,
      assetType,
      registerchainAssetData.genesisAmount,
    );
    const transactionHelper = registerBfchainCore.transactionHelper;
    for (let i = 0; i < txWithIndexList.length; i++) {
      const { trs } = txWithIndexList[i];
      const trsInBlock = TransactionInBlock.fromObject({
        tIndex: i,
        height,
        transaction: trs,
      });
      blockTrsItems[blockTrsItems.length] = trsInBlock;
      const { type, senderId, recipientId, fee } = trs;
      setAccountAsset(magic, senderId, assetType, `-${fee}`);
      totalRewards += BigInt(fee);
      if (type === transactionHelper.TRANSFER_ASSET) {
        const amount = (trs as TransferAssetTransaction).asset.transferAsset.amount;
        setAccountAsset(magic, senderId, assetType, `-${amount}`);
        setAccountAsset(magic, recipientId as string, assetType, amount);
      }
      if (type === transactionHelper.ISSUE_ENTITY_FACTORY_V1) {
        const destoryAmount =
          registerBfchainCore.transactionHelper.calcDestroyMainAssetsOfIsseuEntityFactory(
            (trs as IssueEntityFactoryTransactionV1).asset.issueEntityFactory.entityPrealnum,
          );
        setAccountAsset(magic, senderId, assetType, `-${destoryAmount}`);
      }
    }
    setAccountAsset(magic, genesisAccountInfo.address, assetType, totalRewards.toString());
    const generatorKeypair = await registerBfchainCore.accountBaseHelper.createSecretKeypair(
      config.genesisSecret,
    );
    const assetChangeHash = await registerBfchainCore.blockHelper.calcAssetChangeHash(
      accountsAssets,
    );
    const genesisBlock = await registerBfchainCore.block.generateBlock<GenesisBlock>(
      GenesisBlockFactory,
      {
        version: registerBfchainCore.config.version,
        height: 1,
        timestamp: 0,
        generatorPublicKey: genesisAccountInfo.publicKey,
        previousBlockSignature: "",
        remark: {
          QWQ: "人定胜天",
        },
      },
      {
        genesisAsset: { ...registerchainAssetData, assetChangeHash },
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

  async function getRegisterChainTransaction(
    sender: AccountModel,
    fullBfchainCore: BFChainCore,
    registerBfchainCore: BFChainCore,
  ) {
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
      dappid: getRandomDAppId(), // 交易所属的 dappid
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

    const genesisBlock = await getGenesisBlockAsync(registerBfchainCore);
    const bytes = genesisBlock.getBytes();
    const yyy = fullBfchainCore.block.parseBytesToSomeBlock(bytes);
    await fullBfchainCore.blockHelper.verifyBlockSignature(yyy);
    const { generatorPublicKey, signature, asset, transactionInfo } = genesisBlock;
    const { genesisAsset } = asset;
    const certificate =
      await fullBfchainCore.registerChainCertificateHelper.generateRegisterChainCertificate({
        generatorSecret: config.genesisSecret,
        genesisBlockInfo: {
          genesisBlockSignature: signature,
          chainName: genesisAsset.chainName,
          assetType: genesisAsset.assetType,
          magic: genesisAsset.magic,
          bnid: genesisAsset.bnid,
          beginEpochTime: genesisAsset.beginEpochTime,
          genesisLocationName: genesisAsset.genesisLocationName,
          blockPerRound: genesisAsset.blockPerRound,
          forgeInterval: genesisAsset.forgeInterval,
          genesisGenerators: transactionInfo.transactionInBlocks
            .filter(
              (tib) => tib.transaction.type === registerBfchainCore.transactionHelper.ISSUE_ENTITY,
            )
            .map((tib) => {
              return {
                address: tib.transaction.senderId,
                publicKey: tib.transaction.senderPublicKey,
              };
            }),
        },
      });

    const trs = await fullBfchainCore.transaction.createTransaction<RegisterChainTransaction>(
      RegisterChainTransactionFactory,
      data,
      {
        registerChain: {
          genesisBlock: fullBfchainCore.registerChainCertificateHelper.encode(certificate),
        },
      },
      keypair,
      secondKeypair,
    );

    const trsJson = trs.toJSON();
    const xx = await fullBfchainCore.transaction.recombineTransaction(trsJson);
    await fullBfchainCore.transactionHelper.verifyTransactionSignature(xx);

    return {
      index: getTxs(trs.senderId),
      trs,
    };
  }

  async function getCommonBlockAsync(sender: AccountModel) {
    const fullBfchainCore = await getFullBfchainCoreEntry(50, 15);
    fullBfchainCore.moduleMap.set("transactionGetterHelper", {});
    const randomMagic = false;

    if (randomMagic) {
      registerchainAssetData.magic = getRandomMagic();
    }

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
    registerBfchainCore.moduleMap.set("transactionGetterHelper", {});

    const statistics = Resolve(BlockBaseStatisticsHelper, fullBfchainCore.moduleMap);
    const trsWithIndex = await getRegisterChainTransaction(
      sender,
      fullBfchainCore,
      registerBfchainCore,
    );
    const height = 7;
    const blockTrsItems: TransactionInBlock[] = [];
    const eventEmitter: BFChainCore.ApplyTransactionEventEmitter<any> =
      new QueneEventEmitter<any>();
    const statisticsInfo = statistics.forceGetStatisticsInfoByBlock(
      `core-genesisblock-${height}`,
      "generateCommonBlock",
    );
    statistics.bindApplyTransactionEventEmiter(eventEmitter, statisticsInfo);

    const { trs } = trsWithIndex;
    const { fromMagic } = trs;
    const { chainName, assetType } = fullBfchainCore.config;
    const chainAssetInfo = fullBfchainCore.chainAssetInfoHelper.getAssetInfo(
      chainName,
      fromMagic,
      assetType,
    );
    statisticsInfo.initAssetStatistic(chainAssetInfo);
    const trsInBlock = TransactionInBlock.fromObject({
      tIndex: 0,
      height,
    });
    trsInBlock.transaction = trs;
    blockTrsItems[blockTrsItems.length] = trsInBlock;
    const generatorPublicKey = await fullBfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(
      sender.secret,
    );
    const generatorKeypair = await fullBfchainCore.accountBaseHelper.createSecretKeypair(
      sender.secret,
    );
    const commonBlock = await fullBfchainCore.block.generateBlock<CommonBlock>(
      CommonBlockFactory,
      {
        version: fullBfchainCore.config.version,
        height,
        timestamp: 0,
        generatorPublicKey,
        previousBlockSignature:
          "a8b6f856eae3d0cf57ace98d6d5890db6713a2356f06159a5e34e8924431895a2c0b19f1444120a632bf48442a2b033003a262fb78691bdcc4513ca255c57a11",
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
    statisticsInfo.unref("generateCommonBlock");
    await fullBfchainCore.block.getBlockFactoryFromHeight(commonBlock.height).verify(commonBlock);
    // console.log(commonBlock);
    return commonBlock;
  }

  try {
    // await getRegisterChainTransaction(getSenderWithSecondSecret());
    // await getRegisterChainTransaction(getSenderWithoutSecondSecret());
    const xx = await getCommonBlockAsync(getSenderWithoutSecondSecret());
  } catch (e) {
    console.log(e);
  }
})();
