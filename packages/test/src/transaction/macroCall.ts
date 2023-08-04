import * as util from "util";
import { getHexFromArrayBuffer } from "@bfchain/util";
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
  MacroCallLogicVerifier,
  GiftAnyTransaction,
  GiftAnyTransactionFactory,
  PARENT_ASSET_TYPE,
  GIFT_DISTRIBUTION_RULE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppId,
  getGenesisAccount,
} from "../include";

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

async function getGiftAnyTransaction(
  sender: AccountModel,
  bfchainCore: BFChainCore,
  recipient?: AccountModel[],
  cipher?: boolean,
) {
  const assetType = "skyrim_dragonborn";

  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.GIFT_ANY, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "80000080000", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
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
  const giftAny: BFChainCore.GiftAnyJSON = {
    cipherPublicKeys: [],
    sourceChainName: "bfchain",
    sourceChainMagic: bfchainCore.config.magic,
    parentAssetType: PARENT_ASSET_TYPE.ASSETS,
    assetType: "BFT", // 交易的资产类型
    amount: "100000", // 交易资产数量
    totalGrabableTimes: 1,
    beginUnfrozenBlockHeight: 99,
    giftDistributionRule: GIFT_DISTRIBUTION_RULE.RANDOM,
  };
  if (recipient && recipient.length > 0) {
    data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
    data.range = recipient.map((r) => r.address);
    if (cipher) {
      giftAny.cipherPublicKeys = recipient.map((r) => r.publicKey);
    }
  }
  const trs = await bfchainCore.transaction.createTransaction<GiftAnyTransaction>(
    GiftAnyTransactionFactory,
    data,
    {
      giftAny,
    },
    keypair,
    secondKeypair,
  );
  return trs;
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
    trs = await bfchainCore.transaction.transactionPowCalculator<TransferAssetTransaction>(
      trs,
      pow,
      keypair,
      secondKeypair,
    );
  }
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
    dappid: getRandomDAppId(), // 交易所属的 dappid
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

  const xxxx = trs.as(TransferAssetTransaction, trs.asset.call.transaction.signature);
  if (xxxx) {
    const ff = bfchainCore.transaction.getTransactionFactoryFromType(xxxx.type);
    await ff.verify(xxxx);
  }

  const trsJson = trs.toJSON();

  const xx = await bfchainCore.transaction.recombineTransaction<MacroCallTransaction>(trsJson);

  console.log(xx.asset.call);
  console.log(`json equal ${util.isDeepStrictEqual(trsJson, xx.toJSON())}`);

  const logicVerifier =
    bfchainCore.transactionLogicVerifier.getTransactionLogicVerifierFromType<MacroCallTransaction>(
      trs.type,
    ) as MacroCallLogicVerifier;
  logicVerifier.isInputMatch(macroCall.inputs, macroTrs.asset.macro.inputs);
}

(async () => {
  const bfchainCore = await getBfchainCoreEntry();
  const sender = getSenderWithoutSecondSecret();

  const template = await getGiftAnyTransaction(sender, bfchainCore);
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
    // {
    //   type: MACRO_INPUT_TYPE.ADDRESS,
    //   name: "recipientId",
    //   keyPath: "recipientId",
    // },
    {
      type: MACRO_INPUT_TYPE.SIGNATURE,
      name: "signature",
      keyPath: "signature",
    },
    {
      type: MACRO_INPUT_TYPE.NUMBER,
      name: "amount",
      keyPath: "asset.giftAny.amount",
      base: {
        numerator: "0",
        denominator: "9999999999999",
      },
      min: {
        numerator: "1",
        denominator: "1",
      },
      max: {
        numerator: "200",
        denominator: "2",
      },
      step: {
        numerator: "1",
        denominator: "10",
      },
      format: MACRO_NUMBER_FORMAT.STRING,
    },
    {
      type: MACRO_INPUT_TYPE.NUMBER,
      name: "totalGrabableTimes",
      keyPath: "asset.giftAny.totalGrabableTimes",
      base: {
        numerator: "1",
        denominator: "1",
      },
      min: {
        numerator: "1",
        denominator: "1",
      },
      max: {
        numerator: "200",
        denominator: "2",
      },
      step: {
        numerator: "1",
        denominator: "10",
      },
      format: MACRO_NUMBER_FORMAT.STRING,
    },
    {
      type: MACRO_INPUT_TYPE.NUMBER,
      name: "applyBlockHeight",
      keyPath: "applyBlockHeight",
      base: {
        numerator: "0",
        denominator: "9999999999999",
      },
      min: {
        numerator: "10",
        denominator: "1",
      },
      step: {
        numerator: "1",
        denominator: "10",
      },
      format: MACRO_NUMBER_FORMAT.LITERAL,
    },
    // {
    //   type: MACRO_INPUT_TYPE.NUMBER,
    //   name: "rangeType",
    //   keyPath: "rangeType",
    //   format: MACRO_NUMBER_FORMAT.LITERAL,
    // },
    // {
    //   type: MACRO_INPUT_TYPE.ADDRESS,
    //   name: "range",
    //   keyPath: "range",
    //   repeat: true,
    // },
  ];

  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair("secret");
  const sender1 = {
    secret: "secret",
    address: await bfchainCore.accountBaseHelper.getAddressFromPublicKey(keypair.publicKey),
    publicKey: getHexFromArrayBuffer(keypair.publicKey),
  };
  const inputs: { [name: string]: any } = {
    senderId: sender1.address,
    senderPublicKey: sender1.publicKey,
    // recipientId: "cKySkYVB4MhWhKczSUmY7WhF638hPx6U8N",
    amount: "10",
    signature:
      "82b37cd5461c8624d8b7fda89ff3612c32eee7272331b26db407f594c7a750e89a582074bfe83197146fbad32a94b11665795fe8d476554e50ea7a03a99ddc05",
    applyBlockHeight: "1000",
    totalGrabableTimes: "1",
    // effectiveBlockHeight: "1000",
    // rangeType: RANGE_TYPE.MULTI_ADDRESS.toString(),
    // range: [sender.address, sender1.address],
  };

  const factory = bfchainCore.transaction.getTransactionFactoryFromType<MacroCallTransaction>(
    bfchainCore.transactionHelper.MACRO_CALL,
  ) as unknown as MacroCallTransactionFactory;

  const trsWithoutSign = await factory.generateTransactionWithJsonInput(
    template,
    defaultInputs,
    inputs,
  );
  const macroCall = await factory.signTransaction(
    trsWithoutSign,
    sender1.secret,
    undefined,
    {
      count: 0,
      participation: "1000000000000",
    },
    false,
  );
  inputs.signature = macroCall.signature;
  const macroAsset: BFChainCore.MacroJSON = {
    inputs: defaultInputs,
    template: template.toJSON(),
  };

  const macroTrs = await getMacroTransaction(sender, macroAsset, bfchainCore);
  await bfchainCore.transactionHelper.verifyTransactionSignature(macroCall);

  await getMacroCallTransaction(
    sender,
    {
      macroId: macroTrs.signature,
      inputs: factory.parseToMacroCallInputs(inputs),
      transaction: macroCall.toJSON(),
    },
    macroTrs,
    bfchainCore,
  );
})();
