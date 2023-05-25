import {
  TransferAssetTransaction,
  TransferAssetTransactionFactory,
  MacroTransaction,
  MacroTransactionFactory,
  MacroCallTransaction,
  MacroCallTransactionFactory,
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
  getRandomDAppid,
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
    dappid: getRandomDAppid(), // 交易所属的 dappid
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
    dappid: getRandomDAppid(), // 交易所属的 dappid
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

  return trs;
}

async function getMacroCallTransaction(
  sender: AccountModel,
  macroCall: BFChainCore.MacroCallJSON,
  macroTrs: MacroTransaction,
  bfchainCore: BFChainCore,
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.MACRO_CALL, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "create macro" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "macroId",
      value: macroCall.macroId,
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
  const trs = await bfchainCore.transaction.createTransaction<MacroCallTransaction>(
    MacroCallTransactionFactory,
    data,
    { call: macroCall },
    keypair,
    secondKeypair,
  );

  const trsJson = trs.toJSON();

  const xx = await bfchainCore.transaction.recombineTransaction(trsJson);

  console.log(trsJson.asset.call);
  console.log(`json equal ${util.isDeepStrictEqual(trsJson, xx.toJSON())}`);
}

(async () => {
  const bfchainCore = await getBfchainCoreEntry();
  const sender = getSenderWithSecondSecret();

  const macroAsset: BFChainCore.MacroJSON = {
    inputs: [
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
        type: MACRO_INPUT_TYPE.SIGNATURE,
        name: "signSignature",
        keyPath: "signSignature",
      },
      {
        type: MACRO_INPUT_TYPE.NUMBER,
        name: "amount",
        keyPath: "asset.transferAsset.amount",
        min: {
          numerator: "10",
          denominator: "1",
        },
        max: {
          numerator: "200",
          denominator: "2",
        },
        step: {
          numerator: "20",
          denominator: "1",
        },
        format: MACRO_NUMBER_FORMAT.STRING,
      },
      {
        type: MACRO_INPUT_TYPE.NUMBER,
        name: "nonce",
        keyPath: "nonce",
        min: {
          numerator: "0",
          denominator: "1",
        },
        format: MACRO_NUMBER_FORMAT.LITERAL,
      },
    ],
    template: await getTransferAssetTransaction(sender, bfchainCore),
  };

  const macroTrs = await getMacroTransaction(sender, macroAsset, bfchainCore);

  const inputs = {
    recipientId: "cKySkYVB4MhWhKczSUmY7WhF638hPx6U8N",
    amount: "100",
    signature:
      "82b37cd5461c8624d8b7fda89ff3612c32eee7272331b26db407f594c7a750e89a582074bfe83197146fbad32a94b11665795fe8d476554e50ea7a03a99ddc05",
    signSignature:
      "82b37cd5461c8624d8b7fda89ff3612c32eee7272331b26db407f594c7a750e89a582074bfe83197146fbad32a94b11665795fe8d476554e50ea7a03a99ddc05",
    nonce: "0",
  };

  const { template, inputs: defaultInputs } = macroTrs.asset.macro;

  const factory = bfchainCore.transaction.getTransactionFactoryFromType<MacroCallTransaction>(
    bfchainCore.transactionHelper.MACRO_CALL,
  ) as unknown as MacroCallTransactionFactory;

  const trsWithoutSign = await factory.generateTransaction(template, defaultInputs, inputs);
  const newTrs = await factory.signTransaction(
    trsWithoutSign,
    sender.secret,
    sender.secondSecret,
    {
      count: 1,
      participation: "1000000000000",
    },
    false,
  );

  await bfchainCore.transactionHelper.verifyTransactionSignature(newTrs);

  await getMacroCallTransaction(
    sender,
    {
      macroId: macroTrs.signature,
      inputs,
    },
    macroTrs,
    bfchainCore,
  );
})();
