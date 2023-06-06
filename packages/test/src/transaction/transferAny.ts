import {
  TransferAnyTransaction,
  TransferAnyTransactionFactory,
  RANGE_TYPE,
  Transaction,
  BFChainCore,
  PARENT_ASSET_TYPE,
} from "@bfchain/core";
import {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  AccountModel,
  getBfchainCoreEntry,
  getRandomDAppid,
} from "../include";
import { sleep } from "@bfchain/util";

const _powCount: { [add: string]: number } = {};
function getPOWInfo<T extends Transaction>(address: string) {
  const count = _powCount[address] || 0;
  _powCount[address] = count + 1;
  // const res: BFChainCore.TransactionPoWOptions<T> = {
  //   accountNumberOfTransactionInBlock: count,
  //   accountParticipation: "8888888" + "0".repeat(8),
  // };
  const res: BFChainCore.TransactionPoWOptions<T> = {
    count,
    participation: "8888888" + "0".repeat(8),
  };
  return res;
}

async function getTransferAnyTransaction(sender: AccountModel, bfchainCore: BFChainCore) {
  const assetType = "skyrim_dragonborn";

  const keypair = await bfchainCore.accountBaseHelper.createSecretKeypair(sender.secret);
  const data: BFChainCore.TxBodyJSON = {
    version: bfchainCore.config.version,
    type: bfchainCore.transactionHelper.TRANSFER_ANY, // 交易类型
    senderId: sender.address, // 发起者地址
    senderPublicKey: sender.publicKey, // 发起者公钥
    senderSecondPublicKey: "", // 发起者二次公钥
    recipientId: getGenesisAccount().address,
    rangeType: RANGE_TYPE.EMPTY,
    range: [], // 接收资产账户地址
    timestamp: 770880, // 生成交易时间戳
    fee: "666", // 交易手续费
    remark: { remark: "body.remark" }, // 交易备注，任意信息
    dappid: getRandomDAppid(), // 交易所属的 dappid
    lns: bfchainCore.config.genesisLocationName,
    sourceIP: "127.0.0.1", // 交易来源 ip
    fromMagic: bfchainCore.config.magic, // 交易来源链的 magic
    toMagic: bfchainCore.config.magic, // 交易去往链的 magic
    applyBlockHeight: 10086, // 交易发起高度
    effectiveBlockHeight: 10100,
    storage: {
      key: "assetType",
      value: assetType,
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
      ? getPOWInfo<TransferAnyTransaction>(sender.address)
      : undefined;
  let trs = await bfchainCore.transaction.createTransaction<TransferAnyTransaction>(
    TransferAnyTransactionFactory,
    data,
    {
      transferAny: {
        sourceChainName: bfchainCore.config.chainName,
        sourceChainMagic: bfchainCore.config.magic,
        parentAssetType: PARENT_ASSET_TYPE.ENTITY,
        assetType,
        amount: "1",
        taxInformation: {
          taxCollector: sender.address,
          taxAssetPrealnum: "1000",
        },
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
  const trsJson = trs.toJSON();
  const xx = await bfchainCore.transaction.recombineTransaction(trsJson);

  const yy =
    bfchainCore.transactionLogicVerifier.getTransactionLogicVerifierFromType<TransferAnyTransaction>(
      trs.type,
    );

  yy.checkTrsFeeAndWebFee(trs, trs.getBytes().length);
  yy.checkTrsFeeAndMiningMachineFeeAndWebFee(trs, trs.getBytes().length, {
    numerator: 1000,
    denominator: 1024,
  });
  console.log(trsJson);
}

(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  // await getTransferAnyTransaction(getSenderWithoutSecondSecret(), bfchainCore);
  // await getTransferAnyTransaction(getSenderWithSecondSecret(), bfchainCore);

  // console.log(bfchainCore.config.version);

  // bfchainCore.patchInstaller.changeHeight(50000000);

  // await sleep(1000);

  // console.log(bfchainCore.config.version);

  const xx: BFChainCore.BeExchangeAnyMultiTransactionJSON = {
    version: 1,
    type: "BFMTEST-BFMETATEST-ECA-03",
    timestamp: 9662724,
    senderId: "cLSGxDVHzCK9eMsmmdZNL9zUFrWqegR3Ki",
    senderPublicKey: "ef579d69df200bddcd988899fc2cef0f8651be0b28af15ec5466554012197095",
    fee: "2557",
    signature:
      "5166558cbde4de652f82a94f2de59de67217c38529347d10d2b819f85473da0c547f2816bf58efcebd100d6275e46a272392d6706b4c8649941c44b6d67c5508",
    applyBlockHeight: 81,
    effectiveBlockHeight: 138,
    rangeType: RANGE_TYPE.EMPTY,
    range: [],
    fromMagic: "PPPPW",
    toMagic: "PPPPW",
    asset: {
      beExchangeAnyMulti: {
        transactionSignature:
          "eca9152a4cfc1c99d002f5920149a95c6bfd867ae62913f315e4caa4bec623980a54a2dd1ce59ba4104707c871fd1ef7c416c20ba9ed1daa86a42ffa87597e04",
        toExchangeAssets: [
          {
            toExchangeSource: "PPPPW",
            toExchangeChainName: "bfmetatest",
            toExchangeParentAssetType: 3,
            toExchangeAssetType: "m_bfchain0111_dragonborn10002",
            toExchangeAssetPrealnum: "1",
            taxInformation: {
              taxCollector: "cB9HrEJWuho8Bxo6SFer5miYErpnCY8EVj",
              taxAssetPrealnum: "1",
            },
          },
        ],
        beExchangeAsset: {
          beExchangeSource: "PPPPW",
          beExchangeChainName: "bfmetatest",
          beExchangeParentAssetType: 5,
          beExchangeAssetType: "BFMTEST",
          beExchangeAssetPrealnum: "1000000",
        },
      },
    },
    nonce: 0,
    recipientId: "cB9HrEJWuho8Bxo6SFer5miYErpnCY8EVj",
    remark: {},
    storageKey: "transactionSignature",
    storageValue:
      "eca9152a4cfc1c99d002f5920149a95c6bfd867ae62913f315e4caa4bec623980a54a2dd1ce59ba4104707c871fd1ef7c416c20ba9ed1daa86a42ffa87597e04",
  };

  debugger;
  const yy = await bfchainCore.transaction.recombineTransaction(xx);
  await bfchainCore.transactionHelper.verifyTransactionSignature(yy);
  console.log(yy.asset);
})();
