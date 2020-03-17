import {
  TransferAssetTransaction,
  TransferAssetTransactionFactory,
  RANGE_TYPE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  AccountModel,
  getBfchainCoreEntry,
} from "../include";

const bfchainCore = getBfchainCoreEntry();

const _powCount: { [add: string]: number } = {};
const getPOWInfo = (address: string) => {
  const count = _powCount[address] || 8;
  _powCount[address] = count + 1;
  const res: BFChainCore.TransactonPoWOptions = {
    count,
    participation: "1000",
  };
  return res;
};

async function getTransferAssetTransaction(sender: AccountModel) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.TRANSFER_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: getGenesisAccount().address,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
    lns: `bnqkl.${bfchainCore.config.chainName}`,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "assetType",
      value: "BFT",
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
  const pow =
    data.applyBlockHeight > bfchainCore.config.powOfWorkExemptionBlocks
      ? getPOWInfo(sender.address)
      : undefined;
  let trs = await bfchainCore.transaction.createTransaction<TransferAssetTransaction>(
    TransferAssetTransactionFactory,
    data,
    {
      transferAsset: {
        sourceChainName: "srcchn",
        sourceChainMagic: "THEM4G1KKEY",
        assetType: "BFT",
        amount: "1000",
      },
    },
    keypair,
    secondKeypair,
    undefined,
    undefined,
  );
  if (pow) {
    trs = await bfchainCore.transaction.transactionPowCalculator(trs, pow, keypair, secondKeypair);
  }
  const trsJson = trs.toJSON();
  const xx = await bfchainCore.transaction.recombineTransaction(trsJson);
  console.log(xx.toJSON());
}

(async () => {
  await getTransferAssetTransaction(getSenderWithSecondSecret());
  await getTransferAssetTransaction(getSenderWithoutSecondSecret());
})();
