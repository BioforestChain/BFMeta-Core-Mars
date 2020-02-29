import {
  EmigrateAssetTransaction,
  EmigrateAssetTransactionFactory,
  ImmigrateAssetTransactionFactory,
  ImmigrateAssetTransaction,
  RANGE_TYPE,
  BlockCore,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getFullBfchainCore,
  getFullRegisterBfchainCore,
  AccountModel,
  getDelegateWithoutSecondSecret,
  getDelegateWithSecondSecret,
} from "../include";
import { parseHexToArrayBuffer } from "@bfchain/util";

const fullBfchainCore = getFullBfchainCore(57, 128);
const fullSubBfchainCore = getFullRegisterBfchainCore();

function getEmigrateAssetTransaction(sender: AccountModel, genesisDelegate: AccountModel) {
  const keypair = fullBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: fullBfchainCore.transactionHelper.EMIGRATE_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 10000, // 生成交易时间戳
    fee: "1000", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
    lns: `bnqkl.${fullBfchainCore.config.chainName}`,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: fullBfchainCore.config.magic, // 交易来源链的 magic
    toMagic: fullSubBfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10, // 交易发起高度
    effectiveBlockHeight: 10100,
  };
  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = fullBfchainCore.accountBaseHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey = fullBfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
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
  const signature = fullBfchainCore.transactionHelper.getEmigrateAssetGenesisSignature({
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

  const trs = fullBfchainCore.transaction.createTransaction<EmigrateAssetTransaction>(
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

function getImmigrateAssetTransaction(
  sender: AccountModel,
  genesisDelegate: AccountModel,
  emigrateAssetTrs: BFChainCore.TransactionMixJSON<
    BFChainCore.EmigrateAssetAssetJSON,
    {
      hasRecipientId: false;
    }
  >,
) {
  const keypair = fullSubBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: fullSubBfchainCore.transactionHelper.IMMIGRATE_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 10000, // 生成交易时间戳
    fee: "1000", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
    lns: `bnqkl.${fullSubBfchainCore.config.chainName}`,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: fullBfchainCore.config.magic, // 交易来源链的 magic
    toMagic: fullSubBfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10, // 交易发起高度
    effectiveBlockHeight: 57,
    storage: {
      key: "transactionSignature",
      value: emigrateAssetTrs.signature,
    },
  };
  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = fullSubBfchainCore.accountBaseHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey = fullSubBfchainCore.accountBaseHelper.getPublicKeyStringFromSecondSecret(
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
  const genesisKeypair = fullBfchainCore.accountBaseHelper.createSecretKeypair(
    genesisDelegate.secret,
  );
  const signature = fullBfchainCore.transactionHelper.immigrateAssetGenesisSignature({
    secretKeyBuffer: genesisKeypair.secretKey,
    transactionSignatureBuffer: parseHexToArrayBuffer(emigrateAssetTrs.signature),
  });
  const genesisDelegateSignature: BFChainCore.AccountSignatureJSON = {
    publicKey: genesisDelegate.publicKey,
    signature: signature.toString("hex"),
  };
  if (genesisDelegate.secondSecret) {
    const genesisSecondKeypair = fullBfchainCore.accountBaseHelper.createSecondSecretKeypair(
      genesisDelegate.secret,
      genesisDelegate.secondSecret,
    );
    const signSignature = fullBfchainCore.transactionHelper.immigrateAssetGenesisSignature({
      secretKeyBuffer: genesisSecondKeypair.secretKey,
      transactionSignatureBuffer: parseHexToArrayBuffer(emigrateAssetTrs.signature),
      genesisSignatureBuffer: signature,
    });
    genesisDelegateSignature.secondPublicKey = genesisSecondKeypair.publicKey.toString("hex");
    genesisDelegateSignature.signSignature = signSignature.toString("hex");
  }
  immigrateAsset.genesisDelegateSignature = genesisDelegateSignature;
  fullSubBfchainCore.configMap.set(fullBfchainCore.config.magic, fullBfchainCore.config);

  const trs = fullSubBfchainCore.transaction.createTransaction<ImmigrateAssetTransaction>(
    ImmigrateAssetTransactionFactory,
    data,
    {
      immigrateAsset,
    },
    keypair,
    secondKeypair,
  );

  const trsJson = trs.toJSON();
  const xx = fullBfchainCore.transaction.recombineTransaction(trsJson);
  fullBfchainCore.transactionHelper.verifyTransactionSignature(xx);
  console.log(xx);

  return trs;
}

const senderWithSecondSecret = getSenderWithSecondSecret();
const senderWithoutSecondSecret = getSenderWithoutSecondSecret();
const genesisDelegateWithSecondSecret = getDelegateWithSecondSecret();
const genesisDelegateWithoutSecondSecret = getDelegateWithoutSecondSecret();
const emigrateAssetTrsWithSecondSecret = getEmigrateAssetTransaction(
  senderWithSecondSecret,
  genesisDelegateWithSecondSecret,
);
const emigrateAssetTrsWithoutSecondSecret = getEmigrateAssetTransaction(
  senderWithoutSecondSecret,
  genesisDelegateWithoutSecondSecret,
);
getImmigrateAssetTransaction(
  senderWithSecondSecret,
  genesisDelegateWithSecondSecret,
  emigrateAssetTrsWithSecondSecret,
);
getImmigrateAssetTransaction(
  senderWithoutSecondSecret,
  genesisDelegateWithoutSecondSecret,
  emigrateAssetTrsWithoutSecondSecret,
);
