import {
  IssueEntityFactoryTransaction,
  IssueEntityFactoryTransactionFactory,
  IssueEntityMultiTransactionV1,
  IssueEntityMultiTransactionFactoryV1,
  RANGE_TYPE,
  BFChainCore,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppid,
  getRecipientWithSecondSecret,
  getRecipientWithoutSecondSecret,
} from "../include";

const genesisAddress = getGenesisAccount().address;
async function getIssueEntityFactoryTransaction(sender: AccountModel, bfchainCore: BFChainCore) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,

    type: bfchainCore.transactionHelper.ISSUE_ENTITY_FACTORY, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: genesisAddress,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 资产创世账户地址
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisBlock.asset.genesisAsset.genesisLocationName,
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    storage: {
      key: "factoryId",
      value: "skyrim",
    },

    fee: "666", // 交易手续费
    timestamp: 770880, // 生成交易时间戳
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    sourceIP: "127.0.0.1", // 交易来源 ip
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
  const trs = await bfchainCore.transaction.createTransaction<IssueEntityFactoryTransaction>(
    IssueEntityFactoryTransactionFactory,
    data,
    {
      issueEntityFactory: {
        sourceChainName: bfchainCore.config.chainName,
        sourceChainMagic: bfchainCore.config.magic,
        factoryId: "skyrim",
        entityPrealnum: "88888888",
        entityFrozenAssetPrealnum: "88888888",
        purchaseAssetPrealnum: "88888888",
      },
    },
    keypair,
    secondKeypair,
  );
  await bfchainCore.transaction.getTransactionFactoryFromType(trs.type).verify(trs);
  return trs.toJSON();
}

async function getIssueEntityTransaction(
  sender: AccountModel,
  entityFactory: BFChainCore.IssueEntityFactoryJSON,
  bfchainCore: BFChainCore,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.ISSUE_ENTITY_MULTI, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: sender.address,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 资产创世账户地址
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisBlock.asset.genesisAsset.genesisLocationName,
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    storage: {
      key: "factoryId",
      value: entityFactory.factoryId,
    },

    fee: "666", // 交易手续费
    timestamp: 770880, // 生成交易时间戳
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    sourceIP: "127.0.0.1", // 交易来源 ip
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
  const trs = await bfchainCore.transaction.createTransaction<IssueEntityMultiTransactionV1>(
    IssueEntityMultiTransactionFactoryV1,
    data,
    {
      issueEntityMulti: {
        sourceChainName: bfchainCore.config.chainName,
        sourceChainMagic: bfchainCore.config.magic,
        entityStructList: [
          {
            entityId: `m_${entityFactory.factoryId}_dragonborn`,
            taxAssetPrealnum: "0",
          },
        ],
        entityFactoryPossessor: genesisAddress,
        entityFactory,
      },
    },
    keypair,
    secondKeypair,
  );

  await bfchainCore.transaction.getTransactionFactoryFromType(trs.type).verify(trs);

  const yy =
    bfchainCore.transactionLogicVerifier.getTransactionLogicVerifierFromType<IssueEntityMultiTransactionV1>(
      trs.type,
    );

  await yy.verify(trs, 10, {} as any, {} as any, {} as any, false);

  console.log(trs.toJSON());
}

(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  const entityFactoryTrs1 = await getIssueEntityFactoryTransaction(
    getRecipientWithSecondSecret(),
    bfchainCore,
  );
  const entityFactoryTrs2 = await getIssueEntityFactoryTransaction(
    getRecipientWithoutSecondSecret(),
    bfchainCore,
  );

  await getIssueEntityTransaction(
    getSenderWithSecondSecret(),
    entityFactoryTrs1.asset.issueEntityFactory,
    bfchainCore,
  );
  await getIssueEntityTransaction(
    getSenderWithoutSecondSecret(),
    entityFactoryTrs2.asset.issueEntityFactory,
    bfchainCore,
  );
})();
