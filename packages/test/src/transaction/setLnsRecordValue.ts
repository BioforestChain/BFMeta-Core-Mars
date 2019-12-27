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
  getGenesisAccount,
  bfchainCore,
  AccountModel,
} from "../include";

function getSetLnsRecordValueTransaction(
  sender: AccountModel,
  lnsRecordValue: BFChainCore.SetLnsRecordValueJSON,
) {
  const keypair = bfchainCore.accountHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.SET_LNS_RECORD_VALUE, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
    lns: `bnqkl.${bfchainCore.config.chainName}`,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    storage: {
      key: "name",
      value: "bnqkl.bfchain",
    },
  };
  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = bfchainCore.accountHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey = bfchainCore.accountHelper.getPublicKeyStringFromSecondSecret(
      sender.secret,
      sender.secondSecret,
    );
  }
  const trs = bfchainCore.transaction.createTransaction<SetLnsRecordValueTransaction>(
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

let lnsRecordValue: BFChainCore.SetLnsRecordValueJSON = {
  name: "bnqkl.bfchain",
  sourceChainName: "xxxxxx",
  sourceChainMagic: "THEM4G1KKEY",
  operationType: RECORD_OPERATION_TYPE.ADD,
  addRecord: {
    recordType: RECORD_TYPE.IPV4,
    recordValue: "127.0.0.1",
  },
};
getSetLnsRecordValueTransaction(getSenderWithSecondSecret(), lnsRecordValue);
lnsRecordValue.addRecord = {
  recordType: RECORD_TYPE.ADDRESSV1,
  recordValue: getSenderWithSecondSecret().address,
};
getSetLnsRecordValueTransaction(getSenderWithSecondSecret(), lnsRecordValue);
lnsRecordValue.operationType = RECORD_OPERATION_TYPE.DELETE;
delete lnsRecordValue.addRecord;
lnsRecordValue.deleteRecord = {
  recordType: RECORD_TYPE.IPV6,
  recordValue: "21DA:00D3:0000:2F3B:02AA:00FF:FE28:9C5A",
};
getSetLnsRecordValueTransaction(getSenderWithoutSecondSecret(), lnsRecordValue);
lnsRecordValue.operationType = RECORD_OPERATION_TYPE.UPDATE;
lnsRecordValue.addRecord = {
  recordType: RECORD_TYPE.IPV6,
  recordValue: "21DA:00D3:0000:2F3B:02AA:00FF:FE28:9C5A",
};
lnsRecordValue.deleteRecord = {
  recordType: RECORD_TYPE.IPV4,
  recordValue: "250.250.250.250",
};
getSetLnsRecordValueTransaction(getSenderWithoutSecondSecret(), lnsRecordValue);
