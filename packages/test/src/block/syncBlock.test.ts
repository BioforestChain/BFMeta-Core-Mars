// import test from "ava";
// import { bfchainCore, BlockForkChecker } from "../include";
// import { QueneEventEmitter, Resolve } from "@bfchain/util";
// const map1 = new Map<number, { id: string; height: number; remark?: { hash: string } }>();
// const map2 = new Map<number, { id: string; height: number; remark?: { hash: string } }>();
// function setRight(
//   map: Map<number, { id: string; height: number; remark?: { hash: string } }>,
//   height: number,
//   value: { id: string; height: number; remark?: { hash: string } },
// ) {
//   map.set(height, value);
// }
// function setWrong(
//   map: Map<number, { id: string; height: number; remark?: { hash: string } }>,
//   height: number,
//   value: { id: string; height: number; remark?: { hash: string } },
// ) {
//   value.id = value.id + "ddd";
//   map.set(height, value);
// }

// const MAX_HEIHT = 200;
// const FORK_HEIGHT = 57;
// function getHash(
//   currentHeight: number,
//   map: Map<number, { id: string; height: number; remark?: { hash: string } }>,
// ) {
//   let lastRoundLastBlockHeight =
//     (bfchainCore.blockHelper.calcRoundByHeight(currentHeight) - 1) *
//     bfchainCore.config.blockPerRound;
//   lastRoundLastBlockHeight = lastRoundLastBlockHeight === 0 ? 1 : lastRoundLastBlockHeight;
//   const payloadHash = bfchainCore.cryptoHelper.sha256();
//   if (lastRoundLastBlockHeight !== 1) {
//     const block = map.get(lastRoundLastBlockHeight);
//     if (block && block.remark) {
//       payloadHash.update(block.remark.hash);
//     } else {
//       console.error(`no ~ ${lastRoundLastBlockHeight}`);
//     }
//   }
//   for (let height = lastRoundLastBlockHeight; height < currentHeight; height++) {
//     const _block = map.get(height);
//     if (_block) {
//       payloadHash.update(_block.id);
//     } else {
//       console.error(`no ~~ ${height}`);
//     }
//   }
//   const hashString = payloadHash.digest("hex");

//   return hashString;
// }
// for (let i = 1; i <= MAX_HEIHT; i++) {
//   const random = Math.random().toString(32);
//   if (i >= FORK_HEIGHT) {
//     if (i % bfchainCore.config.blockPerRound === 0) {
//       const hash1 = getHash(i, map1);
//       const hash2 = getHash(i, map2);
//       setRight(map1, i, {
//         id: random,
//         remark: { hash: hash1 },
//         height: i,
//       });
//       setWrong(map2, i, {
//         id: random,
//         remark: { hash: hash2 },
//         height: i,
//       });
//     } else {
//       setRight(map1, i, {
//         id: random,
//         height: i,
//       });
//       setWrong(map2, i, {
//         id: random,
//         height: i,
//       });
//     }
//   } else {
//     if (i % bfchainCore.config.blockPerRound === 0) {
//       const hash1 = getHash(i, map1);
//       const hash2 = getHash(i, map2);
//       setRight(map1, i, {
//         id: random,
//         remark: { hash: hash1 },
//         height: i,
//       });
//       setRight(map2, i, {
//         id: random,
//         remark: { hash: hash2 },
//         height: i,
//       });
//     } else {
//       setRight(map1, i, {
//         id: random,
//         height: i,
//       });
//       setRight(map2, i, {
//         id: random,
//         height: i,
//       });
//     }
//   }
// }

// test("test block Fork Checker", async t => {
//   const blockForkChecker = Resolve(BlockForkChecker, bfchainCore.moduleMap);

//   const result = await blockForkChecker.findNearestSameBlock(
//     MAX_HEIHT,
//     {
//       getBlockByHeight(height) {
//         return Promise.resolve(map1.get(height) as any);
//       },
//       getBlockById(id) {
//         return Promise.resolve({} as any);
//       },
//       getLastBlock() {
//         return this.getBlockByHeight(MAX_HEIHT) as Promise<BFChainCore.Block>;
//       },
//     },
//     {
//       getBlockByHeight(height) {
//         return Promise.resolve(map2.get(height) as any);
//       },
//       getBlockById(id) {
//         return Promise.resolve({} as any);
//       },
//       getLastBlock() {
//         return this.getBlockByHeight(MAX_HEIHT) as Promise<BFChainCore.Block>;
//       },
//     },
//   );
//   // console.log(map1)
//   // console.log(map2)
//   t.is(result.height + 1, FORK_HEIGHT);
//   t.log(result);
// });
