import {
  ToExchangeSpecialAssetTransaction,
  ToExchangeSpecialAssetTransactionFactory,
  EXCHANGE_DIRECTION,
  SPECIAL_ASSET_TYPE,
  RANGE_TYPE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  bfchainCore,
  AccountModel,
} from "../include";

function getToExchangeSpecialAssetTransaction(sender: AccountModel, recipientId: string) {
  const keypair = bfchainCore.accountHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: 1,
    type: bfchainCore.transactionHelper.TO_EXCHANGE_SPECIAL_ASSET, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    timestamp: 770880, // 生成交易时间戳
    fee: "78622", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: "CAPCOM123456789QWQQAQ", // 交易所属的 dappid
    lns: `bnqkl.${bfchainCore.config.chainName}`,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    numberOfEffectiveBlocks: 100,
  };
  let secondKeypair;
  if (sender.secondSecret) {
    secondKeypair = bfchainCore.accountHelper.createSecondSecretKeypair(
      sender.secret,
      sender.secondSecret,
    );
    data.senderSecondPublicKey = bfchainCore.accountHelper.getPublicKeyStringFromSecondSecret(
      sender.secret,
      sender.secondSecret,
    );
  }
  const info: BFChainCore.ToExchangeSpecialAssetAssetJSON = {
    toExchangeSpecialAsset: {
      cipherPublicKeys: [],
      toExchangeSource: bfchainCore.config.magic,
      beExchangeSource: bfchainCore.config.magic,
      toExchangeChainName: "bfchain",
      beExchangeChainName: "bfchain",
      toExchangeAsset: "bnqkl.bfchain",
      beExchangeAsset: "BFT",
      exchangeNumber: "1000000",
      exchangeAssetType: SPECIAL_ASSET_TYPE.LOCATION_NAME,
      exchangeDirection: EXCHANGE_DIRECTION.ASSET_FROM_SENDER,
      // numberOfBeginUnfrozenBlocks: 99,
    },
  };
  if (recipientId) {
    data.rangeType = RANGE_TYPE.MULTI_ADDRESS;
    data.range = [recipientId];
  }
  const trs = bfchainCore.transaction.createTransaction<ToExchangeSpecialAssetTransaction>(
    ToExchangeSpecialAssetTransactionFactory,
    data,
    info,
    keypair,
    secondKeypair,
  );
  console.log(trs.toJSON());
}

getToExchangeSpecialAssetTransaction(getSenderWithSecondSecret(), "");
getToExchangeSpecialAssetTransaction(getSenderWithoutSecondSecret(), getGenesisAccount().address);
