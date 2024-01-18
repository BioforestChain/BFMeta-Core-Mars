import * as util from "util";
import { getHexFromArrayBuffer } from "@bfchain/util";
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
  MacroCallTransaction,
  MacroCallTransactionFactory,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppId,
  getGenesisAccount,
} from "../include";

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
  );
  return trs;
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

  // console.log(trsJson);
  console.log(trsJson.asset.macro);
  console.log(`json equal ${util.isDeepStrictEqual(trsJson, xx.toJSON())}`);
}

(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  const sender = getSenderWithoutSecondSecret();
  const template = await getTransferAssetTransaction(sender, bfchainCore);
  const defaultInputs: BFChainCore.Macro.InputJSON[] = [
    {
      type: MACRO_INPUT_TYPE.ADDRESS,
      name: "senderId",
      keyPath: "senderId",
    },
    {
      type: MACRO_INPUT_TYPE.PUBLICKEY,
      name: "senderPublicKey",
      keyPath: "senderPublicKey",
    },
    {
      type: MACRO_INPUT_TYPE.ADDRESS,
      name: "recipientId",
      keyPath: "recipientId",
    },
    {
      type: MACRO_INPUT_TYPE.SIGNATURE,
      name: "signature",
      keyPath: "signature",
    },
    {
      type: MACRO_INPUT_TYPE.NUMBER,
      name: "amount",
      keyPath: "asset.transferAsset.amount",
      base: {
        numerator: "10",
        denominator: "1",
      },
      min: {
        numerator: "10",
        denominator: "1",
      },
      max: {
        numerator: "200",
        denominator: "2",
      },
      step: {
        numerator: "1",
        denominator: "1",
      },
      format: MACRO_NUMBER_FORMAT.STRING,
    },
    {
      type: MACRO_INPUT_TYPE.NUMBER,
      name: "nonce",
      keyPath: "nonce",
      format: MACRO_NUMBER_FORMAT.LITERAL,
    },
    {
      type: MACRO_INPUT_TYPE.NUMBER,
      name: "applyBlockHeight",
      keyPath: "applyBlockHeight",
      format: MACRO_NUMBER_FORMAT.STRING,
    },
  ];
  const macroAsset: BFChainCore.MacroJSON = {
    inputs: defaultInputs,
    template: template.toJSON(),
  };

  await getMacroTransaction(sender, macroAsset, bfchainCore);
  // await getMacroTransaction(getSenderWithoutSecondSecret(), macroAsset, bfchainCore);
})();
