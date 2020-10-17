import {
  SetLnsManagerTransaction,
  SetLnsManagerTransactionFactory,
  RANGE_TYPE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  AccountModel,
  getRandomDAppid,
  getBfchainCoreEntry,
} from "../include";

const bfchainCore = getBfchainCoreEntry();

async function getSetLnsManagerTransaction(sender: AccountModel) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.SET_LNS_MANAGER, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: getGenesisAccount().address,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisBlock.asset.genesisAsset.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "name",
      value: bfchainCore.config.genesisBlock.asset.genesisAsset.genesisLocationName,
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
  const trs = await bfchainCore.transaction.createTransaction<SetLnsManagerTransaction>(
    SetLnsManagerTransactionFactory,
    data,
    {
      lnsManager: {
        name: bfchainCore.config.genesisBlock.asset.genesisAsset.genesisLocationName,
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
  await getSetLnsManagerTransaction(getSenderWithSecondSecret());
  await getSetLnsManagerTransaction(getSenderWithoutSecondSecret());
})();
