import {
  SetLnsRecordValueTransaction,
  SetLnsRecordValueTransactionFactory,
  RECORD_TYPE,
  RANGE_TYPE,
  RECORD_OPERATION_TYPE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getRandomDAppid,
  AccountModel,
  getBfchainCoreEntry,
} from "../include";

const bfchainCore = getBfchainCoreEntry();

async function getSetLnsRecordValueTransaction(
  sender: AccountModel,
  lnsRecordValue: BFChainCore.SetLnsRecordValueJSON,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.SET_LNS_RECORD_VALUE, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "name",
      value: bfchainCore.config.genesisLocationName,
    },
  };
  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = await bfchainCore.accountBaseHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey = await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
      sender.secret,
      sender.secondSecret,
    );
  }
  const trs = await bfchainCore.transaction.createTransaction<SetLnsRecordValueTransaction>(
    SetLnsRecordValueTransactionFactory,
    data,
    {
      lnsRecordValue,
    },
    keypair,
    secondKeypair,
  );
  console.log(trs.toJSON().asset);
}

const lnsRecordValue: BFChainCore.SetLnsRecordValueJSON = {
  name: bfchainCore.config.genesisLocationName,
  sourceChainName: bfchainCore.config.chainName,
  sourceChainMagic: bfchainCore.config.magic,
  operationType: RECORD_OPERATION_TYPE.ADD,
  addRecord: {
    recordType: RECORD_TYPE.IPV4,
    recordValue: "127.0.0.1",
  },
};
(async () => {
  await getSetLnsRecordValueTransaction(getSenderWithSecondSecret(), lnsRecordValue);
  lnsRecordValue.addRecord = {
    recordType: RECORD_TYPE.ADDRESSV1,
    recordValue: getSenderWithSecondSecret().address,
  };
  await getSetLnsRecordValueTransaction(getSenderWithSecondSecret(), lnsRecordValue);
  lnsRecordValue.operationType = RECORD_OPERATION_TYPE.DELETE;
  delete lnsRecordValue.addRecord;
  lnsRecordValue.deleteRecord = {
    recordType: RECORD_TYPE.IPV6,
    recordValue: "21DA:00D3:0000:2F3B:02AA:00FF:FE28:9C5A",
  };
  await getSetLnsRecordValueTransaction(getSenderWithoutSecondSecret(), lnsRecordValue);
  lnsRecordValue.operationType = RECORD_OPERATION_TYPE.UPDATE;
  lnsRecordValue.addRecord = {
    recordType: RECORD_TYPE.IPV6,
    recordValue: "21DA:00D3:0000:2F3B:02AA:00FF:FE28:9C5A",
  };
  lnsRecordValue.deleteRecord = {
    recordType: RECORD_TYPE.IPV4,
    recordValue: "250.250.250.250",
  };
  await getSetLnsRecordValueTransaction(getSenderWithoutSecondSecret(), lnsRecordValue);
  lnsRecordValue.operationType = RECORD_OPERATION_TYPE.ADD;
  delete lnsRecordValue.deleteRecord;
  lnsRecordValue.addRecord = {
    recordType: RECORD_TYPE.UNKNOWN,
    recordValue: "bbbbbbbbbbbbbbbbbbbb",
  };
  await getSetLnsRecordValueTransaction(getSenderWithSecondSecret(), lnsRecordValue);
})();
