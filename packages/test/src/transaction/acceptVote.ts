import {
  AcceptVoteTransaction,
  AcceptVoteTransactionFactory,
  RANGE_TYPE,
  BFChainCore,
} from "@bfchain/core";
import {
  getSenderWithoutSecondSecret,
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppid,
} from "../include";
import { I18N_LANGUAGE_TYPE } from "@bfchain/util-i18n";

async function getAcceptVoteTransaction(sender: AccountModel, bfchainCore: BFChainCore) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,

    subEnvParams: {},
    type: bfchainCore.transactionHelper.ACCEPT_VOTE, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    maxFee: "100000000",
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    remark: { remark: "body.remark".repeat(1000) }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic

    fee: "2000", // 交易手续费
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
  const trs = await bfchainCore.transaction.createTransaction<AcceptVoteTransaction>(
    AcceptVoteTransactionFactory,
    data,
    {},
    keypair,
    secondKeypair,
  );
  const trsJson = trs.toJSON();
  const xx = await bfchainCore.transaction.recombineTransaction(trsJson);
  await bfchainCore.transaction.getTransactionFactoryFromType(xx.type).verify(xx);
  console.log(xx);
  //   console.log(trs.toJSON());
}

(async () => {
  const bfchainCore = await getBfchainCoreEntry();
  bfchainCore.i18N.setLanguage(I18N_LANGUAGE_TYPE.CHINESE);

  // getAcceptVoteTransaction(getSenderWithSecondSecret());
  await getAcceptVoteTransaction(getSenderWithoutSecondSecret(), bfchainCore);
})();
