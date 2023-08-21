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
  getRandomDAppId,
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
    trs = await bfchainCore.transaction.transactionPowCalculator(trs, pow, keypair, secondKeypair);
  }
  const trsJson = trs.toJSON();
  const xx = await bfchainCore.transaction.recombineTransaction(trsJson);

  const yy =
    bfchainCore.transactionLogicVerifier.getTransactionLogicVerifierFromType<TransferAssetTransaction>(
      trs.type,
    );

  const result = await yy.checkTrsFeeAndWebFee(trs, trs.getBytes().length);
  if (result.isFeeEnough) {
    const result2 = await yy.checkTrsFeeAndMiningMachineFeeAndWebFee(trs, trs.getBytes().length, {
      numerator: 1000,
      denominator: 1024,
    });
    if (result2.isFeeEnough) {
      console.log(xx.toJSON());
    } else {
      throw new Error(JSON.stringify(result2));
    }
  } else {
    throw new Error(JSON.stringify(result));
  }
}

(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  // await getTransferAssetTransaction(getSenderWithoutSecondSecret(), bfchainCore);
  // await getTransferAssetTransaction(getSenderWithSecondSecret(), bfchainCore);

  // console.log(bfchainCore.config.version);

  // bfchainCore.patchInstaller.changeHeight(50000000);

  // await sleep(1000);

  // console.log(bfchainCore.config.version);

  const xx: BFChainCore.PromiseTransactionJSON = {
    v: 1,
    t: "BFMTEST-BFMETATEST-PMS-00",
    ts: 8364250,
    s: "cLf9RnBioXaj5o5ES6SzBsTdn8ZC3tcCsf",
    s_p: "9a2f94b0e8bdadab78c5730880f19b7ec96f13b6fe4814db07188b841f8c6aa1",
    f: "100000",
    sign: "9c6d01d61d66e287880d071ede65eb1c7362a74f49c7debdc512a7f34026df8e73b287223f1067516d6815b4fb9e7c445848b7023719bf7cd88f69454e372f0d",
    aph: 14437,
    ebh: 54937,
    a: {
      promise: {
        transaction: {
          version: 1,
          type: "BFMTEST-BFMETATEST-AST-13",
          senderId: "cLf9RnBioXaj5o5ES6SzBsTdn8ZC3tcCsf",
          senderPublicKey: "9a2f94b0e8bdadab78c5730880f19b7ec96f13b6fe4814db07188b841f8c6aa1",
          rangeType: 0,
          range: [],
          fee: "755822655",
          timestamp: 8364250,
          fromMagic: "MMB4K",
          toMagic: "MMB4K",
          applyBlockHeight: 14437,
          effectiveBlockHeight: 14494,
          signature:
            "c150e89757b980bff45c73455603691e11df57b1d927b57eccc3c5efa8e52095ca3a9878e72445378c431625dadf12569f39be2f1e78fb2c2cd883e480a1ef09",
          remark: {
            message: "create transferAny",
            blobSeed2:
              "blob+sha256+hex://7c2a8c7304095c975e97319057c7e677cba75a564f2a12c032f546c6c45b3e81?size=251940254",
          },
          asset: {
            transferAny: {
              sourceChainName: "bfmetatest",
              sourceChainMagic: "MMB4K",
              parentAssetType: 3,
              assetType: "bfchain0801_vdragonborn130001",
              amount: "1",
              taxInformation: {
                taxCollector: "cLf9RnBioXaj5o5ES6SzBsTdn8ZC3tcCsf",
                taxAssetPrealnum: "0",
              },
            },
          },
          nonce: 0,
          recipientId: "c8FXFDGGaHMnWM1y3PAvTmwz7ahSNYjsXx",
          senderSecondPublicKey: "abddae311010c2474408fb22ba6fc1789a7c84970f32e1ee45f6be2c8a7a4483",
          signSignature:
            "76a0f4cef231661739400f2f6f28a5e858400b09ca3d364ef1086096c0404cff77881a29e3efb769f63f4b602a4e3c1f846a108382e765e62613322fca67e506",
          storageKey: "assetType",
          storageValue: "bfchain0801_vdragonborn130001",
        },
      },
    },
    n: 0,
    r: "cCET2Sxt2LPDhx44wxJ9uhkpviKNrSacvE",
    rmk: {
      message: "create promise",
    },
  };
})();
