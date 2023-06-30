import {
  IssueCertificateTransaction,
  IssueCertificateTransactionFactory,
  RANGE_TYPE,
  BFChainCore,
  CERTIFICATE_TYPE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppId,
  getRandomCertificateId,
} from "../include";

const genesisAddress = getGenesisAccount().address;
const certificateId = getRandomCertificateId();
async function getIssueCertificateTransaction(sender: AccountModel, bfchainCore: BFChainCore) {
  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.ISSUE_CERTIFICATE, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: genesisAddress,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 资产创世账户地址
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppId(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "certificateId",
      value: certificateId,
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
  const trs = await bfchainCore.transaction.createTransaction<IssueCertificateTransaction>(
    IssueCertificateTransactionFactory,
    data,
    {
      issueCertificate: {
        sourceChainName: bfchainCore.config.chainName,
        sourceChainMagic: bfchainCore.config.magic,
        certificateId,
        type: CERTIFICATE_TYPE.DESTORY_BY_APPLICANT,
      },
    },
    keypair,
    secondKeypair,
  );
  await bfchainCore.transaction.getTransactionFactoryFromType(trs.type).verify(trs);
  console.log(trs.toJSON());
}
(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  await getIssueCertificateTransaction(getSenderWithSecondSecret(), bfchainCore);
  await getIssueCertificateTransaction(getSenderWithoutSecondSecret(), bfchainCore);
})();
