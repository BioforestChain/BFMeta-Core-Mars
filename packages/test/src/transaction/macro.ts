import {
  TransferAssetTransaction,
  TransferAssetTransactionFactory,
  MacroTransaction,
  MacroTransactionFactory,
  RANGE_TYPE,
  BFChainCore,
  MACRO_INPUT_TYPE,
  Transaction,
  MACRO_NUMBER_FORMAT,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppId,
  getGenesisAccount,
} from "../include";
import * as util from "util";

const _powCount: { [add: string]: number } = {};
function getPOWInfo<T extends Transaction>(address: string) {
  const count = _powCount[address] || 0;
  _powCount[address] = count + 1;
  const res: BFChainCore.TransactionPoWOptions<T> = {
    count,
    participation: "8888888" + "0".repeat(8),
  };
  return res;
}

async function getTransferAssetTransaction(sender: AccountModel, bfchainCore: BFChainCore) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.TRANSFER_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: getGenesisAccount().address,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 770880, // 生成交易时间戳
    fee: "10", // 交易手续费
    remark: { remark: "create transfer asset" }, // 交易备注，任意信息
    dappid: getRandomDAppId(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
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
    data.senderSecondPublicKey =
      await bfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
        sender.secret,
        sender.secondSecret,
      );
  }
  const pow =
    data.applyBlockHeight > bfchainCore.config.tpowOfWorkExemptionBlocks
      ? getPOWInfo<TransferAssetTransaction>(sender.address)
      : undefined;
  let trs = await bfchainCore.transaction.createTransaction<TransferAssetTransaction>(
    TransferAssetTransactionFactory,
    data,
    {
      transferAsset: {
        sourceChainName: bfchainCore.config.chainName,
        sourceChainMagic: bfchainCore.config.magic,
        assetType: bfchainCore.config.assetType,
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
  return trs.toJSON();
}

async function getMacroTransaction(
  sender: AccountModel,
  macro: BFChainCore.MacroJSON,
  bfchainCore: BFChainCore,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.MACRO, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "create macro" }, // 交易备注，任意信息
    dappid: getRandomDAppId(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
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
  const trs = await bfchainCore.transaction.createTransaction<MacroTransaction>(
    MacroTransactionFactory,
    data,
    { macro },
    keypair,
    secondKeypair,
  );

  const trsJson = trs.toJSON();
  const xx = await bfchainCore.transaction.recombineTransaction<MacroTransaction>(trsJson);

  const factory = bfchainCore.transaction.getTransactionFactoryFromType(xx.type);

  await factory.verifySignature(xx);

  console.log(trsJson);
  console.log(trsJson.asset.macro);
  console.log(`json equal ${util.isDeepStrictEqual(trsJson, xx.toJSON())}`);
}

(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  const macroAsset: BFChainCore.MacroJSON = {
    inputs: [
      {
        type: MACRO_INPUT_TYPE.ADDRESS,
        name: "qaq",
        keyPath: "recipientId",
      },
      {
        type: MACRO_INPUT_TYPE.SIGNATURE,
        name: "qqq",
        keyPath: "signature",
      },
      {
        type: MACRO_INPUT_TYPE.NUMBER,
        name: "qwq",
        keyPath: "asset.transferAsset.amount",
        min: {
          numerator: "10",
          denominator: "1",
        },
        max: {
          numerator: "100",
          denominator: "1",
        },
        step: {
          numerator: "20",
          denominator: "1",
        },
        format: MACRO_NUMBER_FORMAT.STRING,
      },
    ],
    template: await getTransferAssetTransaction(getSenderWithoutSecondSecret(), bfchainCore),
  };

  await getMacroTransaction(getSenderWithSecondSecret(), macroAsset, bfchainCore);
  // await getMacroTransaction(getSenderWithoutSecondSecret(), macroAsset, bfchainCore);
})();
