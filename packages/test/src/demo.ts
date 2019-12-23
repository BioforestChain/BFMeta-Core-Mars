/// 浏览器平台
// import sha256 from "sha.js";
// import md5 from "md5.js";
import Helper, { CommonBlockFactory, TransactionInBlock } from "../src/";
import { bfchainCore } from "./include/init";

(async function test() {
  // const block = await bfchainCore.block.generateBlock(
  //   CommonBlockFactory,
  //   {
  //     height: 10086,
  //     timestamp: 10086,
  //     generatorPublicKey: "generatorPublicKey",
  //     previousBlock: "previousBlock",
  //   },
  //   {
  //     remark: "asss",
  //   },
  //   {
  //     [Symbol.asyncIterator]() {
  //       return {
  //         async next() {
  //           return {
  //             done: true,
  //             value: {} as TransactionInBlock,
  //           };
  //         },
  //       };
  //     },
  //   },
  //   bfchainCore.keypairHelper.create("1"),
  // );

  console.log(bfchainCore.keypairHelper.create("1"));
})().catch(console.error);
