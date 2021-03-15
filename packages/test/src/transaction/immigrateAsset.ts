import {
  EmigrateAssetTransaction,
  EmigrateAssetTransactionFactory,
  ImmigrateAssetTransactionFactory,
  ImmigrateAssetTransaction,
  RANGE_TYPE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getFullBfchainCoreEntry,
  getFullRegisterBfchainCoreEntry,
  AccountModel,
  getDelegateWithoutSecondSecret,
  getDelegateWithSecondSecret,
  getRandomDAppid,
} from "../include";
import { parseHexToArrayBuffer } from "@bfchain/util";

const fullBfchainCore = getFullBfchainCoreEntry(57, 128);
const fullRegisterBfchainCore = getFullRegisterBfchainCoreEntry();

async function getEmigrateAssetTransaction(sender: AccountModel, genesisDelegate: AccountModel) {
  const keypair = await fullBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: fullBfchainCore.config.version,
    type: fullBfchainCore.transactionHelper.EMIGRATE_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 10000, // 生成交易时间戳
    fee: "1000", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: fullBfchainCore.config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: fullBfchainCore.config.magic, // 交易来源链的 magic
    toMagic: fullRegisterBfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10, // 交易发起高度
    effectiveBlockHeight: 10100,
  };
  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = await fullBfchainCore.accountBaseHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey = await fullBfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
      sender.secret,
      sender.secondSecret,
    );
  }
  const emigrateAsset: BFChainCore.EmigrateAssetJSON = {
    genesisDelegateSignature: {
      publicKey: "",
      signature: "",
    },
    sourceChainName: fullBfchainCore.config.chainName,
    sourceChainMagic: fullBfchainCore.config.magic,
    assetType: "BFT",
    amount: "100000",
  };
  const signature = await fullBfchainCore.transactionHelper.getEmigrateAssetGenesisSignature({
    secret: genesisDelegate.secret,
    chainName: emigrateAsset.sourceChainName,
    magic: emigrateAsset.sourceChainMagic,
    assetType: emigrateAsset.assetType,
    senderId: sender.address,
  });
  emigrateAsset.genesisDelegateSignature = {
    publicKey: genesisDelegate.publicKey,
    signature: signature.toString("hex"),
  };

  const trs = await fullBfchainCore.transaction.createTransaction<EmigrateAssetTransaction>(
    EmigrateAssetTransactionFactory,
    data,
    {
      emigrateAsset,
    },
    keypair,
    secondKeypair,
  );

  return trs.toJSON();
}

async function getImmigrateAssetTransaction(
  sender: AccountModel,
  genesisDelegate: AccountModel,
  emigrateAssetTrs: BFChainCore.TransactionMixJSON<
    BFChainCore.EmigrateAssetAssetJSON,
    {
      hasRecipientId: false;
    }
  >,
) {
  const keypair = await fullRegisterBfchainCore.accountBaseHelper.createSecretKeypair(
    sender.secret,
  );
  const data: BFChainCore.TxBodyJSON = {
    version: fullRegisterBfchainCore.config.version,
    type: fullRegisterBfchainCore.transactionHelper.IMMIGRATE_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 10000, // 生成交易时间戳
    fee: "1000", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: fullRegisterBfchainCore.config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: fullBfchainCore.config.magic, // 交易来源链的 magic
    toMagic: fullRegisterBfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10, // 交易发起高度
    effectiveBlockHeight: 57,
    storage: {
      key: "transactionSignature",
      value: emigrateAssetTrs.signature,
    },
  };
  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = await fullRegisterBfchainCore.accountBaseHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey = await fullRegisterBfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
      sender.secret,
      sender.secondSecret,
    );
  }
  const immigrateAsset: BFChainCore.ImmigrateAssetJSON = {
    genesisDelegateSignature: {
      publicKey: "",
      signature: "",
    },
    emigrateAssetTransaction: emigrateAssetTrs,
  };
  const genesisKeypair = await fullBfchainCore.accountBaseHelper.createSecretKeypair(
    genesisDelegate.secret,
  );
  const signature = await fullBfchainCore.transactionHelper.immigrateAssetGenesisSignature({
    secretKeyBuffer: genesisKeypair.secretKey,
    transactionSignatureBuffer: parseHexToArrayBuffer(emigrateAssetTrs.signature),
  });
  const genesisDelegateSignature: BFChainCore.AccountSignatureJSON = {
    publicKey: genesisDelegate.publicKey,
    signature: signature.toString("hex"),
  };
  if (genesisDelegate.secondSecret) {
    const genesisSecondKeypair = await fullBfchainCore.accountBaseHelper.createSecondSecretKeypair(
      genesisDelegate.secret,
      genesisDelegate.secondSecret,
    );
    const signSignature = await fullBfchainCore.transactionHelper.immigrateAssetGenesisSignature({
      secretKeyBuffer: genesisSecondKeypair.secretKey,
      transactionSignatureBuffer: parseHexToArrayBuffer(emigrateAssetTrs.signature),
      genesisSignatureBuffer: signature,
    });
    genesisDelegateSignature.secondPublicKey = genesisSecondKeypair.publicKey.toString("hex");
    genesisDelegateSignature.signSignature = signSignature.toString("hex");
  }
  immigrateAsset.genesisDelegateSignature = genesisDelegateSignature;
  fullRegisterBfchainCore.configMap.set(fullBfchainCore.config.magic, fullBfchainCore.config);

  const trs = await fullRegisterBfchainCore.transaction.createTransaction<
    ImmigrateAssetTransaction
  >(
    ImmigrateAssetTransactionFactory,
    data,
    {
      immigrateAsset,
    },
    keypair,
    secondKeypair,
  );

  const trsJson = trs.toJSON();
  const xx = await fullBfchainCore.transaction.recombineTransaction(trsJson);
  await fullBfchainCore.transactionHelper.verifyTransactionSignature(xx);
  console.log(xx);

  return trs;
}
(async () => {
  const senderWithSecondSecret = getSenderWithSecondSecret();
  const senderWithoutSecondSecret = getSenderWithoutSecondSecret();
  const genesisDelegateWithSecondSecret = getDelegateWithSecondSecret();
  const genesisDelegateWithoutSecondSecret = getDelegateWithoutSecondSecret();
  const emigrateAssetTrsWithSecondSecret = await getEmigrateAssetTransaction(
    senderWithSecondSecret,
    genesisDelegateWithSecondSecret,
  );
  const emigrateAssetTrsWithoutSecondSecret = await getEmigrateAssetTransaction(
    senderWithoutSecondSecret,
    genesisDelegateWithoutSecondSecret,
  );
  await getImmigrateAssetTransaction(
    senderWithSecondSecret,
    genesisDelegateWithSecondSecret,
    emigrateAssetTrsWithSecondSecret,
  );
  await getImmigrateAssetTransaction(
    senderWithoutSecondSecret,
    genesisDelegateWithoutSecondSecret,
    emigrateAssetTrsWithoutSecondSecret,
  );
})();
