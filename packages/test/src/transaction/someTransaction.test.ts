// import test from "ava";
// import { TransactionInBlock, SomeTransactionModel, RANGE_TYPE } from "@bfchain/core";
// import { AcceptVoteTransaction, AcceptVoteTransactionFactory } from "@bfchain/core";
// import {
//   getSenderWithSecondSecret,
//   getSenderWithoutSecondSecret,
//   getGenesisAccount,
//   bfchainCore,
//   AccountModel,
// } from "../include";

// function getAcceptVoteTransaction(sender: AccountModel) {
//   const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
//   const data: BFChainCore.TxBodyJSON = {
//     version: 1,
//     type: bfchainCore.transactionHelper.ACCEPT_VOTE, // 交易类型
//     senderId: sender.address, // 发起者地址
//     senderPublicKey: sender.publicKey, // 发起者公钥
//     senderSecondPublicKey: "", // 发起者二次公钥
//     rangeType: RANGE_TYPE.EMPTY,
//     range: [],
//     timestamp: 770880, // 生成交易时间戳
//     fee: "78622", // 交易手续费
//     remark: { remark: "body.remark" }, // 交易备注，任意信息
//     dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
//     lns: `bnqkl.${bfchainCore.config.chainName}`,
//     sourceIP: "127.0.0.1", // 交易来源 ip
//     fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
//     toMagic: bfchainCore.config.magic, // 交易去往链的 magic
//     applyBlockHeight: 10086, // 交易发起高度
//   };
//   let secondKeypair;
//   if (sender.secondSecret) {
//     secondKeypair = await bfchainCore.accountBaseHelper.createSecondSecretKeypair(
//       sender.secret,
//       sender.secondSecret,
//     );
//     data.senderSecondPublicKey = await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
//       sender.secret,
//       sender.secondSecret,
//     );
//   }
//   const trs = await bfchainCore.transaction.createTransaction<AcceptVoteTransaction>(
//     AcceptVoteTransactionFactory,
//     data,
//     {},
//     keypair,
//     secondKeypair,
//   );

//   return trs;
// }

// test("SomeTransaction", async t => {
//   const trs = await getAcceptVoteTransaction(getSenderWithSecondSecret());
//   const trsWithIndex = TransactionInBlock.fromObject({
//     index: 99,
//   });
//   trsWithIndex.transaction = trs;
//   t.is(trsWithIndex.transaction, trs);
//   const bytes = TransactionInBlock.encode(trsWithIndex).finish();
//   const trsWithIndex2 = TransactionInBlock.decode(bytes);
//   t.not(trsWithIndex2.transaction, trs);
//   t.deepEqual(trsWithIndex2.transaction.toJSON(), trs.toJSON());
//   t.deepEqual(trsWithIndex2.index, 99);

//   trs.senderSecondPublicKey = undefined;
//   t.is(trs.senderSecondPublicKeyBuffer && trs.senderSecondPublicKeyBuffer.length, 0);
//   const bytes1 = AcceptVoteTransaction.encode(trs).finish();
//   trs.senderSecondPublicKeyBuffer = Buffer.alloc(0);
//   t.is(trs.senderSecondPublicKey, undefined);
//   const bytes2 = AcceptVoteTransaction.encode(trs).finish();
//   t.deepEqual(bytes2, bytes1);
// });
