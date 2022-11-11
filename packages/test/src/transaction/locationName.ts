import {
  LocationNameTransaction,
  LocationNameTransactionFactory,
  RANGE_TYPE,
  LOCATION_NAME_OPERATION_TYPE,
  BFChainCore,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppid,
  getGenesisAccount,
} from "../include";

const genesisAddress = getGenesisAccount().address;
async function getLocationNameTransaction(sender: AccountModel, bfchainCore: BFChainCore) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,

    subEnvParams: {},
    type: bfchainCore.transactionHelper.LOCATION_NAME, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    maxFee: "100000000",
    recipientId: sender.address,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    storage: {
      key: "name",
      value: `q_w_q.ibt.${bfchainCore.config.chainName}`,
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
  const trs = await bfchainCore.transaction.createTransaction<LocationNameTransaction>(
    LocationNameTransactionFactory,
    data,
    {
      locationName: {
        name: `q_w_q.ibt.${bfchainCore.config.chainName}`,
        sourceChainName: "bfchain",
        sourceChainMagic: bfchainCore.config.magic,
        operationType: LOCATION_NAME_OPERATION_TYPE.REGISTRATION,
      },
    },
    keypair,
    secondKeypair,
  );
  console.log(trs.toJSON());
}
(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  await getLocationNameTransaction(getSenderWithSecondSecret(), bfchainCore);
  await getLocationNameTransaction(getSenderWithoutSecondSecret(), bfchainCore);
})();
