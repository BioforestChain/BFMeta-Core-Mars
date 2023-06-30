// import test from "ava";
// import { AcceptVoteTransaction, AcceptVoteTransactionFactory, RANGE_TYPE } from "@bfchain/core";
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
//     version: bfchainCore.config.version,
//     type: bfchainCore.transactionHelper.ACCEPT_VOTE, // 交易类型
//     senderId: sender.address, // 发起者地址
//     senderPublicKey: sender.publicKey, // 发起者公钥
//     senderSecondPublicKey: "", // 发起者二次公钥
//     rangeType: RANGE_TYPE.EMPTY,
//     range: [],
//     timestamp: 770880, // 生成交易时间戳
//     fee: "78622", // 交易手续费
//     remark: { remark: "body.remark" }, // 交易备注，任意信息
//     dappid: getRandomDAppId(), // 交易所属的 dappid
//     lns: `ibt.${bfchainCore.config.chainName}`,
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
// test("AcceptVoteTransaction", t => {
//   {
//     const trs = await getAcceptVoteTransaction(getSenderWithSecondSecret());
//     const { signature, signature, signSignature, ...trsbase } = trs.toJSON();

//     t.deepEqual(trsbase, {
//       version: bfchainCore.config.version,
//       type: "BFT-BFCHAIN-BSE-05",
//       senderId: "cCET2Sxt2LPDhx44wxJ9uhkpviKNrSacvE",
//       senderPublicKey: "6e8330144a8c123c017a8f5c363531868d3ce21c45b4a668cc1767c2b4695c84",
//       senderSecondPublicKey: "c66ca6f24bdf55659cf4c799b3bead947e5ebfb94a10d047187399b0b69fb98e",
//       rangeType: RANGE_TYPE.EMPTY,
//       range: [],
//       fee: "78622",
//       timestamp: 770880,
//       dappid: getRandomDAppId(),
//       lns: `ibt.${bfchainCore.config.chainName}`,
//       sourceIP: "127.0.0.1",
//       fromMagic: bfchainCore.config.magic,
//       toMagic: bfchainCore.config.magic,
//       applyBlockHeight: 10086,
//       // signature:
//       //   "e546b378a247c6e8f937482fff55245ede1deedca40832a248a8a0f35a9d78bd0351c90c7272395a88868c0de446af1d8fbb989799c0a26ac2885ec8266c2807",
//       // signSignature:
//       //   "5d0e4739c66d931922ab7153eb8ff984af458f52af81017652f4983da72e4498bd7e1c3b02b1dcb10d9fea54916092aca511f6fdcc3d41807fd47bf4df8b1e09",
//       remark: { remark: "body.remark" },
//       // signature: "b9290ba7bbee3d97975408e1411549ea65c27db68b3c2d3b9e2619dab8b23f20",
//       asset: {},
//       nonce: 0,
//       recipientId: undefined,
//     });
//     t.is(signature.length, 128);
//     t.is(signature, signature);
//     t.is(signSignature && signSignature.length, 128);
//   }
//   {
//     const trs = await getAcceptVoteTransaction(getSenderWithoutSecondSecret());
//     const { signature, signature, signSignature, ...trsbase } = trs.toJSON();
//     t.deepEqual(trsbase, {
//       version: bfchainCore.config.version,
//       type: "BFT-BFCHAIN-BSE-05",
//       senderId: "cCET2Sxt2LPDhx44wxJ9uhkpviKNrSacvE",
//       senderPublicKey: "6e8330144a8c123c017a8f5c363531868d3ce21c45b4a668cc1767c2b4695c84",
//       rangeType: RANGE_TYPE.EMPTY,
//       range: [],
//       fee: "78622",
//       timestamp: 770880,
//       dappid: getRandomDAppId(),
//       lns: "ibt.bfchain",
//       sourceIP: "127.0.0.1",
//       fromMagic: bfchainCore.config.magic,
//       toMagic: bfchainCore.config.magic,
//       applyBlockHeight: 10086,
//       // signature:
//       //   "c8a70a2c2bf60bf20d2a50a88802c37160baf924e258847bfd2c482c82a8a12cb6f96cc3fded47237278e23fbc7a0c6503f1278d7a61e130d3bf58c88b012208",
//       // signSignature: "",
//       remark: { remark: "body.remark" },
//       asset: {},
//       nonce: 0,
//       recipientId: undefined,
//     });
//     t.is(signature.length, 128);
//     t.is(signature, signature);
//     t.is(signSignature, undefined);
//   }
// });
