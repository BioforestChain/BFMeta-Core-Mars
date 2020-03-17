import {
  TrustAssetTransaction,
  TrustAssetTransactionFactory,
  SignForAssetTransaction,
  SignForAssetTransactionFactory,
  RANGE_TYPE,
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getRecipientWithSecondSecret,
  getRecipientWithoutSecondSecret,
  AccountModel,
  getDelegateWithSecondSecret,
  getBfchainCoreEntry,
} from "../include";
import { parseHexToArrayBuffer } from "@bfchain/util";

const bfchainCore = getBfchainCoreEntry();

async function getTrustAssetTransaction(
  sender: AccountModel,
  recipientId: string,
  trustees: string[],
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.TRUST_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 10000, // 生成交易时间戳
    fee: "1000", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
    lns: `bnqkl.${bfchainCore.config.chainName}`,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10, // 交易发起高度
    effectiveBlockHeight: 1000,
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
  const trs = await bfchainCore.transaction.createTransaction<TrustAssetTransaction>(
    TrustAssetTransactionFactory,
    data,
    {
      trustAsset: {
        trustees,
        numberOfSignFor: 2,
        sourceChainName: "xxxxxx",
        sourceChainMagic: "THEM4G1KKEY",
        assetType: "BFT",
        amount: "100000",
      },
    },
    keypair,
    secondKeypair,
  );
  return trs;
}

async function getSignForAssetTransaction(
  sender: AccountModel,
  trustAssetTrs: TrustAssetTransaction,
  thirdPartys: AccountModel[],
) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.SIGN_FOR_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: trustAssetTrs.recipientId,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 20000, // 生成交易时间戳
    fee: "1000", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
    lns: `bnqkl.${bfchainCore.config.chainName}`,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 20, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "transactionSignature",
      value: trustAssetTrs.signature,
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
  thirdPartys[thirdPartys.length] = sender;
  const { trustAsset } = trustAssetTrs.asset;
  const thirdPartySignatures: BFChainCore.AccountSignatureJSON[] = [];
  const signForAsset = {
    transactionSignature: trustAssetTrs.signature,
    thirdPartySignatures,
    trustSenderId: trustAssetTrs.senderId,
    trustRecipientId: trustAssetTrs.recipientId,
    trustNumberOfSignFor: trustAsset.numberOfSignFor,
    applyBlockHeight: trustAssetTrs.applyBlockHeight,
    effectiveBlockHeight: trustAssetTrs.effectiveBlockHeight,
    trustAsset,
  };
  const results: BFChainCore.AccountSignatureJSON[] = [];
  const trusteePublicKeys: string[] = [];
  for (const account of thirdPartys) {
    if (trusteePublicKeys.includes(account.publicKey)) {
      continue;
    }
    trusteePublicKeys[trusteePublicKeys.length] = account.publicKey;
    const accountKeypair = await bfchainCore.accountBaseHelper.createSecretKeypair(account.secret);
    const signature = await bfchainCore.transactionHelper.thirdPartySignature({
      secretKeyBuffer: accountKeypair.secretKey,
      transactionSignatureBuffer: parseHexToArrayBuffer(trustAssetTrs.signature),
      senderId: trustAssetTrs.senderId,
      recipientId: trustAssetTrs.recipientId,
    });
    const result: BFChainCore.AccountSignatureJSON = {
      publicKey: account.publicKey,
      signature: signature.toString("hex"),
    };
    if (account.secondSecret) {
      const accountSecondKeypair = await bfchainCore.accountBaseHelper.createSecondSecretKeypair(
        account.secret,
        account.secondSecret,
      );
      const signSignature = await bfchainCore.transactionHelper.thirdPartySignature({
        secretKeyBuffer: accountSecondKeypair.secretKey,
        transactionSignatureBuffer: parseHexToArrayBuffer(trustAssetTrs.signature),
        senderId: trustAssetTrs.senderId,
        recipientId: trustAssetTrs.recipientId,
        thirdPartySignatureBuffer: signature,
      });
      result.secondPublicKey = accountSecondKeypair.publicKey.toString("hex");
      result.signSignature = signSignature.toString("hex");
    }
    results[results.length] = result;
  }
  signForAsset.thirdPartySignatures = results;
  const trs = await bfchainCore.transaction.createTransaction<SignForAssetTransaction>(
    SignForAssetTransactionFactory,
    data,
    { signForAsset },
    keypair,
    secondKeypair,
  );
  const trsJson = trs.toJSON();
  const xx = await bfchainCore.transaction.recombineTransaction(trsJson);
  await bfchainCore.transactionHelper.verifyTransactionSignature(xx);
  console.log(xx);
  return trs;
}

(async () => {
  const trustees = [getDelegateWithSecondSecret()];
  const trusAssetTrsWithSecret = await getTrustAssetTransaction(
    getSenderWithSecondSecret(),
    getRecipientWithSecondSecret().address,
    trustees.map(trustee => trustee.address),
  );
  const trusAssetTrsWithoutSecret = await getTrustAssetTransaction(
    getSenderWithoutSecondSecret(),
    getRecipientWithoutSecondSecret().address,
    trustees.map(trustee => trustee.address),
  );

  await getSignForAssetTransaction(
    getRecipientWithSecondSecret(),
    trusAssetTrsWithSecret,
    trustees,
  );
  await getSignForAssetTransaction(
    getRecipientWithoutSecondSecret(),
    trusAssetTrsWithoutSecret,
    trustees,
  );
})();
