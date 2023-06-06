import {
  TransferAssetTransaction,
  TransferAssetTransactionFactory,
  RANGE_TYPE,
  Transaction,
  BFChainCore,
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
import { Long } from "@bfchain/protobuf";

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
    fee: "85", // 交易手续费
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
  const trsJson = trs.toJSON();
  const xx = await bfchainCore.transaction.recombineTransaction(trsJson);

  const yy =
    bfchainCore.transactionLogicVerifier.getTransactionLogicVerifierFromType<TransferAssetTransaction>(
      trs.type,
    );

  yy.checkTrsFeeAndWebFee(trs, trs.getBytes().length);
  yy.checkTrsFeeAndMiningMachineFeeAndWebFee(trs, trs.getBytes().length, {
    numerator: 1000,
    denominator: 1024,
  });
  console.log(xx.toJSON());
}

(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  const xx: BFChainCore.BlockJSON = {
    version: 1,
    height: 14,
    blockSize: 519,
    generatorPublicKey: "879485f07b711ce37a366bf8fccb380a37479fc62becb552de97c83488f10cc8",
    generatorSecondPublicKey: "",
    generatorEquity: "0",
    previousBlockSignature:
      "97fb45b2f8c43be3556f42d8fc049c67668d9ce0d78e9b76f039175771a8e3911cfd397a554c2d513f0eb5a7ba667c12870d7e75737dcbc0d264af3645ab530c",
    timestamp: 11572350,
    reward: "4000000000",
    magic: "V7U7T",
    remark: {
      info: "the net version is testnet, only running for the test",
      debug: "BFMTEST_win32_v3.7.1_P13_DP1_T0_C0_A0.00 UNTRS_B0_E0_TIME9 LOST 0",
    },
    asset: {},
    transactionInfo: {
      startTindex: 576,
      numberOfTransactions: 0,
      payloadHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      payloadLength: 0,
      blobSize: 0,
      totalAmount: "0",
      totalFee: "0",
      transactionInBlocks: [],
      statisticInfo: {
        totalFee: "0",
        totalAsset: "0",
        totalChainAsset: "0",
        totalAccount: 0,
        magicAssetTypeTypeStatisticHashMap: {},
      },
    },
    roundOfflineGeneratersHashMap: {},
    blockParticipation: "0",
    signature:
      "a5cfbe59fc2401c6160a4a0d657d4fb86a6a57cbe0f2529bc08323dd23e3f13c80b7947ea9d7146f46c8751dd167916cded79675ed9ac6d31b73acf344db9003",
    signSignature: "",
  };

  // const xx: BFChainCore.BlockJSON = require(process.cwd() +
  //   "/assets/bfm-genesisBlock-mainnet.json");

  const xxx = await bfchainCore.block.recombineBlock(xx);

  // console.log(xxx.transactionInfo);

  const yy = bfchainCore.block.getBlockFactoryFromHeight(xxx.height);

  // debugger
  yy.commonBlockVerify.verifyBlockSize(xxx);

  xxx.transactionInfo.blobSize = 0;
  // console.log(xxx.transactionInfo);
  // console.log(Long.fromNumber(0))

  // await getTransferAssetTransaction(getSenderWithoutSecondSecret(), bfchainCore);
  // await getTransferAssetTransaction(getSenderWithSecondSecret(), bfchainCore);

  // console.log(bfchainCore.config.version);

  // bfchainCore.patchInstaller.changeHeight(50000000);

  // await sleep(1000);

  // console.log(bfchainCore.config.version);
})();
