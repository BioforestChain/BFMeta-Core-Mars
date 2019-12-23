import { VoteTransaction, VoteTransactionFactory, RANGE_TYPE } from "../../src";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  bfchainCore,
  AccountModel,
} from "../include";

function getVoteTransaction(sender: AccountModel) {
  const keypair = bfchainCore.accountHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.VOTE, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: getGenesisAccount().address,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 被投票人的地址
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
    lns: `bnqkl.${bfchainCore.config.chainName}`,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
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
  const trs = bfchainCore.transaction.createTransaction<VoteTransaction>(
    VoteTransactionFactory,
    data,
    {
      vote: {
        equity: "20",
      },
    },
    keypair,
    secondKeypair,
  );
  console.log(trs.toJSON().recipientId);
}

getVoteTransaction(getSenderWithSecondSecret());
getVoteTransaction(getSenderWithoutSecondSecret());
