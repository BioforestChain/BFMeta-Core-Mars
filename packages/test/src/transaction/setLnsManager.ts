import {
  SetLnsManagerTransaction,
  SetLnsManagerTransactionFactory,
  RANGE_TYPE,
  BFChainCore,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  AccountModel,
  getRandomDAppid,
  getBfchainCoreEntry,
} from "../include";

async function getSetLnsManagerTransaction(sender: AccountModel, bfchainCore: BFChainCore) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,

    subEnvParams: {},
    type: bfchainCore.transactionHelper.SET_LNS_MANAGER, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    maxFee: "100000000",
    recipientId: getGenesisAccount().address,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    storage: {
      key: "name",
      value: bfchainCore.config.genesisLocationName,
    },

    fee: "78622", // 交易手续费
    timestamp: 770880, // 生成交易时间戳
    sourceIP: "127.0.0.1", // 交易来源 ip
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
  const trs = await bfchainCore.transaction.createTransaction<SetLnsManagerTransaction>(
    SetLnsManagerTransactionFactory,
    data,
    {
      lnsManager: {
        name: bfchainCore.config.genesisLocationName,
        sourceChainName: bfchainCore.config.chainName,
        sourceChainMagic: bfchainCore.config.magic,
      },
    },
    keypair,
    secondKeypair,
  );
  console.log(trs.toJSON());
}
(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  await getSetLnsManagerTransaction(getSenderWithSecondSecret(), bfchainCore);
  await getSetLnsManagerTransaction(getSenderWithoutSecondSecret(), bfchainCore);
})();
