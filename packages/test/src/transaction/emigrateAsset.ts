import {
  EmigrateAssetTransaction,
  EmigrateAssetTransactionFactory,
  RANGE_TYPE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getDelegateWithoutSecondSecret,
  getFullBfchainCoreEntry,
  AccountModel,
  getDelegateWithSecondSecret,
  getRegisterBfchainCoreEntry,
  getRandomDAppid,
} from "../include";

const fullBfchainCore = getFullBfchainCoreEntry(57, 128);

const registerBfchainCore = getRegisterBfchainCoreEntry();

async function getEmigrateAssetTransaction(sender: AccountModel, genesisDelegate: AccountModel) {
  const keypair = await fullBfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
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
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: fullBfchainCore.config.genesisBlock.asset.genesisAsset.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: fullBfchainCore.config.magic, // 交易来源链的 magic
    toMagic: registerBfchainCore.config.magic, // 交易去往链的 magic
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
  const genesisKeypair = await fullBfchainCore.accountBaseHelper.createSecretKeypair(
    genesisDelegate.secret,
  );
  const signature = await fullBfchainCore.transactionHelper.emigrateAssetGenesisSignature({
    secretKeyBuffer: genesisKeypair.secretKey,
    chainName: emigrateAsset.sourceChainName,
    magic: emigrateAsset.sourceChainMagic,
    assetType: emigrateAsset.assetType,
    senderId: sender.address,
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
    const signSignature = await fullBfchainCore.transactionHelper.emigrateAssetGenesisSignature({
      secretKeyBuffer: genesisSecondKeypair.secretKey,
      chainName: emigrateAsset.sourceChainName,
      magic: emigrateAsset.sourceChainMagic,
      assetType: emigrateAsset.assetType,
      senderId: sender.address,
      genesisSignatureBuffer: signature,
    });
    genesisDelegateSignature.secondPublicKey = genesisSecondKeypair.publicKey.toString("hex");
    genesisDelegateSignature.signSignature = signSignature.toString("hex");
  }

  emigrateAsset.genesisDelegateSignature = genesisDelegateSignature;

  const trs = await fullBfchainCore.transaction.createTransaction<EmigrateAssetTransaction>(
    EmigrateAssetTransactionFactory,
    data,
    {
      emigrateAsset,
    },
    keypair,
    secondKeypair,
  );

  const trsJson = trs.toJSON();
  const xx = await fullBfchainCore.transaction.recombineTransaction(trsJson);
  console.log(xx);
  await fullBfchainCore.transactionHelper.verifyTransactionSignature(xx);
  // console.log(xx.toJSON());
}
(async () => {
  await getEmigrateAssetTransaction(getSenderWithSecondSecret(), getDelegateWithoutSecondSecret());
  await getEmigrateAssetTransaction(getSenderWithoutSecondSecret(), getDelegateWithSecondSecret());
})();
