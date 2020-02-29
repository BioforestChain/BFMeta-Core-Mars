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
(async () => {
  async function getUsernameTransaction(sender: DelegateInfo) {
    const keypair = await subBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const secondKeypair =
      (sender.secondSecret &&
        (await subBfchainCore.accountBaseHelper.createSecondSecretKeypair(
          sender.secret,
          sender.secondSecret,
        ))) ||
      undefined;
    const pow =
      1 > subBfchainCore.config.powOfWorkExemptionBlocks ? getPOWInfo(sender.address) : undefined;
    const createTrs = (fee = "1") => {
      return subBfchainCore.transaction.createTransaction<UsernameTransaction>(
        UsernameTransactionFactory,
        {
          version: 1,
          type: subBfchainCore.transactionHelper.USERNAME, // 交易类型
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
          fromMagic: subBfchainCore.config.magic, // 交易来源链的 magic
          toMagic: subBfchainCore.config.magic, // 交易去往链的 magic
          applyBlockHeight: 1, // 交易发起高度
          numberOfEffectiveBlocks: 1,
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
    let trs = await createTrs();
    if (pow) {
      trs = await subBfchainCore.transaction.transactionPowCalculator(
        trs,
        pow,
        keypair,
        secondKeypair,
      );
    }
    return await createTrs(
      subBfchainCore.transactionHelper.calcTransactionFee(
        trs,
        subBfchainCore.config.minTransactionFeePerByte,
      ),
    );
  }

  async function getDelegateTransaction(sender: DelegateInfo) {
    const keypair = await subBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const secondKeypair =
      (sender.secondSecret &&
        (await subBfchainCore.accountBaseHelper.createSecondSecretKeypair(
          sender.secret,
          sender.secondSecret,
        ))) ||
      undefined;
    const pow =
      1 > subBfchainCore.config.powOfWorkExemptionBlocks ? getPOWInfo(sender.address) : undefined;
    const createTrs = (fee = "1") => {
      return subBfchainCore.transaction.createTransaction(
        DelegateTransactionFactory,
        {
          version: 1,
          type: subBfchainCore.transactionHelper.DELEGATE, // 交易类型
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
          fromMagic: subBfchainCore.config.magic, // 交易来源链的 magic
          toMagic: subBfchainCore.config.magic, // 交易去往链的 magic
          applyBlockHeight: 1, // 交易发起高度
          numberOfEffectiveBlocks: 1,
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
    let trs = await createTrs();
    if (pow) {
      trs = await subBfchainCore.transaction.transactionPowCalculator(
        trs,
        pow,
        keypair,
        secondKeypair,
      );
    }
    return await createTrs(
      subBfchainCore.transactionHelper.calcTransactionFee(
        trs,
        subBfchainCore.config.minTransactionFeePerByte,
      ),
    );
  }

  async function getAcceptVoteTransaction(sender: DelegateInfo) {
    const keypair = await subBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const secondKeypair =
      (sender.secondSecret &&
        (await subBfchainCore.accountBaseHelper.createSecondSecretKeypair(
          sender.secret,
          sender.secondSecret,
        ))) ||
      undefined;
    const pow =
      1 > subBfchainCore.config.powOfWorkExemptionBlocks ? getPOWInfo(sender.address) : undefined;
    const createTrs = (fee = "1") => {
      return subBfchainCore.transaction.createTransaction<AcceptVoteTransaction>(
        AcceptVoteTransactionFactory,
        {
          version: 1,
          type: subBfchainCore.transactionHelper.ACCEPT_VOTE, // 交易类型
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
          fromMagic: subBfchainCore.config.magic, // 交易来源链的 magic
          toMagic: subBfchainCore.config.magic, // 交易去往链的 magic
          applyBlockHeight: 1, // 交易发起高度
          numberOfEffectiveBlocks: 1,
        },
        {},
        keypair,
        secondKeypair,
      );
    };
    let trs = await createTrs();
    if (pow) {
      trs = await subBfchainCore.transaction.transactionPowCalculator(
        trs,
        pow,
        keypair,
        secondKeypair,
      );
    }
    return await createTrs(
      subBfchainCore.transactionHelper.calcTransactionFee(
        trs,
        subBfchainCore.config.minTransactionFeePerByte,
      ),
    );
  }

  async function getLocationNameTransaction() {
    const pow =
      1 > subBfchainCore.config.powOfWorkExemptionBlocks
        ? getPOWInfo(genesisAccountInfo.address)
        : undefined;
    const createTrs = (fee = "AUTO") => {
      return subBfchainCore.transaction.createTransaction(
        LocationNameTransactionFactory,
        {
          version: 1,
          type: subBfchainCore.transactionHelper.LOCATION_NAME, // 交易类型
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
          fromMagic: subBfchainCore.config.magic, // 交易来源链的 magic
          toMagic: subBfchainCore.config.magic, // 交易去往链的 magic
          applyBlockHeight: 1, // 交易发起高度
          numberOfEffectiveBlocks: 1,
          remark: {},
          storage: {
            key: "name",
            value: `bnqkl.${subBfchainCore.config.chainName}`,
          },
        },
        {
          locationName: {
            sourceChainName: subBfchainCore.config.chainName,
            sourceChainMagic: subBfchainCore.config.magic,
            name: `bnqkl.${subBfchainCore.config.chainName}`,
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
      trs = await subBfchainCore.transaction.transactionPowCalculator(
        trs,
        pow,
        genesisAccountKeypair,
        undefined,
      );
    }
    return await createTrs(
      subBfchainCore.transactionHelper.calcTransactionFee(
        trs,
        subBfchainCore.config.minTransactionFeePerByte,
      ),
    );
  }

  async function getSetLnsRecordValueTransaction(
    sender: DelegateInfo,
    record: BFChainCore.LocationNameRecordJSON,
  ) {
    const keypair = await subBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const secondKeypair =
      (sender.secondSecret &&
        (await subBfchainCore.accountBaseHelper.createSecondSecretKeypair(
          sender.secret,
          sender.secondSecret,
        ))) ||
      undefined;
    const pow =
      1 > subBfchainCore.config.powOfWorkExemptionBlocks ? getPOWInfo(sender.address) : undefined;
    const createTrs = (fee = "AUTO") => {
      return subBfchainCore.transaction.createTransaction(
        SetLnsRecordValueTransactionFactory,
        {
          version: 1,
          type: subBfchainCore.transactionHelper.SET_LNS_RECORD_VALUE, // 交易类型
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
          fromMagic: subBfchainCore.config.magic, // 交易来源链的 magic
          toMagic: subBfchainCore.config.magic, // 交易去往链的 magic
          applyBlockHeight: 1, // 交易发起高度
          numberOfEffectiveBlocks: 1,
          remark: {},
          storage: {
            key: "name",
            value: `bnqkl.${subBfchainCore.config.chainName}`,
          },
        },
        {
          lnsRecordValue: {
            sourceChainName: subBfchainCore.config.chainName,
            sourceChainMagic: subBfchainCore.config.magic,
            name: `bnqkl.${subBfchainCore.config.chainName}`,
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
      trs = await subBfchainCore.transaction.transactionPowCalculator(
        trs,
        pow,
        keypair,
        secondKeypair,
      );
    }
    return await createTrs(
      subBfchainCore.transactionHelper.calcTransactionFee(
        trs,
        subBfchainCore.config.minTransactionFeePerByte,
      ),
    );
  }

  const genesisAccountKeypair = await subBfchainCore.accountBaseHelper.createSecretKeypair(
    config.genesisSecret,
  );
  const genesisAccountInfo = {
    address: await subBfchainCore.accountBaseHelper.getAddressFromPublicKey(
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
      1 > subBfchainCore.config.powOfWorkExemptionBlocks
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
          fromMagic: subBfchainCore.config.magic, // 交易来源链的 magic
          toMagic: subBfchainCore.config.magic, // 交易去往链的 magic
          applyBlockHeight: 1, // 交易发起高度
          numberOfEffectiveBlocks: 1,
          remark: { remark: "交易备注，任意信息，这个是转账交易" }, // 交易备注，任意信息
          storage: {
            key: "assetType",
            value: subBfchainCore.config.assetType,
          },
        },
        {
          transferAsset: {
            sourceChainName: subBfchainCore.config.chainName,
            sourceChainMagic: subBfchainCore.config.magic,
            assetType: subBfchainCore.config.assetType,
            amount,
          },
        },
        genesisAccountKeypair,
      );
    };
    let trs = await createTrs();
    if (pow) {
      trs = await subBfchainCore.transaction.transactionPowCalculator(
        trs,
        pow,
        genesisAccountKeypair,
        undefined,
      );
    }
    return await createTrs(
      subBfchainCore.transactionHelper.calcTransactionFee(
        trs,
        subBfchainCore.config.minTransactionFeePerByte,
      ),
    );
  }

  async function getGenesisBlockAsync() {
    const generatorPublicKey = await subBfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(
      config.genesisSecret,
    );
    //#region 模拟账户表的变更
    const subchainAccountAssetMap = new Map<string, bigint>();
    subchainAccountAssetMap.set(
      `${genesisAccountInfo.address}_${subBfchainCore.config.magic}_${subBfchainCore.config.assetType}`,
      BigInt(subBfchainCore.config.genesisBlock.remark.generateTotalAmount),
    );

    function getSubchainAccountAssetKey(address: string, magic: string, assetType: string) {
      return `${address}_${magic}_${assetType}`;
    }

    function setSubchainAccountAsset(key: string, assetNumber: bigint) {
      const remainAsset = subchainAccountAssetMap.get(key);
      if (remainAsset) {
        subchainAccountAssetMap.set(key, remainAsset + assetNumber);
      } else {
        subchainAccountAssetMap.set(key, assetNumber);
      }
    }

    function getAccountAsset(key: string) {
      const assetNumber = subchainAccountAssetMap.get(key);
      return assetNumber ? assetNumber.toString() : "0";
    }
    //#endregion
    const txs: Transaction[] = [];
    txs.push(await getLocationNameTransaction());
    const delegatesSecret = config.delegatesSecret;
    const ips = getIps(delegatesSecret.length, false, defaultIpsPath);
    for (let i = 0; i < delegatesSecret.slice(5).length; i++) {
      const secret = delegatesSecret[i];
      const address = await subBfchainCore.accountBaseHelper.getAddressFromSecret(secret);
      subchainRemarkData.newDelegates.push(address);
      if (subchainRemarkData.nextRoundDelegates.length < subBfchainCore.config.blockPerRound) {
        subchainRemarkData.nextRoundDelegates.push({
          address,
          equity: "0",
        });
      }
      const publicKey = await subBfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(secret);
      const delegate: DelegateInfo = {
        secret,
        address,
        publicKey,
        username: `${subBfchainCore.config.chainName}${i + 1}`,
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
        txs.push(await getTransferAssetTransaction(subBfchainCore, delegate, total_fee));
      }
      txs.push(...trsList);
    }

    const height = 1;
    const blockTrsItems: TransactionInBlock[] = [];
    const eventEmitter: BFChainCore.ApplyTransactionEventEmitter<any> = new QueneEventEmitter<
      any
    >();
    const statisticsInfo = subStatistics.forceGetStatisticsInfoByBlock(
      height,
      "generateSubchainGenesisBlock",
    );
    subStatistics.bindApplyTransactionEventEmiter(eventEmitter, statisticsInfo);
    for (let i = 0; i < txs.length; i++) {
      const { senderId, recipientId, fee, fromMagic, type } = txs[i];
      let assetType = subBfchainCore.config.assetType;
      let amount = "0";
      if (type === subBfchainCore.transactionHelper.TRANSFER_ASSET) {
        amount = (txs[i] as TransferAssetTransaction).asset.transferAsset.amount;
      }
      const chainAssetInfo = subBfchainCore.chainAssetInfoHelper.getAssetInfo(fromMagic, assetType);
      statisticsInfo.initAssetStatistic(chainAssetInfo, statisticsInfo.assetStatisticCount);
      const assetChanges: {
        accountType: number;
        magic: string;
        assetType: string;
        assetNumber: string;
      }[] = [];
      const key = getSubchainAccountAssetKey(senderId, fromMagic, assetType);
      const totalSpend = BigInt("-" + amount) + BigInt("-" + fee);
      setSubchainAccountAsset(key, totalSpend);
      assetChanges[assetChanges.length] = {
        accountType: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE.SENDER,
        magic: fromMagic,
        assetType,
        assetNumber: getAccountAsset(key),
      };
      if (recipientId) {
        const rkey = getSubchainAccountAssetKey(recipientId, fromMagic, assetType);
        setSubchainAccountAsset(rkey, BigInt(amount));
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
    const generatorKeypair = await subBfchainCore.accountBaseHelper.createSecretKeypair(
      config.genesisSecret,
    );
    eventEmitter.on("verifyTransactionProfOfWork", ({ transaction, count }) => {
      return subBfchainCore.transactionHelper.checkTransactionProfOfWork(
        transaction.signatureBuffer,
        count,
        "0",
      );
    });
    subchainRemarkData.parentGenesisBlock = fullBfchainCore.config.genesisBlock;
    const genesisBlock = await subBfchainCore.block.generateBlock<GenesisBlock>(
      GenesisBlockFactory,
      {
        version: 1,
        height: 1,
        timestamp: 0,
        generatorPublicKey,
        previousBlockSignature: "",
      },
      subchainRemarkData,
      (async function* zz() {
        for (let item of blockTrsItems) {
          yield item;
        }
      })(),
      generatorKeypair,
      eventEmitter,
    );
    statisticsInfo.unref("generateSubchainGenesisBlock");

    const out = require("optimist").argv.out;
    if (out) {
      const { resolve } = require("path");
      const outFilePath =
        out === true
          ? resolve(process.cwd(), "./assets/subGenesisBlock.json")
          : resolve(process.cwd(), out);
      require("fs").writeFileSync(outFilePath, JSON.stringify(genesisBlock.toJSON(), null, 2));
      console.log(`Genesis block save to: ${outFilePath}`);
    }

    return genesisBlock;
  }

  async function getIssueSubchainTransaction(sender: AccountModel) {
    const keypair = await fullBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
    const data: BFChainCore.TxBodyJSON = {
      version: 1,
      type: fullBfchainCore.transactionHelper.ISSUE_SUBCHAIN, // 交易类型
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
      numberOfEffectiveBlocks: 100,
      storage: {
        key: "magic",
        value: subBfchainCore.config.magic,
      },
    };

    let secondKeypair;
    if (sender.secondSecret) {
      secondKeypair = await fullBfchainCore.accountBaseHelper.createSecondSecretKeypair(
        sender.secret,
        sender.secondSecret,
      );
      data.senderSecondPublicKey = await fullBfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
        sender.secret,
        sender.secondSecret,
      );
    }

    const genesisBlock = await getGenesisBlockAsync();
    const trs = await fullBfchainCore.transaction.createTransaction<IssueSubchainTransaction>(
      IssueSubchainTransactionFactory,
      data,
      {
        issueSubchain: {
          ...subchainRemarkData,
          genesisBlock: genesisBlock,
        },
      },
      keypair,
      secondKeypair,
    );

    const trsJson = trs.toJSON();
    console.log((trsJson as any).asset.issueSubchain.genesisBlock.transactions[0]);
    const xx = fullBfchainCore.transaction.recombineTransaction(trsJson);
    await fullBfchainCore.transactionHelper.verifyTransactionSignature(xx);

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
    const trs = await getIssueSubchainTransaction(sender);
    const height = 7;
    const blockTrsItems: TransactionInBlock[] = [];
    const eventEmitter: BFChainCore.ApplyTransactionEventEmitter<any> = new QueneEventEmitter<
      any
    >();
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
    const generatorPublicKey = await fullBfchainCore.accountBaseHelper.getPublicKeyStringFromSecret(
      sender.secret,
    );
    const generatorKeypair = await fullBfchainCore.accountBaseHelper.createSecretKeypair(
      sender.secret,
    );
    eventEmitter.on("verifyTransactionProfOfWork", ({ transaction, count }) => {
      return subBfchainCore.transactionHelper.checkTransactionProfOfWork(
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

  try {
    // await getRegisterChainTransaction(getSenderWithSecondSecret());
    // await getRegisterChainTransaction(getSenderWithoutSecondSecret());
    const xx = await getCommonBlockAsync(getSenderWithoutSecondSecret());
    console.log(xx.transactions[0].transactionAssetChanges.map(item => item.getBytes()));
  } catch (e) {
    console.log(e);
  }
})();
