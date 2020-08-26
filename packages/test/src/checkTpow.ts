import { parseHexToArrayBuffer } from "@bfchain/util";
import { getBfchainCoreEntry } from "./include";

const bfchainCore = getBfchainCoreEntry();

async function checkTpow() {
  const powCheckResult = await bfchainCore.transactionHelper.checkTransactionProfOfWork(
    parseHexToArrayBuffer(
      "79754f436f291868c85772b6450ef3481907181c77704c55cd7e263dd3cedc160d93a573839eac3702a496df6a57c06735e89f5b5fc221a6fb13f1f725f1d807",
    ),
    1,
    "17662716016028",
  );

  const diff = await bfchainCore.transactionHelper.calcDiffOfTransactionProfOfWork(
    1,
    "17662716016028",
  );

  console.log(powCheckResult, diff);

  console.log(bfchainCore.transactionHelper.calcTpowParticipationBI(1, "17668421494133"));
}

function formatAssetNumber(assetNumber: string) {
  let formatAssetNumber = "0";
  const assetLength = assetNumber.length;
  if (assetLength <= 8) {
    formatAssetNumber = "0" + "." + "0".repeat(8 - assetLength) + assetNumber;
  } else {
    formatAssetNumber =
      assetNumber.slice(0, assetLength - 8) + "." + assetNumber.slice(assetLength - 8);
  }
  return formatAssetNumber;
}

async function calcMilestone() {
  const senderEquityList = [
    "0",
    "500",
    "2000",
    "5000",
    "7000",
    "10000",
    "15000",
    "17000",
    "20000",
    "45000",
    "100000",
    "2800000",
    "3000000",
    "10000000",
    "50000000",
    "100000000",
    "1000000000",
  ].map((item) => item + "0".repeat(8));
  const results: any = [];
  for (const senderEquity of senderEquityList) {
    // const senderEquity = "1024188093598";
    const transactionHelper = bfchainCore.transactionHelper;
    let isSeperate = false;
    for (let i = 0; i < 60; i++) {
      // 验证交易的 pow
      // const { height, transaction } = trsDocs[i];
      // debugger;
      const diff = await transactionHelper.calcDiffOfTransactionProfOfWork(i, senderEquity);
      if (diff > BigInt(10000) && !isSeperate) {
        results.push({
          senderEquity: "=".repeat(senderEquity.length + 1),
          txCount: "=".repeat(i.toString().length),
          diff: "=".repeat(diff.toString().length),
        });
        isSeperate = true;
      }
      results.push({
        senderEquity: formatAssetNumber(senderEquity),
        txCount: i,
        diff,
      });
      // const powCheckResult = await transactionHelper.checkTransactionProfOfWork(parseHexToArrayBuffer(transaction.signature), i, senderEquity);
      // if (powCheckResult) {
      //     console.log(`账户 ${transaction.senderId} 权益 ${senderEquity} 在高度 ${height} 的第 ${i} 笔事件 tpow 验证成功，nonce ${transaction.nonce}`);
      // } else {
      //     throw new Error(`账户 ${transaction.senderId} 权益 ${senderEquity} 在高度 ${height} 的第 ${i} 笔事件 tpow 验证失败`);
      // }
    }
  }
  console.table(results);
}

(async () => {
  await calcMilestone();
})();
